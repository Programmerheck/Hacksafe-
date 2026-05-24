'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Wifi, 
  WifiOff, 
  Clock, 
  ShieldAlert,
  User,
  CheckCircle
} from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';

interface NavbarProps {
  title: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title }) => {
  const { isConnected, liveAlerts, resolveAlertInUI } = useSocket();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Local clock sync
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }) + ' UTC');
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const openAlerts = liveAlerts.filter(a => a.status === 'open');

  const handleResolveAlert = async (id: string) => {
    await resolveAlertInUI(id, user?.username || 'admin');
  };

  return (
    <header className="h-16 border-b border-cyber-border/40 bg-slate-950/60 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30 select-none">
      
      {/* Title */}
      <div className="flex items-center gap-4">
        <h1 className="font-extrabold text-lg uppercase tracking-wider text-slate-100 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-cyber-cyan rounded-full inline-block"></span>
          {title}
        </h1>
      </div>

      {/* Center Console telemetry */}
      <div className="hidden md:flex items-center gap-6 text-xs text-slate-400 font-mono">
        {/* Clock */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-900 border border-cyber-border/40 text-slate-300">
          <Clock size={12} className="text-cyber-cyan" />
          <span>{currentTime || '00:00:00 UTC'}</span>
        </div>

        {/* Network status beacon */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded border transition-colors duration-300 ${
          isConnected 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
        }`}>
          {isConnected ? (
            <>
              <Wifi size={12} className="text-emerald-400" />
              <span>BEACON ONLINE</span>
            </>
          ) : (
            <>
              <WifiOff size={12} className="text-rose-400" />
              <span>LINK BROKEN</span>
            </>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded bg-slate-900/60 border border-cyber-border/50 text-slate-300 hover:text-cyber-cyan hover:border-cyber-cyan transition-all relative"
          >
            <Bell size={16} />
            {openAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white animate-bounce shadow-[0_0_10px_rgba(239,68,68,0.7)]">
                {openAlerts.length}
              </span>
            )}
          </button>

          {/* Notification Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-slate-950 border border-cyber-border rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-3 border-b border-cyber-border/80 bg-slate-950/80 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-rose-500" />
                  Active Intrusions ({openAlerts.length})
                </span>
                {openAlerts.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 uppercase tracking-widest font-bold">
                    CRITICAL
                  </span>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-cyber-border/40">
                {openAlerts.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                    <CheckCircle size={24} className="text-emerald-500/70" />
                    <span>No active threats registered. Network secure.</span>
                  </div>
                ) : (
                  openAlerts.slice(0, 5).map((alert) => (
                    <div key={alert._id} className="p-3 hover:bg-slate-900/40 transition-colors flex flex-col gap-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          alert.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'
                        }`}>
                          {alert.severity} • {alert.sourceIP}
                        </span>
                        <button
                          onClick={() => handleResolveAlert(alert._id)}
                          className="text-[10px] text-emerald-400 hover:underline hover:text-emerald-300 font-semibold"
                        >
                          Resolve
                        </button>
                      </div>
                      <p className="text-xs font-semibold text-slate-200 truncate">{alert.title}</p>
                      <p className="text-[10px] text-slate-400 truncate">{alert.description}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-cyber-border/80 bg-slate-950/40 text-center">
                <a href="/alerts" className="text-[10px] font-bold uppercase tracking-widest text-cyber-cyan hover:underline">
                  Open SIEM Alerts Hub
                </a>
              </div>
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-cyber-border/40">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-slate-900 to-slate-800 border border-cyber-border flex items-center justify-center text-slate-300 shadow-[0_0_10px_rgba(21,30,61,0.5)]">
            <User size={14} />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">{user?.username || 'Operator'}</span>
            <span className="text-[9px] text-cyber-cyan font-mono uppercase leading-none tracking-widest">{user?.role || 'Analyst'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
