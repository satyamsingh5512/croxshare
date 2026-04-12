export class PeerConnectionManager {
    options;
    pc;
    dc = null;
    pendingCandidates = [];
    constructor(options) {
        this.options = options;
        const iceServers = options.lanOnly ? [] : [{ urls: 'stun:stun.l.google.com:19302' }];
        this.pc = new RTCPeerConnection({ iceServers });
        this.bindPeerEvents();
    }
    get connectionState() {
        return this.pc.connectionState;
    }
    get dataChannel() {
        return this.dc;
    }
    createDataChannel() {
        const channel = this.pc.createDataChannel('filedrop', { ordered: true });
        this.attachDataChannel(channel);
        return channel;
    }
    async createOffer() {
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
        }
        catch (error) {
            this.options.onError?.(error instanceof Error ? error.message : 'Failed to create offer.');
        }
    }
    async handleOffer(payload, fromPeerId) {
        try {
            await this.pc.setRemoteDescription(new RTCSessionDescription(payload));
            await this.flushIceCandidates();
            const answer = await this.pc.createAnswer();
            await this.pc.setLocalDescription(answer);
            this.options.emit({
                type: 'answer',
                room: this.options.room,
                from: this.options.selfId,
                to: fromPeerId,
                payload: answer,
            });
        }
        catch (error) {
            this.options.onError?.(error instanceof Error ? error.message : 'Failed to handle offer.');
        }
    }
    async handleAnswer(payload) {
        try {
            await this.pc.setRemoteDescription(new RTCSessionDescription(payload));
            await this.flushIceCandidates();
        }
        catch (error) {
            this.options.onError?.(error instanceof Error ? error.message : 'Failed to handle answer.');
        }
    }
    async handleIceCandidate(payload) {
        try {
            if (!this.pc.remoteDescription) {
                this.pendingCandidates.push(payload);
                return;
            }
            await this.pc.addIceCandidate(new RTCIceCandidate(payload));
        }
        catch (error) {
            this.options.onError?.(error instanceof Error ? error.message : 'Failed to add ICE candidate.');
        }
    }
    async flushIceCandidates() {
        while (this.pendingCandidates.length > 0) {
            const candidate = this.pendingCandidates.shift();
            if (candidate) {
                try {
                    await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
                }
                catch (error) {
                    this.options.onError?.(error instanceof Error ? error.message : 'Failed to flush ICE candidate.');
                }
            }
        }
    }
    destroy() {
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
        this.pendingCandidates = [];
    }
    bindPeerEvents() {
        this.pc.onicecandidate = (event) => {
            if (!event.candidate)
                return;
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
            if (state === 'connected')
                this.options.onOpen?.();
            if (state === 'disconnected' || state === 'failed' || state === 'closed') {
                this.options.onClose?.();
            }
        };
        this.pc.ondatachannel = (event) => {
            this.attachDataChannel(event.channel);
        };
    }
    attachDataChannel(channel) {
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
            this.options.onData?.(event.data);
        };
    }
}
