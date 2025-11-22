# 📂 Nearby Share — Project Structure

```
croxshare/
│
├── 📄 package.json                      # Dependencies + npm scripts
├── 📄 README_NEARBY_SHARE.md           # Full feature documentation
├── 📄 QUICKSTART.md                    # Quick start guide
├── 📄 IMPLEMENTATION_COMPLETE.md       # Implementation checklist ✅
│
├── 📁 app/                             # Next.js App Router pages
│   ├── nearby-share/
│   │   └── page.tsx                    # Main Nearby Share UI
│   ├── privacy/
│   │   └── page.tsx                    # Privacy Policy page
│   └── terms/
│       └── page.tsx                    # Terms & Conditions page
│
├── 📁 components/                      # React components
│   └── nearby/
│       ├── DeviceNameModal.tsx         # Device name prompt
│       ├── HostPanel.tsx               # Host mode UI
│       ├── JoinPanel.tsx               # Joiner mode UI
│       ├── VerificationCard.tsx        # Security verification
│       ├── FileDropzone.tsx            # File picker
│       ├── FileProgress.tsx            # Progress bar
│       ├── FileHistory.tsx             # Transfer history
│       └── QRCodeDisplay.tsx           # QR code generator
│
├── 📁 hooks/                           # React hooks
│   └── useP2PFileTransfer.ts           # WebRTC P2P transfer logic
│
├── 📁 lib/                             # Browser libraries
│   └── signalingClient.ts              # WebSocket client wrapper
│
├── 📁 server/                          # Backend
│   └── signalingServer.ts              # WebSocket signaling server
│
└── 📁 docs/                            # Documentation
    ├── SIGNALING_SERVER_SETUP.md       # Deployment guide
    └── package-additions.json          # Dependency reference
```

---

## 🔄 Data Flow Diagram

```
┌─────────────┐                  ┌─────────────────────┐                  ┌─────────────┐
│             │                  │                     │                  │             │
│   HOST      │◄────WebSocket────│  Signaling Server   │────WebSocket────►│   JOINER    │
│  (Sender)   │                  │   (Node.js + ws)    │                  │ (Receiver)  │
│             │                  │                     │                  │             │
└──────┬──────┘                  └─────────────────────┘                  └──────┬──────┘
       │                                                                          │
       │  1. create-room                                                          │
       │────────────────────────────────────────────────────────────────────────►│
       │                                                                          │
       │  2. joiner-arrived                                                       │
       │◄────────────────────────────────────────────────────────────────────────│
       │                                                                          │
       │  3. SDP Offer                                                            │
       │────────────────────────────────────────────────────────────────────────►│
       │                                                                          │
       │  4. SDP Answer                                                           │
       │◄────────────────────────────────────────────────────────────────────────│
       │                                                                          │
       │  5. ICE Candidates (both directions)                                     │
       │◄────────────────────────────────────────────────────────────────────────│
       │                                                                          │
       │  6. Session Secret (for verification)                                    │
       │────────────────────────────────────────────────────────────────────────►│
       │                                                                          │
       │         ╔═══════════════════════════════════════╗                        │
       │         ║  WebRTC DataChannel Established (P2P) ║                        │
       │         ╚═══════════════════════════════════════╝                        │
       │                                                                          │
       │  7. File Transfer (16KB chunks)                                          │
       │═════════════════════════════════════════════════════════════════════════►│
       │                           Direct P2P                                     │
       │                      (No Server Involved)                                │
       │                                                                          │
```

---

## 🧩 Component Hierarchy

```
NearbySharePage
├── DeviceNameModal (if first time)
└── Mode Selection
    ├── HostPanel
    │   ├── DeviceNameModal
    │   ├── Room Code Card
    │   ├── QRCodeDisplay
    │   ├── VerificationCard
    │   ├── FileDropzone
    │   └── FileProgress
    └── JoinPanel
        ├── Room Code Input
        ├── VerificationCard
        ├── Received Files List
        └── FileProgress
```

---

## 🎯 Hook Architecture

```typescript
useP2PFileTransfer(signalingUrl)
  │
  ├─► signalingClient (WebSocket)
  │     ├─► create-room
  │     ├─► join-room
  │     └─► signal
  │
  ├─► RTCPeerConnection
  │     ├─► createOffer()
  │     ├─► createAnswer()
  │     ├─► addIceCandidate()
  │     └─► setRemoteDescription()
  │
  ├─► DataChannel ("file")
  │     ├─► onmessage (control + binary)
  │     ├─► send(meta)
  │     ├─► send(chunks)
  │     └─► send(end)
  │
  └─► Returns
        ├─► connectionState
        ├─► isVerified
        ├─► verifyCode
        ├─► peerDeviceName
        ├─► sendFile()
        ├─► receivedFiles[]
        ├─► sendProgress
        ├─► receiveProgress
        └─► error
```

---

## 📊 State Machine

```
┌──────────────┐
│ disconnected │
└───────┬──────┘
        │ createRoom() / joinRoom()
        ▼
┌──────────────┐
│  connecting  │
└───────┬──────┘
        │ WebRTC established
        ▼
┌──────────────┐
│  connected   │◄────── Display verification code
└───────┬──────┘
        │ confirmVerification()
        ▼
┌──────────────┐
│   verified   │◄────── File transfer enabled
└──────────────┘
```

---

## 🔐 Security Flow

```
1. Host generates random sessionSecret (16 bytes hex)
   │
   ├─► Host computes: verifyCode = SHA-256(secret) % 10000
   │
   └─► Sends secret to Joiner via signaling server
                │
                └─► Joiner receives secret
                    │
                    └─► Joiner computes: verifyCode = SHA-256(secret) % 10000

2. Both display 4-digit code

3. User manually verifies codes match

4. Both click "Yes, it matches"

5. File transfer unlocked ✅
```

---

## 📦 Dependencies Graph

```
Nearby Share Feature
│
├─► Next.js 14 (App Router)
│   └─► React + TypeScript
│
├─► Tailwind CSS (styling)
│
├─► qrcode (QR generation)
│
├─► ws (WebSocket server)
│   └─► http (Node.js built-in)
│
└─► Browser APIs
    ├─► WebRTC (RTCPeerConnection, DataChannel)
    ├─► WebSocket (browser native)
    ├─► Crypto (SHA-256 for verification)
    └─► localStorage (device name, history)
```

---

## 🚀 Deployment Paths

### Development
```
Local Machine
├─► Terminal 1: npm run signaling (port 8080)
└─► Terminal 2: npm run dev (port 3000)
```

### Production Option A (Separate Services)
```
┌─────────────────┐         ┌──────────────────┐
│  Next.js App    │         │  Signaling Server│
│  (Vercel)       │         │  (Fly.io/Railway)│
│  Port 443       │         │  Port 8080       │
└─────────────────┘         └──────────────────┘
         │                           │
         └───────────┬───────────────┘
                     ▼
              Browser connects to both
```

### Production Option B (Custom Next.js Server)
```
┌────────────────────────────────┐
│   Custom Next.js Server        │
│   ├─► HTTP handler (Next.js)   │
│   └─► WebSocket handler (ws)   │
│   Port 443                      │
└────────────────────────────────┘
```

---

## 📈 Performance Characteristics

| Metric | Value |
|--------|-------|
| Chunk Size | 16 KB |
| Max File Size | Limited by browser memory (~2GB typical) |
| Transfer Speed | ~10-100 MB/s (LAN), varies by network |
| Latency | <100ms on LAN |
| Concurrent Transfers | 1 file at a time per session |
| Room Capacity | 1 host + 1 joiner |

---

**Visual guide complete! 🎨**
