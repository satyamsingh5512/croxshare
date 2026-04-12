# Croxshare

Croxshare is a LAN-first, peer-to-peer file transfer app using WebRTC DataChannels.
After peers connect, file data goes directly device-to-device (no cloud relay).

## Project Layout

- `./` (root): Next.js 15 app router UI + API routes (`/api/signal`, `/api/stun`)
- `signaling/`: standalone Node.js + `ws` signaling server (offer/answer/ICE relay)
- `client/`: legacy/alternate React 18 + Vite frontend

## Features

- Room-based WebSocket signaling
- WebRTC DataChannel (`ordered: true`) transfer
- Lazy chunked upload with `File.slice()` + `FileReader`
- Backpressure handling with `bufferedAmount` threshold
- Progress, transfer speed, ETA, and per-file status
- Auto-download on receiver side
- QR code join flow for LAN devices
- Auto-reconnect signaling client with exponential backoff

## Requirements

- Node.js 18+
- Two devices on the same local network for LAN transfer

## 1. Setup Environment

Create the root `.env` file with your signaling provider settings:

- `PUSHER_APP_ID=...`
- `PUSHER_SECRET=...`
- `NEXT_PUBLIC_PUSHER_KEY=...`
- `NEXT_PUBLIC_PUSHER_CLUSTER=...`
- `NEXT_PUBLIC_APP_URL=http://<LAN_IP>:3000`

Optional TURN settings for harder NAT cases:

- `TURN_URLS=turn:host:3478,turns:host:5349`
- `TURN_USERNAME=...`
- `TURN_CREDENTIAL=...`

### Signaling env (optional)

You can export in shell or create `signaling/.env` with:

- `PORT=8080`
- `USE_WSS=false`
- `ALLOWED_ORIGINS=http://<LAN_IP>:5173,http://localhost:5173`

### Legacy Vite client env (optional)

Create `client/.env` with:

- `VITE_SIGNALING_URL=ws://<LAN_IP>:8080`
- `VITE_LAN_ONLY_ICE=false`

If `VITE_SIGNALING_URL` is omitted, the client defaults to `ws://<current-hostname>:8080`.

## 2. Install and Run

### Main app (recommended)

Open one terminal at repo root:

```bash
npm install
npm run dev
```

Then open:

- `http://localhost:3000`, or
- `http://<LAN_IP>:3000`

### Standalone signaling server (optional)

Open another terminal if you want the standalone `ws` server:

```bash
cd signaling
npm install
npm run dev
```

### Legacy Vite client (optional)

```bash
cd client
npm install
npm run dev
```

Then open `http://localhost:5173` (or `http://<LAN_IP>:5173`).

## 3. Health Checks

### Root app

```bash
npm run typecheck
npm run build
npm run test
```

### Signaling

```bash
cd signaling
npm run typecheck
npm run test
```

## 4. How to Find Your LAN IP

### Linux

```bash
ip addr
```

Look for an address like `192.168.x.x` or `10.x.x.x` on your active interface.

### macOS

```bash
ifconfig
```

### Windows

```powershell
ipconfig
```

Use that LAN IP in:

- browser URL (main app): `http://<LAN_IP>:3000`
- browser URL (legacy client): `http://<LAN_IP>:5173`
- `VITE_SIGNALING_URL=ws://<LAN_IP>:8080` (legacy client only)

## 5. Mobile Device Flow

1. Start the root Next.js app.
2. On laptop, open `http://<LAN_IP>:3000`.
3. On phone (same WiFi), open the same URL.
4. Create room on one device.
5. Share room code or scan QR from the other device.
6. Transfer files directly.

## 6. Expected Test Path

1. Two tabs join same room.
2. Connection badge becomes `Connected`.
3. Queue one small file and click `Send All`.
4. Observe progress, speed, ETA updates.
5. Receiver auto-downloads on completion.
6. Try large file (>100MB) to validate chunking and backpressure.

## 7. Notes

- Signaling server supports more than 2 peers in a room.
- Current UI pairs first available peer for direct transfer.
- No database and no persistent message storage.

## 8. WebRTC Debug Checklist

### Phase 1: Signaling (handshake)

- Open DevTools -> Network -> `WS` and confirm the signaling socket/channel stays connected.
- Enable app debug logs:
  - `localStorage.setItem('crox:webrtc-debug', '1')` then refresh, or
  - set `NEXT_PUBLIC_WEBRTC_DEBUG=1` in `.env` and restart dev server.
- In Console, verify logs for:
  - peer join/leave
  - SDP offer/answer send + receive
  - ICE candidate send + receive

### Phase 2: ICE + NAT traversal

- Open `chrome://webrtc-internals` (or Firefox `about:webrtc`).
- Confirm ICE state progresses (`new` -> `checking` -> `connected`/`completed`).
- If state stays `checking` or hits `failed`, add TURN (`TURN_URLS`, `TURN_USERNAME`, `TURN_CREDENTIAL`) in `.env`.
- Confirm `onicecandidate` fires and candidate exchange logs appear on both peers.

### Phase 3: DataChannel + file transfer

- Confirm DataChannel `onopen` is logged before transfer starts.
- Files are chunked at `16KB` (`CHUNK_SIZE = 16 * 1024`).
- Backpressure is implemented via:
  - `bufferedAmountLowThreshold = 64KB`
  - pause when `bufferedAmount > 512KB`
  - resume on `bufferedamountlow` event (with polling fallback)
