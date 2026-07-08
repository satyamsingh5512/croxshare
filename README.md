# CroxShare

## System design diagram

```mermaid
flowchart LR
  A[Sender Browser] <-- WebRTC DataChannel --> B[Receiver Browser]

  subgraph NextJS[Next.js App]
    UI[UI + Room UX]
    SignalAPI[/api/signal/]
    StunAPI[/api/stun/]
  end

  subgraph Signaling[Signaling Layer]
    Pusher[(Pusher Presence Channel)]
    WS[(Optional ws Signaling Server)]
  end

  subgraph Ice[ICE Services]
    STUN[Public STUN]
    TURN[(Optional TURN)]
  end

  A --> UI
  B --> UI
  UI --> SignalAPI
  SignalAPI --> Pusher
  A -. optional .-> WS
  B -. optional .-> WS

  A --> StunAPI
  B --> StunAPI
  StunAPI --> STUN
  StunAPI --> TURN
```

## Overview

CroxShare is a LAN-first peer-to-peer file sharing app. It uses WebRTC DataChannels for direct browser-to-browser transfers and uses WebSockets for signaling. Files move device-to-device with no file relay server.

## What it does

- Short room codes for quick pairing
- Direct WebRTC DataChannel transfer (ordered, binary)
- Progress, speed, and ETA with auto-download on completion
- TURN fallback via `/api/stun` for harder NAT cases

## How it works

1. Sender creates a room and shares the code.
2. Peers exchange SDP + ICE over WebSockets (Pusher or optional `ws`).
3. A WebRTC peer connection opens a DataChannel.
4. Files are chunked and sent with backpressure handling.
5. Receiver reassembles chunks and downloads.

## Tech stack

- WebRTC DataChannels, WebSockets (Pusher presence by default)
- Next.js 15 + React 19 + TypeScript + Tailwind CSS

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000` or `http://<LAN_IP>:3000`.

## Environment

- `PUSHER_APP_ID`, `PUSHER_SECRET`, `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER`
- `TURN_URLS`, `TURN_USERNAME`, `TURN_CREDENTIAL` (optional)

## Deployment

This app runs a custom Node server (`server.js`) with a `ws` WebSocket signaling
server attached, so it needs a host that supports persistent, long-running
processes — not a stateless serverless platform like Vercel.

Deploy on [Render](https://render.com) as a **Web Service**:

1. Push this repo to GitHub/GitLab.
2. In the Render dashboard, choose New → Web Service and connect the repo
   (or run `render.yaml` as a Blueprint for infra-as-code setup).
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Set the environment variables listed above in the Render dashboard —
   in particular `NEXT_PUBLIC_APP_URL` should be your `onrender.com` URL
   (or custom domain).

Render's free tier spins the service down after 15 minutes of inactivity
(cold starts take 30–60s on the next request, and idle WebSocket connections
are subject to the same timeout). Use a paid instance type for always-on
availability.

## Resume-aligned highlights

- WebRTC-based P2P file sharing with Node.js signaling and WebSockets.
- Chunked file transport with backpressure for smooth large transfers.
