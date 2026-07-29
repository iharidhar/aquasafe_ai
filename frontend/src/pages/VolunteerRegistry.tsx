/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { User, Shield, Lock, MapPin, Mail, Key, UserPlus, Search, CheckCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';

export default function VolunteerRegistry() {
  const { volunteers, registerVolunteer } = useApp();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [villageAssigned, setVillageAssigned] = useState('Kanakapura');
  const [email, setEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [successMsg, setSuccessMsg] = useState('');

  const generateCredentials = () => {
    if (!name) return;
    const cleanName = name.trim().replace(/\s+/g, '_');
    setUsername(cleanName);
    setPassword('pass_' + Math.floor(1000 + Math.random() * 9000));
    setEmail(cleanName.toLowerCase() + '@aquasafe.org');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !password.trim() || !villageAssigned.trim() || !email.trim()) {
      alert('Please fill out all fields or auto-generate credentials.');
      return;
    }

    registerVolunteer({
      name: name.trim(),
      username: username.trim(),
      password: password.trim(),
      villageAssigned: villageAssigned.trim(),
      email: email.trim(),
      district: 'Ramanagara'
    });

    setSuccessMsg(`Successfully registered ${name.trim()}! Login credentials generated.`);
    setName('');
    setUsername('');
    setPassword('');
    setEmail('');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredVolunteers = volunteers.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.villageAssigned.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-800">Volunteer Registry</h1>
        <p className="text-xs text-slate-400">Register new health volunteers, configure service zones, and view authorized portal access credentials.</p>
      </div>

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2"
        >
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Column */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <div className="p-1.5 bg-cyan-50 text-cyan-600 rounded-lg">
                <UserPlus className="w-4 h-4" />
              </div>
              <h2 className="font-semibold text-slate-800 text-sm font-display">New Volunteer Registration</h2>
            </div>

            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-500">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!username) {
                        setUsername(e.target.value.trim().replace(/\s+/g, '_'));
                      }
                    }}
                    placeholder="e.g. Ramesh Gowda"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-cyan-500 focus:outline-none text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-slate-500">Village Assigned</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={villageAssigned}
                      onChange={(e) => setVillageAssigned(e.target.value)}
                      placeholder="e.g. Kanakapura"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-cyan-500 focus:outline-none text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-slate-500">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ramesh@aquasafe.org"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-cyan-500 focus:outline-none text-slate-700"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Login Credentials</span>
                  <button
                    type="button"
                    onClick={generateCredentials}
                    disabled={!name}
                    className="text-[10px] text-cyan-600 font-bold flex items-center gap-1 hover:text-cyan-700 disabled:opacity-55 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Auto-Generate
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-bold text-slate-500">Authorized Username</label>
                    <div className="relative">
                      <Key className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Ramesh_Gowda"
                        className="w-full pl-8 pr-2 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-cyan-500 focus:outline-none text-slate-700 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-bold text-slate-500">Portal Password</label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="e.g. demo1234"
                        className="w-full pl-8 pr-2 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-cyan-500 focus:outline-none text-slate-700 font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                Register & Lock Credentials
              </button>
            </form>
          </div>
        </div>

        {/* Right Active Volunteers Column */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-50 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-50 text-slate-600 rounded-lg">
                  <Shield className="w-4 h-4" />
                </div>
                <h2 className="font-semibold text-slate-800 text-sm font-display">Active Staff Registrations ({filteredVolunteers.length})</h2>
              </div>

              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search staff..."
                  className="w-full pl-8 pr-3 py-1.5 text-[11px] rounded-lg border border-slate-200 focus:border-cyan-500 focus:outline-none text-slate-700"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100 overflow-y-auto max-h-[440px] pr-1">
              {filteredVolunteers.map(vol => (
                <div key={vol.id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 text-xs sm:text-sm">{vol.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        vol.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-200'
                      }`}>{vol.status}</span>
                    </div>

                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {vol.villageAssigned}
                      </span>
                      <span>•</span>
                      <span>{vol.email}</span>
                    </div>
                  </div>

                  {/* Login Credentials Box */}
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl w-full sm:w-auto text-left flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-[9px] text-slate-400 uppercase font-bold">Portal Access</div>
                      <div className="text-[10px] font-mono text-slate-600">
                        UID: <b className="text-slate-800">{vol.username}</b>
                      </div>
                      <div className="text-[10px] font-mono text-slate-600 flex items-center gap-1.5">
                        Pass: <b className="text-slate-800">{showPassword[vol.id] ? (vol.password || 'demo1234') : '••••••••'}</b>
                      </div>
                    </div>
                    <button
                      onClick={() => togglePasswordVisibility(vol.id)}
                      className="p-1.5 hover:bg-slate-200/55 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
                    >
                      {showPassword[vol.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
