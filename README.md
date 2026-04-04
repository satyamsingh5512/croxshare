# Croxshare

Croxshare is a LAN-first, peer-to-peer file transfer app using WebRTC DataChannels.
After peers connect, file data goes directly device-to-device (no cloud relay).

## Project Layout

- `signaling/` Node.js + `ws` signaling server (offer/answer/ICE relay)
- `client/` React 18 + Vite + TailwindCSS frontend

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

Create `.env` files from `.env.example` as needed.

### Signaling env (optional)

You can export in shell or create `signaling/.env` with:

- `PORT=8080`
- `USE_WSS=false`
- `ALLOWED_ORIGINS=http://<LAN_IP>:5173,http://localhost:5173`

### Client env (optional)

Create `client/.env` with:

- `VITE_SIGNALING_URL=ws://<LAN_IP>:8080`
- `VITE_LAN_ONLY_ICE=false`

If `VITE_SIGNALING_URL` is omitted, the client defaults to `ws://<current-hostname>:8080`.

## 2. Install and Run

Open two terminals.

### Terminal 1: signaling server

```bash
cd signaling
npm install
npx ts-node --esm server.ts
```

### Terminal 2: client

```bash
cd client
npm install
npm run dev
```

Then open:

- `http://localhost:5173` (same machine, two tabs), or
- `http://<LAN_IP>:5173` (different device on same network)

## 3. How to Find Your LAN IP

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

- browser URL: `http://<LAN_IP>:5173`
- `VITE_SIGNALING_URL=ws://<LAN_IP>:8080`

## 4. Mobile Device Flow

1. Start both signaling server and client.
2. On laptop, open `http://<LAN_IP>:5173`.
3. On phone (same WiFi), open the same URL.
4. Create room on one device.
5. Share room code or scan QR from the other device.
6. Transfer files directly.

## 5. Expected Test Path

1. Two tabs join same room.
2. Connection badge becomes `Connected`.
3. Queue one small file and click `Send All`.
4. Observe progress, speed, ETA updates.
5. Receiver auto-downloads on completion.
6. Try large file (>100MB) to validate chunking and backpressure.

## 6. Notes

- Signaling server supports more than 2 peers in a room.
- Current UI pairs first available peer for direct transfer.
- No database and no persistent message storage.
