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

interface UseFileTransferOptions {
  sendSignal: (type: SignalMessage['type'], data: SignalMessage['data']) => Promise<void>;
  onConnected: () => void;
  onDisconnected: () => void;
}

export function useFileTransfer({ sendSignal, onConnected, onDisconnected }: UseFileTransferOptions) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const isHostRef = useRef(false);

  const [sendProgress, setSendProgress] = useState(0);
  const [incomingFiles, setIncomingFiles] = useState<IncomingFile[]>([]);

  // ── DataChannel setup ─────────────────────────────────────────────────

  function setupDataChannel(dc: RTCDataChannel) {
    dc.binaryType = 'arraybuffer';
    dcRef.current = dc;

    let current: IncomingFile | null = null;

    dc.onopen = () => onConnected();
    dc.onclose = () => onDisconnected();

    dc.onmessage = (ev) => {
      if (typeof ev.data === 'string') {
        const msg = JSON.parse(ev.data) as
          | { type: 'file-meta'; meta: FileMetadata }
          | { type: 'file-end' };

        if (msg.type === 'file-meta') {
          current = {
            meta: msg.meta,
            receivedChunks: 0,
            buffers: [],
            done: false,
          };
          setIncomingFiles((prev) => [current!, ...prev]);
        } else if (msg.type === 'file-end' && current) {
          const blob = reassemble(current.buffers, current.meta.mime);
          current.blob = blob;
          current.done = true;
          setIncomingFiles((prev) =>
            prev.map((f) =>
              f.meta.id === current!.meta.id ? { ...f, blob, done: true } : f,
            ),
          );
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
        void pct; // suppress unused warning (progress is derived in component)
      }
    };
  }

  // ── Peer connection ────────────────────────────────────────────────────

  function setupPeerConnection(pc: RTCPeerConnection) {
    pc.onicecandidate = async (ev) => {
      if (ev.candidate) {
        await sendSignal('ice', ev.candidate.toJSON());
      }
    };

    pc.ondatachannel = (ev) => {
      setupDataChannel(ev.channel);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        onDisconnected();
      }
    };
  }

  // ── Called when we are the initiator (host, after peer joins) ─────────

  const startAsHost = useCallback(async () => {
    const pc = createPeerConnection();
    pcRef.current = pc;
    isHostRef.current = true;
    setupPeerConnection(pc);

    const dc = pc.createDataChannel('files', { ordered: true });
    setupDataChannel(dc);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await sendSignal('offer', offer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendSignal]);

  // ── Handle incoming signals (SDP offer/answer + ICE) ─────────────────

  const handleSignal = useCallback(
    async (msg: SignalMessage) => {
      try {
        if (msg.type === 'offer') {
          const pc = createPeerConnection();
          pcRef.current = pc;
          isHostRef.current = false;
          setupPeerConnection(pc);

          await pc.setRemoteDescription(new RTCSessionDescription(msg.data as RTCSessionDescriptionInit));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await sendSignal('answer', answer);
        } else if (msg.type === 'answer') {
          await pcRef.current?.setRemoteDescription(
            new RTCSessionDescription(msg.data as RTCSessionDescriptionInit),
          );
        } else if (msg.type === 'ice') {
          const candidate = new RTCIceCandidate(msg.data as RTCIceCandidateInit);
          await pcRef.current?.addIceCandidate(candidate);
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

    dc.send(JSON.stringify({ type: 'file-meta', meta }));
    setSendProgress(0);

    let sent = 0;
    for await (const { data, index } of chunkFile(file)) {
      // Back-pressure: wait if buffer is filling up
      while (dc.bufferedAmount > 512 * 1024) {
        await new Promise((r) => setTimeout(r, 10));
      }
      dc.send(data);
      sent = index + 1;
      setSendProgress(Math.min(99, Math.round((sent / chunks) * 100)));
    }

    dc.send(JSON.stringify({ type: 'file-end' }));
    setSendProgress(100);
  }, []);

  function cleanup() {
    dcRef.current?.close();
    pcRef.current?.close();
    pcRef.current = null;
    dcRef.current = null;
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
