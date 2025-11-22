'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Moon, Sun, Shield, Clock, User, Info } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [deviceName, setDeviceName] = useState('My Device');
  const [discoveryTimeout, setDiscoveryTimeout] = useState('60');
  const [autoAccept, setAutoAccept] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-dark-bg dark:via-dark-card dark:to-dark-surface transition-colors duration-500">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/nebay">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">
                Settings
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Customize your Nebay Share experience
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="space-y-6">
          {/* Appearance Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-primary" />
                ) : (
                  <Sun className="w-5 h-5 text-primary" />
                )}
                <h2 className="text-lg font-bold text-text-light dark:text-text-dark">
                  Appearance
                </h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-text-light dark:text-text-dark">
                    Theme
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Switch between light and dark mode
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleTheme}
                  className={`relative w-16 h-8 rounded-full transition-colors ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-primary to-accent'
                      : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <motion.div
                    animate={{ x: theme === 'dark' ? 32 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center"
                  >
                    {theme === 'dark' ? (
                      <Moon className="w-4 h-4 text-primary" />
                    ) : (
                      <Sun className="w-4 h-4 text-yellow-500" />
                    )}
                  </motion.div>
                </motion.button>
              </div>
            </CardBody>
          </Card>

          {/* Device Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-text-light dark:text-text-dark">
                  Device
                </h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                  Device Name
                </label>
                <Input
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="Enter device name"
                />
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  This name will be visible to other devices
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-text-light dark:text-text-dark">
                  Privacy & Security
                </h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-text-light dark:text-text-dark">
                    Auto-accept files
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically accept files from verified devices
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAutoAccept(!autoAccept)}
                  className={`relative w-16 h-8 rounded-full transition-colors ${
                    autoAccept
                      ? 'bg-gradient-to-r from-primary to-accent'
                      : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <motion.div
                    animate={{ x: autoAccept ? 32 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg"
                  />
                </motion.button>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />

              <div>
                <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                  Discovery Timeout
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={discoveryTimeout}
                    onChange={(e) => setDiscoveryTimeout(e.target.value)}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">seconds</span>
                </div>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  How long to wait for device responses
                </p>
              </div>
            </CardBody>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-text-light dark:text-text-dark">
                  About
                </h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Version</span>
                <span className="text-sm font-medium text-text-light dark:text-text-dark">1.0.0</span>
              </div>
              
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />

              <Link href="/privacy">
                <Button variant="ghost" className="w-full justify-start">
                  Privacy Policy
                </Button>
              </Link>

              <Link href="/terms">
                <Button variant="ghost" className="w-full justify-start">
                  Terms & Conditions
                </Button>
              </Link>

              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />

              <div className="text-center pt-2">
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Made with ❤️ for secure file sharing
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Save Button */}
          <div className="flex gap-3">
            <Link href="/nebay" className="flex-1">
              <Button variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button className="flex-1">
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
