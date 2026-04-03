const FALLBACK_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:cloudflare-stun.call.workers.dev' },
];

async function getIceServers(): Promise<RTCIceServer[]> {
  try {
    const res = await fetch('/api/stun', { cache: 'no-store' });
    if (!res.ok) return FALLBACK_ICE_SERVERS;
    const json = (await res.json()) as { iceServers?: RTCIceServer[] };
    if (!Array.isArray(json.iceServers) || json.iceServers.length === 0) {
      return FALLBACK_ICE_SERVERS;
    }
    return json.iceServers;
  } catch {
    return FALLBACK_ICE_SERVERS;
  }
}

/**
 * Create an RTCPeerConnection with dynamic ICE configuration.
 * `/api/stun` can return TURN credentials in production for harder NAT cases.
 */
export async function createPeerConnection(): Promise<RTCPeerConnection> {
  const iceServers = await getIceServers();
  return new RTCPeerConnection({
    iceServers,
    iceCandidatePoolSize: 10,
  });
}
