/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Shield, Droplets, Users, ArrowRight, UserCheck, Lock, Check, BookOpen } from 'lucide-react';

export default function LandingPage() {
  const { login } = useApp();
  const [role, setRole] = useState<'volunteer' | 'admin'>('volunteer');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username or email ID.');
      return;
    }
    setError('');
    setLoading(true);

    setTimeout(async () => {
      try {
        const success = await login(role, username, password);
        setLoading(false);
        if (!success) {
          setError('Invalid username or password for the selected portal role.');
        }
      } catch (err) {
        setLoading(false);
        setError('An error occurred during authentication.');
      }
    }, 800);
  };

  const setDemoVolunteer = () => {
    setRole('volunteer');
    setUsername('Sneha_Patil');
    setPassword('demo1234');
  };

  const setDemoAdmin = () => {
    setRole('admin');
    setUsername('admin');
    setPassword('admin@123');
  };

  return (
    <div className="min-h-screen relative bg-slate-900 overflow-hidden flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Wave Background Overlay */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <svg className="absolute bottom-0 w-[200%] h-[40%] animate-wave" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,60 C150,100 350,20 500,60 C650,100 850,20 1000,60 C1150,100 1350,20 1500,60 L1500,120 L0,120 Z" fill="url(#wave-grad-1)"></path>
          <defs>
            <linearGradient id="wave-grad-1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0e7490" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
            </linearGradient>
          </defs>
        </svg>
        <svg className="absolute bottom-0 w-[200%] h-[35%] animate-wave opacity-50" style={{ animationDelay: '-4s' }} viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,40 C180,80 300,10 480,40 C660,70 800,10 980,40 C1160,70 1300,10 1480,40 L1480,120 L0,120 Z" fill="url(#wave-grad-2)"></path>
          <defs>
            <linearGradient id="wave-grad-2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Floating Bubbles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-cyan-500/10 backdrop-blur-xs animate-float"
            style={{
              width: `${(i + 1) * 16}px`,
              height: `${(i + 1) * 16}px`,
              left: `${10 + i * 15}%`,
              bottom: `${15 + (i * 12) % 40}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${4 + i}s`
            }}
          />
        ))}
      </div>

      {/* Main Grid Wrapper */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

        {/* Left Column - Hero branding */}
        <div className="lg:col-span-7 space-y-8 text-left text-white pr-0 lg:pr-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-800/50"
          >
            <Droplets className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider text-cyan-200 uppercase font-display">AquaSafe Government Portal</span>
          </motion.div>

          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl font-extrabold font-display leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-400"
            >
              AI-Based Water Contamination & Waterborne Disease Risk System
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed"
            >
              Empowering local health volunteers and municipal officers to predict, detect, and isolate biological water contaminants before they trigger critical outbreaks.
            </motion.p>
          </div>

          {/* Quick Statistics Grid */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {[
              { label: 'Verified Cases', value: '142', icon: <Shield className="w-4 h-4" /> },
              { label: 'Villages Covered', value: '38', icon: <Droplets className="w-4 h-4" /> },
              { label: 'Active Volunteers', value: '18', icon: <Users className="w-4 h-4" /> },
              { label: 'AI Diagnostic Accuracy', value: '98.4%', icon: <BookOpen className="w-4 h-4" /> }
            ].map((stat, idx) => (
              <div key={idx} className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3.5 hover:border-slate-700/80 transition-colors">
                <div className="text-cyan-400 mb-1">{stat.icon}</div>
                <div className="text-xl font-bold tracking-tight font-display text-white">{stat.value}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">{stat.label}</div>
              </div>
            ))}
          </motion.div>


        </div>

        {/* Right Column - Sliding Auth Card */}
        <div className="lg:col-span-5 w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full bg-white/95 dark:bg-slate-900/90 rounded-2xl border border-slate-200/50 shadow-2xl p-6 sm:p-8 backdrop-blur-md relative"
          >
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold font-display text-slate-800">Secure Access Portal</h2>
            </div>

            {/* Sliding Tab Toggle */}
            <div className="relative bg-slate-100 p-1 rounded-xl flex items-center mb-6 border border-slate-200/40">
              <button
                onClick={() => setRole('volunteer')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 z-10 transition-colors cursor-pointer ${role === 'volunteer' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                <Users className="w-4 h-4" />
                Volunteer Gate
              </button>
              <button
                onClick={() => setRole('admin')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 z-10 transition-colors cursor-pointer ${role === 'admin' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                <Shield className="w-4 h-4" />
                Admin Officer
              </button>

              {/* Slider highlight background */}
              <motion.div
                className="absolute top-1 bottom-1 left-1 bg-white rounded-lg shadow-sm"
                layoutId="roleSlider"
                style={{ width: 'calc(50% - 4px)' }}
                animate={{ x: role === 'admin' ? '100%' : '0%' }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Username or ID</label>
                <div className="relative">
                  <UserCheck className="w-4.5 h-4.5 absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:outline-none text-white text-sm placeholder:text-slate-300 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  <a href="#" className="text-[11px] text-cyan-600 hover:underline">Forgot?</a>
                </div>
                <div className="relative">
                  <Lock className="w-4.5 h-4.5 absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}

                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:outline-none text-white text-sm placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-500">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="hidden"
                  />
                  <div className={`w-4 h-4 rounded-sm border ${rememberMe ? 'bg-cyan-600 border-cyan-600' : 'border-slate-300'} flex items-center justify-center transition-colors`}>
                    {rememberMe && <Check className="w-3 h-3 text-white" />}
                  </div>
                  Remember me
                </label>
              </div>

              {error && (
                <div className="p-3 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 active:scale-98 text-white font-semibold text-sm shadow-md shadow-cyan-600/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
