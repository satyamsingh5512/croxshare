export type PeerStatus = 'idle' | 'waiting' | 'connecting' | 'connected' | 'disconnected' | 'error';

export interface SignalMessage {
  type: 'offer' | 'answer' | 'ice';
  data: RTCSessionDescriptionInit | RTCIceCandidateInit;
  from: string;
  to?: string; // target peer ID for directed signals
}

export interface DiscoveredPeer {
  id: string;
  name: string;
  status: 'discovered' | 'connecting' | 'connected' | 'disconnected';
}

export interface FileMetadata {
  id: string;      // random UUID for this transfer
  name: string;
  size: number;    // bytes
  mime: string;
  chunks: number;  // total chunk count
}

export interface IncomingFile {
  meta: FileMetadata;
  receivedChunks: number;
  buffers: ArrayBuffer[];
  blob?: Blob;
  done: boolean;
}

export interface RoomState {
  roomId: string | null;
  peerId: string | null;       // Pusher socket_id of remote peer
  peerName: string | null;
  status: PeerStatus;
  myName: string;
  mySocketId: string | null;
}
