export type RelayKind = 'offer' | 'answer' | 'ice-candidate';

export type RelayPayload = RTCSessionDescriptionInit | RTCIceCandidateInit;

export interface JoinClientMessage {
  type: 'join';
  room: string;
  peerId: string;
}

export interface RelayClientMessage {
  type: RelayKind;
  room: string;
  from: string;
  to?: string;
  payload: RelayPayload;
}

export type SignalingClientMessage = JoinClientMessage | RelayClientMessage;

export interface JoinedServerMessage {
  type: 'joined';
  room: string;
  peerCount: number;
  peers: string[];
}

export interface PeerJoinedServerMessage {
  type: 'peer-joined';
  room: string;
  peerId: string;
  peerCount: number;
}

export interface PeerLeftServerMessage {
  type: 'peer-left';
  room: string;
  peerId: string;
  peerCount: number;
}

export interface RelayServerMessage {
  type: RelayKind;
  room: string;
  from: string;
  to?: string;
  payload: RelayPayload;
}

export interface ErrorServerMessage {
  type: 'error';
  message: string;
}

export type SignalingServerMessage =
  | JoinedServerMessage
  | PeerJoinedServerMessage
  | PeerLeftServerMessage
  | RelayServerMessage
  | ErrorServerMessage;

export type SignalingMessageHandler = (message: SignalingServerMessage) => void;

export interface SignalingClientOptions {
  url: string;
  onError?: (error: string) => void;
}

export class SignalingClient {
  private ws: WebSocket | null = null;
  private handlers = new Set<SignalingMessageHandler>();
  private reconnectAttempts = 0;
  private maxRetries = 5;
  private reconnectTimer: number | null = null;
  private shouldReconnect = true;
  private currentRoom: string | null = null;
  private peerId: string | null = null;

  constructor(private readonly options: SignalingClientOptions) {}

  connect(peerId: string): void {
    this.peerId = peerId;
    this.shouldReconnect = true;
    this.openSocket();
  }

  join(room: string): void {
    if (!this.peerId) {
      this.options.onError?.('Missing peerId. Call connect() first.');
      return;
    }

    this.currentRoom = room;
    this.send({ type: 'join', room, peerId: this.peerId });
  }

  send(message: SignalingClientMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.options.onError?.('Signaling socket is not connected.');
      return;
    }

    this.ws.send(JSON.stringify(message));
  }

  onMessage(handler: SignalingMessageHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
  }

  private openSocket(): void {
    try {
      this.ws = new WebSocket(this.options.url);
    } catch (error) {
      this.options.onError?.(error instanceof Error ? error.message : 'Failed to create WebSocket.');
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      if (this.currentRoom) {
        this.join(this.currentRoom);
      }
    };

    this.ws.onmessage = (event: MessageEvent<string>) => {
      try {
        const parsed = JSON.parse(event.data) as SignalingServerMessage;
        for (const handler of this.handlers) {
          handler(parsed);
        }
      } catch {
        this.options.onError?.('Received malformed signaling message.');
      }
    };

    this.ws.onerror = () => {
      this.options.onError?.('Signaling socket error.');
    };

    this.ws.onclose = () => {
      if (!this.shouldReconnect) return;
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxRetries) {
      this.options.onError?.('Unable to reconnect to signaling server.');
      return;
    }

    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 8000);
    this.reconnectAttempts += 1;

    this.reconnectTimer = window.setTimeout(() => {
      this.openSocket();
    }, delay);
  }
}
