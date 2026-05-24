'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  User, 
  Trash2, 
  CheckCircle, 
  Activity,
  AlertTriangle,
  Play,
  Crosshair,
  Lock,
  Search,
  CloudLightning,
  Workflow
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';

// Mock attack stages for the SIEM timeline
const timelineStages = [
  {
    phase: 'Reconnaissance',
    title: 'DNS Harvesting & Subnet Mapping',
    desc: 'External IP address mapped subdomain structures, searching public MX registers.',
    status: 'completed',
    icon: Crosshair,
    time: 'T-Minus 4 Hours',
    color: 'text-blue-400 border-blue-500/30 bg-blue-500/10'
  },
  {
    phase: 'Scanning',
    title: 'Rapid Port Scanning (TCP Syn)',
    desc: 'Syn-scan packets swept core boundary ports, discovering open ports 22, 80, and 443.',
    status: 'completed',
    icon: Activity,
    time: 'T-Minus 2 Hours',
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10'
  },
  {
    phase: 'Intrusion',
    title: 'Brute Force Attempts & SQL Injection',
    desc: 'Brute-forcing SSH console portal while injecting database query payloads on product routes.',
    status: 'active',
    icon: CloudLightning,
    time: 'Active Phase',
    color: 'text-rose-500 border-rose-500/40 bg-rose-500/20'
  },
  {
    phase: 'Exfiltration',
    title: 'Database Dump download signature',
    desc: 'Suspicious outbound packets dump encrypted payload records via unknown HTTPS proxies.',
    status: 'blocked',
    icon: Lock,
    time: 'Intercepted / Shield Blocked',
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
  }
];

