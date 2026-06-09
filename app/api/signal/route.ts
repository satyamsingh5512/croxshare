import { NextRequest, NextResponse } from 'next/server';
import { getPusherServer } from '@/lib/pusher-server';

async function readBody(req: NextRequest) {
  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return req.json();
  }
  const raw = await req.text();
  return Object.fromEntries(new URLSearchParams(raw).entries());
}

/**
 * POST /api/signal
 *
 * Two modes determined by request body:
 *
 * 1. Pusher presence channel auth
 *    Body: { socket_id, channel_name } + optional { user_id, user_name }
 *    Headers: x-user-id, x-user-name (fallback identity source)
 *    Returns: Pusher auth token
 *
 * 2. Signal relay (offer / answer / ICE)
 *    Body: { roomId, type, data, from, to? }
 *    Triggers a `signal` event on the room's Pusher channel
 */
export async function POST(req: NextRequest) {
  try {
    const hasPusherEnv =
      !!process.env.PUSHER_APP_ID &&
      !!process.env.PUSHER_SECRET &&
      !!process.env.NEXT_PUBLIC_PUSHER_KEY &&
      !!process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!hasPusherEnv) {
      return NextResponse.json(
        { error: 'Signaling not configured. Missing Pusher env vars.' },
        { status: 500 },
      );
    }

    const pusherServer = getPusherServer();
    const body = await readBody(req);

    // ── Pusher presence channel auth ────────────────────────────────────
    if (body.socket_id && body.channel_name) {
      // Identity comes from body params (if the client sends them) or headers.
      const userId: string =
        body.user_id ||
        req.headers.get('x-user-id') ||
        body.socket_id;
      const userName: string =
        body.user_name ||
        req.headers.get('x-user-name') ||
        'Unknown';

      const authResponse = pusherServer.authorizeChannel(body.socket_id, body.channel_name, {
        user_id: userId,
        user_info: { name: userName },
      });

      return NextResponse.json(authResponse);
    }

    // ── Signal relay ─────────────────────────────────────────────────────
    if (body.roomId && body.type) {
      const { roomId, type, data, from, to } = body as {
        roomId: string;
        type: string;
        data: unknown;
        from: string;
        to?: string;
      };

      await pusherServer.trigger(`presence-room-${roomId}`, 'signal', {
        type,
        data,
        from,
        to,
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  } catch (err) {
    console.error('[/api/signal]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
