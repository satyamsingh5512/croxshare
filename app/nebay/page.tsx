'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings } from 'lucide-react';
import Link from 'next/link';
import { DeviceCard, EmptyDeviceState } from '@/components/nebay/DeviceCard';
import { DropZone, FileList } from '@/components/nebay/FileTransfer';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PinInput } from '@/components/ui/Input';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

export default function NebaySharePage() {
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const { success, error, info } = useToast();
  const [files, setFiles] = useState<Array<{
    id: string;
    name: string;
    size: number;
    progress?: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
  }>>([]);

  // Mock devices for demo
  const [devices] = useState([
    {
      id: '1',
      name: 'MacBook Pro',
      type: 'laptop' as const,
      signal: 'strong' as const,
    },
    {
      id: '2',
      name: 'iPhone 15 Pro',
      type: 'phone' as const,
      signal: 'medium' as const,
    },
    {
      id: '3',
      name: 'Gaming PC',
      type: 'desktop' as const,
      signal: 'strong' as const,
    },
  ]);

  const handleStartSearch = () => {
    setIsSearching(true);
    info('Searching for devices...', 'Looking for devices on your network');
    // In real implementation, this would trigger WebRTC discovery
  };

  const handleDeviceClick = (deviceId: string) => {
    setSelectedDevice(deviceId);
    setShowCodeModal(true);
  };

  const handleFilesSelected = (newFiles: File[]) => {
    const fileObjects = newFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      status: 'pending' as const,
    }));
    setFiles((prev) => [...prev, ...fileObjects]);
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSendFiles = () => {
    if (!selectedDevice || files.length === 0) return;

    const deviceName = devices.find(d => d.id === selectedDevice)?.name || 'device';
    info('Starting transfer...', `Sending ${files.length} file(s) to ${deviceName}`);

    // Simulate file upload progress
    files.forEach((file, index) => {
      setTimeout(() => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: 'uploading', progress: 0 } : f
          )
        );

        // Simulate progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          if (progress > 100) {
            clearInterval(interval);
            setFiles((prev) =>
              prev.map((f) =>
                f.id === file.id ? { ...f, status: 'completed', progress: 100 } : f
              )
            );
            success('File sent!', `${file.name} transferred successfully`);
          } else {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === file.id ? { ...f, progress } : f
              )
            );
          }
        }, 200);
      }, index * 500);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-dark-bg dark:via-dark-card dark:to-dark-surface transition-colors duration-500">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Nebay Share
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Share files instantly
                </p>
              </div>
            </div>
            <Link href="/nebay/settings">
              <Button variant="outline" size="sm">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Device Discovery Section */}
          <div>
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold text-text-light dark:text-text-dark">
                  Nearby Devices
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isSearching
                    ? `Found ${devices.length} device${devices.length !== 1 ? 's' : ''}`
                    : 'Start searching to discover devices'}
                </p>
              </CardHeader>
              <CardBody>
                {!isSearching ? (
                  <div className="text-center py-12">
                    <Button onClick={handleStartSearch} size="lg">
                      Start Searching
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {devices.length > 0 ? (
                      devices.map((device) => (
                        <DeviceCard
                          key={device.id}
                          deviceName={device.name}
                          deviceType={device.type}
                          signalStrength={device.signal}
                          isConnected={selectedDevice === device.id}
                          onClick={() => handleDeviceClick(device.id)}
                        />
                      ))
                    ) : (
                      <EmptyDeviceState isSearching />
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* File Transfer Section */}
          <div>
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold text-text-light dark:text-text-dark">
                  File Transfer
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedDevice
                    ? 'Add files to send'
                    : 'Select a device first'}
                </p>
              </CardHeader>
              <CardBody className="space-y-6">
                <DropZone
                  onFilesSelected={handleFilesSelected}
                  isDisabled={!selectedDevice}
                />

                {files.length > 0 && (
                  <>
                    <FileList files={files} onRemove={handleRemoveFile} />
                    <Button
                      onClick={handleSendFiles}
                      disabled={!selectedDevice || files.every((f) => f.status !== 'pending')}
                      className="w-full"
                    >
                      Send {files.length} file{files.length !== 1 ? 's' : ''}
                    </Button>
                  </>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Verification Code Modal */}
      <Modal
        isOpen={showCodeModal}
        onClose={() => {
          setShowCodeModal(false);
          setVerificationCode('');
        }}
        title="Verify Connection"
        glass
      >
        <div className="space-y-6">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Enter the 4-digit code shown on the other device to establish a secure connection.
          </p>

          <div className="flex justify-center">
            <PinInput
              length={4}
              onComplete={setVerificationCode}
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowCodeModal(false);
                setVerificationCode('');
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (verificationCode.length === 4) {
                  setShowCodeModal(false);
                  // In real implementation, verify the code
                }
              }}
              disabled={verificationCode.length !== 4}
              className="flex-1"
            >
              Connect
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
