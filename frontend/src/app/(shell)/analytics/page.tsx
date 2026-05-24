'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  MapPin, 
  ShieldAlert, 
  Activity, 
  Lock, 
  UserCheck, 
  TrendingUp,
  RefreshCw,
  Cpu,
  Globe
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
  LineChart,
  Line,
  Legend
} from 'recharts';
import { Navbar } from '@/components/Navbar';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { apiUrl } from '@/lib/api';
import ChartContainer from '@/components/ChartContainer';

export default function Analytics() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    trends: [],
    geoMap: [],
    categories: {},
    topIPs: [],
    systemTelemetry: {}
  });

  const fetchStats = async () => {
    if (!token) return;
    try {
      const res = await fetch(apiUrl('/api/analytics'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
      setLoading(false);
    } catch (err) {
      console.error('[ANALYTICS FETCH ERROR]:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [token]);

  // Auth attempts mock data
  const authAttemptsData = [
    { hour: '08:00', successful: 42, failed: 3 },
    { hour: '10:00', successful: 68, failed: 12 },
    { hour: '12:00', successful: 94, failed: 8 },
    { hour: '14:00', successful: 81, failed: 27 }, // brute force period
    { hour: '16:00', successful: 73, failed: 5 },
    { hour: '18:00', successful: 55, failed: 2 },
  ];

  // Bandwidth latency graph data
  const latencyData = [
    { time: '10s', load: 145, latency: 12 },
    { time: '20s', load: 220, latency: 18 },
    { time: '30s', load: 490, latency: 45 }, // peak DDoS scan
    { time: '40s', load: 380, latency: 28 },
    { time: '50s', load: 260, latency: 15 },
    { time: '60s', load: 195, latency: 14 },
  ];

  // Malware classes breakdown
  const malwareClasses = [
    { name: 'Ransomware', value: 34, color: '#f43f5e' },
    { name: 'Spyware / InfoStealer', value: 45, color: '#f59e0b' },
    { name: 'Trojan Payload', value: 25, color: '#3b82f6' },
    { name: 'Adware / Miner', value: 16, color: '#10b981' },
  ];

  return (
    <>
        <Navbar title="Cyber Analytics Hub" />
        <main className="p-6 space-y-6 flex-1 max-w-[1600px] w-full mx-auto">
          
          {/* Header Panel */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-border/20 pb-4">
            <div className="text-left">
              <p className="text-xs font-mono text-cyber-cyan tracking-widest uppercase leading-none">
                [ DEEP PATTERN CLASSIFICATION SERVICE ]
              </p>
              <h2 className="text-2xl font-black text-slate-100 mt-1 uppercase tracking-wide">
                SIEM Intelligence Center
              </h2>
            </div>
            
            <button 
              onClick={fetchStats}
              className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-900 border border-cyber-border/60 text-xs font-mono text-slate-300 hover:text-cyber-cyan hover:border-cyber-cyan transition-all cursor-pointer shadow-sm w-fit"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              REFRESH INTEL
            </button>
          </div>

          {/* Interactive World Threat Tracking Map & Country list */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* SVG Interactive Threat Map */}
            <div className="xl:col-span-2 p-5 rounded-lg bg-slate-950/80 border border-cyber-border/60 shadow-lg flex flex-col h-[350px]">
              <div className="flex items-center justify-between mb-4">
                <div className="text-left">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono flex items-center gap-2">
                    <Globe size={14} className="text-cyber-cyan animate-pulse" />
                    LIVE GEOLOCATION THREAT TRACKING MAP
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">Blinking nodes represent sources of active packet injections</p>
                </div>
              </div>

              {/* Stylized Cyber Map Canvas */}
              <div className="flex-1 bg-slate-950 rounded border border-cyber-border/40 relative overflow-hidden flex items-center justify-center">
                {/* Dotted military grid overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(#151e3d_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
                
                {/* Custom Stylized Minimal World Map Path (Simulated in clean geometric lines for aesthetic precision) */}
                <svg className="w-full h-full max-h-[260px] opacity-40 absolute" viewBox="0 0 1000 500" fill="none" stroke="currentColor">
                  {/* North America */}
                  <path d="M150 120 L250 100 L320 180 L280 260 L200 240 L160 170 Z M130 90 L160 60 L180 80 Z" stroke="#1e293b" strokeWidth="2" fill="#0f172a" />
                  {/* South America */}
                  <path d="M260 270 L300 290 L340 370 L300 450 L270 420 L240 320 Z" stroke="#1e293b" strokeWidth="2" fill="#0f172a" />
                  {/* Europe & Asia */}
                  <path d="M430 110 L500 70 L650 60 L850 110 L880 180 L750 280 L620 220 L540 180 Z" stroke="#1e293b" strokeWidth="2" fill="#0f172a" />
                  {/* Africa */}
                  <path d="M440 230 L530 200 L560 290 L520 380 L470 360 L430 280 Z" stroke="#1e293b" strokeWidth="2" fill="#0f172a" />
                  {/* Australia */}
                  <path d="M780 340 L850 330 L880 380 L800 400 Z" stroke="#1e293b" strokeWidth="2" fill="#0f172a" />

                  {/* Target coordinates and connection vectors */}
                  {/* US Target */}
                  <line x1="220" y1="160" x2="620" y2="100" stroke="rgba(244,63,94,0.15)" strokeWidth="1" strokeDasharray="4 4" />
                  {/* Russia Target */}
                  <line x1="680" y1="90" x2="620" y2="100" stroke="rgba(244,63,94,0.15)" strokeWidth="1" strokeDasharray="4 4" />
                  {/* China Target */}
                  <line x1="740" y1="170" x2="620" y2="100" stroke="rgba(244,63,94,0.15)" strokeWidth="1" strokeDasharray="4 4" />
                </svg>

                {/* Blinking threat nodes overlay */}
                {/* USA Node */}
                <div className="absolute top-[32%] left-[22%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <span className="w-3 h-3 bg-cyber-cyan rounded-full animate-ping absolute"></span>
                  <span className="w-2 h-2 bg-cyber-cyan rounded-full border border-slate-900 z-10"></span>
                  <span className="text-[8px] font-mono text-slate-400 leading-none mt-1 select-none">US: CORE</span>
                </div>

                {/* Russia Node */}
                <div className="absolute top-[18%] left-[68%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <span className="w-3 h-3 bg-rose-500 rounded-full animate-ping absolute"></span>
                  <span className="w-2 h-2 bg-rose-500 rounded-full border border-slate-900 z-10"></span>
                  <span className="text-[8px] font-mono text-slate-400 leading-none mt-1 select-none flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full inline-block animate-pulse"></span> RU
                  </span>
                </div>

                {/* China Node */}
                <div className="absolute top-[34%] left-[74%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <span className="w-3 h-3 bg-rose-500 rounded-full animate-ping absolute"></span>
                  <span className="w-2 h-2 bg-rose-500 rounded-full border border-slate-900 z-10"></span>
                  <span className="text-[8px] font-mono text-slate-400 leading-none mt-1 select-none flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full inline-block animate-pulse"></span> CN
                  </span>
                </div>

                {/* Germany Node */}
                <div className="absolute top-[21%] left-[49%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <span className="w-3 h-3 bg-amber-500 rounded-full animate-ping absolute"></span>
                  <span className="w-2 h-2 bg-amber-500 rounded-full border border-slate-900 z-10"></span>
                  <span className="text-[8px] font-mono text-slate-400 leading-none mt-1 select-none">DE</span>
                </div>
              </div>
            </div>

            {/* Geolocation Top Country stats */}
            <div className="p-5 rounded-lg bg-slate-950/80 border border-cyber-border/60 shadow-lg text-left h-[350px] flex flex-col">
              <div className="mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono">
                  ORIGIN INCIDENT BREAKDOWN
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">Top countries initiating security packets</p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 font-mono text-xs pr-2 scrollbar-thin">
                {stats.geoMap && stats.geoMap.length > 0 ? (
                  stats.geoMap.map((item: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded bg-slate-900 border border-cyber-border/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-cyber-border/60 text-[9px] font-extrabold text-cyber-cyan uppercase">
                          {item.code}
                        </span>
                        <span className="text-slate-200 font-semibold">{item.country}</span>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <div className="text-slate-400 font-extrabold leading-none">{item.count}</div>
                          <span className="text-[8px] text-slate-500 font-mono uppercase">inbound</span>
                        </div>
                        <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                          item.code === 'RU' || item.code === 'CN' ? 'bg-rose-500 animate-ping' : 'bg-slate-700'
                        }`}></span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 italic">
                    Loading geolocation records...
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Attack Trends & Login Attempts Double Graph */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Network Throughput & Latency curves */}
            <div className="p-5 rounded-lg bg-slate-950/80 border border-cyber-border/60 shadow-lg flex flex-col h-80">
              <div className="mb-4 text-left">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono flex items-center gap-1.5">
                  <Activity size={14} className="text-indigo-400" />
                  BANDWIDTH LOAD & RESPONSE LATENCY
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">DDoS and packet flood investigation</p>
              </div>

              <div className="flex-1 w-full text-xs font-mono">
                <ChartContainer>
                  <LineChart
                    data={latencyData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                  >
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#020617', 
                        border: '1px solid #1e293b',
                        fontSize: '11px'
                      }} 
                    />
                    <Line type="monotone" dataKey="load" stroke="#3b82f6" strokeWidth={2} name="Load (Kbps)" activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="latency" stroke="#f43f5e" strokeWidth={1.5} name="Latency (ms)" />
                  </LineChart>
                </ChartContainer>
              </div>
            </div>

            {/* Login attempts tracking (failed vs successful) */}
            <div className="p-5 rounded-lg bg-slate-950/80 border border-cyber-border/60 shadow-lg flex flex-col h-80">
              <div className="mb-4 text-left">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono flex items-center gap-1.5">
                  <Lock size={14} className="text-amber-400" />
                  AUTHENTICATION ACCESS TRIALS HISTORY
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">Brute force sweeping detection rates</p>
              </div>

              <div className="flex-1 w-full text-xs font-mono">
                <ChartContainer>
                  <BarChart
                    data={authAttemptsData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                  >
                    <XAxis dataKey="hour" stroke="#475569" fontSize={10} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#020617', 
                        border: '1px solid #1e293b',
                        fontSize: '11px'
                      }} 
                    />
                    <Bar dataKey="successful" fill="#10b981" radius={[2, 2, 0, 0]} name="Successful" />
                    <Bar dataKey="failed" fill="#ef4444" radius={[2, 2, 0, 0]} name="Failed Attempts" />
                  </BarChart>
                </ChartContainer>
              </div>
            </div>
          </div>

          {/* Lower Grid: Malware signature ratios & Top target IPs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Malware ratios doughnut */}
            <div className="p-5 rounded-lg bg-slate-950/80 border border-cyber-border/60 shadow-lg flex flex-col h-80">
              <div className="text-left mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono">
                  MALWARE CLASSIFICATION DOMINANCE
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">Signatures detected on endpoint nodes</p>
              </div>

              <div className="flex-1 flex flex-col justify-center items-center font-mono">
                <div className="h-36 w-full">
                  <ChartContainer minHeight={144}>
                    <PieChart>
                      <Pie
                        data={malwareClasses}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={55}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {malwareClasses.map((entry, index) => (
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

                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[10px] text-left w-fit mx-auto mt-2">
                  {malwareClasses.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full inline-block animate-pulse" style={{ backgroundColor: item.color }}></span>
                      <span className="text-slate-400 truncate max-w-[80px]">{item.name}:</span>
                      <span className="font-extrabold text-slate-200">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top attacking IP addresses list */}
            <div className="lg:col-span-2 p-5 rounded-lg bg-slate-950/80 border border-cyber-border/60 shadow-lg text-left h-80 flex flex-col">
              <div className="mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono">
                  TOP OFFENSIVE TARGET HOST IP ADDRESSES
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">Source IPs mapping highest network load metrics</p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 font-mono text-xs pr-2 scrollbar-thin">
                {stats.topIPs && stats.topIPs.length > 0 ? (
                  stats.topIPs.map((item: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded bg-slate-900 border border-cyber-border/40 flex items-center justify-between hover:border-cyber-cyan/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="text-slate-500 font-extrabold">0{idx + 1}</span>
                        <div>
                          <span className="text-slate-200 font-bold select-all">{item.ip}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <span className="text-slate-400 font-semibold">{item.events}</span>
                          <span className="text-[9px] text-slate-500 block leading-none">Total Events</span>
                        </div>
                        <span className="text-[10px] text-rose-500 font-extrabold px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 uppercase tracking-wide">
                          Host Blocked
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 italic">
                    Loading telemetry records...
                  </div>
                )}
              </div>
            </div>

          </div>

        </main>
    </>
  );
}
