import type { PresenceChannel } from 'pusher-js';
import type { SignalMessage } from '@/types';
import { getPusherClient, setPusherAuthIdentity } from '@/lib/pusher-client';

interface JoinOptions {
  roomId: string;
  myId: string;
  myName: string;
  onReady: (id: string) => void;
  onPeerJoined: (peerId: string, peerName: string) => void;
  onPeerLeft: (peerId: string) => void;
  onSignal: (msg: SignalMessage) => void;
  onError?: (message: string) => void;
}

export class SignalingClient {
  private channel: PresenceChannel | null = null;
  private knownPeers = new Set<string>();

  join(options: JoinOptions) {
    // Set identity BEFORE subscribing so auth requests carry it via headers.
    setPusherAuthIdentity(options.myId, options.myName);

    let pusher;
    try {
      pusher = getPusherClient();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to initialize signaling';
      options.onError?.(msg);
      return;
    }

    const channelName = `presence-room-${options.roomId}`;
    const channel = pusher.subscribe(channelName) as PresenceChannel;
    this.channel = channel;
    this.knownPeers.clear();

    pusher.connection.bind('error', (error: any) => {
      const message =
        error?.error?.data?.message || error?.error?.message || 'Signaling connection failed';
      options.onError?.(message);
    });

    channel.bind('pusher:subscription_succeeded', (members: any) => {
      options.onReady(options.myId);
      members.each((member: any) => {
        if (member.id === options.myId) return;
        if (this.knownPeers.has(member.id)) return;
        this.knownPeers.add(member.id);
        // setTimeout ensures onReady's myId ref update propagates before host election.
        setTimeout(() => {
          options.onPeerJoined(member.id, member.info?.name || 'Unknown device');
        }, 0);
      });
    });

    channel.bind('pusher:member_added', (member: any) => {
      if (member.id === options.myId) return;
      if (this.knownPeers.has(member.id)) return;
      this.knownPeers.add(member.id);
      options.onPeerJoined(member.id, member.info?.name || 'Unknown device');
    });

    channel.bind('pusher:member_removed', (member: any) => {
      const peerId = member?.id;
      if (peerId) {
        this.knownPeers.delete(peerId);
        options.onPeerLeft(peerId);
      }
    });

    channel.bind('pusher:subscription_error', (status: number) => {
      options.onError?.(`Room subscription failed (${status})`);
    });

    channel.bind('signal', (msg: SignalMessage) => {
      if (msg.from === options.myId) return;
      // Ignore signals targeted at someone else.
      if (msg.to && msg.to !== options.myId) return;
      options.onSignal(msg);
    });
  }

  async sendSignal(
    roomId: string,
    from: string,
    type: SignalMessage['type'],
    data: SignalMessage['data'],
    to?: string,
  ) {
    const res = await fetch('/api/signal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, type, data, from, to }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Signal relay failed (${res.status})`);
    }
  }

  leave() {
    if (this.channel) {
      getPusherClient().unsubscribe(this.channel.name);
    }
    this.channel = null;
    this.knownPeers.clear();
  }
}
