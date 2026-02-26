/**
 * Create an RTCPeerConnection with sensible defaults.
 * Uses Google/Cloudflare STUN servers so peers behind NAT can connect across networks.
 * For truly same-network transfers the STUN lookup is skipped by ICE automatically.
 */
export function createPeerConnection(): RTCPeerConnection {
  return new RTCPeerConnection({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:cloudflare-stun.call.workers.dev' },
    ],
    iceCandidatePoolSize: 10,
  });
}
