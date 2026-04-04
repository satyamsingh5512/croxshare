import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import { WebSocket, WebSocketServer, type RawData } from 'ws';
import type {
  ClientMessage,
  ErrorMessage,
  JoinedMessage,
  PeerJoinedMessage,
  PeerLeftMessage,
  RelayEnvelope,
  RelayKind,
  RoomsMap,
  ServerMessage,
} from './types.js';

const PORT = Number(process.env.PORT || 8080);
const USE_WSS = process.env.USE_WSS === 'true';
const TLS_KEY_PATH = process.env.TLS_KEY_PATH || '';
const TLS_CERT_PATH = process.env.TLS_CERT_PATH || '';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((v) => v.trim())
  .filter(Boolean);

const rooms: RoomsMap = new Map();
const socketMeta = new WeakMap<WebSocket, { room: string; peerId: string }>();

function send(socket: WebSocket, message: ServerMessage): void {
  if (socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify(message));
}

function broadcast(room: string, message: ServerMessage, excludePeerId?: string): void {
  const peers = rooms.get(room);
  if (!peers) return;

  for (const [peerId, socket] of peers.entries()) {
    if (excludePeerId && peerId === excludePeerId) continue;
    send(socket, message);
  }
}

function getOrCreateRoom(room: string): Map<string, WebSocket> {
  const existing = rooms.get(room);
  if (existing) return existing;
  const created = new Map<string, WebSocket>();
  rooms.set(room, created);
  return created;
}

function joinRoom(socket: WebSocket, room: string, peerId: string): void {
  const peers = getOrCreateRoom(room);
  peers.set(peerId, socket);
  socketMeta.set(socket, { room, peerId });

  const peerIds = [...peers.keys()];
  const joined: JoinedMessage = {
    type: 'joined',
    room,
    peerCount: peerIds.length,
    peers: peerIds.filter((id) => id !== peerId),
  };
  send(socket, joined);

  const peerJoined: PeerJoinedMessage = {
    type: 'peer-joined',
    room,
    peerId,
    peerCount: peers.size,
  };
  broadcast(room, peerJoined, peerId);
}

function leaveRoom(socket: WebSocket): void {
  const meta = socketMeta.get(socket);
  if (!meta) return;

  const { room, peerId } = meta;
  const peers = rooms.get(room);
  if (!peers) return;

  peers.delete(peerId);
  socketMeta.delete(socket);

  if (peers.size === 0) {
    rooms.delete(room);
    return;
  }

  const peerLeft: PeerLeftMessage = {
    type: 'peer-left',
    room,
    peerId,
    peerCount: peers.size,
  };
  broadcast(room, peerLeft, peerId);
}

function relayMessage(sender: WebSocket, msg: ClientMessage & { type: RelayKind }): void {
  const meta = socketMeta.get(sender);
  if (!meta) {
    const error: ErrorMessage = { type: 'error', message: 'Join a room before relaying messages.' };
    send(sender, error);
    return;
  }

  if (msg.room !== meta.room || msg.from !== meta.peerId) {
    const error: ErrorMessage = { type: 'error', message: 'Invalid relay envelope.' };
    send(sender, error);
    return;
  }

  const peers = rooms.get(msg.room);
  if (!peers) return;

  const envelope: RelayEnvelope = {
    type: msg.type,
    room: msg.room,
    from: msg.from,
    to: msg.to,
    payload: msg.payload,
  };

  if (msg.to) {
    const targetSocket = peers.get(msg.to);
    if (targetSocket) send(targetSocket, envelope);
    return;
  }

  for (const [peerId, peerSocket] of peers.entries()) {
    if (peerId === msg.from) continue;
    send(peerSocket, envelope);
  }
}

function parseMessage(raw: RawData): ClientMessage | null {
  try {
    const text = typeof raw === 'string' ? raw : raw.toString();
    const parsed = JSON.parse(text) as Partial<ClientMessage>;
    if (!parsed || typeof parsed.type !== 'string') return null;

    if (parsed.type === 'join') {
      if (typeof parsed.room !== 'string' || typeof parsed.peerId !== 'string') return null;
      return { type: 'join', room: parsed.room, peerId: parsed.peerId };
    }

    if (parsed.type === 'offer' || parsed.type === 'answer' || parsed.type === 'ice-candidate') {
      if (typeof parsed.room !== 'string' || typeof parsed.from !== 'string') return null;
      return {
        type: parsed.type,
        room: parsed.room,
        from: parsed.from,
        to: typeof parsed.to === 'string' ? parsed.to : undefined,
        payload: parsed.payload,
      };
    }

    return null;
  } catch {
    return null;
  }
}

function originAllowed(originHeader: string | undefined): boolean {
  if (!originHeader || ALLOWED_ORIGINS.length === 0) return true;
  return ALLOWED_ORIGINS.includes(originHeader);
}

const server = USE_WSS
  ? https.createServer({
      key: fs.readFileSync(TLS_KEY_PATH),
      cert: fs.readFileSync(TLS_CERT_PATH),
    })
  : http.createServer();

const wss = new WebSocketServer({
  server,
  verifyClient: ({ origin }: { origin?: string }) => originAllowed(origin),
});

wss.on('connection', (socket) => {
  socket.on('message', (raw) => {
    const msg = parseMessage(raw);

    if (!msg) {
      const error: ErrorMessage = { type: 'error', message: 'Invalid message payload.' };
      send(socket, error);
      return;
    }

    if (msg.type === 'join') {
      joinRoom(socket, msg.room, msg.peerId);
      return;
    }

    relayMessage(socket, msg);
  });

  socket.on('close', () => {
    leaveRoom(socket);
  });

  socket.on('error', () => {
    leaveRoom(socket);
  });
});

server.listen(PORT, () => {
  const protocol = USE_WSS ? 'wss' : 'ws';
  console.log(`[signaling] listening on ${protocol}://0.0.0.0:${PORT}`);
});
