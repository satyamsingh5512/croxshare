'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatFileSize, formatTransferSpeed } from '@/lib/fileUtils';
import { TransferHistoryItem } from './TransferHistory';

interface TransferStatsProps {
  history: TransferHistoryItem[];
}

export function TransferStats({ history }: TransferStatsProps) {
  const stats = useMemo(() => {
    const sent = history.filter(h => h.type === 'sent');
    const received = history.filter(h => h.type === 'received');
    const completed = history.filter(h => h.status === 'completed');
    const failed = history.filter(h => h.status === 'failed');

    const totalSize = history.reduce((sum, h) => sum + h.fileSize, 0);
    const sentSize = sent.reduce((sum, h) => sum + h.fileSize, 0);
    const receivedSize = received.reduce((sum, h) => sum + h.fileSize, 0);

    // Calculate average speed (estimate based on file size and realistic speeds)
    const avgSpeed = history.length > 0 ? totalSize / (history.length * 10) : 0; // Rough estimate

    // Success rate
    const successRate = history.length > 0 
      ? (completed.length / history.length) * 100 
      : 0;

    // Calculate time period
    const timestamps = history.map(h => h.timestamp);
    const oldestTransfer = timestamps.length > 0 ? Math.min(...timestamps) : Date.now();
    const newestTransfer = timestamps.length > 0 ? Math.max(...timestamps) : Date.now();
    const periodDays = Math.max(1, (newestTransfer - oldestTransfer) / (1000 * 60 * 60 * 24));

    return {
      total: history.length,
      sent: sent.length,
      received: received.length,
      completed: completed.length,
      failed: failed.length,
      totalSize,
      sentSize,
      receivedSize,
      avgSpeed,
      successRate,
      periodDays: Math.ceil(periodDays),
    };
  }, [history]);

  const statCards = [
    {
      icon: Activity,
      label: 'Total Transfers',
      value: stats.total,
      subtext: `Last ${stats.periodDays} day${stats.periodDays > 1 ? 's' : ''}`,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: TrendingUp,
      label: 'Files Sent',
      value: stats.sent,
      subtext: formatFileSize(stats.sentSize),
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: TrendingDown,
      label: 'Files Received',
      value: stats.received,
      subtext: formatFileSize(stats.receivedSize),
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: Zap,
      label: 'Avg Speed',
      value: formatTransferSpeed(stats.avgSpeed),
      subtext: 'Estimated',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      icon: CheckCircle,
      label: 'Success Rate',
      value: `${stats.successRate.toFixed(1)}%`,
      subtext: `${stats.completed} completed`,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: XCircle,
      label: 'Failed',
      value: stats.failed,
      subtext: stats.failed > 0 ? 'Need attention' : 'All good!',
      color: stats.failed > 0 ? 'text-red-500' : 'text-gray-400',
      bgColor: stats.failed > 0 ? 'bg-red-500/10' : 'bg-gray-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardBody className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {stat.subtext}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Total Data Transferred */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Data Transfer Overview</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Data</span>
              <span className="text-lg font-semibold">{formatFileSize(stats.totalSize)}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div className="flex h-full">
                <div
                  className="bg-purple-500 transition-all duration-500"
                  style={{ width: `${stats.total > 0 ? (stats.sentSize / stats.totalSize) * 100 : 0}%` }}
                  title={`Sent: ${formatFileSize(stats.sentSize)}`}
                />
                <div
                  className="bg-green-500 transition-all duration-500"
                  style={{ width: `${stats.total > 0 ? (stats.receivedSize / stats.totalSize) * 100 : 0}%` }}
                  title={`Received: ${formatFileSize(stats.receivedSize)}`}
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  Sent: {formatFileSize(stats.sentSize)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  Received: {formatFileSize(stats.receivedSize)}
                </span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Largest Transfer
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {history.length > 0 
                  ? formatFileSize(Math.max(...history.map(h => h.fileSize)))
                  : '0 B'
                }
              </p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Avg File Size
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {history.length > 0 
                  ? formatFileSize(stats.totalSize / history.length)
                  : '0 B'
                }
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
