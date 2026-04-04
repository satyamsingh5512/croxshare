import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useReducer } from 'react';
const initialState = {
    room: null,
    mode: 'idle',
    connectionState: 'new',
    peerCount: 1,
    transfers: [],
    error: null,
};
function reducer(state, action) {
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
                transfers: state.transfers.map((t) => t.id === action.id ? { ...t, ...action.patch } : t),
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
const TransferContext = createContext(undefined);
export function TransferProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    return _jsx(TransferContext.Provider, { value: { state, dispatch }, children: children });
}
export function useTransferContext() {
    const ctx = useContext(TransferContext);
    if (!ctx) {
        throw new Error('useTransferContext must be used within TransferProvider');
    }
    return ctx;
}
