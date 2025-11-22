#!/bin/bash

# 🚀 Nebay Share - Complete Startup Script

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║     🚀 Nebay Share - Starting Up...     ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Kill any existing processes on ports 8080 and 3000
echo "🧹 Cleaning up existing servers..."
lsof -ti:8080,3000 | xargs kill -9 2>/dev/null
sleep 1
echo "   ✓ Ports cleared"
echo ""

# Start signaling server in background
echo "📡 Starting WebSocket signaling server..."
npm run signaling > /tmp/nebay-signaling.log 2>&1 &
SIGNALING_PID=$!
echo "   ✓ Signaling server started (PID: $SIGNALING_PID)"
echo "   📍 WebSocket: ws://localhost:8080"
echo ""

# Wait for signaling server to initialize
sleep 2

# Check if signaling server is running
if ! lsof -ti:8080 > /dev/null; then
    echo "   ❌ Signaling server failed to start"
    echo "   📋 Check logs: /tmp/nebay-signaling.log"
    exit 1
fi

# Start Next.js dev server
echo "🌐 Starting Next.js development server..."
echo "   Please wait..."
echo ""
npm run dev

# Cleanup on exit
trap "echo ''; echo '🛑 Shutting down...'; kill $SIGNALING_PID 2>/dev/null; echo '✓ Servers stopped'; exit" INT TERM

# Start Next.js dev server
echo "⚡ Starting Next.js on port 3000..."
echo ""
echo "   🌐 Open: http://localhost:3000"
echo "   📱 Nearby Share: http://localhost:3000/nearby-share"
echo ""
npm run dev

# Cleanup on exit
trap "kill $SIGNALING_PID 2>/dev/null" EXIT
