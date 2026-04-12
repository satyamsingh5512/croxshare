'use client';

/**
 * useFileTransfer — orchestrates WebRTC peer connection + DataChannel file transfer.
 *
 * Caller provides sendSignal() from useSignaling to relay SDP/ICE.
 * The hook handles:
 *  - Creating/receiving RTCPeerConnection
 *  - DataChannel for file bytes
 *  - Chunked file sending with progress
 *  - Receiving and reassembling chunks, then auto-downloading
 */

import { useRef, useState, useCallback } from 'react';
import { createPeerConnection } from '@/lib/webrtc';
import { chunkFile, reassemble, downloadBlob, CHUNK_SIZE } from '@/lib/file-chunker';
import type { SignalMessage, FileMetadata, IncomingFile } from '@/types';
import { useTransferStore } from '@/store/useTransferStore';

interface UseFileTransferOptions {
  sendSignal: (type: SignalMessage['type'], data: SignalMessage['data']) => Promise<void>;
  onConnected: () => void;
  onDisconnected: () => void;
}

const BUFFER_HIGH_WATERMARK = 512 * 1024;
const BUFFER_LOW_WATERMARK = 64 * 1024;

function isDebugEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_WEBRTC_DEBUG === '1') return true;
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem('crox:webrtc-debug') === '1';
  } catch {
    return false;
  }
}

function debugLog(...args: unknown[]) {
  if (!isDebugEnabled()) return;
  // Keep logs grouped for easier filtering in browser console.
  console.debug('[webrtc]', ...args);
}

async function waitForBufferDrain(dc: RTCDataChannel): Promise<void> {
  if (dc.bufferedAmount <= BUFFER_HIGH_WATERMARK) return;

  await new Promise<void>((resolve) => {
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      dc.removeEventListener('bufferedamountlow', onBufferedAmountLow);
      resolve();
    };

    const onBufferedAmountLow = () => {
      if (dc.bufferedAmount <= BUFFER_LOW_WATERMARK || dc.readyState !== 'open') {
        finish();
      }
    };

    dc.addEventListener('bufferedamountlow', onBufferedAmountLow);

    // Fallback polling in case a browser misses the event.
    const poll = () => {
      if (done) return;
      if (dc.bufferedAmount <= BUFFER_LOW_WATERMARK || dc.readyState !== 'open') {
        finish();
        return;
      }
      window.setTimeout(poll, 12);
    };

    poll();
  });
}

