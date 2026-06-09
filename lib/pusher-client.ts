import PusherJS from 'pusher-js';

// Browser-only singleton. Lazily created so it doesn't run on the server.
let client: PusherJS | null = null;

// Auth identity set before subscribing to presence channels.
let authUserId = '';
let authUserName = '';

export function setPusherAuthIdentity(userId: string, userName: string) {
  authUserId = userId;
  authUserName = userName;
}

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
    channelAuthorization: {
      endpoint: '/api/signal',
      transport: 'ajax',
      // Inject user identity into every auth request so the server can build
      // a proper presence channel auth token with user_id + user_info.
      headersProvider: () => ({
        'x-user-id': authUserId,
        'x-user-name': authUserName,
      }),
    } as any,
  });
  return client;
}

export function destroyPusherClient() {
  client?.disconnect();
  client = null;
}
