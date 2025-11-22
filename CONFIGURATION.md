# ⚙️ Configuration Reference

All configurable options for the Nearby Share feature.

---

## 🌐 Signaling Server Configuration

### File: `server/signalingServer.ts`

```typescript
// Port configuration
const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;

// Change default port:
const PORT = 3001; // or any port you prefer
```

**Environment variable override:**
```bash
PORT=3001 npm run signaling
```

---

## 🔌 WebSocket URL Configuration

### Files: `components/nearby/HostPanel.tsx` and `JoinPanel.tsx`

```typescript
// Default (development)
const SIGNALING_URL = 'ws://localhost:8080';

// Production example
const SIGNALING_URL = process.env.NEXT_PUBLIC_SIGNALING_URL || 'ws://localhost:8080';

// For same network testing (use your local IP)
const SIGNALING_URL = 'ws://192.168.1.100:8080';
```

**Using environment variables:**

Create `.env.local`:
```bash
NEXT_PUBLIC_SIGNALING_URL=wss://signaling.yourapp.com
```

Update components:
```typescript
const SIGNALING_URL = process.env.NEXT_PUBLIC_SIGNALING_URL || 'ws://localhost:8080';
```

---

## 🧊 WebRTC Configuration

### File: `hooks/useP2PFileTransfer.ts`

```typescript
// STUN servers (for NAT traversal)
const pc = new RTCPeerConnection({
  iceServers: [
    { urls: ['stun:stun.l.google.com:19302'] },
    { urls: ['stun:stun1.l.google.com:19302'] },
  ],
});
```

**Add TURN server (for public internet transfers):**
```typescript
const pc = new RTCPeerConnection({
  iceServers: [
    { urls: ['stun:stun.l.google.com:19302'] },
    {
      urls: ['turn:your-turn-server.com:3478'],
      username: 'your-username',
      credential: 'your-password',
    },
  ],
});
```

**Popular TURN services:**
- [Twilio TURN](https://www.twilio.com/docs/stun-turn)
- [Xirsys](https://xirsys.com/)
- [Metered TURN](https://www.metered.ca/tools/openrelay/)

---

## 📦 File Transfer Configuration

### File: `hooks/useP2PFileTransfer.ts`

```typescript
// Chunk size (default: 16KB)
const CHUNK_SIZE = 16 * 1024;

// Increase for faster local transfers:
const CHUNK_SIZE = 64 * 1024; // 64KB

// Decrease for slower connections:
const CHUNK_SIZE = 8 * 1024; // 8KB
```

**Throttling (add delay between chunks):**
```typescript
// In sendFile() function, after dcRef.current.send(slice.buffer):
await new Promise((r) => setTimeout(r, 10)); // 10ms delay
```

---

## 🎨 UI/UX Configuration

### Color Palette

**Current colors (defined inline in components):**
```typescript
// Background
className="bg-[#F9FAFB]"

// Primary button
className="bg-[#4F46E5] hover:bg-[#4338CA]"

// Text primary
className="text-[#111827]"

// Text secondary
className="text-[#4B5563]"

// Accent
className="bg-[#0EA5E9]"

// Border
className="border-[#E5E7EB]"
```

**To change colors globally**, create a Tailwind config:

`tailwind.config.js`:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'nearby-bg': '#F9FAFB',
        'nearby-primary': '#4F46E5',
        'nearby-primary-hover': '#4338CA',
        'nearby-accent': '#0EA5E9',
        'nearby-text': '#111827',
        'nearby-text-secondary': '#4B5563',
        'nearby-border': '#E5E7EB',
      },
    },
  },
};
```

Then replace:
```typescript
// Before
className="bg-[#F9FAFB]"

// After
className="bg-nearby-bg"
```

---

## 📱 QR Code Configuration

### File: `components/nearby/QRCodeDisplay.tsx`

```typescript
// QR code size and margin
QRCode.toCanvas(canvasRef.current, url, {
  width: 200,  // Change size (default: 200px)
  margin: 2,   // Change margin (default: 2)
}, (err) => {
  if (err) console.error('QR generation error', err);
});
```

**Styling:**
```typescript
// Change QR container style
<canvas ref={canvasRef} className="rounded-xl border-4 border-blue-500" />
```

---

## 💾 Local Storage Keys

### File: `components/nearby/DeviceNameModal.tsx`

```typescript
// Device name storage
const STORAGE_KEY = 'nearby:deviceName';

// Change key:
const STORAGE_KEY = 'myapp:deviceName';
```

### File: `hooks/useP2PFileTransfer.ts`

```typescript
// History storage
localStorage.setItem('nearby:history', JSON.stringify(hist));

// Change key:
localStorage.setItem('myapp:transfer-history', JSON.stringify(hist));
```

**History size limit:**
```typescript
// Current: keeps last 50 transfers
localStorage.setItem('nearby:history', JSON.stringify(hist.slice(0, 50)));

