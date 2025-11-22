# Nearby Share Over WiFi — P2P File Sharing Feature

**Premium, production-ready peer-to-peer file sharing** built for decentralized chat web apps. Transfer files directly between devices on the same network using **WebRTC DataChannels** — no server storage, end-to-end encrypted, with device identity verification.

---

## 🎨 Design & UX

- **Modern, light-mode UI** inspired by Apple, Linear, Notion, and Vercel
- **Color palette**:
  - Background: `#F9FAFB`
  - Primary: `#4F46E5` (Indigo 600)
  - Accent: `#0EA5E9` (Sky blue)
  - Text: `#111827` / `#4B5563`
- **Responsive**: Mobile-first, works on phones → ultra-wide monitors
- **Smooth animations** with Tailwind CSS utilities

---

## 🚀 Features

### Core P2P Transfer
- **Host Mode**: Create a sharing session, generate room code + QR
- **Join Mode**: Enter room code and connect
- **Chunked file transfer**: 16KB chunks via WebRTC DataChannel
- **Progress tracking**: Real-time send/receive progress bars

### Security
- **Device identity**: Persistent device name stored in localStorage
- **Room locking**: Only one joiner allowed per room
- **Verification code**: 4-digit hash-based code displayed on both peers; must confirm before transfer
- **No server storage**: Files transferred P2P; signaling server only relays SDP/ICE/secrets

### UX Polish
- **QR code sharing**: Auto-generated QR for easy mobile join
- **File history**: Local history (no file payloads stored)
- **Device name modal**: Prompt once, editable later
- **Status indicators**: Connection state displayed throughout

---

## 📁 Project Structure

```
/app
  /nearby-share
    page.tsx               # Main Nearby Share UI (host/join modes)
  /terms
    page.tsx               # Terms & Conditions
  /privacy
    page.tsx               # Privacy Policy
/components
  /nearby
    DeviceNameModal.tsx    # Device name prompt
    HostPanel.tsx          # Host UI (create room, QR, verification, send)
    JoinPanel.tsx          # Joiner UI (enter code, verification, receive)
    VerificationCard.tsx   # Verification code display
    FileDropzone.tsx       # Drag & drop / browse file selector
    FileProgress.tsx       # Progress bar
    FileHistory.tsx        # Local transfer history
    QRCodeDisplay.tsx      # QR code generator
/hooks
  useP2PFileTransfer.ts    # WebRTC + DataChannel hook (state machine)
/lib
  signalingClient.ts       # Browser WebSocket client wrapper
/server
  signalingServer.ts       # Standalone WebSocket signaling server
/docs
  SIGNALING_SERVER_SETUP.md # Deployment guide
```

---

## 🛠️ Installation

### 1. Install Dependencies

```bash
npm install ws qrcode
npm install --save-dev @types/ws @types/qrcode
```

**Required packages**:
- `ws` — WebSocket server (Node.js)
- `qrcode` — QR code generation
- `@types/ws`, `@types/qrcode` — TypeScript definitions

### 2. Start Signaling Server

```bash
# Development (standalone)
npx tsx server/signalingServer.ts
# Or:
node server/signalingServer.ts
```

Server listens on **port 8080** by default. Change via:

```bash
PORT=3001 npx tsx server/signalingServer.ts
```

### 3. Run Next.js App

```bash
npm run dev
```

Visit: `http://localhost:3000/nearby-share`

---

## 🧪 Testing the Feature

### Local Test (Two Browsers)

1. **Host**: Open `http://localhost:3000/nearby-share` in Chrome
   - Click **"I'm Sending"**
   - Click **"Create Sharing Session"**
   - Note the room code (e.g., `123-456`)

2. **Joiner**: Open `http://localhost:3000/nearby-share` in Firefox (or Incognito)
   - Click **"I'm Receiving"**
   - Enter room code: `123456`
   - Click **"Join"**

3. **Verification**:
   - Both peers see a 4-digit code
   - Confirm they match
   - Click **"Yes, it matches"**

4. **Transfer**:
   - Host: Drag & drop a file
   - Joiner: See incoming file, click **"Download"**

---

## 🔐 Security & Privacy

