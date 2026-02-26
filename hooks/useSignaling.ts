'use client';

/**
 * useSignaling — subscribes to a Pusher presence channel and provides:
 *   - onPeerJoined / onPeerLeft callbacks when the remote peer enters/leaves
 *   - sendSignal() to relay WebRTC SDP / ICE data through our API route
 *   - onSignal callback invoked when we receive a signal from the peer
 *   - mySocketId so we can identify ourselves in signals
 */

import { useEffect, useRef, useCallback } from 'react';
import type { PresenceChannel } from 'pusher-js';
import type { SignalMessage } from '@/types';

interface UseSignalingOptions {
  roomId: string | null;
  myName: string;
  onPeerJoined: (peerId: string, peerName: string) => void;
  onPeerLeft: () => void;
  onSignal: (msg: SignalMessage) => void;
  onSocketId: (id: string) => void;
}

export function useSignaling({
  roomId,
  myName,
  onPeerJoined,
  onPeerLeft,
  onSignal,
  onSocketId,
}: UseSignalingOptions) {
  const channelRef = useRef<PresenceChannel | null>(null);
  const socketIdRef = useRef<string | null>(null);

  const sendSignal = useCallback(
    async (type: SignalMessage['type'], data: SignalMessage['data']) => {
      if (!roomId || !socketIdRef.current) return;
      await fetch('/api/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, type, data, from: socketIdRef.current }),
      });
    },
    [roomId],
  );

  useEffect(() => {
    if (!roomId) return;

    // Dynamically import Pusher client (browser-only)
    let cancelled = false;

    (async () => {
      const { getPusherClient } = await import('@/lib/pusher-client');
      if (cancelled) return;

      const pusher = getPusherClient();

      // Pass user info via auth payload — the API route reads these
      (pusher.config as any).auth = {
        headers: { 'Content-Type': 'application/json' },
        params: { user_id: pusher.sessionID, user_name: myName },
      };

      const channelName = `presence-room-${roomId}`;
      const channel = pusher.subscribe(channelName) as PresenceChannel;
      channelRef.current = channel;

      channel.bind('pusher:subscription_succeeded', (members: any) => {
        const id = String(pusher.sessionID);
        socketIdRef.current = id;
        onSocketId(id);

        // If there's already exactly one other member → they joined before us
        const others: any[] = [];
        members.each((m: any) => {
          if (m.id !== id) others.push(m);
        });
        if (others.length === 1) {
          const peer = others[0];
          onPeerJoined(peer.id, peer.info?.name || 'Unknown device');
        }
      });

      channel.bind('pusher:member_added', (member: any) => {
        onPeerJoined(member.id, member.info?.name || 'Unknown device');
      });

      channel.bind('pusher:member_removed', () => {
        onPeerLeft();
      });

      channel.bind('signal', (msg: SignalMessage) => {
        // Ignore signals we sent ourselves
        if (msg.from === socketIdRef.current) return;
        onSignal(msg);
      });
    })();

    return () => {
      cancelled = true;
      channelRef.current?.unsubscribe();
      channelRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  return { sendSignal };
}
