// @ts-check
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// roomId -> Map<peerId, { ws, name }>
const rooms = new Map();

function broadcast(roomId, payload, excludeId = null) {
  const room = rooms.get(roomId);
  if (!room) return;
  const msg = JSON.stringify(payload);
  for (const [id, peer] of room) {
    if (id !== excludeId && peer.ws.readyState === 1) peer.ws.send(msg);
  }
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    // Lightweight health check for Render's health probe and keep-warm pings.
    // Short-circuits before Next.js so it stays cheap and never renders a page.
    if (req.url === '/healthz') {
      res.writeHead(200, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' });
      res.end('ok');
      return;
    }

    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    let myId = null;
    let myRoom = null;

    ws.on('message', (raw) => {
      let msg;
      try { msg = JSON.parse(raw.toString()); } catch { return; }

      if (msg.type === 'join') {
        myId = msg.peerId;
        myRoom = msg.roomId;
        if (!rooms.has(myRoom)) rooms.set(myRoom, new Map());
        const room = rooms.get(myRoom);

        // Send existing peers to joiner
        const peers = [];
        for (const [id, peer] of room) peers.push({ id, name: peer.name });
        ws.send(JSON.stringify({ type: 'peers', peers }));

        // Notify existing peers
        broadcast(myRoom, { type: 'peer-joined', peerId: myId, name: msg.name }, myId);

        room.set(myId, { ws, name: msg.name });
        return;
      }

      // Signal relay: offer, answer, ice
      if (msg.type === 'signal' && myRoom) {
        const room = rooms.get(myRoom);
        const target = room?.get(msg.to);
        if (target?.ws.readyState === 1) {
          target.ws.send(JSON.stringify({ ...msg, from: myId }));
        }
      }
    });

    ws.on('close', () => {
      if (!myRoom || !myId) return;
      const room = rooms.get(myRoom);
      if (!room) return;
      room.delete(myId);
      broadcast(myRoom, { type: 'peer-left', peerId: myId });
      if (room.size === 0) rooms.delete(myRoom);
    });
  });

  const port = process.env.PORT || 3000;
  server.listen(port, '0.0.0.0', () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
