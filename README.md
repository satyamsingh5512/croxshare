# Croxshare

Share files instantly between devices on the same WiFi network.
No login. No cloud. No backend database. Pure peer-to-peer.

---

## How it works

1. **Sender** opens the app and clicks **Send Files** → gets a 6-digit room code + QR code.
2. **Receiver** opens the app on another device (same WiFi) → clicks **Receive Files** → enters the code.
3. Both sides confirm the 4-digit security code match → files transfer directly via WebRTC (browser-to-browser).

Files never leave your local network.

---

## Requirements

- Both devices on the **same WiFi / local network**
- Any modern browser (Chrome, Firefox, Edge, Safari)
- Node.js 18+

---

## Run locally

    # Install dependencies
    npm install

    # Start the signaling server (needed for WebRTC handshake)
    npm run signaling

    # In another terminal, start the Next.js app
    npm run dev

Open http://localhost:3000 on both devices.

The signaling server only exchanges WebRTC handshake messages — it never sees your file data.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run signaling` | Start WebSocket signaling server |
| `npm run signaling:dev` | Start signaling server with hot-reload |

---

## Tech

- Next.js 15 + React 19 — frontend
- WebRTC DataChannel — direct browser-to-browser file transfer
- WebSocket signaling server (ws) — room creation and WebRTC handshake only
- QR Code — easy mobile joining
- No database, no authentication, no cloud storage
