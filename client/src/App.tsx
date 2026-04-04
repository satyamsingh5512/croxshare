import React, { useEffect, useMemo, useRef, useState } from 'react';
import RoomCard from './components/RoomCard';
import DropZone from './components/DropZone';
import FileQueue from './components/FileQueue';
import ReceivePanel from './components/ReceivePanel';
import { useTransferContext } from './context/TransferContext';
import { PeerConnectionManager } from './lib/peer';
import { SignalingClient, type RelayServerMessage, type SignalingServerMessage } from './lib/signaling';
import { FileReceiver, sendFile } from './lib/transfer';
import { formatSpeed, generateRoomId } from './lib/utils';

function getSignalingUrl(): string {
  const envUrl = import.meta.env.VITE_SIGNALING_URL as string | undefined;
  if (envUrl) return envUrl;
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${protocol}://${window.location.hostname}:8080`;
}

export default function App() {
  const { state, dispatch } = useTransferContext();

  const [roomInput, setRoomInput] = useState('');
  const [filesById] = useState(() => new Map<string, File>());

  const selfIdRef = useRef<string>(generateRoomId());
  const peerIdRef = useRef<string | null>(null);
  const signalingRef = useRef<SignalingClient | null>(null);
  const peerRef = useRef<PeerConnectionManager | null>(null);
  const receiverRef = useRef<FileReceiver | null>(null);

  const senderTransfers = useMemo(
    () => state.transfers.filter((t) => t.status === 'queued' || t.status === 'sending' || t.status === 'done' || t.status === 'error'),
    [state.transfers],
  );

  const receiverTransfers = useMemo(
    () => state.transfers.filter((t) => t.status === 'receiving' || t.status === 'done'),
    [state.transfers],
  );

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
      lanOnly: (import.meta.env.VITE_LAN_ONLY_ICE as string | undefined) === 'true',
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

    const unsubscribe = signaling.onMessage((message: SignalingServerMessage) => {
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

  async function createRoomAndCopy(nextMode: 'sender' | 'receiver'): Promise<void> {
    const id = generateRoomId();
    await navigator.clipboard.writeText(id);
    setRoomInput(id);
    dispatch({ type: 'SET_MODE', mode: nextMode });
    dispatch({ type: 'SET_ROOM', room: id });
    window.history.replaceState(null, '', `/?room=${id}`);
  }

  function joinRoom(nextMode: 'sender' | 'receiver'): void {
    if (!roomInput.trim()) return;
    dispatch({ type: 'SET_MODE', mode: nextMode });
    dispatch({ type: 'SET_ROOM', room: roomInput.trim() });
    window.history.replaceState(null, '', `/?room=${roomInput.trim()}`);
  }

  function leaveRoom(): void {
    filesById.clear();
    dispatch({ type: 'RESET_SESSION' });
    setRoomInput('');
    window.history.replaceState(null, '', '/');
  }

  function addFiles(files: File[]): void {
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

  async function sendAll(): Promise<void> {
    const channel = peerRef.current?.dataChannel;
    if (!channel || channel.readyState !== 'open') {
      dispatch({ type: 'SET_ERROR', error: 'Data channel is not connected yet.' });
      return;
    }

    const queue = state.transfers.filter((t) => t.status === 'queued');

    for (const item of queue) {
      const file = filesById.get(item.id);
      if (!file) continue;

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
      } catch (error) {
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
    return (
      <div className="min-h-screen bg-zinc-900 px-4 py-10 text-zinc-100">
        <div className="mx-auto max-w-3xl rounded-2xl border border-zinc-700 bg-zinc-950 p-6">
          <h1 className="text-3xl font-bold">Croxshare</h1>
          <p className="mt-2 text-zinc-400">LAN-first P2P file transfer with WebRTC DataChannel.</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => void createRoomAndCopy('sender')}
              className="rounded-xl bg-violet-500 px-4 py-3 font-semibold text-white hover:bg-violet-400"
            >
              Send Files
            </button>
            <button
              type="button"
              onClick={() => joinRoom('receiver')}
              className="rounded-xl border border-zinc-700 px-4 py-3 font-semibold text-zinc-200 hover:bg-zinc-800"
            >
              Receive Files
            </button>
          </div>

          <div className="mt-6 space-y-2">
            <label htmlFor="room" className="text-sm text-zinc-400">
              Room Code
            </label>
            <input
              id="room"
              value={roomInput}
              onChange={(event) => setRoomInput(event.target.value)}
              placeholder="Paste room UUID"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-100 outline-none ring-violet-500 focus:ring-2"
            />
          </div>

          <button
            type="button"
            onClick={() => void createRoomAndCopy('receiver')}
            className="mt-4 rounded-xl border border-violet-500/40 px-4 py-3 text-sm font-semibold text-violet-300 hover:bg-violet-500/10"
          >
            Create Room
          </button>

          {state.error && <p className="mt-4 text-sm text-rose-400">{state.error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 px-4 py-6 text-zinc-100">
      <main className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">Croxshare Room</h1>
          <button
            type="button"
            onClick={leaveRoom}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            Leave Room
          </button>
        </div>

        <RoomCard roomId={state.room} peerCount={state.peerCount} connectionState={state.connectionState} />

        {state.error && <p className="text-sm text-rose-400">{state.error}</p>}

        {state.mode === 'sender' && (
          <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <DropZone disabled={state.connectionState !== 'connected'} onFiles={addFiles} />
              <button
                type="button"
                disabled={state.connectionState !== 'connected'}
                onClick={() => void sendAll()}
                className="rounded-xl bg-violet-500 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send All
              </button>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold text-zinc-100">File Queue</p>
              <FileQueue items={senderTransfers} />
            </div>
          </section>
        )}

        {state.mode === 'receiver' && <ReceivePanel items={receiverTransfers} />}
      </main>
    </div>
  );
}

async function handleRelayMessage(
  message: RelayServerMessage,
  peer: PeerConnectionManager,
  selfId: string,
  peerIdRef: React.MutableRefObject<string | null>,
  dispatch: React.Dispatch<import('./context/TransferContext').TransferAction>,
): Promise<void> {
  if (message.to && message.to !== selfId) return;
  if (message.from === selfId) return;

  if (!peerIdRef.current) {
    peerIdRef.current = message.from;
  } else if (peerIdRef.current !== message.from) {
    return;
  }

  try {
    if (message.type === 'offer') {
      await peer.handleOffer(message.payload as RTCSessionDescriptionInit, message.from);
      return;
    }
    if (message.type === 'answer') {
      await peer.handleAnswer(message.payload as RTCSessionDescriptionInit);
      return;
    }
    if (message.type === 'ice-candidate') {
      await peer.handleIceCandidate(message.payload as RTCIceCandidateInit);
      return;
    }
  } catch (error) {
    dispatch({
      type: 'SET_ERROR',
      error: error instanceof Error ? error.message : 'Failed to handle signaling relay.',
    });
  }
}
