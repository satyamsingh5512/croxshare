import {
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  Code,
  FileSpreadsheet,
  FileIcon,
  File,
} from 'lucide-react';

export function getFileIcon(fileName: string, size: number = 20) {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  const iconProps = { size, className: 'flex-shrink-0' };

  // Documents
  if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(extension)) {
    return <FileText {...iconProps} className={`${iconProps.className} text-red-500`} />;
  }

  // Images
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico'].includes(extension)) {
    return <ImageIcon {...iconProps} className={`${iconProps.className} text-blue-500`} />;
  }

  // Videos
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v'].includes(extension)) {
    return <Video {...iconProps} className={`${iconProps.className} text-purple-500`} />;
  }

  // Audio
  if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma'].includes(extension)) {
    return <Music {...iconProps} className={`${iconProps.className} text-pink-500`} />;
  }

  // Archives
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(extension)) {
    return <Archive {...iconProps} className={`${iconProps.className} text-yellow-500`} />;
  }

  // Spreadsheets
  if (['xls', 'xlsx', 'csv', 'ods'].includes(extension)) {
    return <FileSpreadsheet {...iconProps} className={`${iconProps.className} text-green-500`} />;
  }

  // Code
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json', 'xml', 'yaml', 'yml', 'sh', 'php', 'rb', 'go', 'rs'].includes(extension)) {
    return <Code {...iconProps} className={`${iconProps.className} text-indigo-500`} />;
  }

  // Default
  return <File {...iconProps} className={`${iconProps.className} text-gray-500`} />;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function formatTransferSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond === 0) return '0 KB/s';
  const k = 1024;
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
  return Math.round(bytesPerSecond / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function formatTimeRemaining(seconds: number): string {
  if (seconds === 0 || !isFinite(seconds)) return 'Calculating...';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

export function getFileColor(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(extension)) return 'from-red-400 to-red-600';
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension)) return 'from-blue-400 to-blue-600';
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(extension)) return 'from-purple-400 to-purple-600';
  if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(extension)) return 'from-pink-400 to-pink-600';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return 'from-yellow-400 to-yellow-600';
  if (['xls', 'xlsx', 'csv'].includes(extension)) return 'from-green-400 to-green-600';
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'java'].includes(extension)) return 'from-indigo-400 to-indigo-600';
  
  return 'from-gray-400 to-gray-600';
}

export function getFileCategory(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  // Documents
  if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'pages'].includes(extension)) {
    return 'document';
  }
  
  // Images
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'heic'].includes(extension)) {
    return 'image';
  }
  
  // Videos
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v'].includes(extension)) {
    return 'video';
  }
  
  // Audio
  if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma'].includes(extension)) {
    return 'audio';
  }
  
  // Archives
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(extension)) {
    return 'archive';
  }
  
  // Spreadsheets
  if (['xls', 'xlsx', 'csv', 'ods', 'numbers'].includes(extension)) {
    return 'spreadsheet';
  }
  
  // Code
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json', 'xml', 'yaml', 'yml', 'sh', 'php', 'rb', 'go', 'rs'].includes(extension)) {
    return 'code';
  }
  
  return 'file';
}
