export const CHUNK_SIZE = 16 * 1024; // 16 KB per chunk (safer default for WebRTC DataChannels)

/**
 * Split a File into fixed-size ArrayBuffer chunks, yielding them one by one.
 * This keeps memory usage low for large files.
 */
export async function* chunkFile(
  file: File,
): AsyncGenerator<{ index: number; data: ArrayBuffer; total: number }> {
  const total = Math.ceil(file.size / CHUNK_SIZE);
  let index = 0;
  let offset = 0;
  while (offset < file.size) {
    const slice = file.slice(offset, offset + CHUNK_SIZE);
    const data = await slice.arrayBuffer();
    yield { index, data, total };
    index++;
    offset += CHUNK_SIZE;
  }
}

/**
 * Reassemble ordered ArrayBuffer chunks into a downloadable Blob.
 */
export function reassemble(buffers: ArrayBuffer[], mime: string): Blob {
  return new Blob(buffers, { type: mime || 'application/octet-stream' });
}

/**
 * Trigger a browser file download from a Blob.
 */
export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
