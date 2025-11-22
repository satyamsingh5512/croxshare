# 🚀 How to Run CroxShare

## Quick Start (Easiest)

### Single Command:
```bash
./start.sh
```

This starts both the signaling server and Next.js dev server automatically!

---

## Manual Start (2 Terminals)

### Terminal 1 - Start Signaling Server:
```bash
npm run signaling
```
You should see: `Signaling server listening on :8080`

### Terminal 2 - Start Next.js:
```bash
npm run dev
```
You should see: `Ready on http://localhost:3000`

---

## Open the App

1. **Home page**: http://localhost:3000
2. **Nearby Share**: http://localhost:3000/nearby-share
3. **Privacy Policy**: http://localhost:3000/privacy
4. **Terms**: http://localhost:3000/terms

---

## Test File Sharing

### On Computer 1 (Host):
1. Open http://localhost:3000/nearby-share
2. Click **"I'm Sending"**
3. Click **"Create Sharing Session"**
4. Note the room code (e.g., `123-456`)

### On Computer 2 or Phone (Joiner):
1. Open http://localhost:3000/nearby-share (or scan QR code)
2. Click **"I'm Receiving"**
3. Enter the room code
4. Click **"Join"**

### Verify & Transfer:
1. Both devices show a 4-digit verification code
2. Confirm they match
3. Click **"Yes, it matches"**
4. **Host**: Drag & drop a file
5. **Joiner**: Click **"Download"**

---

## Troubleshooting

### Port already in use?
```bash
# Find what's using port 3000 or 8080
lsof -i :3000
lsof -i :8080

# Kill the process
kill -9 <PID>
```

### Can't connect to signaling server?
- Make sure `npm run signaling` is running
- Check http://localhost:8080 is accessible

### React/Next.js errors?
- Clear cache: `rm -rf .next`
- Reinstall: `rm -rf node_modules && npm install`

---

## Stop the App

Press `Ctrl+C` in both terminals (or in the terminal running `./start.sh`)

---

## 🎉 You're Ready!

Visit http://localhost:3000 to get started!
