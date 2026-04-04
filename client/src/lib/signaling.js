export class SignalingClient {
    options;
    ws = null;
    handlers = new Set();
    reconnectAttempts = 0;
    maxRetries = 5;
    reconnectTimer = null;
    shouldReconnect = true;
    currentRoom = null;
    peerId = null;
    constructor(options) {
        this.options = options;
    }
    connect(peerId) {
        this.peerId = peerId;
        this.shouldReconnect = true;
        this.openSocket();
    }
    join(room) {
        if (!this.peerId) {
            this.options.onError?.('Missing peerId. Call connect() first.');
            return;
        }
        this.currentRoom = room;
        this.send({ type: 'join', room, peerId: this.peerId });
    }
    send(message) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            this.options.onError?.('Signaling socket is not connected.');
            return;
        }
        this.ws.send(JSON.stringify(message));
    }
    onMessage(handler) {
        this.handlers.add(handler);
        return () => {
            this.handlers.delete(handler);
        };
    }
    disconnect() {
        this.shouldReconnect = false;
        if (this.reconnectTimer !== null) {
            window.clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        this.ws?.close();
        this.ws = null;
    }
    openSocket() {
        try {
            this.ws = new WebSocket(this.options.url);
        }
        catch (error) {
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
        this.ws.onmessage = (event) => {
            try {
                const parsed = JSON.parse(event.data);
                for (const handler of this.handlers) {
                    handler(parsed);
                }
            }
            catch {
                this.options.onError?.('Received malformed signaling message.');
            }
        };
        this.ws.onerror = () => {
            this.options.onError?.('Signaling socket error.');
        };
        this.ws.onclose = () => {
            if (!this.shouldReconnect)
                return;
            this.scheduleReconnect();
        };
    }
    scheduleReconnect() {
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
