'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Upload, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Progress, CircularProgress } from '@/components/ui/Progress';
import { Modal } from '@/components/ui/Modal';
import { Badge, SignalBadge, StatusBadge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { DeviceCardSkeleton, FileCardSkeleton, TextSkeleton } from '@/components/ui/Skeleton';

export default function ComponentsPage() {
  const [showModal, setShowModal] = useState(false);
  const [progress, setProgress] = useState(45);
  const [loading, setLoading] = useState(false);
  const { success, error, warning, info } = useToast();

  const handleShowToasts = () => {
    success('Files sent successfully!', 'All 3 files transferred to MacBook Pro');
    setTimeout(() => info('New device discovered', 'iPhone 15 Pro is nearby'), 1000);
    setTimeout(() => warning('Connection unstable', 'Signal strength is weak'), 2000);
  };

  const handleLoadingDemo = () => {
    setLoading(true);
    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setLoading(false);
        success('Upload complete!');
        setProgress(45);
      }
    }, 300);
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
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Component Showcase
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Premium UI Components Library
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Buttons */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Buttons</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <Button>Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="danger">Danger Button</Button>
              <Button loading>Loading Button</Button>
              <Button size="sm">Small Button</Button>
              <Button size="lg">Large Button</Button>
            </CardBody>
          </Card>

          {/* Badges */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Badges</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="gradient">Gradient</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <SignalBadge strength="weak" />
                <SignalBadge strength="medium" />
                <SignalBadge strength="strong" />
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status="online" />
                <StatusBadge status="offline" />
                <StatusBadge status="connecting" />
                <StatusBadge status="idle" />
              </div>
            </CardBody>
          </Card>

          {/* Progress */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Progress Indicators</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Linear Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
              <div className="space-y-2">
                <p className="text-sm">Gradient Progress</p>
                <Progress value={progress} variant="gradient" />
              </div>
              <div className="flex gap-6 justify-center">
                <div className="text-center">
                  <CircularProgress value={progress} size={80} />
                  <p className="text-sm mt-2">Default</p>
                </div>
                <div className="text-center">
                  <CircularProgress value={progress} size={80} variant="gradient" />
                  <p className="text-sm mt-2">Gradient</p>
                </div>
              </div>
              <Button onClick={handleLoadingDemo} loading={loading}>
                Start Upload Demo
              </Button>
            </CardBody>
          </Card>

          {/* Cards */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Card Variants</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <Card>
                <CardBody>Default Card</CardBody>
              </Card>
              <Card glass>
                <CardBody>Glass Card</CardBody>
              </Card>
              <Card glow>
                <CardBody>Glow Card</CardBody>
              </Card>
              <Card hover>
                <CardBody>Hover Card</CardBody>
              </Card>
            </CardBody>
          </Card>

          {/* Input */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Input Fields</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input placeholder="Default input" />
              <Input placeholder="With icon" icon={<Upload className="w-4 h-4" />} />
              <Input placeholder="Disabled input" disabled />
            </CardBody>
          </Card>

          {/* Toast Notifications */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Toast Notifications</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <Button onClick={handleShowToasts}>
                Show Toast Sequence
              </Button>
              <Button onClick={() => success('Success!', 'Operation completed')}>
                Success Toast
              </Button>
              <Button onClick={() => error('Error!', 'Something went wrong')} variant="danger">
                Error Toast
              </Button>
              <Button onClick={() => warning('Warning!', 'Please be careful')} variant="outline">
                Warning Toast
              </Button>
              <Button onClick={() => info('Info', 'Here is some information')} variant="secondary">
                Info Toast
              </Button>
            </CardBody>
          </Card>

          {/* Modal */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Modals</h2>
            </CardHeader>
            <CardBody>
              <Button onClick={() => setShowModal(true)}>
                Open Modal
              </Button>
            </CardBody>
          </Card>

          {/* Skeleton Loaders */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Loading Skeletons</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <DeviceCardSkeleton />
              <FileCardSkeleton />
              <TextSkeleton lines={4} />
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Demo Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Premium Modal"
        glass
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            This is a premium glass-morphism modal with smooth animations powered by Framer Motion.
          </p>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <Zap className="w-6 h-6 text-primary" />
            <div>
              <h4 className="font-semibold text-text-light dark:text-text-dark">
                Premium Features
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Glassmorphism, animations, and beautiful gradients
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={() => {
              setShowModal(false);
              success('Modal action confirmed!');
            }} className="flex-1">
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
