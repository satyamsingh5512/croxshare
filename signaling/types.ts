export type RelayKind = 'offer' | 'answer' | 'ice-candidate';

export interface JoinMessage {
  type: 'join';
  room: string;
  peerId: string;
}

export interface RelayMessage {
  type: RelayKind;
  room: string;
  from: string;
  to?: string;
  payload: unknown;
}

export type ClientMessage = JoinMessage | RelayMessage;

export interface JoinedMessage {
  type: 'joined';
  room: string;
  peerCount: number;
  peers: string[];
}

export interface PeerJoinedMessage {
  type: 'peer-joined';
  room: string;
  peerId: string;
  peerCount: number;
}

export interface PeerLeftMessage {
  type: 'peer-left';
  room: string;
  peerId: string;
  peerCount: number;
}

export interface RelayEnvelope {
  type: RelayKind;
  room: string;
  from: string;
  to?: string;
  payload: unknown;
}

export interface ErrorMessage {
  type: 'error';
  message: string;
}

export type ServerMessage =
  | JoinedMessage
  | PeerJoinedMessage
  | PeerLeftMessage
  | RelayEnvelope
  | ErrorMessage;

export interface RoomPeer {
  peerId: string;
  socket: import('ws').WebSocket;
}

export type RoomsMap = Map<string, Map<string, import('ws').WebSocket>>;
