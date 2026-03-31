import type { PresenceChannel } from 'pusher-js';
import type { SignalMessage } from '@/types';
import { getPusherClient } from '@/lib/pusher-client';

interface JoinOptions {
  roomId: string;
  myId: string;
  myName: string;
  onReady: (id: string) => void;
  onPeerJoined: (peerId: string, peerName: string) => void;
  onPeerLeft: () => void;
  onSignal: (msg: SignalMessage) => void;
}

export class SignalingClient {
  private channel: PresenceChannel | null = null;

  join(options: JoinOptions) {
    const pusher = getPusherClient();
    (pusher.config as any).auth = {
      params: { user_id: options.myId, user_name: options.myName },
    };

    const channelName = `presence-room-${options.roomId}`;
    const channel = pusher.subscribe(channelName) as PresenceChannel;
    this.channel = channel;

    channel.bind('pusher:subscription_succeeded', (members: any) => {
      options.onReady(options.myId);
      const others: any[] = [];
      members.each((member: any) => {
        if (member.id !== options.myId) others.push(member);
      });
      if (others.length === 1) {
        const peer = others[0];
        options.onPeerJoined(peer.id, peer.info?.name || 'Unknown device');
      }
    });

    channel.bind('pusher:member_added', (member: any) => {
      if (member.id === options.myId) return;
      options.onPeerJoined(member.id, member.info?.name || 'Unknown device');
    });

    channel.bind('pusher:member_removed', () => {
      options.onPeerLeft();
    });

    channel.bind('signal', (msg: SignalMessage) => {
      if (msg.from === options.myId) return;
      options.onSignal(msg);
    });
  }

  async sendSignal(
    roomId: string,
    from: string,
    type: SignalMessage['type'],
    data: SignalMessage['data'],
  ) {
    await fetch('/api/signal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, type, data, from }),
    });
  }

  leave() {
    if (this.channel) {
      getPusherClient().unsubscribe(this.channel.name);
    }
    this.channel = null;
  }
}
