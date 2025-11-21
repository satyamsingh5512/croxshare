/*
 * Signaling Server for Nearby Share
 * - Simple WebSocket server using `ws`.
 * - Rooms are created with a roomId (6 digits formatted with dash for display but canonical is no-dash).
 * - Only one joiner allowed per room; subsequent joins are rejected.
 * - Messages are JSON with {type, payload}
 *
 * Run: node server/signalingServer.ts
 * Requires: npm install ws
 */

import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';

type WS = WebSocket;

interface Room {
  host?: WS;
  joiner?: WS;
  locked: boolean; // locked after join accepted
}

const rooms = new Map<string, Room>();

function send(ws: WS, msg: any) {
  try {
    ws.send(JSON.stringify(msg));
  } catch (e) {
    // ignore
  }
}

const server = http.createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(String(data));
      handleMessage(ws, message);
    } catch (err) {
      send(ws, { type: 'error', payload: { message: 'Invalid JSON' } });
    }
  });

  ws.on('close', () => {
    // Cleanup: remove host/joiner references
    for (const [roomId, room] of rooms.entries()) {
      if (room.host === ws) {
        // notify joiner
        if (room.joiner) send(room.joiner, { type: 'host-left', payload: {} });
        rooms.delete(roomId);
      } else if (room.joiner === ws) {
        if (room.host) send(room.host, { type: 'joiner-left', payload: {} });
        rooms.delete(roomId);
      }
    }
  });
});

function handleMessage(ws: WS, message: any) {
  const { type, payload } = message;
  switch (type) {
    case 'create-room':
      return handleCreateRoom(ws, payload);
    case 'join-room':
      return handleJoinRoom(ws, payload);
    case 'signal':
      return handleSignal(ws, payload);
    default:
      send(ws, { type: 'error', payload: { message: 'Unknown message type' } });
  }
}

function canonicalRoomId(raw: string) {
  return raw.replace(/[^0-9]/g, '').slice(0, 6);
}

function handleCreateRoom(ws: WS, payload: any) {
  const { roomId, deviceName } = payload || {};
  if (!roomId) return send(ws, { type: 'error', payload: { message: 'roomId required' } });
  const id = canonicalRoomId(roomId);
  if (rooms.has(id)) return send(ws, { type: 'create-failed', payload: { message: 'Room exists' } });
  rooms.set(id, { host: ws, locked: false });
  // attach meta
  (ws as any).__roomId = id;
  (ws as any).__deviceName = deviceName;
  send(ws, { type: 'created', payload: { roomId: id } });
}

function handleJoinRoom(ws: WS, payload: any) {
  const { roomId, deviceName } = payload || {};
  if (!roomId) return send(ws, { type: 'error', payload: { message: 'roomId required' } });
  const id = canonicalRoomId(roomId);
  const room = rooms.get(id);
  if (!room || !room.host) return send(ws, { type: 'join-failed', payload: { message: 'Room not found' } });
  if (room.locked || room.joiner) return send(ws, { type: 'join-failed', payload: { message: 'Room locked' } });

  room.joiner = ws;
  room.locked = true; // prevent others
  (ws as any).__roomId = id;
  (ws as any).__deviceName = deviceName;

  // notify host that joiner arrived
  send(room.host as WS, {
    type: 'joiner-arrived',
    payload: { deviceName },
  });

  // confirm join to joiner
  send(ws, { type: 'joined', payload: { roomId: id } });
}

function handleSignal(ws: WS, payload: any) {
  const { roomId, target, data } = payload || {};
  const id = canonicalRoomId(roomId || (ws as any).__roomId || '');
  const room = rooms.get(id);
  if (!room) return send(ws, { type: 'error', payload: { message: 'Room not found for signaling' } });

  // route to other peer
  const other = room.host === ws ? room.joiner : room.host;
  if (!other) return send(ws, { type: 'error', payload: { message: 'No peer connected' } });
  send(other, { type: 'signal', payload: { data } });
}

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
server.listen(PORT, () => console.log(`Signaling server listening on :${PORT}`));
