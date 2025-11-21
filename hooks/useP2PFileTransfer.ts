/*
 * useP2PFileTransfer
 * - Reusable hook encapsulating WebRTC peer connection, datachannel file transfer (16KB chunks),
 *   signaling via SignalingClient, verification code flow and a small state machine.
 * - Returns necessary actions and state for UI components.
 */

import { useEffect, useRef, useState } from 'react';
import { SignalingClient } from '../lib/signalingClient';

const CHUNK_SIZE = 16 * 1024; // 16KB

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'verified';

interface ReceivedFile {
  id: string;
  name: string;
  size: number;
  mime?: string;
  blob?: Blob;
}

export function useP2PFileTransfer(signalingUrl: string) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [isVerified, setIsVerified] = useState(false);
  const [verifyCode, setVerifyCode] = useState<number | null>(null);
  const [peerDeviceName, setPeerDeviceName] = useState<string | null>(null);
  const [receivedFiles, setReceivedFiles] = useState<ReceivedFile[]>([]);
  const [sendProgress, setSendProgress] = useState(0);
  const [receiveProgress, setReceiveProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const signalingRef = useRef<SignalingClient | null>(null);
  const roomIdRef = useRef<string | null>(null);
  const localDeviceNameRef = useRef<string | null>(null);
  const sessionSecretRef = useRef<string | null>(null);

  // helper: compute verification code from sessionSecret
  async function computeVerifyCode(secret: string) {
    // SHA-256 then take first 4 bytes as uint32
    const enc = new TextEncoder();
    const hash = await crypto.subtle.digest('SHA-256', enc.encode(secret));
    const view = new DataView(hash.slice(0, 4));
    const val = view.getUint32(0, false);
    return val % 10000;
  }

  // initialize signaling client
  function createSignaling() {
    const client = new SignalingClient(signalingUrl);
    client.connect();
    signalingRef.current = client;
    client.on('open', () => {});
    client.on('created', (p: any) => {
      // created room success
    });
    client.on('joined', (p: any) => {
      // joined
    });
    client.on('joiner-arrived', (p: any) => {
      if (p?.deviceName) setPeerDeviceName(p.deviceName);
    });
    client.on('signal', async (payload: any) => {
      try {
        const data = payload?.data;
        if (!data) return;
        // handle SDP/ICE/session-secret
        if (data.type === 'offer') {
          await pcRef.current?.setRemoteDescription(new RTCSessionDescription(data));
          const answer = await pcRef.current?.createAnswer();
          if (answer) await pcRef.current?.setLocalDescription(answer);
          signalingRef.current?.sendSignal(roomIdRef.current!, { type: 'answer', ...answer });
        } else if (data.type === 'answer') {
          await pcRef.current?.setRemoteDescription(new RTCSessionDescription(data));
        } else if (data.type === 'ice') {
          await pcRef.current?.addIceCandidate(data.candidate);
        } else if (data.type === 'session-secret') {
          // joiner receives secret
          sessionSecretRef.current = data.secret;
          const code = await computeVerifyCode(data.secret);
          setVerifyCode(code);
          setConnectionState('connected');
        }
      } catch (err: any) {
        console.error(err);
      }
    });
    client.on('joiner-left', () => {
      cleanup();
    });
    client.on('host-left', () => {
      cleanup();
    });
  }

  useEffect(() => {
    createSignaling();
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cleanup() {
    dcRef.current?.close();
    pcRef.current?.close();
    signalingRef.current?.close();
    pcRef.current = null;
    dcRef.current = null;
    signalingRef.current = null;
    roomIdRef.current = null;
    sessionSecretRef.current = null;
    setConnectionState('disconnected');
    setIsVerified(false);
  }

  async function createPeerConnection(isHost: boolean) {
    setConnectionState('connecting');
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
    });
    pcRef.current = pc;

    pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        signalingRef.current?.sendSignal(roomIdRef.current!, { type: 'ice', candidate: ev.candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      if (!pcRef.current) return;
      const s = pcRef.current.connectionState;
      if (s === 'connected') {
        setConnectionState('connected');
      } else if (s === 'disconnected' || s === 'failed' || s === 'closed') {
        setConnectionState('disconnected');
      }
    };

    // Data channel handling
    if (isHost) {
      const dc = pc.createDataChannel('file');
      setupDataChannel(dc, true);
      dcRef.current = dc;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      signalingRef.current?.sendSignal(roomIdRef.current!, offer);
    } else {
      pc.ondatachannel = (ev) => {
        const dc = ev.channel;
        setupDataChannel(dc, false);
        dcRef.current = dc;
      };
    }

    return pc;
  }

  function setupDataChannel(dc: RTCDataChannel, isHostSide: boolean) {
    dc.binaryType = 'arraybuffer';
    let incomingBuffers: Uint8Array[] = [];
    let expectedFileMeta: any = null;
    let receivedBytes = 0;

    dc.onopen = () => {};
    dc.onmessage = async (ev) => {
      // messages can be control (JSON) or binary chunks
      if (typeof ev.data === 'string') {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.type === 'file-meta') {
            expectedFileMeta = msg.meta;
            incomingBuffers = [];
            receivedBytes = 0;
            setReceiveProgress(0);
          } else if (msg.type === 'file-end') {
            // assemble
            const blob = new Blob(incomingBuffers, { type: expectedFileMeta?.mime || 'application/octet-stream' });
            const id = String(Date.now());
            const rf = { id, name: expectedFileMeta.name, size: expectedFileMeta.size, mime: expectedFileMeta.mime, blob };
            setReceivedFiles((s) => [rf, ...s]);
            // reset
            expectedFileMeta = null;
            incomingBuffers = [];
            receivedBytes = 0;
            setReceiveProgress(0);
          }
        } catch (e) {
          console.warn('Invalid control message', e);
        }
      } else if (ev.data instanceof ArrayBuffer) {
        const chunk = new Uint8Array(ev.data);
        incomingBuffers.push(chunk);
        receivedBytes += chunk.byteLength;
        if (expectedFileMeta && expectedFileMeta.size) {
          setReceiveProgress(Math.min(100, Math.round((receivedBytes / expectedFileMeta.size) * 100)));
        }
      }
    };
  }

  async function createRoom(roomId: string, deviceName?: string) {
    if (!signalingRef.current) throw new Error('Signaling not ready');
    roomIdRef.current = roomId.replace(/[^0-9]/g, '').slice(0, 6);
    localDeviceNameRef.current = deviceName || null;
    signalingRef.current.createRoom(roomIdRef.current, deviceName);
    await createPeerConnection(true);
    // generate sessionSecret and send to joiner via signaling
    const secret = crypto.getRandomValues(new Uint8Array(16)).reduce((s, b) => s + ('00' + b.toString(16)).slice(-2), '');
    sessionSecretRef.current = secret;
    // compute code for host as well
    const code = await computeVerifyCode(secret);
    setVerifyCode(code);
    // send to joiner via signaling server relay
    signalingRef.current.sendSignal(roomIdRef.current!, { type: 'session-secret', secret });
  }

  async function joinRoom(roomId: string, deviceName?: string) {
    if (!signalingRef.current) throw new Error('Signaling not ready');
    roomIdRef.current = roomId.replace(/[^0-9]/g, '').slice(0, 6);
    localDeviceNameRef.current = deviceName || null;
    signalingRef.current.joinRoom(roomIdRef.current, deviceName);
    await createPeerConnection(false);
  }

  async function confirmVerification() {
    if (!sessionSecretRef.current) return false;
    const code = await computeVerifyCode(sessionSecretRef.current);
    setIsVerified(true);
    setVerifyCode(code);
    setConnectionState('verified');
    return true;
  }

  async function sendFile(file: File) {
    if (!dcRef.current || dcRef.current.readyState !== 'open') throw new Error('Data channel not open');
    // send meta
    const meta = { name: file.name, size: file.size, mime: file.type };
    dcRef.current.send(JSON.stringify({ type: 'file-meta', meta }));
    const reader = file.stream().getReader();
    let sent = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        // chunk into CHUNK_SIZE pieces
        let offset = 0;
        while (offset < value.length) {
          const end = Math.min(offset + CHUNK_SIZE, value.length);
          const slice = value.slice(offset, end);
          dcRef.current.send(slice.buffer);
          sent += slice.length;
          setSendProgress(Math.min(100, Math.round((sent / file.size) * 100)));
          offset = end;
          // small yield to avoid blocking
          await new Promise((r) => setTimeout(r, 0));
        }
      }
    }
    dcRef.current.send(JSON.stringify({ type: 'file-end' }));
    setSendProgress(100);
    // record history (not storing file payloads)
    try {
      const hist = JSON.parse(localStorage.getItem('nearby:history') || '[]');
      hist.unshift({ id: Date.now(), type: 'sent', name: file.name, size: file.size, when: Date.now() });
      localStorage.setItem('nearby:history', JSON.stringify(hist.slice(0, 50)));
    } catch (e) {}
  }

  return {
    connectionState,
    isVerified,
    verifyCode,
    peerDeviceName,
    sendFile,
    receivedFiles,
    sendProgress,
    receiveProgress,
    error,
    createRoom,
    joinRoom,
    confirmVerification,
  } as const;
}

export type UseP2PFileTransfer = ReturnType<typeof useP2PFileTransfer>;
