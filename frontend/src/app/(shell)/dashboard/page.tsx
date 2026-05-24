'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Terminal as TermIcon, 
  UserX, 
  Network, 
  Cpu, 
  Activity, 
  Database,
  ArrowUpRight,
  TrendingUp,
  AlertOctagon,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Navbar } from '@/components/Navbar';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { apiUrl } from '@/lib/api';
import ChartContainer from '@/components/ChartContainer';

export default function Dashboard() {
  const { liveLogs, liveAlerts, isConnected } = useSocket();
  const { token } = useAuth();
  
  // Real-time counter metrics
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeThreats: 0,
    failedLogins: 0,
    firewallBlocked: 0,
    cpuUsage: 22,
    netInbound: 182,
    netOutbound: 84,
    severities: { info: 0, warning: 0, error: 0, critical: 0 },
    categories: { firewall: 0, auth: 0, malware: 0, system: 0 },
    trends: [] as any[],
  });

  const [loading, setLoading] = useState(true);

  // Fetch initial analytics metrics
  const fetchAnalytics = async () => {
    if (!token) return;
    try {
      const res = await fetch(apiUrl('/api/analytics'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(prev => ({
          ...prev,
          totalEvents: data.stats.totalEvents,
          activeThreats: data.stats.activeThreats,
          failedLogins: data.stats.failedLogins,
          firewallBlocked: data.stats.categories.firewall || 0,
          cpuUsage: data.stats.systemTelemetry.cpuUsage,
          netInbound: data.stats.systemTelemetry.networkInbound,
          netOutbound: data.stats.systemTelemetry.networkOutbound,
          severities: data.stats.severities,
          categories: data.stats.categories,
          trends: data.stats.trends,
        }));
      }
      setLoading(false);
    } catch (err) {
      console.error('[ANALYTICS FETCH ERROR]:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // Refresh stats from database every 10 seconds to keep trends aligned
    const interval = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(interval);
  }, [token]);

  // Hook into live WebSocket events to increment counters in real-time!
  useEffect(() => {
    if (liveLogs.length === 0) return;
    const latestLog = liveLogs[0];

    // Real-time reactive updates
    setStats(prev => {
      const newTotal = prev.totalEvents + 1;
      const newCats = { ...prev.categories };
      newCats[latestLog.category] = (newCats[latestLog.category] || 0) + 1;

      const newSevs = { ...prev.severities };
      newSevs[latestLog.severity] = (newSevs[latestLog.severity] || 0) + 1;

      let newFailedLogins = prev.failedLogins;
      if (latestLog.category === 'auth' && /failed/i.test(latestLog.message)) {
        newFailedLogins += 1;
      }

      // Slightly fluctuate hardware load in real-time
      const newCpu = Math.min(Math.max(prev.cpuUsage + (Math.random() > 0.5 ? 2 : -2), 10), 95);
      const newNetIn = Math.min(Math.max(prev.netInbound + Math.floor(Math.random() * 20 - 10), 50), 990);
      const newNetOut = Math.min(Math.max(prev.netOutbound + Math.floor(Math.random() * 10 - 5), 20), 450);

      return {
        ...prev,
        totalEvents: newTotal,
        categories: newCats,
        severities: newSevs,
        failedLogins: newFailedLogins,
        firewallBlocked: newCats.firewall || 0,
        cpuUsage: newCpu,
        netInbound: newNetIn,
        netOutbound: newNetOut
      };
    });
  }, [liveLogs]);

  // Sync open threats count with websocket liveAlerts length
  useEffect(() => {
    const openCount = liveAlerts.filter(a => a.status === 'open').length;
    setStats(prev => ({
      ...prev,
      activeThreats: openCount
    }));
  }, [liveAlerts]);

  // Severity Pie Chart Data Formatting
  const pieData = [
    { name: 'Critical', value: stats.severities.critical || 1, color: '#f43f5e' },
    { name: 'Error', value: stats.severities.error || 1, color: '#ef4444' },
    { name: 'Warning', value: stats.severities.warning || 1, color: '#f59e0b' },
    { name: 'Info', value: stats.severities.info || 1, color: '#10b981' },
  ];

  // Category Bar Chart Data Formatting
  const barData = [
    { name: 'Firewall', events: stats.categories.firewall || 0, fill: '#00f5ff' },
    { name: 'Auth', events: stats.categories.auth || 0, fill: '#3b82f6' },
    { name: 'Malware', events: stats.categories.malware || 0, fill: '#f43f5e' },
    { name: 'System', events: stats.categories.system || 0, fill: '#10b981' },
  ];

  return (
    <>
        <Navbar title="SIEM Control Dashboard" />
        <main className="p-6 space-y-6 flex-1 max-w-[1600px] w-full mx-auto">
          
          {/* Header Description */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-border/20 pb-4">
            <div className="text-left">
              <p className="text-xs font-mono text-cyber-cyan tracking-widest uppercase leading-none">
                [ SECURITY INTEGRITY SYSTEM DEPLOYED ]
              </p>
              <h2 className="text-2xl font-black text-slate-100 mt-1 uppercase tracking-wide">
                HackerSafe Cockpit
              </h2>
            </div>
            
            <button 
              onClick={fetchAnalytics}
              className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-900 border border-cyber-border/60 text-xs font-mono text-slate-300 hover:text-cyber-cyan hover:border-cyber-cyan transition-all cursor-pointer shadow-sm w-fit"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              SYNC LOGS
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
            {/* Total Events */}
            <motion.div 
              whileHover={{ y: -3 }}
              className="p-4 rounded-lg bg-slate-950/80 border border-cyber-border/60 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.4)] relative overflow-hidden"
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Total Events</span>
                <Database size={16} className="text-cyber-cyan" />
              </div>
              <div className="my-2 text-left">
                <span className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
                  {stats.totalEvents.toLocaleString()}
                </span>
              </div>
              <div className="text-[10px] font-mono text-cyber-cyan flex items-center gap-1 leading-none mt-1">
                <TrendingUp size={10} />
                <span>REAL-TIME PIPELINE ACTIVE</span>
              </div>
            </motion.div>

            {/* Active Threats */}
            <motion.div 
              whileHover={{ y: -3 }}
              className={`p-4 rounded-lg bg-slate-950/80 border flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.4)] relative overflow-hidden ${
                stats.activeThreats > 0 ? 'border-rose-500/50 cyber-glow-rose' : 'border-cyber-border/60'
              }`}
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Active Threats</span>
                <ShieldAlert size={16} className={stats.activeThreats > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-400'} />
              </div>
              <div className="my-2 text-left">
                <span className={`text-3xl font-extrabold font-mono tracking-tight ${
                  stats.activeThreats > 0 ? 'text-rose-500' : 'text-slate-100'
                }`}>
                  {stats.activeThreats}
                </span>
              </div>
              <div className={`text-[10px] font-mono flex items-center gap-1 leading-none mt-1 ${
                stats.activeThreats > 0 ? 'text-rose-400 font-bold' : 'text-slate-500'
              }`}>
                {stats.activeThreats > 0 ? (
                  <>
                    <AlertOctagon size={10} className="animate-spin" />
                    <span>INTRUSIONS UNRESOLVED</span>
                  </>
                ) : (
                  <span>ALL TARGETS SECURED</span>
                )}
              </div>
            </motion.div>

            {/* Failed Logins */}
            <motion.div 
              whileHover={{ y: -3 }}
              className={`p-4 rounded-lg bg-slate-950/80 border flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.4)] relative overflow-hidden ${
                stats.failedLogins > 5 ? 'border-amber-500/50' : 'border-cyber-border/60'
              }`}
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Failed Logins</span>
                <UserX size={16} className="text-amber-500" />
              </div>
              <div className="my-2 text-left">
                <span className={`text-3xl font-extrabold font-mono tracking-tight ${
                  stats.failedLogins > 5 ? 'text-amber-500 font-bold' : 'text-slate-100'
                }`}>
                  {stats.failedLogins}
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-500 leading-none mt-1">
                <span>ON AUTHENTICATION APPS</span>
              </div>
            </motion.div>

            {/* Firewall Drops */}
            <motion.div 
              whileHover={{ y: -3 }}
              className="p-4 rounded-lg bg-slate-950/80 border border-cyber-border/60 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.4)] relative overflow-hidden"
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Firewall Logs</span>
                <Network size={16} className="text-blue-500" />
              </div>
              <div className="my-2 text-left">
                <span className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
                  {stats.firewallBlocked}
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-500 leading-none mt-1">
                <span>INBOUND PACKETS PROCESSED</span>
              </div>
            </motion.div>

            {/* CPU Load */}
            <motion.div 
              whileHover={{ y: -3 }}
              className="p-4 rounded-lg bg-slate-950/80 border border-cyber-border/60 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.4)] relative overflow-hidden"
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono">CPU Usage</span>
                <Cpu size={16} className="text-emerald-400 animate-pulse" />
              </div>
              <div className="my-2 text-left flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
                  {stats.cpuUsage}
                </span>
                <span className="text-xs text-slate-500 font-mono">%</span>
              </div>
              {/* Progress visualizer */}
              <div className="w-full bg-slate-900 rounded-full h-1 mt-1 overflow-hidden">
                <div 
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${stats.cpuUsage}%` }}
                ></div>
              </div>
            </motion.div>

            {/* Network load */}
            <motion.div 
              whileHover={{ y: -3 }}
              className="p-4 rounded-lg bg-slate-950/80 border border-cyber-border/60 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.4)] relative overflow-hidden"
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Network Traffic</span>
                <Activity size={16} className="text-indigo-400" />
              </div>
              <div className="my-2 text-left text-xs font-mono flex flex-col gap-0.5 justify-center">
                <div className="flex justify-between items-center text-slate-200 font-bold leading-tight">
                  <span>IN:</span>
                  <span>{stats.netInbound} <span className="text-[9px] text-slate-500 font-normal">KB/s</span></span>
                </div>
                <div className="flex justify-between items-center text-slate-300 leading-tight">
                  <span>OUT:</span>
                  <span>{stats.netOutbound} <span className="text-[9px] text-slate-500 font-normal">KB/s</span></span>
                </div>
              </div>
              <div className="text-[9px] font-mono text-slate-500 leading-none mt-1">
                <span>SIEM DAEMON STREAMING</span>
              </div>
            </motion.div>
          </div>

          {/* Core SIEM Charting & Ingest Console */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Attack Trends Area Chart */}
            <div className="lg:col-span-2 p-5 rounded-lg bg-slate-950/80 border border-cyber-border/60 shadow-lg flex flex-col h-96">
              <div className="flex items-center justify-between mb-4">
                <div className="text-left">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono">
                    CHRONOLOGICAL SECURITY INCIDENTS
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">Real-time log events mapped chronologically</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30 rounded uppercase tracking-wider">
                  Live Feed
                </span>
              </div>

              <div className="flex-1 w-full text-xs font-mono">
                {stats.trends.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-500">
                    Calculating timeline statistics...
                  </div>
                ) : (
                  <ChartContainer>
                    <AreaChart
                      data={stats.trends}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorCrit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.01}/>
                        </linearGradient>
                        <linearGradient id="colorErr" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.01}/>
                        </linearGradient>
                        <linearGradient id="colorWarn" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.01}/>
                        </linearGradient>
                        <linearGradient id="colorInfo" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#020617', 
                          border: '1px solid #1e293b', 
                          borderRadius: '6px',
                          color: '#f8fafc' 
                        }} 
                      />
                      <Area type="monotone" dataKey="critical" stroke="#f43f5e" fillOpacity={1} fill="url(#colorCrit)" strokeWidth={2} name="Critical" />
                      <Area type="monotone" dataKey="error" stroke="#ef4444" fillOpacity={1} fill="url(#colorErr)" strokeWidth={1.5} name="Error" />
                      <Area type="monotone" dataKey="warning" stroke="#f59e0b" fillOpacity={1} fill="url(#colorWarn)" strokeWidth={1} name="Warning" />
                      <Area type="monotone" dataKey="info" stroke="#10b981" fillOpacity={1} fill="url(#colorInfo)" strokeWidth={1} name="Info" />
                    </AreaChart>
                  </ChartContainer>
                )}
              </div>
            </div>

            {/* Severity Distribution Pie Chart */}
            <div className="p-5 rounded-lg bg-slate-950/80 border border-cyber-border/60 shadow-lg flex flex-col h-96">
              <div className="text-left mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono">
                  THREAT SEVERITY ALLOCATION
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">Critical vs Informational logs ratio</p>
              </div>

              <div className="flex-1 flex flex-col justify-center items-center font-mono">
                <div className="h-48 w-full">
                  <ChartContainer minHeight={192}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#020617', 
                          border: '1px solid #1e293b',
                          fontSize: '11px'
                        }} 
                      />
                    </PieChart>
                  </ChartContainer>
                </div>

                {/* Legend list */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-left w-fit mx-auto mt-2">
                  {pieData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }}></span>
                      <span className="text-slate-400 capitalize">{item.name}:</span>
                      <span className="font-extrabold text-slate-200">{stats.severities[item.name.toLowerCase() as keyof typeof stats.severities] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Lower Grid: Mini Live Terminal & Event Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Live Terminal Mini Stream */}
            <div className="lg:col-span-2 p-5 rounded-lg bg-slate-950/80 border border-cyber-border/60 shadow-lg flex flex-col h-[380px]">
              <div className="flex items-center justify-between mb-3">
                <div className="text-left flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono">
                    LIVE SECURITY SYSLOG FEED
                  </h3>
                </div>
                <a href="/logs" className="text-[10px] font-mono text-cyber-cyan hover:underline uppercase tracking-wider flex items-center gap-1">
                  ADVANCED INVESTIGATOR <ArrowUpRight size={12} />
                </a>
              </div>

              {/* Terminal Logs Monospace container */}
              <div className="flex-1 bg-slate-950 border border-cyber-border/60 p-4 rounded font-mono text-[11px] overflow-y-auto space-y-2 text-left relative scrollbar-thin select-text">
                <div className="absolute top-0 right-0 p-2 text-[9px] text-slate-600 pointer-events-none uppercase">
                  STDIN/STDOUT ACTIVE
                </div>
                
                {liveLogs.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-600 italic">
                    &gt; Connection established. Awaiting UDP syslogs / REST payloads...
                  </div>
                ) : (
                  liveLogs.slice(0, 30).map((log, index) => {
                    const color = 
                      log.severity === 'critical' ? 'text-rose-500' :
                      log.severity === 'error' ? 'text-red-400' :
                      log.severity === 'warning' ? 'text-amber-400' : 'text-emerald-400';

                    return (
                      <div key={log._id || index} className="border-b border-slate-900 pb-1 hover:bg-slate-900/20 px-1 transition-colors leading-relaxed">
                        <span className="text-slate-600">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                        <span className={`font-bold ${color}`}>[{log.severity.toUpperCase()}]</span>{' '}
                        <span className="text-slate-400 font-semibold font-mono">({log.sourceIP}::{log.hostname})</span>{' '}
                        <span className="text-slate-300 font-mono break-all">{log.message}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Category Breakdown Bar Chart */}
            <div className="p-5 rounded-lg bg-slate-950/80 border border-cyber-border/60 shadow-lg flex flex-col h-[380px]">
              <div className="text-left mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono">
                  LOG CATEGORY VOLUMES
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">Telemetry metrics classified by domain</p>
              </div>

              <div className="flex-1 w-full text-xs font-mono">
                {stats.totalEvents === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-500">
                    Preparing histogram analytics...
                  </div>
                ) : (
                  <ChartContainer>
                    <BarChart
                      data={barData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                    >
                      <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#020617', 
                          border: '1px solid #1e293b',
                          fontSize: '11px'
                        }}
                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      />
                      <Bar dataKey="events" radius={[4, 4, 0, 0]}>
                        {barData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                )}
              </div>
            </div>

          </div>
        </main>
    </>
  );
}
