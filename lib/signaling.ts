import type { SignalMessage } from '@/types';

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
  private ws: WebSocket | null = null;
  private opts: JoinOptions | null = null;

  join(opts: JoinOptions) {
    this.opts = opts;
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${proto}://${location.host}/ws`);
    this.ws = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join', roomId: opts.roomId, peerId: opts.myId, name: opts.myName }));
      opts.onReady(opts.myId);
    };

    ws.onmessage = (ev) => {
      let msg: any;
      try { msg = JSON.parse(ev.data); } catch { return; }

      if (msg.type === 'peers') {
        for (const p of msg.peers) opts.onPeerJoined(p.id, p.name);
      } else if (msg.type === 'peer-joined') {
        opts.onPeerJoined(msg.peerId, msg.name);
      } else if (msg.type === 'peer-left') {
        opts.onPeerLeft(msg.peerId);
      } else if (msg.type === 'signal') {
        opts.onSignal({ type: msg.signal, data: msg.data, from: msg.from, to: opts.myId });
      }
    };

    ws.onerror = () => opts.onError?.('WebSocket connection failed');
    ws.onclose = () => {};
  }

  sendSignal(_roomId: string, _from: string, type: SignalMessage['type'], data: SignalMessage['data'], to?: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'signal', signal: type, data, to }));
    }
    return Promise.resolve();
  }

  leave() {
    this.ws?.close();
    this.ws = null;
  }
}
