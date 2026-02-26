import Pusher from 'pusher';

// Server-side Pusher instance — used only in API routes (never in client bundles).
// Reads from environment variables set in Vercel dashboard or .env.local.
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});
