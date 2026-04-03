import { NextResponse } from 'next/server';

export async function GET() {
  const turnUrls = (process.env.TURN_URLS || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  const turnUsername = process.env.TURN_USERNAME;
  const turnCredential = process.env.TURN_CREDENTIAL;

  const turnServers =
    turnUrls.length > 0 && turnUsername && turnCredential
      ? [{ urls: turnUrls, username: turnUsername, credential: turnCredential }]
      : [];

  return NextResponse.json({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:cloudflare-stun.call.workers.dev' },
      ...turnServers,
    ],
  });
}