### Data Storage
- **Server**: Stores only ephemeral session metadata (device names, room IDs)
- **Client**: Stores device name + non-sensitive history in `localStorage`
- **No files stored**: All files transferred P2P over WebRTC

### Verification Flow
1. Host generates random `sessionSecret` (16 bytes hex)
2. Both peers compute: `verifyCode = SHA-256(secret) % 10000`
3. Users verify 4-digit codes match before transfer

### Privacy Policy & Terms
- `/privacy` — Privacy Policy page
- `/terms` — Terms & Conditions page

---

## 📦 Deployment

### Option 1: Standalone Signaling Server

Deploy `server/signalingServer.ts` on:
- **Fly.io** (WebSocket support)
- **Railway**
- **DigitalOcean**
- **AWS EC2**

Update client code with production WebSocket URL:

```ts
// HostPanel.tsx, JoinPanel.tsx
const SIGNALING_URL = process.env.NEXT_PUBLIC_SIGNALING_URL || 'ws://localhost:8080';
```

Add to `.env.local`:

```
NEXT_PUBLIC_SIGNALING_URL=wss://signaling.yourapp.com
```

### Option 2: Custom Next.js Server

See [`docs/SIGNALING_SERVER_SETUP.md`](./docs/SIGNALING_SERVER_SETUP.md) for details on embedding WebSocket server with Next.js.

---

## 🧩 Architecture

### Tech Stack
- **Next.js 14** (App Router)
- **React + TypeScript**
- **Tailwind CSS**
- **WebRTC** (RTCPeerConnection, DataChannel)
- **WebSocket** (signaling via `ws` library)

### Data Flow

```
Host                Signaling Server           Joiner
 |                        |                       |
 |--create-room---------->|                       |
 |<------created----------|                       |
 |                        |<-----join-room--------|
 |<---joiner-arrived------|------joined---------->|
 |                        |                       |
 |--SDP offer------------>|--signal (offer)------>|
 |<--SDP answer-----------|<-signal (answer)------|
 |--ICE candidate-------->|--signal (ICE)-------->|
 |                        |                       |
 |--session-secret------->|--signal (secret)----->|
 | (compute verifyCode)   |  (compute verifyCode) |
 |                        |                       |
 [User confirms codes match on both sides]
 |                        |                       |
 |==== WebRTC DataChannel (P2P file transfer) ====|
```

### State Machine (useP2PFileTransfer)

```
disconnected → connecting → connected → verified
```

---

## 🎯 Usage Example

### Host Flow

```tsx
import HostPanel from '@/components/nearby/HostPanel';

export default function Page() {
  return <HostPanel />;
}
```

### Join Flow

```tsx
import JoinPanel from '@/components/nearby/JoinPanel';

export default function Page() {
  return <JoinPanel />;
}
```

---

## 🔧 Configuration

### Signaling Server Port

```bash
PORT=9000 node server/signalingServer.ts
```

### WebRTC STUN Servers

Edit `hooks/useP2PFileTransfer.ts`:

```ts
const pc = new RTCPeerConnection({
  iceServers: [
    { urls: ['stun:stun.l.google.com:19302'] },
    { urls: ['stun:stun1.l.google.com:19302'] },
  ],
});
```

### Chunk Size

Default: **16KB**. Edit in `hooks/useP2PFileTransfer.ts`:

```ts
const CHUNK_SIZE = 16 * 1024; // 16KB
```

---

## 📝 TODO / Future Enhancements

- [ ] Add unit tests for `useP2PFileTransfer`
- [ ] Add E2E tests (Playwright)
- [ ] Add TURN server support for NAT traversal
- [ ] Add multi-file transfer queue
- [ ] Add transfer cancellation
- [ ] Add resume support for interrupted transfers
- [ ] Add encryption layer on top of WebRTC (optional)
- [ ] Add mobile PWA install prompt
- [ ] Add dark mode support

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "Add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

[Your License Here — e.g., MIT]

---

## 💬 Support

For issues or questions:
- Open a GitHub issue
- Contact: [Your Email/Support Channel]

---

**Built with ❤️ for decentralized, privacy-first file sharing.**
