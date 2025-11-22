'use client';

import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';
import { Download, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

interface QRCodeShareProps {
  roomId: string;
  url?: string;
}

export function QRCodeShare({ roomId, url }: QRCodeShareProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = React.useState(false);
  const { success } = useToast();

  const shareUrl = url || `${window.location.origin}/nebay-pro?join=${roomId}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        shareUrl,
        {
          width: 200,
          margin: 2,
          color: {
            dark: '#4F46E5',
            light: '#FFFFFF',
          },
        },
        (error) => {
          if (error) console.error('QR Code generation error:', error);
        }
      );
    }
  }, [shareUrl]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      success('Copied!', 'Share URL copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownloadQR = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `nebay-share-${roomId}.png`;
      a.click();
      success('Downloaded!', 'QR code saved to your device');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      <Card glass>
        <CardBody className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-bold text-text-light dark:text-text-dark mb-2">
              Share Room
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Scan QR code or share the URL
            </p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-2xl shadow-lg">
              <canvas ref={canvasRef} />
            </div>
          </div>

          {/* Room ID */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Room ID:</p>
            <p className="text-2xl font-mono font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {roomId}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleCopyUrl}
              variant="outline"
              className="flex-1"
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? 'Copied!' : 'Copy URL'}
            </Button>
            <Button
              onClick={handleDownloadQR}
              variant="outline"
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Save QR
            </Button>
          </div>

          {/* URL */}
          <div className="p-3 bg-gray-100 dark:bg-dark-surface rounded-xl">
            <p className="text-xs text-gray-600 dark:text-gray-400 break-all">
              {shareUrl}
            </p>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
