import React, { createContext, useContext, useReducer } from 'react';

export type AppMode = 'idle' | 'sender' | 'receiver';
export type TransferStatus = 'queued' | 'sending' | 'receiving' | 'done' | 'error';

export interface TransferItem {
  id: string;
  name: string;
  size: number;
  progress: number;
  speed: string;
  eta: string;
  status: TransferStatus;
}

export interface TransferState {
  room: string | null;
  mode: AppMode;
  connectionState: RTCPeerConnectionState;
  peerCount: number;
  transfers: TransferItem[];
  error: string | null;
}

export type TransferAction =
  | { type: 'SET_ROOM'; room: string | null }
  | { type: 'SET_MODE'; mode: AppMode }
  | { type: 'SET_CONNECTION_STATE'; connectionState: RTCPeerConnectionState }
  | { type: 'SET_PEER_COUNT'; peerCount: number }
  | { type: 'UPSERT_TRANSFER'; transfer: TransferItem }
  | {
      type: 'UPDATE_TRANSFER';
      id: string;
      patch: Partial<Pick<TransferItem, 'progress' | 'speed' | 'eta' | 'status'>>;
    }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'RESET_SESSION' };

const initialState: TransferState = {
  room: null,
  mode: 'idle',
  connectionState: 'new',
  peerCount: 1,
  transfers: [],
  error: null,
};

function reducer(state: TransferState, action: TransferAction): TransferState {
  switch (action.type) {
    case 'SET_ROOM':
      return { ...state, room: action.room };
    case 'SET_MODE':
      return { ...state, mode: action.mode };
    case 'SET_CONNECTION_STATE':
      return { ...state, connectionState: action.connectionState };
    case 'SET_PEER_COUNT':
      return { ...state, peerCount: action.peerCount };
    case 'UPSERT_TRANSFER': {
      const index = state.transfers.findIndex((t) => t.id === action.transfer.id);
      if (index < 0) {
        return { ...state, transfers: [action.transfer, ...state.transfers] };
      }
      const next = [...state.transfers];
      next[index] = action.transfer;
      return { ...state, transfers: next };
    }
    case 'UPDATE_TRANSFER': {
      return {
        ...state,
        transfers: state.transfers.map((t) =>
          t.id === action.id ? { ...t, ...action.patch } : t,
        ),
      };
    }
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'RESET_SESSION':
      return {
        ...state,
        room: null,
        mode: 'idle',
        connectionState: 'new',
        peerCount: 1,
        transfers: [],
        error: null,
      };
    default:
      return state;
  }
}

interface TransferContextValue {
  state: TransferState;
  dispatch: React.Dispatch<TransferAction>;
}

const TransferContext = createContext<TransferContextValue | undefined>(undefined);

export function TransferProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <TransferContext.Provider value={{ state, dispatch }}>{children}</TransferContext.Provider>;
}

export function useTransferContext(): TransferContextValue {
  const ctx = useContext(TransferContext);
  if (!ctx) {
    throw new Error('useTransferContext must be used within TransferProvider');
  }
  return ctx;
}
