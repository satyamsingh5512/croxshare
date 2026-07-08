'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Zap, Wifi, ShieldCheck } from 'lucide-react';
import { generateRoomCode, normalizeRoomCode } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [creating, setCreating] = useState(false);

  const createRoom = () => {
    setCreating(true);
    const id = generateRoomCode();
    setTimeout(() => router.push(`/room/${id}`), 180);
  };

  const features = [
    { icon: Zap, title: 'Direct DataChannel', body: 'Files stream peer-to-peer — never through a relay server.' },
    { icon: Wifi, title: 'LAN-first speed', body: 'On the same network, transfers run at local link speed.' },
    { icon: ShieldCheck, title: 'Nothing stored', body: 'No cloud, no login, no size cap. Bytes leave no trace.' },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="mesh-bg pointer-events-none absolute inset-0 h-[520px]" />

      <div className="relative mx-auto max-w-md px-6 py-16">
        <div className="reveal flex items-center gap-2" style={{ animationDelay: '0ms' }}>
          <span className="relative flex h-2 w-2 text-[var(--ok)]">
            <span className="dot-pulse absolute inline-flex h-full w-full rounded-full" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--ok)]" />
          </span>
          <span className="text-xs font-medium text-[var(--on-surface-variant)]">Peer-to-peer · no cloud</span>
        </div>

        <h1
          className="reveal mt-5 text-[2.6rem] font-bold leading-[1.05] tracking-tight text-[var(--on-surface)]"
          style={{ animationDelay: '60ms' }}
        >
          Send files<br />
          <span className="text-gradient">wire to wire.</span>
        </h1>

        <p className="reveal mt-4 text-[15px] leading-relaxed text-[var(--on-surface-variant)]" style={{ animationDelay: '120ms' }}>
          Open a room, share the code, and drop files straight
          onto the other device. WebRTC does the rest.
        </p>

        <div className="reveal mt-8 space-y-3" style={{ animationDelay: '180ms' }}>
          <button onClick={createRoom} disabled={creating} className="btn group w-full">
            <span>{creating ? 'Opening room…' : 'Create a room'}</span>
            <ArrowRight
              size={16}
              className={creating ? 'animate-pulse' : 'transition-transform duration-200 group-hover:translate-x-0.5'}
            />
          </button>

          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(normalizeRoomCode(e.target.value))}
              onKeyDown={(e) => e.key === 'Enter' && code.length === 6 && router.push(`/room/${code}`)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              aria-label="Room code"
              className="input mono flex-1 text-center text-base tracking-[0.3em] uppercase"
            />
            <button
              onClick={() => code.length === 6 && router.push(`/room/${code}`)}
              disabled={code.length !== 6}
              className="btn-tonal px-6"
            >
              Join
            </button>
          </div>
        </div>

        <div className="reveal mt-12 space-y-3" style={{ animationDelay: '260ms' }}>
          {features.map(({ icon: Icon, title, body }) => (
            <div key={title} className="card flex items-start gap-3.5 p-4 transition-shadow duration-200 hover:shadow-[var(--elev-2)]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-container)] text-[var(--primary)]">
                <Icon size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--on-surface)]">{title}</p>
                <p className="mt-0.5 text-[13px] leading-snug text-[var(--on-surface-variant)]">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
