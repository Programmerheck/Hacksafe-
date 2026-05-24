'use client';

import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Terminal as TermIcon, 
  Cpu, 
  AlertTriangle, 
  Play, 
  Mail, 
  ShieldAlert, 
  Database,
  Code,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';

const simulationTriggers = [
  {
    name: 'SSH Brute Force credential sweep',
    desc: 'Simulates 5 failed authentication access requests on root accounts within 4 seconds.',
    category: 'auth',
    severity: 'warning',
    host: 'hs-active-directory',
    msg: 'SSH Brute force attempt detected (5 failed attempts within 10s) on user: root',
    color: 'border-amber-500/20 hover:bg-amber-500/10 hover:border-amber-500/50 text-amber-400'
  },
  {
    name: 'SQL Injection database sweep',
    desc: 'Injects query commands seeking administrative records directly on public APIs.',
    category: 'firewall',
    severity: 'critical',
    host: 'hs-web-prod-01',
    msg: 'SQL Injection signature detected in URI parameter: id=1%20OR%201=1',
    color: 'border-rose-500/20 hover:bg-rose-500/10 hover:border-rose-500/50 text-rose-500'
  },
  {
    name: 'TCP Port scan sweep',
    desc: 'Rapidly probes common boundaries mapping available listener daemons.',
    category: 'firewall',
    severity: 'warning',
    host: 'hs-firewall-core',
    msg: 'Port scan signature detected (ports 21, 22, 23, 80, 443 targeted)',
    color: 'border-blue-500/20 hover:bg-blue-500/10 hover:border-blue-500/50 text-blue-400'
  },
  {
    name: 'mimikatz.exe Trojan infection payload',
    desc: 'Downloads binary file matching malicious memory extraction patterns.',
    category: 'malware',
    severity: 'critical',
    host: 'hs-db-prod',
    msg: 'Malware file Trojan.Generic.Downloader blocked by Endpoint Agent: mimikatz.exe',
    color: 'border-red-500/20 hover:bg-red-500/10 hover:border-red-500/50 text-red-500 shadow-rose-900/10 shadow-lg'
  }
];

