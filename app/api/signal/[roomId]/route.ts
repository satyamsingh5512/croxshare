import { NextRequest, NextResponse } from 'next/server';

// In-memory room store. Rooms are short-lived (a few seconds of signaling).
// Works on Vercel because the signaling exchange finishes within one warm function instance.

interface Signal {
  from: 'host' | 'joiner';
  data: unknown;
  ts: number;
}

interface Room {
  hostName: string;
  joinerName: string | null;
  locked: boolean;
  signals: Signal[];
  createdAt: number;
}

// Use a global so it survives across requests within the same function instance.
const rooms: Map<string, Room> = (globalThis as any).__sigRooms ??= new Map();

// Prune rooms older than 5 minutes to avoid memory leaks.
function prune() {
  const now = Date.now();
  for (const [id, room] of rooms.entries()) {
    if (now - room.createdAt > 5 * 60 * 1000) rooms.delete(id);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const body = await req.json().catch(() => ({}));
  const { action, deviceName, from, data } = body as {
    action: string;
    deviceName?: string;
    from?: 'host' | 'joiner';
    data?: unknown;
  };

  prune();

  if (action === 'create') {
    if (rooms.has(roomId)) {
      return NextResponse.json({ ok: false, error: 'Room exists' }, { status: 409 });
    }
    rooms.set(roomId, {
      hostName: deviceName || 'Sender',
      joinerName: null,
      locked: false,
      signals: [],
      createdAt: Date.now(),
    });
    return NextResponse.json({ ok: true });
  }

  if (action === 'join') {
    const room = rooms.get(roomId);
    if (!room) return NextResponse.json({ ok: false, error: 'Room not found' }, { status: 404 });
    if (room.locked) return NextResponse.json({ ok: false, error: 'Room locked' }, { status: 403 });
    room.joinerName = deviceName || 'Receiver';
    room.locked = true;
    return NextResponse.json({ ok: true, hostName: room.hostName });
  }

  if (action === 'signal') {
    const room = rooms.get(roomId);
    if (!room) return NextResponse.json({ ok: false, error: 'Room not found' }, { status: 404 });
    room.signals.push({ from: from!, data, ts: Date.now() });
    return NextResponse.json({ ok: true });
  }

  if (action === 'close') {
    rooms.delete(roomId);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: 'Unknown action' }, { status: 400 });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const role = req.nextUrl.searchParams.get('role') as 'host' | 'joiner';
  const after = Number(req.nextUrl.searchParams.get('after') || '0');

  const room = rooms.get(roomId);
  if (!room) return NextResponse.json({ ok: false, error: 'Room not found' }, { status: 404 });

  // Host polls for joiner arrival + signals sent by joiner.
  // Joiner polls for signals sent by host.
  const opposite = role === 'host' ? 'joiner' : 'host';
  const newSignals = room.signals.filter((s) => s.from === opposite && s.ts > after);

  const joinerJoined = role === 'host' && room.joinerName !== null;

  return NextResponse.json({
    ok: true,
    joinerJoined,
    joinerName: room.joinerName,
    hostName: room.hostName,
    signals: newSignals,
  });
}
