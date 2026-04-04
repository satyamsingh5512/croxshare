export function generateRoomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const random = Math.random().toString(16).slice(2);
  return `${Date.now().toString(16)}-${random}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

export interface SpeedSample {
  at: number;
  bytes: number;
}

export function calcSpeed(samples: SpeedSample[], now = Date.now(), windowMs = 500): number {
  const cutoff = now - windowMs;
  let bytes = 0;
  for (const sample of samples) {
    if (sample.at >= cutoff) {
      bytes += sample.bytes;
    }
  }
  return bytes / (windowMs / 1000);
}

export function formatSpeed(bytesPerSecond: number): string {
  if (!Number.isFinite(bytesPerSecond) || bytesPerSecond <= 0) return '0 KB/s';
  if (bytesPerSecond < 1024 ** 2) return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
  return `${(bytesPerSecond / (1024 ** 2)).toFixed(2)} MB/s`;
}

export function formatEta(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '00:00';
  const rounded = Math.ceil(seconds);
  const mins = Math.floor(rounded / 60)
    .toString()
    .padStart(2, '0');
  const secs = (rounded % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}
