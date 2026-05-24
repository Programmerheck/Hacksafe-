'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal as TermIcon, 
  Search, 
  Download, 
  Play, 
  Pause, 
  Trash2, 
  Filter, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { apiUrl } from '@/lib/api';

export default function LogsViewer() {
  const { liveLogs, clearLiveLogs } = useSocket();
  const { token } = useAuth();
  
  // Queries & Filter State
  const [severityFilter, setSeverityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [ipFilter, setIpFilter] = useState('');
  
  // Database logs state
  const [dbLogs, setDbLogs] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Operational toggles
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [logsBuffer, setLogsBuffer] = useState<any[]>([]);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Load logs from Database (with filters and page)
  const fetchLogs = async (page = 1) => {
    if (!token) return;
    setLoading(true);
    try {
      const url = new URL(apiUrl('/api/logs'));
      url.searchParams.append('page', page.toString());
      url.searchParams.append('limit', '50');
      
      if (severityFilter) url.searchParams.append('severity', severityFilter);
      if (categoryFilter) url.searchParams.append('category', categoryFilter);
      if (ipFilter) url.searchParams.append('sourceIP', ipFilter);
      if (searchQuery) url.searchParams.append('search', searchQuery);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDbLogs(data.data);
        setCurrentPage(data.page);
        setTotalPages(data.pages);
        setTotalCount(data.total);
      }
      setLoading(false);
    } catch (error) {
      console.error('[LOG FETCH ERROR]:', error);
      setLoading(false);
    }
  };

  // Triggers refresh on filter changes
  useEffect(() => {
    fetchLogs(1);
  }, [severityFilter, categoryFilter, searchQuery, ipFilter, token]);

  // WebSocket Live Sync
  useEffect(() => {
    if (isPaused || liveLogs.length === 0) return;
    
    // Auto-prepend websocket logs into the current logs list
    const latestLog = liveLogs[0];
    
    // Check if latest matches currently set filters
    const matchesSev = !severityFilter || latestLog.severity === severityFilter;
    const matchesCat = !categoryFilter || latestLog.category === categoryFilter;
    const matchesIP = !ipFilter || latestLog.sourceIP === ipFilter;
    const matchesSearch = !searchQuery || latestLog.message.toLowerCase().includes(searchQuery.toLowerCase());

    if (matchesSev && matchesCat && matchesIP && matchesSearch) {
      setDbLogs(prev => {
        const updated = [latestLog, ...prev];
        return updated.slice(0, 100); // cap buffer size in UI
      });
      setTotalCount(prev => prev + 1);
    }
  }, [liveLogs, isPaused]);

  // Terminal Auto Scroll handler
  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [dbLogs, autoScroll]);

  // CSV Export utility
  const handleExportCSV = () => {
    if (dbLogs.length === 0) return;
    
    const headers = ['Timestamp', 'Severity', 'Category', 'Source IP', 'Hostname', 'Message'];
    const rows = dbLogs.map(log => [
      new Date(log.timestamp).toISOString(),
      log.severity.toUpperCase(),
      log.category.toUpperCase(),
      log.sourceIP,
      log.hostname,
      log.message.replace(/"/g, '""')
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hackersafe_siem_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWipeLogs = async () => {
    if (!confirm('Are you sure you want to permanently delete all security logs? This action is irreversible.')) {
      return;
    }
    try {
      const res = await fetch(apiUrl('/api/logs'), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        clearLiveLogs();
        setDbLogs([]);
        setTotalCount(0);
        alert(data.message);
      }
    } catch (err) {
      console.error('[LOG WIPE ERROR]:', err);
    }
  };

  return (
    <>
        <Navbar title="SIEM Logs Investigator" />
        <main className="p-6 space-y-4 flex-1 max-w-[1600px] w-full mx-auto flex flex-col h-[calc(100vh-4rem)]">
          
          {/* Controls Panel */}
          <div className="p-4 rounded-lg bg-slate-950/80 border border-cyber-border/60 flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
            
            {/* Left side filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 flex-1">
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search logs message..."
                  className="w-full pl-8 pr-3 py-1.5 rounded bg-slate-900 border border-cyber-border/40 text-slate-300 text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyber-cyan"
                />
              </div>

              {/* Source IP tracking */}
              <div className="relative">
                <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input 
                  type="text"
                  value={ipFilter}
                  onChange={(e) => setIpFilter(e.target.value)}
                  placeholder="Filter Source IP..."
                  className="w-full pl-8 pr-3 py-1.5 rounded bg-slate-900 border border-cyber-border/40 text-slate-300 text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyber-cyan"
                />
              </div>

              {/* Severity filter */}
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="py-1.5 px-3 rounded bg-slate-900 border border-cyber-border/40 text-slate-300 text-xs font-mono focus:outline-none focus:border-cyber-cyan cursor-pointer"
              >
                <option value="">All Severities</option>
                <option value="critical" className="text-rose-500">Critical</option>
                <option value="error" className="text-red-400">Error</option>
                <option value="warning" className="text-amber-400">Warning</option>
                <option value="info" className="text-emerald-400">Info</option>
              </select>

              {/* Category filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="py-1.5 px-3 rounded bg-slate-900 border border-cyber-border/40 text-slate-300 text-xs font-mono focus:outline-none focus:border-cyber-cyan cursor-pointer"
              >
                <option value="">All Categories</option>
                <option value="firewall">Firewall</option>
                <option value="auth">Auth / Access</option>
                <option value="malware">Malware / Botnet</option>
                <option value="system">Host System</option>
              </select>

            </div>

            {/* Right side actions */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Play / Pause live stream */}
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-mono cursor-pointer transition-all ${
                  isPaused 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                }`}
              >
                {isPaused ? (
                  <>
                    <Play size={12} />
                    <span>RESUME FEED</span>
                  </>
                ) : (
                  <>
                    <Pause size={12} />
                    <span>PAUSE FEED</span>
                  </>
                )}
              </button>

              {/* Auto Scroll toggle */}
              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className={`px-3 py-1.5 rounded border text-xs font-mono cursor-pointer transition-all ${
                  autoScroll 
                    ? 'bg-cyber-cyan/10 border-cyber-cyan/30 text-cyber-cyan shadow-[0_0_10px_rgba(0,245,255,0.1)]' 
                    : 'bg-slate-900 border-cyber-border/40 text-slate-400'
                }`}
              >
                AUTO-SCROLL
              </button>

              {/* CSV Export */}
              <button
                onClick={handleExportCSV}
                disabled={dbLogs.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 border border-cyber-border/60 text-xs font-mono text-slate-300 hover:text-cyber-cyan hover:border-cyber-cyan disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <Download size={12} />
                <span>CSV</span>
              </button>

              {/* Wipe / Clear Logs */}
              <button
                onClick={handleWipeLogs}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900/60 border border-red-500/30 text-xs font-mono text-red-400 hover:bg-red-500/10 hover:border-red-500 transition-all cursor-pointer"
              >
                <Trash2 size={12} />
                <span>WIPE DB</span>
              </button>

            </div>
          </div>

          {/* Monospace Interactive Terminal Panel */}
          <div className="flex-1 bg-slate-950 border border-cyber-border/60 rounded-lg p-5 flex flex-col overflow-hidden relative shadow-inner">
            <div className="absolute top-2 right-4 flex items-center gap-4 text-[9px] text-slate-600 font-mono select-none pointer-events-none uppercase">
              <span>HackerSafe core-listener active</span>
              <span>Buffer: {dbLogs.length} events loaded</span>
              <span className="flex items-center gap-1">
                <ShieldCheck size={10} className="text-cyber-cyan" /> Network Shielded
              </span>
            </div>

            {/* Logs List Container */}
            <div className="flex-1 overflow-y-auto space-y-2.5 font-mono text-[11px] text-left pr-2 select-text scrollbar-thin">
              
              {loading && dbLogs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 italic">
                  <RefreshCw size={16} className="animate-spin mr-2" />
                  &gt; Querying pipeline databases, establishing security schemas...
                </div>
              ) : dbLogs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 italic">
                  &gt; No cyber log records match the current filter query parameters.
                </div>
              ) : (
                dbLogs.map((log, index) => {
                  const severityStyles = 
                    log.severity === 'critical' ? 'text-rose-500 font-bold border-l-2 border-rose-500 pl-1.5' :
                    log.severity === 'error' ? 'text-red-400 font-bold border-l-2 border-red-400 pl-1.5' :
                    log.severity === 'warning' ? 'text-amber-400 border-l-2 border-amber-400 pl-1.5' : 
                    'text-emerald-400 border-l-2 border-emerald-500/40 pl-1.5';

                  return (
                    <div key={log._id || index} className="py-1 hover:bg-slate-900/40 transition-colors leading-relaxed border-b border-slate-900/40">
                      <span className="text-slate-600">[{new Date(log.timestamp).toISOString()}]</span>{' '}
                      <span className={`${severityStyles}`}>[{log.severity.toUpperCase()}]</span>{' '}
                      <span className="text-slate-500">[{log.category.toUpperCase()}]</span>{' '}
                      <span className="text-cyber-cyan">({log.sourceIP}::{log.hostname})</span>{' '}
                      <span className="text-slate-300 font-semibold break-all">{log.message}</span>
                      
                      {/* Deep-dive nested parsed json print */}
                      {log.parsedDetails && Object.keys(log.parsedDetails).length > 2 && (
                        <div className="ml-8 text-[10px] text-slate-500 leading-snug">
                          <span>Metadata:</span>{' '}
                          {Object.entries(log.parsedDetails)
                            .filter(([k]) => k !== 'raw' && k !== 'seed' && k !== 'simulated')
                            .map(([key, val]) => (
                              <span key={key} className="mr-3 bg-slate-900/50 px-1 py-0.5 rounded border border-cyber-border/10">
                                {key}: <span className="text-slate-400">{String(val)}</span>
                              </span>
                            ))
                          }
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              
              {/* Ref pointer for autoscrolling */}
              <div ref={terminalEndRef} />
            </div>

          </div>

          {/* Lower Pagination bar */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/80 border border-cyber-border/40 text-xs font-mono text-slate-400 select-none shrink-0">
            <div>
              <span>Events Mapped: </span>
              <span className="font-extrabold text-slate-200">{totalCount.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                disabled={currentPage <= 1 || loading}
                onClick={() => fetchLogs(currentPage - 1)}
                className="p-1 rounded bg-slate-900 border border-cyber-border/40 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:text-cyber-cyan transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              <span>Page <span className="font-bold text-slate-200">{currentPage}</span> of <span className="font-bold text-slate-200">{totalPages}</span></span>

              <button
                disabled={currentPage >= totalPages || loading}
                onClick={() => fetchLogs(currentPage + 1)}
                className="p-1 rounded bg-slate-900 border border-cyber-border/40 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:text-cyber-cyan transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

        </main>
    </>
  );
}
