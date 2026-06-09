'use client';

import { useRef, useState, useCallback } from 'react';
import { createPeerConnection } from '@/lib/webrtc';
import { chunkFile, reassemble, downloadBlob, CHUNK_SIZE } from '@/lib/file-chunker';
import type { SignalMessage, FileMetadata, IncomingFile } from '@/types';
import { useTransferStore } from '@/store/useTransferStore';

interface UseFileTransferOptions {
  /** sendSignal must direct the signal to the correct peer via the `to` param */
  sendSignal: (type: SignalMessage['type'], data: SignalMessage['data'], to?: string) => Promise<void>;
  onPeerConnected: (peerId: string) => void;
  onPeerDisconnected: (peerId: string) => void;
}

interface PeerEntry {
  pc: RTCPeerConnection;
  dc: RTCDataChannel | null;
  isHost: boolean;
  pendingIce: RTCIceCandidateInit[];
  hostStarted: boolean;
}

const BUFFER_HIGH = 512 * 1024;
const BUFFER_LOW = 64 * 1024;

async function drainBuffer(dc: RTCDataChannel) {
  if (dc.bufferedAmount <= BUFFER_HIGH) return;
  await new Promise<void>((resolve) => {
    let done = false;
    const finish = () => { if (!done) { done = true; dc.removeEventListener('bufferedamountlow', onLow); resolve(); } };
    const onLow = () => { if (dc.bufferedAmount <= BUFFER_LOW || dc.readyState !== 'open') finish(); };
    dc.addEventListener('bufferedamountlow', onLow);
    const poll = () => { if (done) return; if (dc.bufferedAmount <= BUFFER_LOW || dc.readyState !== 'open') { finish(); return; } setTimeout(poll, 12); };
    poll();
  });
}