export default function AlertsCenter() {
  const { liveAlerts, resolveAlertInUI, deleteAlertInUI } = useSocket();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'open' | 'resolved'>('open');
  const [loading, setLoading] = useState(false);

  const filteredAlerts = liveAlerts.filter(alert => alert.status === activeTab);

  const handleResolveAlert = async (id: string) => {
    setLoading(true);
    await resolveAlertInUI(id, user?.username || 'admin');
    setLoading(false);
  };

  const handleDeleteAlert = async (id: string) => {
    if (confirm('Permanently purge this alert from the historic register?')) {
      setLoading(true);
      await deleteAlertInUI(id);
      setLoading(false);
    }
  };

  return (
    <>
        <Navbar title="SIEM Alerts Center" />
        <main className="p-6 space-y-6 flex-1 max-w-[1600px] w-full mx-auto">
          
          {/* Header Panel */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-border/20 pb-4">
            <div className="text-left">
              <p className="text-xs font-mono text-cyber-cyan tracking-widest uppercase leading-none">
                [ THREAT THRESHOLD MONITORS ACTIVE ]
              </p>
              <h2 className="text-2xl font-black text-slate-100 mt-1 uppercase tracking-wide">
                SIEM Incident Response Hub
              </h2>
            </div>
            
            {/* Tab switchers */}
            <div className="flex bg-slate-950 border border-cyber-border/60 p-1 rounded-md text-xs font-mono w-fit">
              <button
                onClick={() => setActiveTab('open')}
                className={`px-4 py-1.5 rounded transition-all cursor-pointer ${
                  activeTab === 'open' 
                    ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ACTIVE INTRUSIONS ({liveAlerts.filter(a => a.status === 'open').length})
              </button>
              <button
                onClick={() => setActiveTab('resolved')}
                className={`px-4 py-1.5 rounded transition-all cursor-pointer ${
                  activeTab === 'resolved' 
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                RESOLVED INCIDENTS ({liveAlerts.filter(a => a.status === 'resolved').length})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            
            {/* Alerts List (2 Cols on large screens) */}
            <div className="xl:col-span-2 space-y-4">
              
              <AnimatePresence mode="popLayout">
                {filteredAlerts.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-12 rounded-lg bg-slate-950/80 border border-cyber-border/60 text-center flex flex-col items-center justify-center gap-3"
                  >
                    <div className="w-12 h-12 rounded bg-slate-900 border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan shadow-[0_0_15px_rgba(0,245,255,0.05)]">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono">
                        Network Segment Secure
                      </h3>
                      <p className="text-xs text-slate-500 font-mono mt-1">
                        No {activeTab} threats currently recorded in the active security perimeter.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  filteredAlerts.map((alert) => {
                    const sevColor = 
                      alert.severity === 'critical' ? 'text-rose-500 bg-rose-500/10 border-rose-500/30' :
                      alert.severity === 'high' ? 'text-red-400 bg-red-400/10 border-red-500/20' :
                      alert.severity === 'medium' ? 'text-amber-400 bg-amber-400/10 border-amber-500/20' : 
                      'text-blue-400 bg-blue-500/10 border-blue-500/20';

                    return (
                      <motion.div
                        key={alert._id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.2 }}
                        className={`p-5 rounded-lg bg-slate-950/80 border text-left shadow-[0_4px_25px_rgba(0,0,0,0.3)] relative overflow-hidden flex flex-col md:flex-row justify-between gap-4 md:items-center ${
                          alert.status === 'open' ? 'border-cyber-border/80' : 'border-emerald-500/30'
                        }`}
                      >
                        {/* Glow indicator side bar */}
                        <div className={`absolute top-0 left-0 w-1 h-full ${
                          alert.severity === 'critical' ? 'bg-rose-500' :
                          alert.severity === 'high' ? 'bg-red-400' :
                          alert.severity === 'medium' ? 'bg-amber-400' : 'bg-blue-400'
                        }`}></div>

                        {/* Title, description, meta */}
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                            <span className={`px-2 py-0.5 rounded border uppercase text-[9px] font-bold ${sevColor}`}>
                              {alert.severity}
                            </span>
                            <span className="text-slate-400">Target IP:</span>
                            <span className="text-cyber-cyan font-bold select-all">{alert.sourceIP || 'Unknown'}</span>
                            <span className="text-slate-600">•</span>
                            <div className="flex items-center gap-1 text-slate-500">
                              <Clock size={12} />
                              <span>{new Date(alert.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                          
                          <h4 className="text-base font-bold text-slate-100 uppercase tracking-wide">{alert.title}</h4>
                          <p className="text-xs text-slate-400 font-mono leading-relaxed">{alert.description}</p>
                          
                          {alert.status === 'resolved' && (
                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/20 w-fit">
                              <CheckCircle size={10} />
                              <span>RESOLVED BY: <span className="font-extrabold">{alert.assignedTo}</span></span>
                              {alert.resolvedAt && <span>at {new Date(alert.resolvedAt).toLocaleTimeString()}</span>}
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                          {alert.status === 'open' ? (
                            <button
                              onClick={() => handleResolveAlert(alert._id)}
                              disabled={loading}
                              className="px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40"
                            >
                              RESOLVE THREAT
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDeleteAlert(alert._id)}
                              disabled={loading}
                              className="p-2 rounded bg-slate-900 border border-cyber-border/80 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>

                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>

            </div>

            {/* Vertical Kill Chain Attack Timeline */}
            <div className="p-5 rounded-lg bg-slate-950/80 border border-cyber-border/60 shadow-lg text-left">
              <div className="mb-6 flex items-center gap-2">
                <Workflow size={16} className="text-cyber-cyan" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono">
                  SIEM Kill-Chain Analysis
                </h3>
              </div>

              {/* Timeline Tree */}
              <div className="relative border-l border-cyber-border/60 ml-3 pl-5 space-y-6">
                
                {timelineStages.map((stage, idx) => {
                  const StageIcon = stage.icon;
                  const dotColor = 
                    stage.status === 'completed' ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                    stage.status === 'active' ? 'bg-rose-500 border-rose-500 animate-ping shadow-[0_0_8px_rgba(244,63,94,0.5)]' :
                    'bg-slate-800 border-slate-700';

                  return (
                    <div key={idx} className="relative">
                      {/* Tree dot */}
                      <span className={`absolute -left-[26px] top-1.5 w-3 h-3 rounded-full border ${dotColor}`}></span>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[9px] font-mono leading-none">
                          <span className="font-extrabold text-cyber-cyan uppercase tracking-widest">{stage.phase}</span>
                          <span className="text-slate-500 uppercase">{stage.time}</span>
                        </div>
                        
                        <div className={`p-3 rounded border text-xs font-sans mt-1 text-left ${stage.color}`}>
                          <div className="flex items-center gap-1.5 font-bold text-slate-200">
                            <StageIcon size={12} className="shrink-0" />
                            <span>{stage.title}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono leading-relaxed mt-1">{stage.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}

              </div>

            </div>

          </div>

        </main>
    </>
  );
}
