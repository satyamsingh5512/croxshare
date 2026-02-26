import { NextRequest, NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher-server';

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
    const body = await req.json();

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
