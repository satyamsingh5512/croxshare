'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Download, Upload, X, Clock } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getFileIcon, formatFileSize } from '@/lib/fileUtils';

export interface TransferHistoryItem {
  id: string;
  fileName: string;
  fileSize: number;
  type: 'sent' | 'received';
  deviceName: string;
  timestamp: number;
  status: 'completed' | 'failed';
}

interface TransferHistoryProps {
  history: TransferHistoryItem[];
  onClear?: () => void;
}

export function TransferHistory({ history, onClear }: TransferHistoryProps) {
  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const formatFullDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (history.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
          >
            <History className="w-8 h-8 text-gray-400" />
          </motion.div>
          <h3 className="text-lg font-semibold text-text-light dark:text-text-dark mb-2">
            No Transfer History
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your file transfers will appear here
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-xl font-bold text-text-light dark:text-text-dark">
                Transfer History
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {history.length} transfer{history.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          {onClear && history.length > 0 && (
            <Button
              onClick={onClear}
              variant="ghost"
              size="sm"
            >
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {history.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-4 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Type indicator */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    item.type === 'sent'
                      ? 'bg-blue-100 dark:bg-blue-900/30'
                      : 'bg-green-100 dark:bg-green-900/30'
                  }`}>
                    {item.type === 'sent' ? (
                      <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Download className="w-5 h-5 text-green-600 dark:text-green-400" />
                    )}
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {getFileIcon(item.fileName, 16)}
                        <h4 className="text-sm font-medium text-text-light dark:text-text-dark truncate">
                          {item.fileName}
                        </h4>
                      </div>
                      <Badge
                        variant={item.status === 'completed' ? 'success' : 'danger'}
                        size="sm"
                      >
                        {item.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-600 dark:text-gray-400 flex-wrap">
                      <span>{formatFileSize(item.fileSize)}</span>
                      <span>•</span>
                      <span>
                        {item.type === 'sent' ? 'To' : 'From'}: <span className="font-medium">{item.deviceName}</span>
                      </span>
                      <span>•</span>
                      <div className="flex items-center gap-1" title={formatFullDate(item.timestamp)}>
                        <Clock className="w-3 h-3" />
                        <span>{formatTimestamp(item.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardBody>
    </Card>
  );
}

// Hook to manage transfer history with localStorage persistence
export function useTransferHistory() {
  const [history, setHistory] = React.useState<TransferHistoryItem[]>([]);

  // Load from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('nebay-transfer-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to load history:', err);
      }
    }
  }, []);

  // Save to localStorage whenever history changes
  React.useEffect(() => {
    localStorage.setItem('nebay-transfer-history', JSON.stringify(history));
  }, [history]);

  const addTransfer = React.useCallback((item: Omit<TransferHistoryItem, 'id' | 'timestamp'>) => {
    const newItem: TransferHistoryItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    setHistory((prev) => [newItem, ...prev].slice(0, 50)); // Keep last 50
  }, []);

  const clearHistory = React.useCallback(() => {
    setHistory([]);
    localStorage.removeItem('nebay-transfer-history');
  }, []);

  return { history, addTransfer, clearHistory };
}
