'use client';

/**
 * useSignaling — subscribes to a Pusher presence channel and provides:
 *   - onPeerJoined / onPeerLeft callbacks when the remote peer enters/leaves
 *   - sendSignal() to relay WebRTC SDP / ICE data through our API route
 *   - onSignal callback invoked when we receive a signal from the peer
 *   - mySocketId so we can identify ourselves in signals
 */

import { useEffect, useRef, useCallback } from 'react';
import type { SignalMessage } from '@/types';
import { SignalingClient } from '@/lib/signaling';

interface UseSignalingOptions {
  roomId: string | null;
  myName: string;
  onPeerJoined: (peerId: string, peerName: string) => void;
  onPeerLeft: () => void;
  onSignal: (msg: SignalMessage) => void;
  onSocketId: (id: string) => void;
  onError?: (message: string) => void;
}

export function useSignaling({
  roomId,
  myName,
  onPeerJoined,
  onPeerLeft,
  onSignal,
  onSocketId,
  onError,
}: UseSignalingOptions) {
  const signalingRef = useRef<SignalingClient | null>(null);
  const myIdRef = useRef<string>('');
  const onPeerJoinedRef = useRef(onPeerJoined);
  const onPeerLeftRef = useRef(onPeerLeft);
  const onSignalRef = useRef(onSignal);
  const onSocketIdRef = useRef(onSocketId);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onPeerJoinedRef.current = onPeerJoined;
  }, [onPeerJoined]);

  useEffect(() => {
    onPeerLeftRef.current = onPeerLeft;
  }, [onPeerLeft]);

  useEffect(() => {
    onSignalRef.current = onSignal;
  }, [onSignal]);

  useEffect(() => {
    onSocketIdRef.current = onSocketId;
  }, [onSocketId]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  if (!myIdRef.current) {
    const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    myIdRef.current = `peer-${random}`;
  }

  const sendSignal = useCallback(
    async (type: SignalMessage['type'], data: SignalMessage['data']) => {
      if (!roomId || !myIdRef.current || !signalingRef.current) return;
      try {
        await signalingRef.current.sendSignal(roomId, myIdRef.current, type, data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to send signaling message';
        onErrorRef.current?.(message);
        throw err;
      }
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
      onReady: (id) => onSocketIdRef.current(id),
      onPeerJoined: (peerId, peerName) => onPeerJoinedRef.current(peerId, peerName),
      onPeerLeft: () => onPeerLeftRef.current(),
      onSignal: (msg) => onSignalRef.current(msg),
      onError: (message) => onErrorRef.current?.(message),
    });

    return () => {
      signalingRef.current?.leave();
      signalingRef.current = null;
    };
  }, [roomId, myName]);

  return { sendSignal };
}
