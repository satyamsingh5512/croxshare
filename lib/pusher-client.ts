import PusherJS from 'pusher-js';

// Browser-only singleton. Lazily created so it doesn't run on the server.
let client: PusherJS | null = null;

export function getPusherClient(): PusherJS {
  if (client) return client;
  client = new PusherJS(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    // Presence channels require server auth — this is our API route.
    authEndpoint: '/api/signal',
    auth: {},
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
