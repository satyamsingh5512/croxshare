import PusherJS from 'pusher-js';

// Browser-only singleton. Lazily created so it doesn't run on the server.
let client: PusherJS | null = null;

export function getPusherClient(): PusherJS {
  if (client) return client;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!key || !cluster) {
    throw new Error(
      'Missing Pusher client env vars. Set NEXT_PUBLIC_PUSHER_KEY and NEXT_PUBLIC_PUSHER_CLUSTER.',
    );
  }

  client = new PusherJS(key, {
    cluster,
    // Presence channels require server auth — this is our API route.
    authEndpoint: '/api/signal',
    channelAuthorization: {
      endpoint: '/api/signal',
      transport: 'ajax',
    } as any,
  });
  return client;
}

export function destroyPusherClient() {
  client?.disconnect();
  client = null;
}
