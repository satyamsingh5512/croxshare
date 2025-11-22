'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, Wifi, CloudOff, ArrowRight, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '../theme-provider';
import { Button } from '../ui/Button';
import { Card, CardBody } from '../ui/Card';

const rotatingTexts = ['Fast.', 'Secure.', 'Offline.', 'Instant.'];

export default function LandingPage() {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % rotatingTexts.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Ultra-Fast Transfer',
      description: 'Transfer files at lightning speed over your local network',
      gradient: 'from-yellow-400 to-orange-500',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Peer-to-Peer Security',
      description: 'End-to-end encrypted transfers with verification codes',
      gradient: 'from-green-400 to-cyan-500',
    },
    {
      icon: <Wifi className="w-8 h-8" />,
      title: 'Works on Same WiFi',
      description: 'Connect instantly when devices are on the same network',
      gradient: 'from-blue-400 to-purple-500',
    },
    {
      icon: <CloudOff className="w-8 h-8" />,
      title: 'No Cloud Required',
      description: 'Direct device-to-device transfer, no intermediary servers',
      gradient: 'from-pink-400 to-red-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-dark-bg dark:via-dark-card dark:to-dark-surface transition-colors duration-500">
      {/* Theme Toggle */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 rounded-2xl bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 hover:scale-110 transition-transform shadow-lg"
      >
        {theme === 'dark' ? (
          <Sun className="w-6 h-6 text-yellow-500" />
        ) : (
          <Moon className="w-6 h-6 text-indigo-600" />
        )}
      </motion.button>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 dark:from-primary/20 dark:via-accent/20 dark:to-secondary/20" />
        
        {/* Floating orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-20 left-20 w-96 h-96 bg-primary/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-accent/30 rounded-full blur-3xl"
        />

        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.8 }}
              className="inline-flex items-center gap-3 mb-8"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-glow">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Nebay Share
              </h1>
            </motion.div>

            {/* Animated headline */}
            <div className="mb-8">
              <h2 className="text-5xl md:text-7xl font-bold text-text-light dark:text-text-dark mb-4">
                Share files instantly.
              </h2>
              <div className="h-20 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.h3
                    key={currentTextIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent"
                  >
                    {rotatingTexts[currentTextIndex]}
                  </motion.h3>
                </AnimatePresence>
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto"
            >
              Transfer files directly between devices on the same network. No cloud, no limits, just pure speed.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/nebay-pro">
                <Button size="lg" className="group w-full sm:w-auto">
                  Start P2P Transfer
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/features">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  ✨ New Features
                </Button>
              </Link>
              <Link href="/components">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Components
                </Button>
              </Link>
            </motion.div>

            {/* Device connection visualization */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-20 relative"
            >
              <div className="flex items-center justify-center gap-12">
                {/* Device 1 */}
                <motion.div
                  animate={{
                    boxShadow: ['0 0 20px rgba(79,70,229,0.5)', '0 0 40px rgba(79,70,229,0.8)', '0 0 20px rgba(79,70,229,0.5)'],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
                >
                  <div className="w-16 h-16 rounded-full bg-white dark:bg-dark-card flex items-center justify-center">
                    📱
                  </div>
                </motion.div>

                {/* Connection beam */}
                <motion.div
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.95, 1.05, 0.95],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex-1 h-1 bg-gradient-to-r from-primary via-accent to-primary max-w-xs"
                />

                {/* Device 2 */}
                <motion.div
                  animate={{
                    boxShadow: ['0 0 20px rgba(14,165,233,0.5)', '0 0 40px rgba(14,165,233,0.8)', '0 0 20px rgba(14,165,233,0.5)'],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center"
                >
                  <div className="w-16 h-16 rounded-full bg-white dark:bg-dark-card flex items-center justify-center">
                    💻
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-text-light dark:text-text-dark">
            Why Choose Nebay Share?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card glass hover className="h-full">
                  <CardBody className="flex flex-col items-center text-center space-y-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${feature.gradient}`}>
                      <div className="text-white">{feature.icon}</div>
                    </div>
                    <h3 className="text-xl font-bold text-text-light dark:text-text-dark">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <p>© 2025 Nebay Share. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-primary transition-colors">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
