import Pusher from 'pusher';

let instance: Pusher | null = null;

// Server-side Pusher instance — used only in API routes (never in client bundles).
export function getPusherServer(): Pusher {
  if (instance) return instance;

  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) {
    throw new Error(
      'Missing Pusher server env vars. Required: PUSHER_APP_ID, PUSHER_SECRET, NEXT_PUBLIC_PUSHER_KEY, NEXT_PUBLIC_PUSHER_CLUSTER.',
    );
  }

  instance = new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });

  return instance;
}
