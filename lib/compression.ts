'use client';

/**
 * File Compression Utilities
 * Compress files before P2P transfer to reduce bandwidth and time
 */

// Compression using browser's native CompressionStream API
export async function compressFile(file: File): Promise<{ 
  compressedBlob: Blob; 
  originalSize: number; 
  compressedSize: number; 
  ratio: number;
  compressionTime: number;
}> {
  const startTime = performance.now();
  
  try {
    // Check if file is already compressed (images, videos, archives)
    const ext = file.name.split('.').pop()?.toLowerCase();
    const alreadyCompressed = ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mp3', 'zip', 'rar', '7z', 'gz'].includes(ext || '');
    
    if (alreadyCompressed) {
      // Skip compression for already compressed formats
      return {
        compressedBlob: file,
        originalSize: file.size,
        compressedSize: file.size,
        ratio: 1,
        compressionTime: performance.now() - startTime,
      };
    }

    // Use CompressionStream for compressible files (text, code, documents)
    const stream = file.stream();
    const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
    
    const chunks: BlobPart[] = [];
    const reader = compressedStream.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    
    const compressedBlob = new Blob(chunks, { type: 'application/gzip' });
    const compressionTime = performance.now() - startTime;
    
    return {
      compressedBlob,
      originalSize: file.size,
      compressedSize: compressedBlob.size,
      ratio: compressedBlob.size / file.size,
      compressionTime,
    };
  } catch (error) {
    console.error('Compression failed:', error);
    // Fallback: return original file
    return {
      compressedBlob: file,
      originalSize: file.size,
      compressedSize: file.size,
      ratio: 1,
      compressionTime: performance.now() - startTime,
    };
  }
}

// Decompress received file
export async function decompressFile(
  compressedBlob: Blob,
  originalName: string
): Promise<Blob> {
  try {
    const ext = originalName.split('.').pop()?.toLowerCase();
    const wasCompressed = !['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mp3', 'zip', 'rar', '7z', 'gz'].includes(ext || '');
    
    if (!wasCompressed) {
      // File wasn't compressed, return as-is
      return compressedBlob;
    }

    // Decompress using DecompressionStream
    const stream = compressedBlob.stream();
    const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'));
    
    const chunks: BlobPart[] = [];
    const reader = decompressedStream.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    
    return new Blob(chunks);
  } catch (error) {
    console.error('Decompression failed:', error);
    // Return original blob if decompression fails
    return compressedBlob;
  }
}

// Format compression ratio as percentage
export function formatCompressionRatio(ratio: number): string {
  const savings = (1 - ratio) * 100;
  if (savings < 1) return 'No compression';
  return `${savings.toFixed(1)}% smaller`;
}

// Check if file type benefits from compression
export function shouldCompressFile(fileName: string): boolean {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const compressible = ['txt', 'doc', 'docx', 'pdf', 'json', 'xml', 'html', 'css', 'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'h'];
  return compressible.includes(ext || '');
}

// Estimate compression benefit
export function estimateCompressionBenefit(fileName: string, fileSize: number): {
  shouldCompress: boolean;
  estimatedSavings: string;
  reason: string;
} {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  // Already compressed formats
  const compressed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mp3', 'zip', 'rar', '7z', 'gz'];
  if (compressed.includes(ext || '')) {
    return {
      shouldCompress: false,
      estimatedSavings: '0%',
      reason: 'Already compressed format',
    };
  }
  
  // Text/code files - high compression
  const highCompression = ['txt', 'json', 'xml', 'html', 'css', 'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp'];
  if (highCompression.includes(ext || '')) {
    return {
      shouldCompress: true,
      estimatedSavings: '60-80%',
      reason: 'Text file - high compression',
    };
  }
  
  // Documents - medium compression
  const mediumCompression = ['doc', 'docx', 'pdf', 'ppt', 'pptx'];
  if (mediumCompression.includes(ext || '')) {
    return {
      shouldCompress: true,
      estimatedSavings: '20-40%',
      reason: 'Document - medium compression',
    };
  }
  
  // Default - try compression
  return {
    shouldCompress: true,
    estimatedSavings: '10-30%',
    reason: 'May benefit from compression',
  };
}
