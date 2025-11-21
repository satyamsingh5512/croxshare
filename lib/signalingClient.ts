/*
 * Lightweight browser signaling client for the WebSocket signaling server.
 * - Wraps a WebSocket and emits typed events.
 * - Implements create-room, join-room and raw signal forwarding.
 */

type Handler = (payload: any) => void;

export class SignalingClient {
  private ws: WebSocket | null = null;
  private handlers: Map<string, Handler[]> = new Map();
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;
    this.ws = new WebSocket(this.url);
    this.ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        const { type, payload } = msg;
        (this.handlers.get(type) || []).forEach((h) => h(payload));
      } catch (e) {
        console.warn('Invalid signaling message', e);
      }
    };
    this.ws.onopen = () => {
      (this.handlers.get('open') || []).forEach((h) => h(null));
    };
    this.ws.onclose = () => {
      (this.handlers.get('close') || []).forEach((h) => h(null));
    };
  }

  on(type: string, cb: Handler) {
    const arr = this.handlers.get(type) || [];
    arr.push(cb);
    this.handlers.set(type, arr);
  }

  off(type: string, cb: Handler) {
    const arr = this.handlers.get(type) || [];
    this.handlers.set(type, arr.filter((f) => f !== cb));
  }

  private send(type: string, payload: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Signaling socket not open');
    }
    this.ws.send(JSON.stringify({ type, payload }));
  }

  createRoom(roomId: string, deviceName?: string) {
    this.send('create-room', { roomId, deviceName });
  }

  joinRoom(roomId: string, deviceName?: string) {
    this.send('join-room', { roomId, deviceName });
  }

  // application-level signal routing (offer/answer/ice/session-secret etc.)
  sendSignal(roomId: string, data: any) {
    this.send('signal', { roomId, data });
  }

  close() {
    this.ws?.close();
  }
}