export function useFileTransfer({ sendSignal, onConnected, onDisconnected }: UseFileTransferOptions) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const isHostRef = useRef(false);
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const hostStartedRef = useRef(false);

  const [sendProgress, setSendProgress] = useState(0);
  const [incomingFiles, setIncomingFiles] = useState<IncomingFile[]>([]);
  const setStoreSendProgress = useTransferStore((state) => state.setSendProgress);
  const upsertTransfer = useTransferStore((state) => state.upsertTransfer);
  const updateTransferProgress = useTransferStore((state) => state.updateTransferProgress);
  const markTransferDone = useTransferStore((state) => state.markTransferDone);

  // ── DataChannel setup ─────────────────────────────────────────────────

  function setupDataChannel(dc: RTCDataChannel) {
    dc.binaryType = 'arraybuffer';
    dc.bufferedAmountLowThreshold = BUFFER_LOW_WATERMARK;
    dcRef.current = dc;

    let current: IncomingFile | null = null;

    dc.onopen = () => {
      debugLog('datachannel open', { label: dc.label, protocol: dc.protocol });
      onConnected();
    };
    dc.onclose = () => {
      debugLog('datachannel close', { label: dc.label });
      onDisconnected();
    };
    dc.onerror = () => {
      debugLog('datachannel error', { label: dc.label, readyState: dc.readyState });
    };

    dc.onmessage = (ev) => {
      if (typeof ev.data === 'string') {
        const msg = JSON.parse(ev.data) as
          | { type: 'file-meta'; meta: FileMetadata }
          | { type: 'file-end' };

        if (msg.type === 'file-meta') {
          debugLog('incoming file metadata', {
            id: msg.meta.id,
            name: msg.meta.name,
            size: msg.meta.size,
            chunks: msg.meta.chunks,
          });
          current = {
            meta: msg.meta,
            receivedChunks: 0,
            buffers: [],
            done: false,
          };
          setIncomingFiles((prev) => [current!, ...prev]);
          upsertTransfer({
            id: msg.meta.id,
            name: msg.meta.name,
            size: msg.meta.size,
            direction: 'receiving',
            progress: 0,
            status: 'active',
          });
        } else if (msg.type === 'file-end' && current) {
          debugLog('incoming file complete', { id: current.meta.id, name: current.meta.name });
          const blob = reassemble(current.buffers, current.meta.mime);
          current.blob = blob;
          current.done = true;
          setIncomingFiles((prev) =>
            prev.map((f) =>
              f.meta.id === current!.meta.id ? { ...f, blob, done: true } : f,
            ),
          );
          markTransferDone(current.meta.id);
          downloadBlob(blob, current.meta.name);
          current = null;
        }
      } else if (ev.data instanceof ArrayBuffer && current) {
        current.buffers.push(ev.data);
        current.receivedChunks++;
        const pct = Math.min(
          99,
          Math.round((current.receivedChunks / current.meta.chunks) * 100),
        );
        setIncomingFiles((prev) =>
          prev.map((f) =>
            f.meta.id === current!.meta.id ? { ...f, receivedChunks: current!.receivedChunks } : f,
          ),
        );
        updateTransferProgress(current.meta.id, pct);
        void pct; // suppress unused warning (progress is derived in component)
      }
    };
  }

  // ── Peer connection ────────────────────────────────────────────────────

  function setupPeerConnection(pc: RTCPeerConnection) {
    pc.onicecandidate = async (ev) => {
      if (ev.candidate) {
        debugLog('local ICE candidate generated', {
          candidateType: ev.candidate.type,
          protocol: ev.candidate.protocol,
        });
        await sendSignal('ice', ev.candidate.toJSON());
      }
    };

    pc.ondatachannel = (ev) => {
      debugLog('remote datachannel received', { label: ev.channel.label });
      setupDataChannel(ev.channel);
    };

    pc.oniceconnectionstatechange = () => {
      debugLog('iceConnectionState', pc.iceConnectionState);
    };

    pc.onicegatheringstatechange = () => {
      debugLog('iceGatheringState', pc.iceGatheringState);
    };

    pc.onconnectionstatechange = () => {
      debugLog('peer connectionState', pc.connectionState);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        onDisconnected();
      }
    };
  }

  async function flushPendingIceCandidates(pc: RTCPeerConnection) {
    if (pendingIceCandidatesRef.current.length === 0) return;

    const queuedCandidates = [...pendingIceCandidatesRef.current];
    pendingIceCandidatesRef.current = [];

    for (const candidate of queuedCandidates) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  // ── Called when we are the initiator (host, after peer joins) ─────────

  const startAsHost = useCallback(async () => {
    if (hostStartedRef.current || pcRef.current) return;

    const pc = await createPeerConnection();
    pcRef.current = pc;
    isHostRef.current = true;
    hostStartedRef.current = true;
    setupPeerConnection(pc);

    const dc = pc.createDataChannel('files', { ordered: true });
    setupDataChannel(dc);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    debugLog('sending SDP offer');
    await sendSignal('offer', offer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendSignal]);

  // ── Handle incoming signals (SDP offer/answer + ICE) ─────────────────

  const handleSignal = useCallback(
    async (msg: SignalMessage) => {
      try {
        if (msg.type === 'offer') {
          debugLog('received SDP offer');
          const pc = pcRef.current ?? await createPeerConnection();
          pcRef.current = pc;
          isHostRef.current = false;
          setupPeerConnection(pc);

          // Handle glare (simultaneous offers) by rolling back our local offer first.
          if (pc.signalingState !== 'stable') {
            await pc.setLocalDescription({ type: 'rollback' });
          }

          await pc.setRemoteDescription(new RTCSessionDescription(msg.data as RTCSessionDescriptionInit));
          await flushPendingIceCandidates(pc);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          debugLog('sending SDP answer');
          await sendSignal('answer', answer);
        } else if (msg.type === 'answer') {
          debugLog('received SDP answer');
          if (!pcRef.current) return;

          await pcRef.current.setRemoteDescription(
            new RTCSessionDescription(msg.data as RTCSessionDescriptionInit),
          );
          await flushPendingIceCandidates(pcRef.current);
        } else if (msg.type === 'ice') {
          debugLog('received remote ICE candidate');
          const candidate = msg.data as RTCIceCandidateInit;
          const pc = pcRef.current;

          if (!pc || !pc.remoteDescription) {
            pendingIceCandidatesRef.current.push(candidate);
            return;
          }

          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error('[WebRTC signal error]', err);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sendSignal],
  );

  // ── Send a file ────────────────────────────────────────────────────────

  const sendFile = useCallback(async (file: File) => {
    const dc = dcRef.current;
    if (!dc || dc.readyState !== 'open') return;

    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const chunks = Math.ceil(file.size / CHUNK_SIZE);

    const meta: FileMetadata = {
      id,
      name: file.name,
      size: file.size,
      mime: file.type || 'application/octet-stream',
      chunks,
    };

    debugLog('start sending file', { id, name: file.name, size: file.size, chunks });
    dc.send(JSON.stringify({ type: 'file-meta', meta }));
    setSendProgress(0);
    setStoreSendProgress(0);
    upsertTransfer({
      id,
      name: file.name,
      size: file.size,
      direction: 'sending',
      progress: 0,
      status: 'active',
    });

    let sent = 0;
    for await (const { data, index } of chunkFile(file)) {
      // Event-driven backpressure using bufferedAmountLowThreshold + bufferedamountlow.
      await waitForBufferDrain(dc);
      if (dc.readyState !== 'open') return;
      dc.send(data);
      sent = index + 1;
      const progress = Math.min(99, Math.round((sent / chunks) * 100));
      setSendProgress(progress);
      setStoreSendProgress(progress);
      updateTransferProgress(id, progress);
    }

    dc.send(JSON.stringify({ type: 'file-end' }));
    debugLog('file send complete', { id, name: file.name });
    setSendProgress(100);
    setStoreSendProgress(100);
    markTransferDone(id);
  }, []);

  function cleanup() {
    dcRef.current?.close();
    pcRef.current?.close();
    pcRef.current = null;
    dcRef.current = null;
    pendingIceCandidatesRef.current = [];
    hostStartedRef.current = false;
    isHostRef.current = false;
  }

  return {
    startAsHost,
    handleSignal,
    sendFile,
    sendProgress,
    incomingFiles,
    cleanup,
  };
}
