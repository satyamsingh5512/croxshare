'use client';

import { useEffect, useState } from 'react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
}

export function useSystemNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const showNotification = (options: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') {
      return null;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
      });

      // Auto-close after 5 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => notification.close(), 5000);
      }

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  };

  const notifyFileReceived = (fileName: string, fileSize: string) => {
    return showNotification({
      title: '📥 File Received!',
      body: `${fileName} (${fileSize}) has been downloaded`,
      tag: 'file-received',
    });
  };

  const notifyFileSent = (fileName: string) => {
    return showNotification({
      title: '📤 File Sent!',
      body: `${fileName} transferred successfully`,
      tag: 'file-sent',
    });
  };

  const notifyTransferComplete = (fileCount: number) => {
    return showNotification({
      title: '✅ Transfer Complete!',
      body: `${fileCount} file${fileCount > 1 ? 's' : ''} transferred successfully`,
      tag: 'transfer-complete',
    });
  };

  const notifyConnectionEstablished = (deviceName: string) => {
    return showNotification({
      title: '🔗 Connected!',
      body: `Connected to ${deviceName}`,
      tag: 'connection',
    });
  };

  const notifyConnectionLost = () => {
    return showNotification({
      title: '⚠️ Connection Lost',
      body: 'Attempting to reconnect...',
      tag: 'connection',
    });
  };

  const notifyError = (message: string) => {
    return showNotification({
      title: '❌ Error',
      body: message,
      tag: 'error',
      requireInteraction: true,
    });
  };

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
    notifyFileReceived,
    notifyFileSent,
    notifyTransferComplete,
    notifyConnectionEstablished,
    notifyConnectionLost,
    notifyError,
  };
}

// Sound effects
export function useNotificationSounds() {
  const playSound = (type: 'success' | 'error' | 'notification') => {
    try {
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      // Different frequencies for different notification types
      switch (type) {
        case 'success':
          // Happy ascending notes
          oscillator.frequency.setValueAtTime(523.25, context.currentTime); // C5
          oscillator.frequency.setValueAtTime(659.25, context.currentTime + 0.1); // E5
          oscillator.frequency.setValueAtTime(783.99, context.currentTime + 0.2); // G5
          break;
        case 'error':
          // Alert descending notes
          oscillator.frequency.setValueAtTime(659.25, context.currentTime); // E5
          oscillator.frequency.setValueAtTime(523.25, context.currentTime + 0.1); // C5
          break;
        case 'notification':
          // Simple beep
          oscillator.frequency.setValueAtTime(800, context.currentTime);
          break;
      }

      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.3);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const playFileReceived = () => playSound('success');
  const playFileSent = () => playSound('success');
  const playError = () => playSound('error');
  const playNotification = () => playSound('notification');

  return {
    playSound,
    playFileReceived,
    playFileSent,
    playError,
    playNotification,
  };
}