export function useFileTransfer({ sendSignal, onPeerConnected, onPeerDisconnected }: UseFileTransferOptions) {
  const peers = useRef<Map<string, PeerEntry>>(new Map());
  // Active peer for file sending (last connected)
  const activePeerRef = useRef<string | null>(null);

  const [incomingFiles, setIncomingFiles] = useState<IncomingFile[]>([]);
  const [sendProgress, setSendProgress] = useState(0);
  const upsertTransfer = useTransferStore((s) => s.upsertTransfer);
  const updateTransferProgress = useTransferStore((s) => s.updateTransferProgress);
  const markTransferDone = useTransferStore((s) => s.markTransferDone);
  const setStoreSendProgress = useTransferStore((s) => s.setSendProgress);

  function setupDataChannel(dc: RTCDataChannel, peerId: string) {
    dc.binaryType = 'arraybuffer';
    dc.bufferedAmountLowThreshold = BUFFER_LOW;

    const entry = peers.current.get(peerId);
    if (entry) entry.dc = dc;

    let current: IncomingFile | null = null;

    dc.onopen = () => {
      activePeerRef.current = peerId;
      onPeerConnected(peerId);
    };
    dc.onclose = () => onPeerDisconnected(peerId);
    dc.onerror = () => onPeerDisconnected(peerId);

    dc.onmessage = (ev) => {
      if (typeof ev.data === 'string') {
        const msg = JSON.parse(ev.data) as
          | { type: 'file-meta'; meta: FileMetadata }
          | { type: 'file-end' };

        if (msg.type === 'file-meta') {
          current = { meta: msg.meta, receivedChunks: 0, buffers: [], done: false };
          setIncomingFiles((prev) => [current!, ...prev]);
          upsertTransfer({ id: msg.meta.id, name: msg.meta.name, size: msg.meta.size, direction: 'receiving', progress: 0, status: 'active' });
        } else if (msg.type === 'file-end' && current) {
          const blob = reassemble(current.buffers, current.meta.mime);
          current.done = true;
          setIncomingFiles((prev) => prev.map((f) => f.meta.id === current!.meta.id ? { ...f, blob, done: true } : f));
          markTransferDone(current.meta.id);
          downloadBlob(blob, current.meta.name);
          current = null;
        }
      } else if (ev.data instanceof ArrayBuffer && current) {
        current.buffers.push(ev.data);
        current.receivedChunks++;
        const pct = Math.min(99, Math.round((current.receivedChunks / current.meta.chunks) * 100));
        setIncomingFiles((prev) => prev.map((f) => f.meta.id === current!.meta.id ? { ...f, receivedChunks: current!.receivedChunks } : f));
        updateTransferProgress(current.meta.id, pct);
      }
    };
  }

  function setupPeerConnection(pc: RTCPeerConnection, peerId: string) {
    pc.onicecandidate = async (ev) => {
      if (ev.candidate) await sendSignal('ice', ev.candidate.toJSON(), peerId);
    };

    pc.ondatachannel = (ev) => setupDataChannel(ev.channel, peerId);

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        onPeerDisconnected(peerId);
      }
    };
  }

  async function flushIce(peerId: string) {
    const entry = peers.current.get(peerId);
    if (!entry || entry.pendingIce.length === 0) return;
    const candidates = [...entry.pendingIce];
    entry.pendingIce = [];
    for (const c of candidates) await entry.pc.addIceCandidate(new RTCIceCandidate(c));
  }

  /** Call when user clicks "Connect" on a discovered peer. Creates offer. */
  const connectToPeer = useCallback(async (peerId: string) => {
    if (peers.current.has(peerId)) return; // already connecting

    const pc = await createPeerConnection();
    const entry: PeerEntry = { pc, dc: null, isHost: true, pendingIce: [], hostStarted: true };
    peers.current.set(peerId, entry);
    setupPeerConnection(pc, peerId);

    const dc = pc.createDataChannel('files', { ordered: true });
    setupDataChannel(dc, peerId);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await sendSignal('offer', offer, peerId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendSignal]);

  const handleSignal = useCallback(async (msg: SignalMessage) => {
    const peerId = msg.from;

    try {
      if (msg.type === 'offer') {
        let entry = peers.current.get(peerId);
        if (!entry) {
          const pc = await createPeerConnection();
          entry = { pc, dc: null, isHost: false, pendingIce: [], hostStarted: false };
          peers.current.set(peerId, entry);
          setupPeerConnection(pc, peerId);
        }
        const { pc } = entry;
        if (pc.signalingState !== 'stable') await pc.setLocalDescription({ type: 'rollback' });
        await pc.setRemoteDescription(new RTCSessionDescription(msg.data as RTCSessionDescriptionInit));
        await flushIce(peerId);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await sendSignal('answer', answer, peerId);

      } else if (msg.type === 'answer') {
        const entry = peers.current.get(peerId);
        if (!entry) return;
        await entry.pc.setRemoteDescription(new RTCSessionDescription(msg.data as RTCSessionDescriptionInit));
        await flushIce(peerId);

      } else if (msg.type === 'ice') {
        const candidate = msg.data as RTCIceCandidateInit;
        const entry = peers.current.get(peerId);
        if (!entry || !entry.pc.remoteDescription) {
          // Queue until remote description is set
          if (entry) entry.pendingIce.push(candidate);
          return;
        }
        await entry.pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (err) {
      console.error('[WebRTC signal error]', err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendSignal]);

  const sendFile = useCallback(async (file: File, targetPeerId?: string) => {
    const peerId = targetPeerId || activePeerRef.current;
    const entry = peerId ? peers.current.get(peerId) : undefined;
    const dc = entry?.dc;
    if (!dc || dc.readyState !== 'open') return;

    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const chunks = Math.ceil(file.size / CHUNK_SIZE);
    const meta: FileMetadata = { id, name: file.name, size: file.size, mime: file.type || 'application/octet-stream', chunks };

    dc.send(JSON.stringify({ type: 'file-meta', meta }));
    setSendProgress(0);
    setStoreSendProgress(0);
    upsertTransfer({ id, name: file.name, size: file.size, direction: 'sending', progress: 0, status: 'active' });

    let sent = 0;
    for await (const { data, index } of chunkFile(file)) {
      await drainBuffer(dc);
      if (dc.readyState !== 'open') return;
      dc.send(data);
      sent = index + 1;
      const progress = Math.min(99, Math.round((sent / chunks) * 100));
      setSendProgress(progress);
      setStoreSendProgress(progress);
      updateTransferProgress(id, progress);
    }

    dc.send(JSON.stringify({ type: 'file-end' }));
    setSendProgress(100);
    setStoreSendProgress(100);
    markTransferDone(id);
  }, []);

  const removePeer = useCallback((peerId: string) => {
    const entry = peers.current.get(peerId);
    if (entry) {
      entry.dc?.close();
      entry.pc.close();
      peers.current.delete(peerId);
    }
    if (activePeerRef.current === peerId) activePeerRef.current = null;
  }, []);

  const cleanup = useCallback(() => {
    for (const [id] of peers.current) removePeer(id);
  }, [removePeer]);

  return { connectToPeer, handleSignal, sendFile, sendProgress, incomingFiles, removePeer, cleanup };
}
