import type { RelayClientMessage } from './signaling';

export interface PeerOptions {
  room: string;
  selfId: string;
  targetPeerId?: string;
  lanOnly?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (message: string) => void;
  onStateChange?: (state: RTCPeerConnectionState) => void;
  onData?: (data: string | ArrayBuffer | Blob) => void;
  emit: (message: RelayClientMessage) => void;
}

export class PeerConnectionManager {
  private pc: RTCPeerConnection;
  private dc: RTCDataChannel | null = null;

  constructor(private readonly options: PeerOptions) {
    const iceServers = options.lanOnly ? [] : [{ urls: 'stun:stun.l.google.com:19302' }];
    this.pc = new RTCPeerConnection({ iceServers });
    this.bindPeerEvents();
  }

  get connectionState(): RTCPeerConnectionState {
    return this.pc.connectionState;
  }

  get dataChannel(): RTCDataChannel | null {
    return this.dc;
  }

  createDataChannel(): RTCDataChannel {
    const channel = this.pc.createDataChannel('filedrop', { ordered: true });
    this.attachDataChannel(channel);
    return channel;
  }

  async createOffer(): Promise<void> {
    try {
      if (!this.dc) {
        this.createDataChannel();
      }
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
      this.options.emit({
        type: 'offer',
        room: this.options.room,
        from: this.options.selfId,
        to: this.options.targetPeerId,
        payload: offer,
      });
    } catch (error) {
      this.options.onError?.(error instanceof Error ? error.message : 'Failed to create offer.');
    }
  }

  async handleOffer(payload: RTCSessionDescriptionInit, fromPeerId: string): Promise<void> {
    try {
      await this.pc.setRemoteDescription(new RTCSessionDescription(payload));
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);
      this.options.emit({
        type: 'answer',
        room: this.options.room,
        from: this.options.selfId,
        to: fromPeerId,
        payload: answer,
      });
    } catch (error) {
      this.options.onError?.(error instanceof Error ? error.message : 'Failed to handle offer.');
    }
  }

  async handleAnswer(payload: RTCSessionDescriptionInit): Promise<void> {
    try {
      await this.pc.setRemoteDescription(new RTCSessionDescription(payload));
    } catch (error) {
      this.options.onError?.(error instanceof Error ? error.message : 'Failed to handle answer.');
    }
  }

  async handleIceCandidate(payload: RTCIceCandidateInit): Promise<void> {
    try {
      await this.pc.addIceCandidate(new RTCIceCandidate(payload));
    } catch (error) {
      this.options.onError?.(error instanceof Error ? error.message : 'Failed to add ICE candidate.');
    }
  }

  destroy(): void {
    if (this.dc) {
      this.dc.onopen = null;
      this.dc.onclose = null;
      this.dc.onerror = null;
      this.dc.onmessage = null;
      this.dc.close();
      this.dc = null;
    }

    this.pc.onicecandidate = null;
    this.pc.onconnectionstatechange = null;
    this.pc.ondatachannel = null;
    this.pc.close();
  }

  private bindPeerEvents(): void {
    this.pc.onicecandidate = (event) => {
      if (!event.candidate) return;
      this.options.emit({
        type: 'ice-candidate',
        room: this.options.room,
        from: this.options.selfId,
        to: this.options.targetPeerId,
        payload: event.candidate.toJSON(),
      });
    };

    this.pc.onconnectionstatechange = () => {
      const state = this.pc.connectionState;
      this.options.onStateChange?.(state);
      if (state === 'connected') this.options.onOpen?.();
      if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        this.options.onClose?.();
      }
    };

    this.pc.ondatachannel = (event) => {
      this.attachDataChannel(event.channel);
    };
  }

  private attachDataChannel(channel: RTCDataChannel): void {
    this.dc = channel;
    this.dc.binaryType = 'arraybuffer';

    this.dc.onopen = () => {
      this.options.onOpen?.();
    };

    this.dc.onclose = () => {
      this.options.onClose?.();
    };

    this.dc.onerror = () => {
      this.options.onError?.('DataChannel error.');
    };

    this.dc.onmessage = (event) => {
      this.options.onData?.(event.data as string | ArrayBuffer | Blob);
    };
  }
}
