import { calcSpeed, formatEta, type SpeedSample } from './utils';

export const CHUNK_SIZE = 16 * 1024;
export const BUFFER_THRESHOLD = 256 * 1024;

export interface FileMetaMessage {
  type: 'meta';
  id: string;
  name: string;
  size: number;
  mime: string;
}

export interface FileDoneMessage {
  type: 'done';
  id: string;
}

export type TransferControlMessage = FileMetaMessage | FileDoneMessage;

export interface SendProgress {
  id: string;
  sentBytes: number;
  totalBytes: number;
  percent: number;
  speedBytesPerSec: number;
  eta: string;
}

export type SendProgressHandler = (progress: SendProgress) => void;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function readChunk(file: File, offset: number, length: number): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const slice = file.slice(offset, offset + length);
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (!(result instanceof ArrayBuffer)) {
        reject(new Error('FileReader did not produce ArrayBuffer.'));
        return;
      }
      resolve(result);
    };

    reader.onerror = () => {
      reject(reader.error ?? new Error('Failed to read file chunk.'));
    };

    reader.readAsArrayBuffer(slice);
  });
}

function encodeChunkPacket(id: string, payload: ArrayBuffer): ArrayBuffer {
  const encoder = new TextEncoder();
  const idBytes = encoder.encode(id);
  const headerBytes = 2;
  const buffer = new Uint8Array(headerBytes + idBytes.length + payload.byteLength);
  const view = new DataView(buffer.buffer);

  view.setUint16(0, idBytes.length);
  buffer.set(idBytes, headerBytes);
  buffer.set(new Uint8Array(payload), headerBytes + idBytes.length);
  return buffer.buffer;
}

function decodeChunkPacket(packet: ArrayBuffer): { id: string; chunk: ArrayBuffer } {
  const bytes = new Uint8Array(packet);
  const view = new DataView(packet);
  const idLength = view.getUint16(0);
  const idStart = 2;
  const idEnd = idStart + idLength;

  if (packet.byteLength <= idEnd) {
    throw new Error('Chunk packet too short.');
  }

  const decoder = new TextDecoder();
  const id = decoder.decode(bytes.slice(idStart, idEnd));
  const chunk = bytes.slice(idEnd).buffer;

  return { id, chunk };
}

export async function sendFile(
  file: File,
  channel: RTCDataChannel,
  onProgress: SendProgressHandler,
  transferId?: string,
): Promise<string> {
  if (channel.readyState !== 'open') {
    throw new Error('DataChannel is not open.');
  }

  const id = transferId ?? (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

  const meta: FileMetaMessage = {
    type: 'meta',
    id,
    name: file.name,
    size: file.size,
    mime: file.type || 'application/octet-stream',
  };

  channel.send(JSON.stringify(meta));

  let offset = 0;
  let sentBytes = 0;
  const samples: SpeedSample[] = [];

  while (offset < file.size) {
    while (channel.bufferedAmount > BUFFER_THRESHOLD) {
      await wait(50);
    }

    const remaining = file.size - offset;
    const length = Math.min(CHUNK_SIZE, remaining);
    const chunk = await readChunk(file, offset, length);
    const packet = encodeChunkPacket(id, chunk);
    channel.send(packet);

    offset += length;
    sentBytes += length;

    const now = Date.now();
    samples.push({ at: now, bytes: length });
    while (samples.length > 0) {
      const oldest = samples[0];
      if (!oldest || oldest.at >= now - 500) break;
      samples.shift();
    }

    const speed = calcSpeed(samples, now, 500);
    const remainingBytes = file.size - sentBytes;
    const etaSeconds = speed > 0 ? remainingBytes / speed : 0;

    onProgress({
      id,
      sentBytes,
      totalBytes: file.size,
      percent: Math.min(100, Math.round((sentBytes / file.size) * 100)),
      speedBytesPerSec: speed,
      eta: formatEta(etaSeconds),
    });
  }

  const done: FileDoneMessage = { type: 'done', id };
  channel.send(JSON.stringify(done));

  return id;
}

interface ActiveIncomingTransfer {
  meta: FileMetaMessage;
  chunks: ArrayBuffer[];
  receivedBytes: number;
}

export interface ReceiveProgress {
  id: string;
  name: string;
  size: number;
  receivedBytes: number;
  percent: number;
}

export interface FileReceiverOptions {
  onMeta?: (meta: FileMetaMessage) => void;
  onProgress?: (progress: ReceiveProgress) => void;
  onDone?: (meta: FileMetaMessage) => void;
  onError?: (message: string) => void;
}

export class FileReceiver {
  private incoming = new Map<string, ActiveIncomingTransfer>();

  constructor(private readonly options: FileReceiverOptions = {}) {}

  async handle(data: string | ArrayBuffer | Blob): Promise<void> {
    try {
      if (typeof data === 'string') {
        this.handleControl(data);
        return;
      }

      if (data instanceof Blob) {
        const arrayBuffer = await data.arrayBuffer();
        this.handleChunk(arrayBuffer);
        return;
      }

      this.handleChunk(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'File receiver failed.';
      this.options.onError?.(message);
    }
  }

  private handleControl(raw: string): void {
    const parsed = JSON.parse(raw) as TransferControlMessage;

    if (parsed.type === 'meta') {
      this.incoming.set(parsed.id, {
        meta: parsed,
        chunks: [],
        receivedBytes: 0,
      });
      this.options.onMeta?.(parsed);
      return;
    }

    if (parsed.type === 'done') {
      const transfer = this.incoming.get(parsed.id);
      if (!transfer) return;

      const blob = new Blob(transfer.chunks, {
        type: transfer.meta.mime || 'application/octet-stream',
      });
      this.triggerDownload(blob, transfer.meta.name);
      this.options.onDone?.(transfer.meta);
      this.incoming.delete(parsed.id);
      return;
    }

    throw new Error('Unknown control message type.');
  }

  private handleChunk(packet: ArrayBuffer): void {
    const { id, chunk } = decodeChunkPacket(packet);
    const transfer = this.incoming.get(id);
    if (!transfer) return;

    transfer.chunks.push(chunk);
    transfer.receivedBytes += chunk.byteLength;

    const percent = Math.min(100, Math.round((transfer.receivedBytes / transfer.meta.size) * 100));
    this.options.onProgress?.({
      id,
      name: transfer.meta.name,
      size: transfer.meta.size,
      receivedBytes: transfer.receivedBytes,
      percent,
    });
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  destroy(): void {
    this.incoming.clear();
  }
}
