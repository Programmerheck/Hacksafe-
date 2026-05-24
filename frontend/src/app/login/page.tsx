'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter all credentials');
      return;
    }
    
    setError(null);
    setLoading(true);
    
    const result = await login(email, password);
    setLoading(false);
    
    if (!result.success) {
      setError(result.message || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <main className="h-screen w-screen bg-[#05070f] flex items-center justify-center relative overflow-hidden select-none cyber-grid font-sans">
      {/* Dynamic Cyber Orbs */}
      <div className="absolute w-[600px] h-[600px] bg-cyber-cyan/5 rounded-full blur-[120px] -top-20 -left-20 pointer-events-none"></div>
      <div className="absolute w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] -bottom-20 -right-20 pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md p-8 rounded-xl bg-slate-950/80 border border-cyber-border/80 backdrop-blur-xl relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
      >
        {/* Glow boarder accent */}
        <div className="absolute inset-0 rounded-xl border border-cyber-cyan/20 pointer-events-none"></div>

        {/* Branding header */}
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <div className="w-12 h-12 rounded bg-slate-900 border border-cyber-cyan/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,245,255,0.15)] mb-1">
            <Shield size={22} className="text-cyber-cyan" />
          </div>
          <h2 className="font-extrabold text-xl tracking-wider text-slate-100 uppercase">
            Hacker<span className="text-cyber-cyan">Safe</span> SIEM
          </h2>
          <p className="text-xs font-mono text-slate-400 uppercase tracking-wide">
            Authorization Portal & Identity Check
          </p>
        </div>

        {/* Form panel */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Error Alert */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-start gap-2 text-left"
            >
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Email field */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              operator email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@hackersafe.com"
                className="w-full pl-10 pr-4 py-2.5 rounded bg-slate-900 border border-cyber-border text-slate-200 text-sm font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyber-cyan transition-colors"
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              access token password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded bg-slate-900 border border-cyber-border text-slate-200 text-sm font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyber-cyan transition-colors"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Action button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded bg-gradient-to-r from-cyber-cyan/90 to-blue-600/90 hover:from-cyber-cyan hover:to-blue-600 text-slate-950 font-extrabold uppercase text-xs tracking-widest shadow-[0_0_15px_rgba(0,245,255,0.25)] hover:shadow-[0_0_25px_rgba(0,245,255,0.45)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? 'AUTHENTICATING OPERATIONS...' : 'AUTHORIZE INTRUSION FEED'}
          </button>
        </form>

        {/* Demo Helper box */}
        <div className="mt-6 p-3 rounded bg-slate-900/60 border border-cyber-border/40 text-[10px] font-mono text-slate-400 text-left">
          <span className="text-cyber-cyan font-bold uppercase">Sandbox Credentials:</span>
          <div className="mt-1">Email: <span className="text-slate-200 select-all">admin@hackersafe.com</span></div>
          <div>Password: <span className="text-slate-200 select-all">adminpassword123</span></div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <span>New security analyst? </span>
          <Link href="/signup" className="text-cyber-cyan font-semibold hover:underline">
            Register operator ID
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
