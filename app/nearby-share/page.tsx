import React, { useState } from 'react';
import HostPanel from '../../components/nearby/HostPanel';
import JoinPanel from '../../components/nearby/JoinPanel';
import DeviceNameModal from '../../components/nearby/DeviceNameModal';

export default function NearbySharePage() {
  const [mode, setMode] = useState<'home' | 'host' | 'join'>('home');

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="text-4xl font-semibold text-[#111827]">Share files instantly over WiFi</h1>
          <p className="mt-2 text-[#4B5563]">Connect two devices on the same network and transfer files directly — no server storage.</p>
        </header>

        {mode === 'home' && (
          <div className="flex flex-col gap-4 sm:flex-row">
            <button onClick={() => setMode('host')} className="flex-1 rounded-3xl bg-[#4F46E5] px-6 py-6 text-white font-semibold hover:bg-[#4338CA] shadow-lg">I'm Sending</button>
            <button onClick={() => setMode('join')} className="flex-1 rounded-3xl bg-white px-6 py-6 text-[#111827] font-semibold border border-[#E5E7EB]">I'm Receiving</button>
          </div>
        )}

        {mode === 'host' && (
          <div className="mt-6">
            <HostPanel />
            <div className="mt-6">
              <DeviceNameModal />
            </div>
          </div>
        )}

        {mode === 'join' && (
          <div className="mt-6">
            <JoinPanel />
          </div>
        )}
      </div>
    </div>
  );
}
