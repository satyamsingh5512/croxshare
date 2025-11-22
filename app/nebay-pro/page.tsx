'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings, Wifi, WifiOff, History as HistoryIcon, Keyboard, BarChart3, Bell, Moon, Sun, Gauge } from 'lucide-react';
import Link from 'next/link';
import { useP2PFileTransfer } from '@/hooks/useP2PFileTransfer';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useClipboardPaste } from '@/hooks/useClipboardPaste';
import { useSystemNotifications, useNotificationSounds } from '@/hooks/useNotifications';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useConnectionQuality } from '@/hooks/useConnectionQuality';
import { useTransferSpeedLimiter, SpeedLimit } from '@/hooks/useTransferSpeedLimiter';
import { DeviceCard, EmptyDeviceState } from '@/components/nebay/DeviceCard';
import { DropZone, FileList } from '@/components/nebay/FileTransferEnhanced';
import { QRCodeShare } from '@/components/nebay/QRCodeShare';
import { TransferHistory, useTransferHistory } from '@/components/nebay/TransferHistory';
import { TransferStats } from '@/components/nebay/TransferStats';
import { FilePreviewList } from '@/components/nebay/FilePreview';
import { ConnectionQualityIndicator } from '@/components/nebay/ConnectionQualityIndicator';
import { SpeedLimitSelector } from '@/components/nebay/SpeedLimitSelector';
import { DarkModeToggleButton } from '@/components/ui/DarkModeToggle';
import { ShareButton } from '@/components/nebay/MobileShareSheet';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PinInput } from '@/components/ui/Input';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { StatusBadge } from '@/components/ui/Badge';
import { compressFile, formatCompressionRatio } from '@/lib/compression';
import { formatFileSize } from '@/lib/fileUtils';
import { simulateLatency, experienceRuntime } from '@/lib/experienceConfig';

const SIGNALING_URL = process.env.NEXT_PUBLIC_SIGNALING_URL || 'ws://localhost:8080';

