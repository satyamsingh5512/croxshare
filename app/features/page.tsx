'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { DropZone, FileList } from '@/components/nebay/FileTransferEnhanced';
import { QRCodeShare } from '@/components/nebay/QRCodeShare';
import { TransferHistory, useTransferHistory, type TransferHistoryItem } from '@/components/nebay/TransferHistory';
import { useToast } from '@/components/ui/Toast';

export default function FeaturesPage() {
  const [demoFiles, setDemoFiles] = useState<Array<{
    id: string;
    name: string;
    size: number;
    progress?: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    speed?: number;
    startTime?: number;
  }>>([]);

  const { history, addTransfer, clearHistory } = useTransferHistory();
  const { success, info } = useToast();

  const handleFilesSelected = (files: File[]) => {
    const newFiles = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      status: 'pending' as const,
    }));
    setDemoFiles((prev) => [...prev, ...newFiles]);
    success('Files Added', `${files.length} file(s) ready for demo transfer`);
  };

  const handleRemoveFile = (id: string) => {
    setDemoFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDemoTransfer = () => {
    const pendingFiles = demoFiles.filter((f) => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    pendingFiles.forEach((file, index) => {
      setTimeout(() => {
        // Start upload
        setDemoFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? { ...f, status: 'uploading', progress: 0, speed: 1024 * 500, startTime: Date.now() } // 500 KB/s
              : f
          )
        );

        // Simulate progress
        const duration = 3000; // 3 seconds
        const steps = 30;
        const stepDuration = duration / steps;

        for (let i = 1; i <= steps; i++) {
          setTimeout(() => {
            const progress = (i / steps) * 100;
            setDemoFiles((prev) =>
              prev.map((f) =>
                f.id === file.id ? { ...f, progress } : f
              )
            );

            if (i === steps) {
              // Complete
              setDemoFiles((prev) =>
                prev.map((f) =>
                  f.id === file.id ? { ...f, status: 'completed', progress: 100 } : f
                )
              );
              success('Transfer Complete!', `${file.name} sent successfully`);

              // Add to history
              addTransfer({
                fileName: file.name,
                fileSize: file.size,
                type: 'sent',
                deviceName: 'Demo Device',
                status: 'completed',
              });
            }
          }, i * stepDuration);
        }
      }, index * 500);
    });

    info('Starting Demo Transfer', `Transferring ${pendingFiles.length} file(s)...`);
  };

  const addDemoHistory = () => {
    const demoItems: Array<Omit<TransferHistoryItem, 'id' | 'timestamp'>> = [
      {
        fileName: 'vacation-photo.jpg',
        fileSize: 2048576,
        type: 'received',
        deviceName: 'iPhone 15 Pro',
        status: 'completed',
      },
      {
        fileName: 'presentation.pdf',
        fileSize: 5242880,
        type: 'sent',
        deviceName: 'MacBook Pro',
        status: 'completed',
      },
      {
        fileName: 'music.mp3',
        fileSize: 8388608,
        type: 'received',
        deviceName: 'Gaming PC',
        status: 'completed',
      },
    ];

    demoItems.forEach((item) => addTransfer(item));
    success('Demo History Added', '3 sample transfers added');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-dark-bg dark:via-dark-card dark:to-dark-surface transition-colors duration-500">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  New Features Demo
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enhanced file transfer experience
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced File Transfer */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold text-text-light dark:text-text-dark">
                  Enhanced File Transfer
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  With speed indicators and file type icons
                </p>
              </CardHeader>
              <CardBody className="space-y-6">
                <DropZone onFilesSelected={handleFilesSelected} />

                {demoFiles.length > 0 && (
                  <>
                    <FileList files={demoFiles} onRemove={handleRemoveFile} />
                    <Button
                      onClick={handleDemoTransfer}
                      disabled={demoFiles.every((f) => f.status !== 'pending')}
                      className="w-full"
                    >
                      Demo Transfer {demoFiles.filter((f) => f.status === 'pending').length} file(s)
                    </Button>
                  </>
                )}

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-text-light dark:text-text-dark mb-2">
                    ✨ New Features:
                  </h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• 📁 File type icons (50+ types)</li>
                    <li>• ⚡ Transfer speed indicator (KB/s, MB/s)</li>
                    <li>• ⏱️ Estimated time remaining</li>
                    <li>• 🎨 Color-coded file types</li>
                    <li>• ✅ Enhanced progress bars</li>
                  </ul>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* QR Code Sharing */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold text-text-light dark:text-text-dark">
                  QR Code Sharing
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Easy mobile device connection
                </p>
              </CardHeader>
              <CardBody>
                <QRCodeShare roomId="DEMO1234" />
                
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-text-light dark:text-text-dark mb-2">
                    ✨ Features:
                  </h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• 📱 Instant mobile connection</li>
                    <li>• 📋 One-click URL copy</li>
                    <li>• 💾 Download QR code as image</li>
                    <li>• 🔗 Shareable link generation</li>
                  </ul>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Transfer History */}
          <div className="lg:col-span-2">
            <TransferHistory history={history} onClear={clearHistory} />
            
            {history.length === 0 && (
              <div className="mt-4 text-center">
                <Button onClick={addDemoHistory} variant="outline">
                  Add Demo History
                </Button>
              </div>
            )}

            <Card className="mt-4">
              <CardBody>
                <h3 className="text-sm font-semibold text-text-light dark:text-text-dark mb-2">
                  ✨ History Features:
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• 📜 Persistent history (localStorage)</li>
                  <li>• ⬆️⬇️ Sent/Received indicators</li>
                  <li>• ⏰ Relative timestamps ("2h ago")</li>
                  <li>• ✅ Status badges (completed/failed)</li>
                  <li>• 🗑️ Clear history option</li>
                  <li>• 📊 File size and device info</li>
                </ul>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Summary Card */}
        <Card className="mt-8" glass>
          <CardBody>
            <h2 className="text-2xl font-bold text-text-light dark:text-text-dark mb-4">
              🎉 All New Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-lg text-primary mb-2">Enhanced Transfer</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>✓ File type icons</li>
                  <li>✓ Transfer speed</li>
                  <li>✓ Time remaining</li>
                  <li>✓ Color coding</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-accent mb-2">QR Code Sharing</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>✓ QR code generation</li>
                  <li>✓ URL copying</li>
                  <li>✓ Image download</li>
                  <li>✓ Mobile friendly</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-secondary mb-2">Transfer History</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>✓ Persistent storage</li>
                  <li>✓ Sent/Received tracking</li>
                  <li>✓ Timestamps</li>
                  <li>✓ Clear option</li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