export default function SettingsPortal() {
  const { triggerMockLog } = useSocket();
  const { user } = useAuth();
  
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState('critical');
  const [syslogActive, setSyslogActive] = useState(true);
  const [simulationStatus, setSimulationStatus] = useState<string | null>(null);

  const handleTriggerSimulation = async (sim: typeof simulationTriggers[0]) => {
    setSimulationStatus(`Deploying mock vector: ${sim.name}...`);
    
    // Simulate multiple network delays for immersive feeling
    await triggerMockLog(sim.severity, sim.category, sim.host, sim.msg);
    
    setTimeout(() => {
      setSimulationStatus(`[SYSTEM] Vector successfully ingested. Broadcast over WebSocket complete.`);
    }, 1000);

    setTimeout(() => {
      setSimulationStatus(null);
    }, 4000);
  };

  return (
    <>
        <Navbar title="SIEM Operations Panel" />
        <main className="p-6 space-y-6 flex-1 max-w-[1600px] w-full mx-auto text-left">
          
          {/* Header */}
          <div className="border-b border-cyber-border/20 pb-4">
            <p className="text-xs font-mono text-cyber-cyan tracking-widest uppercase leading-none">
              [ SIEM COMPILER CONFIGURATION PORTAL ]
            </p>
            <h2 className="text-2xl font-black text-slate-100 mt-1 uppercase tracking-wide">
              HackerSafe System Configuration
            </h2>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            
            {/* Left 2 Cols: Main Options and simulators */}
            <div className="xl:col-span-2 space-y-6">
              
              {/* Kali Linux threat sandbox simulation */}
              <div className="p-5 rounded-lg bg-slate-950/80 border border-cyber-border/60 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={16} className="text-cyber-cyan" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono">
                      KALI THREAT ATTACK SIMULATOR (SANDBOX)
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded uppercase">
                    Sandbox Ready
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Click on the attack payloads below to execute sandbox security violations. The simulated syslogs will be pushed directly to our MongoDB pipeline and streamed instantly via WebSockets to all connected clients.
                </p>

                {/* Simulator Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {simulationTriggers.map((sim, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleTriggerSimulation(sim)}
                      className={`p-4 rounded border bg-slate-900/40 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group ${sim.color}`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-200 transition-colors">
                            {sim.category} • {sim.severity}
                          </span>
                          <Play size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h4 className="text-xs font-bold uppercase text-slate-200">{sim.name}</h4>
                        <p className="text-[10px] text-slate-500 font-mono leading-relaxed mt-1 leading-snug">{sim.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Status Indicator */}
                <AnimatePresence>
                  {simulationStatus && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 rounded bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan text-[10px] font-mono leading-none flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-ping"></span>
                      <span>{simulationStatus}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

              {/* Advanced operations settings */}
              <div className="p-5 rounded-lg bg-slate-950/80 border border-cyber-border/60 shadow-lg space-y-5">
                <div className="flex items-center gap-2">
                  <SettingsIcon size={16} className="text-cyber-cyan" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono">
                    SIEM CORE SYSTEM PREFERENCES
                  </h3>
                </div>

                <div className="space-y-4 divide-y divide-cyber-border/40 text-xs font-mono">
                  
                  {/* Email Notifications Toggle */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4">
                    <div className="space-y-1">
                      <div className="text-slate-200 font-bold uppercase flex items-center gap-1.5">
                        <Mail size={12} className="text-slate-400" />
                        Email Alert Integration
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal max-w-sm font-sans">
                        Simulate automatic SMTP email notification dispatches to security teams immediately on threat trigger detections.
                      </p>
                    </div>
                    
                    <button
                      onClick={() => setEmailAlerts(!emailAlerts)}
                      className={`px-4 py-1.5 rounded border text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-all ${
                        emailAlerts 
                          ? 'bg-cyber-cyan/10 border-cyber-cyan/30 text-cyber-cyan' 
                          : 'bg-slate-900 border-cyber-border/40 text-slate-500'
                      }`}
                    >
                      {emailAlerts ? 'ACTIVE' : 'DEACTIVATED'}
                    </button>
                  </div>

                  {/* Threat Alert Threshold select */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-4">
                    <div className="space-y-1">
                      <div className="text-slate-200 font-bold uppercase flex items-center gap-1.5">
                        <ShieldAlert size={12} className="text-slate-400" />
                        SMTP Threat dispatch Threshold
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal max-w-sm font-sans">
                        Determine what severity level is needed to trigger the automated alert pipeline warnings.
                      </p>
                    </div>
                    
                    <select
                      value={alertThreshold}
                      onChange={(e) => setAlertThreshold(e.target.value)}
                      className="py-1.5 px-3 rounded bg-slate-900 border border-cyber-border/40 text-slate-300 text-xs focus:outline-none focus:border-cyber-cyan cursor-pointer"
                    >
                      <option value="critical">Critical Severity Only</option>
                      <option value="high">High + Critical</option>
                      <option value="warning">Warning + High + Critical</option>
                    </select>
                  </div>

                  {/* Syslog server configuration toggle */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-4">
                    <div className="space-y-1">
                      <div className="text-slate-200 font-bold uppercase flex items-center gap-1.5">
                        <Database size={12} className="text-slate-400" />
                        UDP 514 Syslog listener daemon
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal max-w-sm font-sans">
                        Opens core Node.js datagram sockets listening for network syslogs streaming from Kali Linux servers.
                      </p>
                    </div>
                    
                    <button
                      onClick={() => setSyslogActive(!syslogActive)}
                      className={`px-4 py-1.5 rounded border text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-all ${
                        syslogActive 
                          ? 'bg-cyber-cyan/10 border-cyber-cyan/30 text-cyber-cyan shadow-[0_0_10px_rgba(0,245,255,0.1)]' 
                          : 'bg-slate-900 border-cyber-border/40 text-slate-500'
                      }`}
                    >
                      {syslogActive ? 'LISTENING' : 'DISABLED'}
                    </button>
                  </div>

                </div>
              </div>

            </div>

            {/* Right Col: SySLog integration manuals */}
            <div className="space-y-6">
              
              {/* Kali Linux syslog guide */}
              <div className="p-5 rounded-lg bg-slate-950/80 border border-cyber-border/60 shadow-lg space-y-4">
                <div className="flex items-center gap-2">
                  <Code size={16} className="text-cyber-cyan" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono">
                    Kali Syslog Ingest Guide
                  </h3>
                </div>

                <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                  HackerSafe SIEM comes fully integrated with a RFC-compliant UDP Syslog server listening on port <span className="font-bold text-cyber-cyan font-mono">514</span>.
                </p>

                <div className="space-y-3 font-mono text-[10px]">
                  {/* Command block 1 */}
                  <div className="space-y-1">
                    <span className="text-slate-500 uppercase leading-none">01. Standard Bash trigger (Kali CLI):</span>
                    <pre className="p-2.5 rounded bg-slate-900 border border-cyber-border/60 text-slate-300 whitespace-pre-wrap select-all font-mono leading-normal">
                      logger -n localhost -P 514 --rfc5424 "auth admin login brute force attempt from 192.168.1.10"
                    </pre>
                  </div>

                  {/* Command block 2 */}
                  <div className="space-y-1 mt-2">
                    <span className="text-slate-500 uppercase leading-none">02. Netcat ingestion pipe:</span>
                    <pre className="p-2.5 rounded bg-slate-900 border border-cyber-border/60 text-slate-300 whitespace-pre-wrap select-all font-mono leading-normal">
                      echo "&lt;14&gt;1 2026-05-22T08:00:00Z kali-vm firewall - - port scan detected 45.33.22.11" | nc -u -w1 localhost 514
                    </pre>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-900/60 border border-cyber-border/40 text-[9px] font-mono text-slate-500 flex items-start gap-1.5">
                  <Info size={12} className="text-cyber-cyan shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    Make sure firewall iptables on your hosting VPS permit incoming UDP traffic packets on standard port 514!
                  </p>
                </div>
              </div>

              {/* Environment Information */}
              <div className="p-5 rounded-lg bg-slate-950/80 border border-cyber-border/60 shadow-lg space-y-3 font-mono text-xs">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">
                  SYSTEM ENVIRONMENT
                </h3>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-500">Core Port:</span>
                    <span className="text-slate-200">5000</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-500">Syslog Port:</span>
                    <span className="text-slate-200">514 (UDP)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-500">Environment:</span>
                    <span className="text-cyber-cyan uppercase font-bold">development</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">User Role:</span>
                    <span className="text-slate-200 uppercase">{user?.role}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </main>
    </>
  );
}