export default function NebayShareIntegratedPage() {
  const [mode, setMode] = useState<'idle' | 'host' | 'join'>('idle');
  const [roomId, setRoomId] = useState('');
  const [deviceName, setDeviceName] = useState('My Device');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [enableCompression, setEnableCompression] = useState(true);
  const [enteredCode, setEnteredCode] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileStates, setFileStates] = useState<Array<{
    id: string;
    name: string;
    size: number;
    progress?: number;
    speed?: number;
    startTime?: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
  }>>([]);
  const heroPhrases = useMemo(
    () => [
      'Premium P2P that feels instant.',
      'Deep Charcoal. Indigo energy.',
      'Enterprise-grade security. Zero cloud.',
    ],
    []
  );
  const [heroIndex, setHeroIndex] = useState(0);

  const { success, error: showError, info, warning } = useToast();
  const { history, addTransfer, clearHistory } = useTransferHistory();
  const notifications = useSystemNotifications();
  const sounds = useNotificationSounds();
  const { isDarkMode, toggle: toggleDarkMode, mounted } = useDarkMode();
  const speedLimiter = useTransferSpeedLimiter('unlimited');

  const {
    connectionState,
    isVerified,
    verifyCode,
    peerDeviceName,
    receivedFiles,
    sendProgress,
    receiveProgress,
    error: p2pError,
    createRoom,
    joinRoom,
    sendFile,
    confirmVerification,
    pauseTransfer,
    resumeTransfer,
    cancelTransfer,
    isPaused,
    isCancelled,
    dataChannel,
  } = useP2PFileTransfer(SIGNALING_URL);

  // Connection quality monitoring
  const connectionQuality = useConnectionQuality(dataChannel);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'Escape',
      callback: () => {
        setShowVerifyModal(false);
        setShowHistoryModal(false);
        setShowShortcutsModal(false);
      },
      description: 'Close modals',
    },
    {
      key: 'h',
      ctrlKey: true,
      callback: () => {
        setShowHistoryModal(true);
      },
      description: 'Show history',
    },
    {
      key: 's',
      ctrlKey: true,
      callback: () => {
        if (isVerified && fileStates.some(f => f.status === 'pending')) {
          handleSendFiles();
        }
      },
      description: 'Send files',
    },
    {
      key: ' ',
      callback: () => {
        if (fileStates.some(f => f.status === 'uploading')) {
          if (isPaused) {
            resumeTransfer();
            info('Resumed', 'Transfer resumed');
          } else {
            pauseTransfer();
            info('Paused', 'Transfer paused');
          }
        }
      },
      description: 'Pause/Resume',
    },
    {
      key: '?',
      shiftKey: true,
      callback: () => {
        setShowShortcutsModal(true);
      },
      description: 'Show shortcuts',
    },
  ], mode !== 'idle');

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroPhrases.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [heroPhrases.length]);

  // Show error toasts
  useEffect(() => {
    if (p2pError) {
      showError('Connection Error', p2pError);
    }
  }, [p2pError, showError]);

  // Show verification modal when code is ready
  useEffect(() => {
    if (verifyCode !== null && !isVerified) {
      setShowVerifyModal(true);
      info('Verification Required', `Code: ${String(verifyCode).padStart(4, '0')}`);
    }
  }, [verifyCode, isVerified, info]);

  // Handle connection state changes
  useEffect(() => {
    if (connectionState === 'connected' && !isVerified) {
      info('Device Connected', 'Waiting for verification...');
    } else if (connectionState === 'verified') {
      success('Connection Verified!', 'You can now transfer files');
      setShowVerifyModal(false);
    }
  }, [connectionState, isVerified, info, success]);

  // Handle received files
  useEffect(() => {
    if (receivedFiles.length > 0) {
      const latest = receivedFiles[receivedFiles.length - 1];
      if (latest.blob) {
        success('File Received!', `${latest.name} downloaded successfully`);
        
        // Add to history
        addTransfer({
          fileName: latest.name,
          fileSize: latest.size,
          type: 'received',
          deviceName: peerDeviceName || 'Unknown Device',
          status: 'completed',
        });
        
        // Auto-download the file
        const url = URL.createObjectURL(latest.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = latest.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  }, [receivedFiles, success, addTransfer, peerDeviceName]);

  // Enable clipboard paste
  useClipboardPaste((pastedFiles) => {
    handleFilesSelected(pastedFiles);
    success('Files Pasted!', `${pastedFiles.length} file(s) added from clipboard`);
    sounds.playNotification();
  }, mode !== 'idle' && isVerified);

  // Request notification permission on mount
  useEffect(() => {
    if (notifications.isSupported && notifications.permission === 'default') {
      info('Enable Notifications', 'Allow notifications for file transfer updates');
      setTimeout(() => {
        notifications.requestPermission();
      }, 2000);
    }
  }, [notifications]);

  // Update file progress and calculate speed
  useEffect(() => {
    if (sendProgress > 0) {
      setFileStates(prev =>
        prev.map(f => {
          if (f.status === 'uploading' && f.startTime) {
            const elapsed = (Date.now() - f.startTime) / 1000; // seconds
            const bytesTransferred = (sendProgress / 100) * f.size;
            const speed = elapsed > 0 ? bytesTransferred / elapsed : 0;
            return { ...f, progress: sendProgress, speed };
          }
          return f.status === 'uploading' ? { ...f, progress: sendProgress } : f;
        })
      );
    }
  }, [sendProgress]);

  const handleHostRoom = async () => {
    if (!deviceName.trim()) {
      warning('Device Name Required', 'Please enter a device name');
      return;
    }
    const generatedRoomId = Math.random().toString(36).substr(2, 8).toUpperCase();
    setRoomId(generatedRoomId);
    setMode('host');
    await simulateLatency('discovery');
    await createRoom(generatedRoomId, deviceName);
    info('Room Created', `Room ID: ${generatedRoomId}. Waiting for devices...`);
  };

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      warning('Room ID Required', 'Please enter a room ID');
      return;
    }
    if (!deviceName.trim()) {
      warning('Device Name Required', 'Please enter a device name');
      return;
    }
    setMode('join');
    await simulateLatency('discovery');
    await joinRoom(roomId, deviceName);
    info('Joining Room', `Connecting to room ${roomId}...`);
  };

  const handleVerifyCode = () => {
    if (enteredCode.length === 4) {
      confirmVerification();
      if (verifyCode === parseInt(enteredCode)) {
        success('Verified!', 'Connection is now secure');
        notifications.notifyConnectionEstablished(peerDeviceName || 'Device');
        sounds.playFileReceived();
      } else {
        showError('Invalid Code', 'The code you entered is incorrect');
        sounds.playError();
      }
    }
  };

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    const newFileStates = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      status: 'pending' as const,
    }));
    setFileStates(prev => [...prev, ...newFileStates]);
    success('Files Added', `${files.length} file(s) ready to send`);
  };

  const handleSendFiles = async () => {
    if (!isVerified) {
      warning('Device Name Required', 'Please verify the connection first');
      return;
    }
    if (selectedFiles.length === 0) return;

    let successCount = 0;

    for (const file of selectedFiles) {
      try {
        const startTime = Date.now();
        
        // Compress file if enabled
        let fileToSend = file;
        if (enableCompression) {
          info('Compressing...', `Compressing ${file.name}`);
          const compressed = await compressFile(file);
          if (compressed.ratio < 0.95) { // Only use if >5% savings
            fileToSend = new File([compressed.compressedBlob], file.name, { type: file.type });
            info('Compressed!', `${formatCompressionRatio(compressed.ratio)} - Sending...`);
          }
        }
        
        setFileStates(prev =>
          prev.map(f =>
            f.name === file.name ? { ...f, status: 'uploading', progress: 0, startTime, speed: 0 } : f
          )
        );
  info('Sending File', `Transferring ${file.name}...`);
  await simulateLatency('upload');
  info('Optimizing Route', `${experienceRuntime.label} calibrating throughput`);
        await sendFile(fileToSend);
        setFileStates(prev =>
          prev.map(f =>
            f.name === file.name ? { ...f, status: 'completed', progress: 100 } : f
          )
        );
        success('File Sent!', `${file.name} transferred successfully`);
        successCount++;
        
        // Notifications
        sounds.playFileSent();
        notifications.notifyFileSent(file.name);
        
        // Add to history
        addTransfer({
          fileName: file.name,
          fileSize: file.size,
          type: 'sent',
          deviceName: peerDeviceName || 'Unknown Device',
          status: 'completed',
        });
      } catch (err: any) {
        const isCancelledError = err.message?.includes('cancelled');
        
        setFileStates(prev =>
          prev.map(f =>
            f.name === file.name ? { ...f, status: isCancelledError ? 'pending' : 'error', progress: 0 } : f
          )
        );
        
        if (!isCancelledError) {
          showError('Transfer Failed', `Failed to send ${file.name}`);
          sounds.playError();
          
          // Add failed transfer to history
          addTransfer({
            fileName: file.name,
            fileSize: file.size,
            type: 'sent',
            deviceName: peerDeviceName || 'Unknown Device',
            status: 'failed',
          });
        } else {
          info('Transfer Cancelled', `${file.name} transfer was cancelled`);
        }
      }
    }
    
    // Notify batch complete
    if (successCount > 0) {
      notifications.notifyTransferComplete(successCount);
      sounds.playFileReceived();
    }
    
    setSelectedFiles([]);
  };

  const handleRemoveFile = (id: string) => {
    setFileStates(prev => prev.filter(f => f.id !== id));
    setSelectedFiles(prev => prev.filter(f => f.name !== fileStates.find(fs => fs.id === id)?.name));
  };

  const getConnectionStatus = () => {
    if (mode === 'idle' && connectionState === 'disconnected') return 'idle';
    if (isVerified || connectionState === 'verified') return 'online';
    if (connectionState === 'connected') return 'online';
    if (connectionState === 'connecting') return 'connecting';
    return 'offline';
  };

  return (
    <div className="relative z-10 min-h-screen py-8">
      {/* Header */}
      <div className="sticky top-4 z-20 px-4 sm:px-6 lg:px-10">
        <div className="rounded-2xl border border-white/10 bg-deep-charcoal/70 backdrop-blur-md px-4 py-4 sm:px-6 flex flex-col gap-4 shadow-2xl shadow-black/30">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">Nebay Share Pro</p>
                <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text">
                  Deep Charcoal Engine
                </h1>
                <p className="text-sm text-white/70 flex items-center gap-2">
                  Real P2P · Runtime {experienceRuntime.label}
                  <StatusBadge status={getConnectionStatus()} />
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {mounted && (
                <DarkModeToggleButton
                  isDarkMode={isDarkMode}
                  onToggle={toggleDarkMode}
                />
              )}

              {selectedFiles.length > 0 && (
                <ShareButton files={selectedFiles} />
              )}

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowStatsModal(true)}
                title="Transfer Statistics"
              >
                <BarChart3 className="w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowHistoryModal(true)}
                title="Transfer History (Ctrl+H)"
              >
                <HistoryIcon className="w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (notifications.permission === 'granted') {
                    notifications.showNotification({
                      title: '🔔 Notifications Enabled',
                      body: 'You will receive updates for file transfers',
                    });
                  } else {
                    notifications.requestPermission();
                  }
                }}
                title={`Notifications: ${notifications.permission}`}
              >
                <Bell className={`w-5 h-5 ${notifications.permission === 'granted' ? 'text-green-500' : ''}`} />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowShortcutsModal(true)}
                title="Keyboard Shortcuts (?)"
              >
                <Keyboard className="w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowSettingsModal(true)}
                title="Settings"
              >
                <motion.span
                  animate={{ rotate: showSettingsModal ? 45 : 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 14 }}
                  className="inline-flex"
                >
                  <Settings className="w-5 h-5" />
                </motion.span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-10">
        {mode === 'idle' && (
          <section className="space-y-6 text-center lg:text-left">
            <p className="text-xs uppercase tracking-[0.35em] text-white/60">Air-gapped ready</p>
            <div className="relative min-h-[80px]">
              <motion.h2
                key={heroIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white"
              >
                {heroPhrases[heroIndex]}
              </motion.h2>
            </div>
            <p className="text-lg text-white/70 max-w-3xl mx-auto lg:mx-0">
              Share securely across WiFi with simulated network latency for realistic handshakes and adaptive routing guided by the {experienceRuntime.label}.
            </p>
          </section>
        )}

        {mode === 'idle' ? (
          /* Setup Screen */
          <div className="max-w-3xl mx-auto">
            <Card glass>
              <CardHeader>
                <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">
                  Get Started
                </h2>
                <p className="text-white/60">
                  Choose how you want to share files
                </p>
              </CardHeader>
              <CardBody className="space-y-6">
                {/* Device Name */}
                <div>
                  <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                    Device Name
                  </label>
                  <input
                    type="text"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    placeholder="My Device"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 dark:bg-white/5 border border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition-all text-white"
                  />
                </div>

                {/* Host or Join */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card hover className="cursor-pointer" onClick={handleHostRoom}>
                    <CardBody className="text-center space-y-3">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
                        <Wifi className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-text-light dark:text-text-dark">
                        Host Room
                      </h3>
                      <p className="text-sm text-white/70">
                        Create a new room and share files with others
                      </p>
                      <Button className="w-full">Create Room</Button>
                    </CardBody>
                  </Card>

                  <Card hover>
                    <CardBody className="text-center space-y-3">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-accent to-secondary rounded-2xl flex items-center justify-center">
                        <WifiOff className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-text-light dark:text-text-dark">
                        Join Room
                      </h3>
                      <p className="text-sm text-white/70">
                        Enter a room ID to connect with another device
                      </p>
                      <input
                        type="text"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                        placeholder="ROOM ID"
                        className="w-full px-4 py-2 rounded-xl bg-white/5 dark:bg-white/5 border border-white/10 focus:border-accent focus:ring-2 focus:ring-accent/30 outline-none transition-all text-center font-mono text-white"
                        maxLength={8}
                      />
                      <Button onClick={handleJoinRoom} variant="secondary" className="w-full">
                        Join Room
                      </Button>
                    </CardBody>
                  </Card>
                </div>
              </CardBody>
            </Card>
          </div>
        ) : (
          /* Transfer Screen */
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Connection Info */}
      <div className="xl:col-span-1">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold text-text-light dark:text-text-dark">
                    Connection Info
                  </h2>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="flex justify-between items-center p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10">
                    <span className="text-sm font-medium">Room ID:</span>
                    <span className="text-xl font-mono font-bold">{roomId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Your Device:</span>
                    <span className="font-semibold">{deviceName}</span>
                  </div>
                  {peerDeviceName && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Connected To:</span>
                      <span className="font-semibold">{peerDeviceName}</span>
                    </div>
                  )}
                  
                  {/* Connection Quality Indicator */}
                  {isVerified && dataChannel && (
                    <div className="p-4 rounded-2xl glass-panel dark:glass-panel-dark border border-white/10">
                      <ConnectionQualityIndicator
                        quality={connectionQuality.metrics.quality}
                        rtt={connectionQuality.metrics.rtt}
                        bandwidth={connectionQuality.metrics.bandwidth}
                      />
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Status:</span>
                    <StatusBadge status={getConnectionStatus()} />
                  </div>
                  {verifyCode !== null && (
                    <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400 mb-2">
                        Verification Code:
                      </p>
                      <p className="text-3xl font-mono font-bold text-center text-yellow-900 dark:text-yellow-300">
                        {String(verifyCode).padStart(4, '0')}
                      </p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-500 mt-2 text-center">
                        Share this code with the other device
                      </p>
                    </div>
                  )}
                  
                  {/* QR Code for host */}
                  {mode === 'host' && (
                    <QRCodeShare roomId={roomId} />
                  )}
                </CardBody>
              </Card>
            </div>

            {/* File Transfer */}
            <div className="xl:col-span-2">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold text-text-light dark:text-text-dark">
                    File Transfer
                  </h2>
                  <p className="text-sm text-white/70">
                    {isVerified ? 'Ready to send files' : 'Verify connection first'}
                  </p>
                </CardHeader>
                <CardBody className="space-y-6">
                  <DropZone
                    onFilesSelected={handleFilesSelected}
                    isDisabled={!isVerified}
                  />

                  {fileStates.length > 0 && (
                    <>
                      <FileList files={fileStates} onRemove={handleRemoveFile} />
                      
                      <div className="flex gap-4 flex-wrap">
                        <Button
                          onClick={handleSendFiles}
                          disabled={!isVerified || fileStates.every(f => f.status !== 'pending')}
                          className="flex-1"
                        >
                          Send {fileStates.filter(f => f.status === 'pending').length} file(s)
                        </Button>
                        
                        {fileStates.some(f => f.status === 'uploading') && (
                          <>
                            <Button
                              onClick={isPaused ? resumeTransfer : pauseTransfer}
                              variant="secondary"
                              size="sm"
                            >
                              {isPaused ? '▶️ Resume' : '⏸️ Pause'}
                            </Button>
                            <Button
                              onClick={() => {
                                cancelTransfer();
                                info('Cancelling', 'Transfer is being cancelled...');
                              }}
                              variant="outline"
                              size="sm"
                            >
                              ✕ Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </CardBody>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Verification Modal */}
      <Modal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        title="Verify Connection"
        glass
      >
        <div className="space-y-6">
          {mode === 'host' ? (
            <>
              <p className="text-center text-white/70">
                Share this code with the other device:
              </p>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 text-center">
                <p className="text-5xl font-mono font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {String(verifyCode).padStart(4, '0')}
                </p>
              </div>
              <p className="text-sm text-center text-white/50">
                Waiting for verification...
              </p>
            </>
          ) : (
            <>
              <p className="text-center text-white/70">
                Enter the 4-digit code shown on the host device:
              </p>
              <div className="flex justify-center">
                <PinInput length={4} onComplete={setEnteredCode} />
              </div>
              <Button
                onClick={handleVerifyCode}
                disabled={enteredCode.length !== 4}
                className="w-full"
              >
                Verify
              </Button>
            </>
          )}
        </div>
      </Modal>

      {/* Transfer History Modal */}
      <Modal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title="Transfer History"
        glass
      >
        <TransferHistory 
          history={history} 
          onClear={() => {
            clearHistory();
            success('History Cleared', 'All transfer records have been deleted');
          }}
        />
      </Modal>

      {/* Transfer Statistics Modal */}
      <Modal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        title="📊 Transfer Statistics"
        glass
      >
        <TransferStats history={history} />
      </Modal>

      {/* Keyboard Shortcuts Modal */}
      <Modal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
        title="⌨️ Keyboard Shortcuts"
        glass
      >
        <div className="space-y-4">
          <div className="grid grid-cols-[1fr,auto] gap-4 text-sm">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <span className="text-gray-700 dark:text-gray-300">Close modals</span>
                <kbd className="px-3 py-1 bg-white dark:bg-gray-900 rounded border border-gray-300 dark:border-gray-700 font-mono text-xs">Esc</kbd>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <span className="text-gray-700 dark:text-gray-300">Show history</span>
                <kbd className="px-3 py-1 bg-white dark:bg-gray-900 rounded border border-gray-300 dark:border-gray-700 font-mono text-xs">Ctrl+H</kbd>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <span className="text-gray-700 dark:text-gray-300">Send files</span>
                <kbd className="px-3 py-1 bg-white dark:bg-gray-900 rounded border border-gray-300 dark:border-gray-700 font-mono text-xs">Ctrl+S</kbd>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <span className="text-gray-700 dark:text-gray-300">Pause/Resume transfer</span>
                <kbd className="px-3 py-1 bg-white dark:bg-gray-900 rounded border border-gray-300 dark:border-gray-700 font-mono text-xs">Space</kbd>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <span className="text-gray-700 dark:text-gray-300">Show shortcuts</span>
                <kbd className="px-3 py-1 bg-white dark:bg-gray-900 rounded border border-gray-300 dark:border-gray-700 font-mono text-xs">Shift+?</kbd>
              </div>
            </div>
          </div>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
            💡 Tip: Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded text-xs">?</kbd> anytime to see shortcuts
          </p>
        </div>
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="⚙️ Settings"
        glass
      >
        <div className="space-y-6">
          {/* Speed Limit Selector */}
          <div>
            <SpeedLimitSelector
              currentLimit={speedLimiter.speedLimit}
              onChange={(limit) => speedLimiter.setLimit(limit)}
              disabled={sendProgress > 0 && sendProgress < 100}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Limit transfer speed to control bandwidth usage. Changes apply to new transfers.
            </p>
          </div>

          {/* Compression Setting */}
          <div className="space-y-2">
            <label className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div>
                <div className="font-medium text-[#111827] dark:text-white">File Compression</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Compress files before transfer (20-85% savings)</div>
              </div>
              <input
                type="checkbox"
                checked={enableCompression}
                onChange={(e) => setEnableCompression(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
            </label>
          </div>

          {/* Dark Mode Setting */}
          {mounted && (
            <div className="space-y-2">
              <label className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div>
                  <div className="font-medium text-[#111827] dark:text-white">Dark Mode</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Switch between light and dark theme</div>
                </div>
                <input
                  type="checkbox"
                  checked={isDarkMode}
                  onChange={toggleDarkMode}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </label>
            </div>
          )}

          {/* Info */}
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              💡 Settings are saved automatically and persist across sessions
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
