'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Terminal, 
  ShieldAlert, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert as ShieldIcon
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Logs Viewer', path: '/logs', icon: Terminal },
  { name: 'Alerts Center', path: '/alerts', icon: ShieldAlert },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <motion.div
      animate={{ width: isCollapsed ? 70 : 240 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen sticky top-0 left-0 bg-slate-950/80 border-r border-cyber-border/60 backdrop-blur-md flex flex-col z-40 text-slate-400 select-none"
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-cyber-border/40 flex items-center justify-between overflow-hidden">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded bg-gradient-to-tr from-cyber-cyan to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_10px_rgba(0,245,255,0.4)]">
                HS
              </div>
              <span className="font-extrabold text-lg tracking-wider text-slate-100 uppercase">
                Hacker<span className="text-cyber-cyan">Safe</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {isCollapsed && (
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-cyber-cyan to-blue-600 flex items-center justify-center text-slate-950 font-bold mx-auto shadow-[0_0_10px_rgba(0,245,255,0.4)]">
            HS
          </div>
        )}

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded bg-slate-900 border border-cyber-border/50 text-slate-300 hover:text-cyber-cyan hover:border-cyber-cyan transition-colors"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-all duration-200 group relative ${
                isActive
                  ? 'bg-cyber-cyan/10 text-cyber-cyan border-l-2 border-cyber-cyan font-semibold'
                  : 'hover:bg-slate-900 hover:text-slate-100'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-cyber-cyan' : 'group-hover:text-cyber-cyan transition-colors'} />

              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-sm tracking-wide"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>

              {isCollapsed && (
                <div className="absolute left-16 px-2 py-1 rounded bg-slate-900 border border-cyber-border text-xs text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Session Footer */}
      <div className="p-4 border-t border-cyber-border/40 flex flex-col gap-2 overflow-hidden bg-slate-950/40">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 mb-2"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-cyber-border flex items-center justify-center text-xs font-bold text-cyber-cyan uppercase">
                {user?.username?.substring(0, 2) || 'OP'}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-slate-200 truncate">{user?.username || 'Operator'}</span>
                <span className="text-[10px] text-cyber-cyan font-mono uppercase tracking-wider">{user?.role || 'analyst'}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={logout}
          className={`flex items-center justify-center gap-2 px-3 py-2 rounded bg-slate-900/60 border border-red-500/20 text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 transition-colors w-full ${
            isCollapsed ? 'p-2' : ''
          }`}
        >
          <LogOut size={16} />
          {!isCollapsed && <span className="text-xs font-semibold uppercase tracking-wider">Log Out</span>}
        </button>
      </div>
    </motion.div>
  );
};
