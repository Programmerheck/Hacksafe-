'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login after a quick authentic simulation loader
    const timer = setTimeout(() => {
      const storedToken = localStorage.getItem('hs_token');
      if (storedToken) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="h-screen w-screen bg-[#05070f] flex flex-col items-center justify-center relative overflow-hidden select-none cyber-grid">
      {/* Background radial glow */}
      <div className="absolute w-[500px] h-[500px] bg-cyber-cyan/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="flex flex-col items-center gap-6 z-10 text-center animate-pulse">
        {/* Core Shield Emblem */}
        <div className="w-16 h-16 rounded-lg bg-slate-900 border border-cyber-cyan/50 flex items-center justify-center shadow-[0_0_20px_rgba(0,245,255,0.2)]">
          <Shield size={32} className="text-cyber-cyan" />
        </div>

        {/* Brand Text */}
        <div className="space-y-2">
          <h1 className="font-extrabold text-2xl tracking-widest text-slate-100 uppercase font-mono">
            Hacker<span className="text-cyber-cyan">Safe</span>
          </h1>
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest leading-none">
            [ INITIALIZING SIEM SECURE DEPLOYMENT ... ]
          </p>
        </div>

        {/* Monospace Telemetry */}
        <div className="text-[10px] font-mono text-cyber-cyan/80 mt-4 leading-relaxed max-w-xs text-left bg-slate-950/80 p-3 rounded border border-cyber-border/40">
          <div>&gt; Loading network telemetry sockets...</div>
          <div>&gt; Establishing crypto pipelines...</div>
          <div>&gt; Synchronizing dashboard analytics...</div>
          <div className="animate-pulse text-emerald-400">&gt; Core: ONLINE. Verification successful.</div>
        </div>
      </div>
    </main>
  );
}
