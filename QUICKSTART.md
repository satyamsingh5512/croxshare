# Quick Start Guide — Nearby Share Feature

## ⚡ Get Started in 3 Steps

### Step 1: Start the Signaling Server

```bash
npm run signaling
```

You should see:
```
Signaling server listening on :8080
```

**Tip**: Use `npm run signaling:dev` for auto-reload during development.

---

### Step 2: Start Your Next.js App

In a separate terminal:

```bash
npm run dev
# or: next dev
```

---

### Step 3: Open Nearby Share

Visit: **http://localhost:3000/nearby-share**

---

## 🧪 Testing with Two Devices

### On Device 1 (Host):
1. Open `http://localhost:3000/nearby-share`
2. Click **"I'm Sending"**
3. Click **"Create Sharing Session"**
4. Note the **room code** (e.g., `123-456`)
5. Scan the QR code or share the link

### On Device 2 (Joiner):
1. Open `http://localhost:3000/nearby-share` (or scan QR)
2. Click **"I'm Receiving"**
3. Enter the **room code** from Device 1
4. Click **"Join"**

### Verify & Transfer:
1. **Both devices** show a 4-digit verification code
2. Confirm they match
3. Click **"Yes, it matches"** on both
4. **Host**: Drag & drop a file or browse
5. **Joiner**: Click **Download** when received

---

## 🔧 Configuration

### Change Signaling Server Port

Edit `server/signalingServer.ts`:

```ts
const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
```

Or set via environment:

```bash
PORT=3001 npm run signaling
```

### Update Client WebSocket URL

If you change the port, update `components/nearby/HostPanel.tsx` and `JoinPanel.tsx`:

```ts
const SIGNALING_URL = 'ws://localhost:3001'; // Change port here
```

---

## 📱 Mobile Testing

### On Same WiFi Network:

1. Find your local IP:
   ```bash
   # Linux/Mac
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Or
   hostname -I
   ```

2. Update `SIGNALING_URL` in components to use your IP:
   ```ts
   const SIGNALING_URL = 'ws://192.168.1.100:8080'; // Your IP
   ```

3. On mobile, visit: `http://192.168.1.100:3000/nearby-share`

---

## 🚨 Troubleshooting

### "Cannot connect to signaling server"
- Ensure signaling server is running: `npm run signaling`
- Check console for errors
- Verify port 8080 is not in use: `lsof -i :8080`

### "Room not found"
- Room expires when host disconnects
- Create a new room
- Ensure room code is entered correctly (6 digits)

### "Connection failed" after joining
- Both devices must be on same network (or use TURN server for public internet)
- Check browser console for WebRTC errors
- Try refreshing and creating a new room

### QR Code not showing
- Install qrcode dependency: `npm install qrcode`
- Check browser console for errors

---

## 📚 Additional Resources

- **Full Documentation**: See `README_NEARBY_SHARE.md`
- **Deployment Guide**: See `docs/SIGNALING_SERVER_SETUP.md`
- **Privacy Policy**: Visit `/privacy` page
- **Terms**: Visit `/terms` page

---

## 🎉 You're Ready!

Your Nearby Share feature is now fully set up. Start sharing files securely over your local network!

**Need help?** Check the main README or open an issue on GitHub.
