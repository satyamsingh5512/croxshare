# Signaling Server Setup

## Option 1: Standalone Server (Recommended for Development)

Run the WebSocket signaling server as a separate Node process:

```bash
# Install dependency
npm install ws

# Run the server
node server/signalingServer.ts
# Or with tsx/ts-node:
npx tsx server/signalingServer.ts
```

The server listens on port 8080 by default. Change via `PORT` environment variable:

```bash
PORT=3001 node server/signalingServer.ts
```

---

## Option 2: Deploy with Next.js (Production)

Next.js doesn't support WebSocket servers in API routes out of the box. You have two approaches:

### A. Use a custom Next.js server

Create `server.js` at the project root:

```js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ server, path: '/api/signaling' });

  // Copy the logic from server/signalingServer.ts here
  // (rooms Map, handleMessage, etc.)

  const rooms = new Map();
  wss.on('connection', (ws) => {
    // ... copy handler logic
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
```

Then update `package.json`:

```json
{
  "scripts": {
    "dev": "node server.js",
    "build": "next build",
    "start": "NODE_ENV=production node server.js"
  }
}
```

### B. Deploy signaling server separately

Deploy the standalone signaling server (`server/signalingServer.ts`) on a platform like:

- **Fly.io** (WebSocket-friendly)
- **Railway** (supports long-lived connections)
- **DigitalOcean App Platform**
- **AWS EC2 / Fargate**

Then set the WebSocket URL in your Next.js app (e.g., via `.env.local`):

```
NEXT_PUBLIC_SIGNALING_URL=wss://signaling.yourapp.com
```

Update `HostPanel.tsx` and `JoinPanel.tsx`:

```ts
const SIGNALING_URL = process.env.NEXT_PUBLIC_SIGNALING_URL || 'ws://localhost:8080';
```

---

## Security Considerations

- **Production**: Use WSS (secure WebSocket) with TLS certificates.
- **Authentication**: Add token-based auth to prevent abuse.
- **Rate limiting**: Limit room creation and join attempts per IP.
- **CORS**: Configure allowed origins if needed.