// Change to 100:
localStorage.setItem('nearby:history', JSON.stringify(hist.slice(0, 100)));
```

---

## 🔒 Room Code Configuration

### File: `components/nearby/HostPanel.tsx`

```typescript
// Generate 6-digit room code
const code = String(Math.floor(100000 + Math.random() * 900000));

// Change to 4-digit:
const code = String(Math.floor(1000 + Math.random() * 9000));

// Change to 8-digit:
const code = String(Math.floor(10000000 + Math.random() * 90000000));
```

**Formatting:**
```typescript
// Current: 123-456
function formatRoom(code: string) {
  return code.replace(/(\d{3})(\d{3})/, '$1-$2');
}

// No formatting:
function formatRoom(code: string) {
  return code;
}

// 4-digit format: 12-34
function formatRoom(code: string) {
  return code.replace(/(\d{2})(\d{2})/, '$1-$2');
}
```

---

## 🔐 Verification Code Configuration

### File: `hooks/useP2PFileTransfer.ts`

```typescript
// Current: 4-digit code (0000-9999)
async function computeVerifyCode(secret: string) {
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-256', enc.encode(secret));
  const view = new DataView(hash.slice(0, 4));
  const val = view.getUint32(0, false);
  return val % 10000; // 4 digits
}

// Change to 6-digit:
return val % 1000000; // 6 digits (000000-999999)

// Change to 8-digit:
return val % 100000000; // 8 digits
```

**Display formatting:**
```typescript
// Current: shows raw number (e.g., 9421)
<div>{code ?? '—'}</div>

// Padded with zeros (e.g., 0042):
<div>{String(code ?? 0).padStart(4, '0')}</div>

// Formatted with dashes (e.g., 94-21):
<div>{String(code ?? 0).padStart(4, '0').replace(/(\d{2})(\d{2})/, '$1-$2')}</div>
```

---

## 📊 Progress Update Frequency

### File: `hooks/useP2PFileTransfer.ts`

```typescript
// Current: updates every chunk (16KB)
setSendProgress(Math.min(100, Math.round((sent / file.size) * 100)));

// Update every 5 chunks for smoother UI:
if (chunkCount % 5 === 0) {
  setSendProgress(Math.min(100, Math.round((sent / file.size) * 100)));
}
```

---

## 🧹 Session Cleanup Configuration

### File: `server/signalingServer.ts`

**Auto-delete rooms after timeout:**
```typescript
// Add in handleCreateRoom:
const room = { host: ws, locked: false };
rooms.set(id, room);

// Auto-delete after 30 minutes
setTimeout(() => {
  if (rooms.get(id) === room) {
    rooms.delete(id);
    send(ws, { type: 'room-expired', payload: {} });
  }
}, 30 * 60 * 1000); // 30 minutes
```

---

## 📝 Logging Configuration

### Enable debug logging

**Signaling server:**
```typescript
// Add at top of server/signalingServer.ts
const DEBUG = process.env.DEBUG === 'true';

function log(...args: any[]) {
  if (DEBUG) console.log('[Signaling]', ...args);
}

// Use throughout:
log('Room created:', id);
```

**Client-side:**
```typescript
// In hooks/useP2PFileTransfer.ts
const DEBUG = localStorage.getItem('nearby:debug') === 'true';

function log(...args: any[]) {
  if (DEBUG) console.log('[P2P]', ...args);
}
```

**Enable:**
```javascript
// In browser console:
localStorage.setItem('nearby:debug', 'true');
```

---

## 🎛️ Feature Flags

**Disable features conditionally:**

```typescript
// In NearbySharePage component
const FEATURES = {
  qrCode: true,     // Show QR codes
  history: true,    // Show transfer history
  deviceName: true, // Prompt for device name
};

// Use:
{FEATURES.qrCode && <QRCodeDisplay url={url} />}
{FEATURES.history && <FileHistory />}
```

---

## 📦 Build Configuration

### TypeScript strict mode

If you want stricter type checking, create/update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### ESLint rules

Add to `.eslintrc.json`:

```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

---

## 🚀 Performance Tuning

### Reduce re-renders

**Memoize expensive components:**
```typescript
import { memo } from 'react';

const FileProgress = memo(({ label, percent }: Props) => {
  // ...
});
```

**Use useCallback for handlers:**
```typescript
const handleFile = useCallback((file: File) => {
  p2p.sendFile(file);
}, [p2p]);
```

---

## 🔧 Advanced Configuration

### Custom signaling protocol

To add custom messages, edit both:

1. `server/signalingServer.ts`:
```typescript
case 'custom-message':
  return handleCustomMessage(ws, payload);
```

2. `lib/signalingClient.ts`:
```typescript
sendCustomMessage(data: any) {
  this.send('custom-message', data);
}
```

3. `hooks/useP2PFileTransfer.ts`:
```typescript
client.on('custom-message', (payload: any) => {
  // Handle custom logic
});
```

---

**Configuration reference complete! 🎛️**

For questions, see `README_NEARBY_SHARE.md` or `QUICKSTART.md`.
