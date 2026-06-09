'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { SignalMessage } from '@/types';
import { SignalingClient } from '@/lib/signaling';

interface UseSignalingOptions {
  roomId: string | null;
  myName: string;
  onPeerJoined: (peerId: string, peerName: string) => void;
  onPeerLeft: (peerId: string) => void;
  onSignal: (msg: SignalMessage) => void;
  onReady: (id: string) => void;
  onError?: (message: string) => void;
}

export function useSignaling({
  roomId,
  myName,
  onPeerJoined,
  onPeerLeft,
  onSignal,
  onReady,
  onError,
}: UseSignalingOptions) {
  const signalingRef = useRef<SignalingClient | null>(null);
  // Stable ID generated once and never changes — stored in a ref, NOT state.
  const myIdRef = useRef<string>('');

  if (!myIdRef.current) {
    myIdRef.current = `peer-${
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    }`;
  }

  // Keep callback refs stable so the signaling client always calls the latest version.
  const cbRefs = useRef({ onPeerJoined, onPeerLeft, onSignal, onReady, onError });
  useEffect(() => {
    cbRefs.current = { onPeerJoined, onPeerLeft, onSignal, onReady, onError };
  });

  const sendSignal = useCallback(
    async (type: SignalMessage['type'], data: SignalMessage['data'], to?: string) => {
      if (!roomId || !myIdRef.current || !signalingRef.current) return;
      await signalingRef.current.sendSignal(roomId, myIdRef.current, type, data, to);
    },
    [roomId],
  );

  useEffect(() => {
    if (!roomId) return;

    const signaling = new SignalingClient();
    signalingRef.current = signaling;

    signaling.join({
      roomId,
      myId: myIdRef.current,
      myName,
      onReady: (id) => cbRefs.current.onReady(id),
      onPeerJoined: (peerId, peerName) => cbRefs.current.onPeerJoined(peerId, peerName),
      onPeerLeft: (peerId) => cbRefs.current.onPeerLeft(peerId),
      onSignal: (msg) => cbRefs.current.onSignal(msg),
      onError: (msg) => cbRefs.current.onError?.(msg),
    });

    return () => {
      signalingRef.current?.leave();
      signalingRef.current = null;
    };
  }, [roomId, myName]);

  return { sendSignal, myId: myIdRef.current };
}
