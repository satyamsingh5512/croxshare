import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import RoomCard from './components/RoomCard';
import DropZone from './components/DropZone';
import FileQueue from './components/FileQueue';
import ReceivePanel from './components/ReceivePanel';
import { useTransferContext } from './context/TransferContext';
import { PeerConnectionManager } from './lib/peer';
import { SignalingClient } from './lib/signaling';
import { FileReceiver, sendFile } from './lib/transfer';
import { formatSpeed, generateRoomId } from './lib/utils';
function getSignalingUrl() {
    const envUrl = import.meta.env.VITE_SIGNALING_URL;
    if (envUrl)
        return envUrl;
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    return `${protocol}://${window.location.hostname}:8080`;
}
export default function App() {
    const { state, dispatch } = useTransferContext();
    const [roomInput, setRoomInput] = useState('');
    const [filesById] = useState(() => new Map());
    const selfIdRef = useRef(generateRoomId());
    const peerIdRef = useRef(null);
    const signalingRef = useRef(null);
    const peerRef = useRef(null);
    const receiverRef = useRef(null);
    const senderTransfers = useMemo(() => state.transfers.filter((t) => t.status === 'queued' || t.status === 'sending' || t.status === 'done' || t.status === 'error'), [state.transfers]);
    const receiverTransfers = useMemo(() => state.transfers.filter((t) => t.status === 'receiving' || t.status === 'done'), [state.transfers]);
    useEffect(() => {
        const roomFromQuery = new URLSearchParams(window.location.search).get('room');
        if (roomFromQuery) {
            setRoomInput(roomFromQuery);
        }
    }, []);
    useEffect(() => {
        if (!state.room || state.mode === 'idle') {
            return;
        }
        dispatch({ type: 'SET_ERROR', error: null });
        dispatch({ type: 'SET_CONNECTION_STATE', connectionState: 'connecting' });
        const signaling = new SignalingClient({
            url: getSignalingUrl(),
            onError: (message) => dispatch({ type: 'SET_ERROR', error: message }),
        });
        signalingRef.current = signaling;
        receiverRef.current = new FileReceiver({
            onMeta: (meta) => {
                dispatch({
                    type: 'UPSERT_TRANSFER',
                    transfer: {
                        id: meta.id,
                        name: meta.name,
                        size: meta.size,
                        progress: 0,
                        speed: '0 KB/s',
                        eta: '--:--',
                        status: 'receiving',
                    },
                });
            },
            onProgress: (progress) => {
                dispatch({
                    type: 'UPDATE_TRANSFER',
                    id: progress.id,
                    patch: {
                        progress: progress.percent,
                        status: progress.percent >= 100 ? 'done' : 'receiving',
                    },
                });
            },
            onDone: (meta) => {
                dispatch({
                    type: 'UPDATE_TRANSFER',
                    id: meta.id,
                    patch: {
                        progress: 100,
                        status: 'done',
                        eta: '00:00',
                    },
                });
            },
            onError: (message) => dispatch({ type: 'SET_ERROR', error: message }),
        });
        const peer = new PeerConnectionManager({
            room: state.room,
            selfId: selfIdRef.current,
            targetPeerId: peerIdRef.current || undefined,
            lanOnly: import.meta.env.VITE_LAN_ONLY_ICE === 'true',
            emit: (message) => {
                const to = message.to ?? peerIdRef.current ?? undefined;
                signaling.send({ ...message, to });
            },
            onOpen: () => dispatch({ type: 'SET_CONNECTION_STATE', connectionState: 'connected' }),
            onClose: () => dispatch({ type: 'SET_CONNECTION_STATE', connectionState: 'disconnected' }),
            onError: (message) => dispatch({ type: 'SET_ERROR', error: message }),
            onStateChange: (connectionState) => dispatch({ type: 'SET_CONNECTION_STATE', connectionState }),
            onData: (data) => {
                void receiverRef.current?.handle(data);
            },
        });
        peerRef.current = peer;
        const unsubscribe = signaling.onMessage((message) => {
            if (message.type === 'error') {
                dispatch({ type: 'SET_ERROR', error: message.message });
                return;
            }
            if (message.type === 'joined') {
                dispatch({ type: 'SET_PEER_COUNT', peerCount: message.peerCount });
                if (!peerIdRef.current) {
                    const firstPeer = message.peers[0];
                    if (firstPeer) {
                        peerIdRef.current = firstPeer;
                    }
                }
                if (state.mode === 'sender' && peerIdRef.current) {
                    void peer.createOffer();
                }
                return;
            }
            if (message.type === 'peer-joined') {
                dispatch({ type: 'SET_PEER_COUNT', peerCount: message.peerCount });
                if (!peerIdRef.current && message.peerId !== selfIdRef.current) {
                    peerIdRef.current = message.peerId;
                    if (state.mode === 'sender') {
                        void peer.createOffer();
                    }
                }
                return;
            }
            if (message.type === 'peer-left') {
                dispatch({ type: 'SET_PEER_COUNT', peerCount: message.peerCount });
                if (peerIdRef.current === message.peerId) {
                    peerIdRef.current = null;
                    dispatch({ type: 'SET_CONNECTION_STATE', connectionState: 'disconnected' });
                }
                return;
            }
            handleRelayMessage(message, peer, selfIdRef.current, peerIdRef, dispatch);
        });
        signaling.connect(selfIdRef.current);
        signaling.join(state.room);
        return () => {
            unsubscribe();
            receiverRef.current?.destroy();
            receiverRef.current = null;
            peer.destroy();
            peerRef.current = null;
            signaling.disconnect();
            signalingRef.current = null;
            peerIdRef.current = null;
        };
    }, [dispatch, state.mode, state.room]);
    async function createRoomAndCopy(nextMode) {
        const id = generateRoomId();
        await navigator.clipboard.writeText(id);
        setRoomInput(id);
        dispatch({ type: 'SET_MODE', mode: nextMode });
        dispatch({ type: 'SET_ROOM', room: id });
        window.history.replaceState(null, '', `/?room=${id}`);
    }
    function joinRoom(nextMode) {
        if (!roomInput.trim())
            return;
        dispatch({ type: 'SET_MODE', mode: nextMode });
        dispatch({ type: 'SET_ROOM', room: roomInput.trim() });
        window.history.replaceState(null, '', `/?room=${roomInput.trim()}`);
    }
    function leaveRoom() {
        filesById.clear();
        dispatch({ type: 'RESET_SESSION' });
        setRoomInput('');
        window.history.replaceState(null, '', '/');
    }
    function addFiles(files) {
        for (const file of files) {
            const id = generateRoomId();
            filesById.set(id, file);
            dispatch({
                type: 'UPSERT_TRANSFER',
                transfer: {
                    id,
                    name: file.name,
                    size: file.size,
                    progress: 0,
                    speed: '0 KB/s',
                    eta: '--:--',
                    status: 'queued',
                },
            });
        }
    }
    async function sendAll() {
        const channel = peerRef.current?.dataChannel;
        if (!channel || channel.readyState !== 'open') {
            dispatch({ type: 'SET_ERROR', error: 'Data channel is not connected yet.' });
            return;
        }
        const queue = state.transfers.filter((t) => t.status === 'queued');
        for (const item of queue) {
            const file = filesById.get(item.id);
            if (!file)
                continue;
            dispatch({
                type: 'UPDATE_TRANSFER',
                id: item.id,
                patch: { status: 'sending', eta: '--:--', speed: '0 KB/s', progress: 0 },
            });
            try {
                await sendFile(file, channel, (progress) => {
                    const remaining = progress.totalBytes - progress.sentBytes;
                    dispatch({
                        type: 'UPDATE_TRANSFER',
                        id: progress.id,
                        patch: {
                            progress: progress.percent,
                            status: progress.percent >= 100 ? 'done' : 'sending',
                            speed: formatSpeed(progress.speedBytesPerSec),
                            eta: remaining <= 0 ? '00:00' : progress.eta,
                        },
                    });
                }, item.id);
                dispatch({
                    type: 'UPDATE_TRANSFER',
                    id: item.id,
                    patch: { status: 'done', progress: 100, eta: '00:00' },
                });
            }
            catch (error) {
                dispatch({
                    type: 'UPDATE_TRANSFER',
                    id: item.id,
                    patch: { status: 'error' },
                });
                dispatch({
                    type: 'SET_ERROR',
                    error: error instanceof Error ? error.message : 'Failed to send file.',
                });
            }
        }
    }
    if (!state.room || state.mode === 'idle') {
        return (_jsx("div", { className: "min-h-screen bg-zinc-900 px-4 py-10 text-zinc-100", children: _jsxs("div", { className: "mx-auto max-w-3xl rounded-2xl border border-zinc-700 bg-zinc-950 p-6", children: [_jsx("h1", { className: "text-3xl font-bold", children: "Croxshare" }), _jsx("p", { className: "mt-2 text-zinc-400", children: "LAN-first P2P file transfer with WebRTC DataChannel." }), _jsxs("div", { className: "mt-6 grid gap-3 sm:grid-cols-2", children: [_jsx("button", { type: "button", onClick: () => void createRoomAndCopy('sender'), className: "rounded-xl bg-violet-500 px-4 py-3 font-semibold text-white hover:bg-violet-400", children: "Send Files" }), _jsx("button", { type: "button", onClick: () => joinRoom('receiver'), className: "rounded-xl border border-zinc-700 px-4 py-3 font-semibold text-zinc-200 hover:bg-zinc-800", children: "Receive Files" })] }), _jsxs("div", { className: "mt-6 space-y-2", children: [_jsx("label", { htmlFor: "room", className: "text-sm text-zinc-400", children: "Room Code" }), _jsx("input", { id: "room", value: roomInput, onChange: (event) => setRoomInput(event.target.value), placeholder: "Paste room UUID", className: "w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-100 outline-none ring-violet-500 focus:ring-2" })] }), _jsx("button", { type: "button", onClick: () => void createRoomAndCopy('receiver'), className: "mt-4 rounded-xl border border-violet-500/40 px-4 py-3 text-sm font-semibold text-violet-300 hover:bg-violet-500/10", children: "Create Room" }), state.error && _jsx("p", { className: "mt-4 text-sm text-rose-400", children: state.error })] }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-zinc-900 px-4 py-6 text-zinc-100", children: _jsxs("main", { className: "mx-auto max-w-5xl space-y-6", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Croxshare Room" }), _jsx("button", { type: "button", onClick: leaveRoom, className: "rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800", children: "Leave Room" })] }), _jsx(RoomCard, { roomId: state.room, peerCount: state.peerCount, connectionState: state.connectionState }), state.error && _jsx("p", { className: "text-sm text-rose-400", children: state.error }), state.mode === 'sender' && (_jsxs("section", { className: "grid gap-4 lg:grid-cols-[1.1fr_0.9fr]", children: [_jsxs("div", { className: "space-y-4", children: [_jsx(DropZone, { disabled: state.connectionState !== 'connected', onFiles: addFiles }), _jsx("button", { type: "button", disabled: state.connectionState !== 'connected', onClick: () => void sendAll(), className: "rounded-xl bg-violet-500 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50", children: "Send All" })] }), _jsxs("div", { children: [_jsx("p", { className: "mb-3 text-sm font-semibold text-zinc-100", children: "File Queue" }), _jsx(FileQueue, { items: senderTransfers })] })] })), state.mode === 'receiver' && _jsx(ReceivePanel, { items: receiverTransfers })] }) }));
}
async function handleRelayMessage(message, peer, selfId, peerIdRef, dispatch) {
    if (message.to && message.to !== selfId)
        return;
    if (message.from === selfId)
        return;
    if (!peerIdRef.current) {
        peerIdRef.current = message.from;
    }
    else if (peerIdRef.current !== message.from) {
        return;
    }
    try {
        if (message.type === 'offer') {
            await peer.handleOffer(message.payload, message.from);
            return;
        }
        if (message.type === 'answer') {
            await peer.handleAnswer(message.payload);
            return;
        }
        if (message.type === 'ice-candidate') {
            await peer.handleIceCandidate(message.payload);
            return;
        }
    }
    catch (error) {
        dispatch({
            type: 'SET_ERROR',
            error: error instanceof Error ? error.message : 'Failed to handle signaling relay.',
        });
    }
}
