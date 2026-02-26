/*
 * SignalingClient — supports two modes:
 *
 * 1. WebSocket mode  (url starts with ws:// or wss://)
 *    Uses the standalone signalingServer.ts — good for local dev with --signaling flag.
 *
 * 2. HTTP polling mode  (url starts with / or http:// or https://)
 *    Uses the Next.js API route at /api/signal/[roomId].
 *    Works on Vercel with zero extra infrastructure — no separate server needed.
 *    Polls every 300 ms while a room is active.
 */

type Handler = (payload: any) => void;

export class SignalingClient {
  private ws: WebSocket | null = null;
  private handlers: Map<string, Handler[]> = new Map();
  private url: string;
  readonly isHttp: boolean;

  // HTTP-mode state
  private roomId: string | null = null;
  private role: 'host' | 'joiner' | null = null;
  private lastPollTs = 0;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private joinerArrivedEmitted = false;
  private roomReady = false;
  private signalBuffer: Array<{ roomId: string; data: any }> = [];

  constructor(url: string) {
    this.url = url;
    this.isHttp = !url.startsWith('ws');
  }

  connect() {
    if (this.isHttp) {
      setTimeout(() => this.emit('open', null), 0);
      return;
    }
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;
    this.ws = new WebSocket(this.url);
    this.ws.onmessage = (ev) => {
      try {
        const { type, payload } = JSON.parse(ev.data);
        this.emit(type, payload);
      } catch (e) {
        console.warn('Invalid signaling message', e);
      }
    };
    this.ws.onopen = () => this.emit('open', null);
    this.ws.onclose = () => this.emit('close', null);
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

  private emit(type: string, payload: any) {
    (this.handlers.get(type) || []).forEach((h) => h(payload));
  }

  private wsSend(type: string, payload: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Signaling socket not open');
    }
    this.ws.send(JSON.stringify({ type, payload }));
  }

  private apiUrl(roomId: string) {
    const base = this.url.endsWith('/') ? this.url.slice(0, -1) : this.url;
    return `${base}/${roomId}`;
  }

  private async httpPost(roomId: string, body: Record<string, unknown>) {
    const res = await fetch(this.apiUrl(roomId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  private flushBuffer() {
    const buf = this.signalBuffer.splice(0);
    for (const { roomId, data } of buf) {
      this.httpPost(roomId, { action: 'signal', from: this.role, data }).catch(() => {});
    }
  }

  private startPolling(roomId: string, role: 'host' | 'joiner') {
    this.stopPolling();
    // Use 0 so the first poll fetches ALL signals from the start of the room.
    // Without this the joiner misses the host's offer (sent before joiner joined).
    this.lastPollTs = 0;
    this.joinerArrivedEmitted = false;
    this.pollTimer = setInterval(() => this.poll(roomId, role), 300);
  }

  private stopPolling() {
    if (this.pollTimer !== null) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private async poll(roomId: string, role: 'host' | 'joiner') {
    try {
      const base = this.url.endsWith('/') ? this.url.slice(0, -1) : this.url;
      const res = await fetch(`${base}/${roomId}?role=${role}&after=${this.lastPollTs}`);
      if (!res.ok) {
        this.stopPolling();
        this.emit(role === 'host' ? 'joiner-left' : 'host-left', {});
        return;
      }
      const data = await res.json();
      if (role === 'host' && data.joinerJoined && !this.joinerArrivedEmitted) {
        this.joinerArrivedEmitted = true;
        this.emit('joiner-arrived', { deviceName: data.joinerName });
      }
      for (const sig of data.signals || []) {
        this.emit('signal', { roomId, data: sig.data });
        if (sig.ts > this.lastPollTs) this.lastPollTs = sig.ts;
      }
    } catch (_) {
      // network hiccup — keep retrying
    }
  }

  createRoom(roomId: string, deviceName?: string) {
    if (!this.isHttp) { this.wsSend('create-room', { roomId, deviceName }); return; }
    this.roomId = roomId;
    this.role = 'host';
    this.roomReady = false;
    this.httpPost(roomId, { action: 'create', deviceName }).then((data) => {
      if (data.ok) {
        this.roomReady = true;
        this.flushBuffer();
        this.emit('created', { roomId });
        this.startPolling(roomId, 'host');
      } else {
        this.emit('create-failed', { message: data.error });
      }
    });
  }

  joinRoom(roomId: string, deviceName?: string) {
    if (!this.isHttp) { this.wsSend('join-room', { roomId, deviceName }); return; }
    this.roomId = roomId;
    this.role = 'joiner';
    this.roomReady = false;
    this.httpPost(roomId, { action: 'join', deviceName }).then((data) => {
      if (data.ok) {
        this.roomReady = true;
        this.flushBuffer();
        this.emit('joined', { roomId });
        this.startPolling(roomId, 'joiner');
      } else {
        this.emit('join-failed', { message: data.error });
      }
    });
  }

  sendSignal(roomId: string, data: any) {
    if (!this.isHttp) { this.wsSend('signal', { roomId, data }); return; }
    if (!this.roomReady) {
      // Buffer until room is confirmed on server
      this.signalBuffer.push({ roomId, data });
      return;
    }
    this.httpPost(roomId, { action: 'signal', from: this.role, data }).catch(() => {});
  }

  close() {
    this.stopPolling();
    if (this.roomId && this.isHttp) {
      this.httpPost(this.roomId, { action: 'close' }).catch(() => {});
    }
    this.ws?.close();
  }
}
