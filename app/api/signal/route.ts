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
 *    Body: { socket_id: string, channel_name: string, user_id: string, user_name: string }
 *    Returns: Pusher auth token
 *
 * 2. Signal relay (offer / answer / ICE)
 *    Body: { roomId: string, type: 'offer'|'answer'|'ice', data: any, from: string }
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
        {
          error:
            'Signaling is not configured. Missing PUSHER_APP_ID, PUSHER_SECRET, NEXT_PUBLIC_PUSHER_KEY, or NEXT_PUBLIC_PUSHER_CLUSTER.',
        },
        { status: 500 },
      );
    }

    const pusherServer = getPusherServer();
    const body = await readBody(req);

    // ── Pusher presence channel auth ─────────────────────────────────────
    if (body.socket_id && body.channel_name) {
      const { socket_id, channel_name, user_id, user_name } = body as {
        socket_id: string;
        channel_name: string;
        user_id: string;
        user_name: string;
      };

      const authResponse = pusherServer.authorizeChannel(socket_id, channel_name, {
        user_id: user_id || socket_id,
        user_info: { name: user_name || 'Unknown' },
      });

      return NextResponse.json(authResponse);
    }

    // ── Signal relay ──────────────────────────────────────────────────────
    if (body.roomId && body.type) {
      const { roomId, type, data, from } = body as {
        roomId: string;
        type: string;
        data: unknown;
        from: string;
      };

      await pusherServer.trigger(`presence-room-${roomId}`, 'signal', {
        type,
        data,
        from,
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  } catch (err) {
    console.error('[/api/signal]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
