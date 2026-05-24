'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { apiUrl, getWsUrl } from '../lib/api';

interface Log {
  _id: string;
  timestamp: string;
  sourceIP: string;
  hostname: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: 'firewall' | 'auth' | 'malware' | 'system';
  message: string;
  parsedDetails?: any;
}

interface Alert {
  _id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'resolved';
  sourceIP: string;
  createdAt: string;
  resolvedAt?: string;
  assignedTo: string;
}

interface SocketContextType {
  liveLogs: Log[];
  liveAlerts: Alert[];
  isConnected: boolean;
  clearLiveLogs: () => void;
  triggerMockLog: (severity: string, category: string, host: string, msg: string) => void;
  resolveAlertInUI: (alertId: string, assignedTo: string) => Promise<boolean>;
  deleteAlertInUI: (alertId: string) => Promise<boolean>;
  fetchHistory: () => Promise<void>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [liveLogs, setLiveLogs] = useState<Log[]>([]);
  const [liveAlerts, setLiveAlerts] = useState<Alert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { token, isAuthenticated } = useAuth();

  // Helper to fetch log history
  const fetchHistory = async () => {
    if (!token) return;
    try {
      // 1. Fetch initial logs
      const logsRes = await fetch(apiUrl('/api/logs?limit=50'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const logsData = await logsRes.json();
      if (logsData.success) {
        setLiveLogs(logsData.data);
      }

      // 2. Fetch initial alerts
      const alertsRes = await fetch(apiUrl('/api/alerts'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const alertsData = await alertsRes.json();
      if (alertsData.success) {
        setLiveAlerts(alertsData.data);
      }
    } catch (error) {
      console.error('[SIEM HISTORY] Failed to seed history:', error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setIsConnected(false);
      setLiveLogs([]);
      setLiveAlerts([]);
      return;
    }

    // Load initial history
    fetchHistory();

    // Setup native WebSocket connection
    const socketUrl = getWsUrl();
    console.log('[WEBSOCKET] Connecting to SIEM live telemetry stream...');
    const ws = new WebSocket(socketUrl);

    ws.onopen = () => {
      console.log('[WEBSOCKET] Stream secured. Live updates enabled.');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { event: wsEvent, data } = payload;

        switch (wsEvent) {
          case 'connected':
            console.log(`[WEBSOCKET] Server Welcome: ${data.message}`);
            break;
          case 'new-log':
            setLiveLogs((prev) => {
              // Maintain maximum 150 items in local buffer
              const updated = [data, ...prev];
              return updated.slice(0, 150);
            });
            break;
          case 'new-alert':
            setLiveAlerts((prev) => [data, ...prev]);
            break;
          case 'update-alert':
            setLiveAlerts((prev) =>
              prev.map((alert) => (alert._id === data._id ? data : alert))
            );
            break;
          case 'delete-alert':
            setLiveAlerts((prev) => prev.filter((alert) => alert._id !== data));
            break;
          default:
            break;
        }
      } catch (err) {
        console.error('[WEBSOCKET] Parser exception:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('[WEBSOCKET] Connection error:', err);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('[WEBSOCKET] Stream closed.');
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [isAuthenticated, token]);

  const clearLiveLogs = () => {
    setLiveLogs([]);
  };

  // Triggers custom log simulation
  const triggerMockLog = async (severity: string, category: string, host: string, msg: string) => {
    try {
      await fetch(apiUrl('/api/logs/ingest'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          severity,
          category,
          hostname: host,
          message: msg,
          parsedDetails: { simulationType: 'user-triggered' }
        })
      });
    } catch (error) {
      console.error('[MOCK TRIGGER] Failed to trigger log:', error);
    }
  };

  // Resolve alert call
  const resolveAlertInUI = async (alertId: string, assignedTo: string) => {
    if (!token) return false;
    try {
      const res = await fetch(apiUrl(`/api/alerts/${alertId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'resolved', assignedTo })
      });
      const data = await res.json();
      return data.success;
    } catch (error) {
      console.error('[ALERT ACTION] Error resolving:', error);
      return false;
    }
  };

  // Delete alert call
  const deleteAlertInUI = async (alertId: string) => {
    if (!token) return false;
    try {
      const res = await fetch(apiUrl(`/api/alerts/${alertId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      return data.success;
    } catch (error) {
      console.error('[ALERT ACTION] Error deleting:', error);
      return false;
    }
  };

  return (
    <SocketContext.Provider
      value={{
        liveLogs,
        liveAlerts,
        isConnected,
        clearLiveLogs,
        triggerMockLog,
        resolveAlertInUI,
        deleteAlertInUI,
        fetchHistory
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
