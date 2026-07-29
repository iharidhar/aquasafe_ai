/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { 
  Users, Droplets, MapPin, Clock, AlertCircle, 
  Send, Wrench, Building2, CheckCircle2, Activity, 
  Check, Navigation, HeartPulse, HelpCircle
} from 'lucide-react';
import { Case } from '../types';

export default function VolunteerUploads() {
  const { cases, volunteers, takeAdminAction, updateCaseStatus } = useApp();
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string>('all');
  const [dispatchingCase, setDispatchingCase] = useState<Case | null>(null);
  
  // Mapped short ID helper (converts CASE-2026-001 to AQ-1001)
  const getShortId = (id: string) => {
    const num = id.split('-').pop();
    return `AQ-${num ? (1000 + parseInt(num)).toString() : '1001'}`;
  };

  // Priority mapping based on risk
  const getPriorityInfo = (risk: string | undefined) => {
    switch (risk) {
      case 'Critical':
        return { code: 'P0', label: 'CRITICAL', colorClass: 'text-rose-400 border-rose-500/30 bg-rose-500/10' };
      case 'High':
        return { code: 'P1', label: 'HIGH', colorClass: 'text-amber-400 border-amber-500/30 bg-amber-500/10' };
      case 'Medium':
        return { code: 'P2', label: 'MEDIUM', colorClass: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' };
      default:
        return { code: 'P3', label: 'LOW', colorClass: 'text-slate-400 border-slate-500/30 bg-slate-500/10' };
    }
  };

  // Filter cases for columns based on the selected volunteer
  const volunteerFilteredCases = selectedVolunteerId === 'all'
    ? cases
    : cases.filter(c => {
        const vol = volunteers.find(v => v.id === selectedVolunteerId);
        if (!vol) return false;
        return c.assignedVolunteer === vol.name || c.assignedVolunteer.toLowerCase().includes(vol.username.toLowerCase());
      });

  const pendingCases = volunteerFilteredCases.filter(c => !c.adminResponse && c.status !== 'Resolved');
  const assignedCases = volunteerFilteredCases.filter(c => c.adminResponse && c.status === 'Government Action');
  const inProgressCases = volunteerFilteredCases.filter(c => c.status === 'In Progress');
  const resolvedCases = volunteerFilteredCases.filter(c => c.status === 'Resolved');

  // Handle department dispatch from the modal
  const handleDispatch = (caseId: string, department: 'ASHA Workers' | 'Medical Support' | 'Sewage Cleaners' | 'Assign Support') => {
    const note = `Dispatched ${department} team for rapid containment.`;
    takeAdminAction(caseId, department, note);
    setDispatchingCase(null);
  };

  // Move from Assigned -> In Progress
  const handleMoveToInProgress = (caseId: string) => {
    updateCaseStatus(caseId, 'In Progress', 'Assigned team is now on-site and active.');
  };

  // Move from In Progress -> Resolved
  const handleMoveToResolved = (caseId: string) => {
    takeAdminAction(caseId, 'Closed', 'Solution fully executed and water source sanitized.');
  };

  // Helper to render current assignee body on a card
  const renderDepartmentInfo = (c: Case) => {
    if (!c.adminResponse) {
      return (
        <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/30 p-2 rounded-xl border border-slate-800/40">
          <span className="flex items-center gap-1.5 font-medium"><Navigation className="w-3.5 h-3.5 text-slate-500" /> Unassigned</span>
          <span className="font-mono text-[10px] text-slate-500 font-bold">ETA 1h</span>
        </div>
      );
    }

    const { actionType } = c.adminResponse;
    switch (actionType) {
      case 'ASHA Workers':
        return (
          <div className="flex items-center justify-between text-xs text-cyan-300 bg-cyan-950/25 p-2 rounded-xl border border-cyan-500/20">
            <span className="flex items-center gap-1.5 font-bold"><Droplets className="w-3.5 h-3.5 text-cyan-400" /> Sanitation Dept</span>
            <span className="font-mono text-[10px] text-cyan-400 font-bold">ETA 2h</span>
          </div>
        );
      case 'Medical Support':
        return (
          <div className="flex items-center justify-between text-xs text-sky-300 bg-sky-950/25 p-2 rounded-xl border border-sky-500/20">
            <span className="flex items-center gap-1.5 font-bold"><HeartPulse className="w-3.5 h-3.5 text-sky-400" /> Medical Support</span>
            <span className="font-mono text-[10px] text-sky-400 font-bold">ETA 2h</span>
          </div>
        );
      case 'Sewage Cleaners':
        return (
          <div className="flex items-center justify-between text-xs text-amber-300 bg-amber-950/25 p-2 rounded-xl border border-amber-500/20">
            <span className="flex items-center gap-1.5 font-bold"><Wrench className="w-3.5 h-3.5 text-amber-400" /> Sewage Clearers</span>
            <span className="font-mono text-[10px] text-amber-400 font-bold">ETA 3h</span>
          </div>
        );
      case 'Assign Support':
        return (
          <div className="flex items-center justify-between text-xs text-purple-300 bg-purple-950/25 p-2 rounded-xl border border-purple-500/20">
            <span className="flex items-center gap-1.5 font-bold"><Building2 className="w-3.5 h-3.5 text-purple-400" /> Water Board</span>
            <span className="font-mono text-[10px] text-purple-400 font-bold">ETA 4h</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/25 p-2 rounded-xl border border-slate-500/20">
            <span className="flex items-center gap-1.5 font-bold"><Users className="w-3.5 h-3.5 text-slate-400" /> Custom Support</span>
            <span className="font-mono text-[10px] text-slate-400 font-bold">ETA 4h</span>
          </div>
        );
    }
  };

  return (
    <div className="-mx-4 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8 p-6 sm:p-8 bg-[#070c19] text-slate-100 min-h-[calc(100vh-64px)] flex flex-col justify-between relative overflow-hidden font-sans">
      
      {/* Background neon ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      <div className="space-y-6">
        {/* Header Block */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800/60 pb-6">
          <div className="space-y-1">
            <span className="text-[#06b6d4] font-black text-xs tracking-widest font-mono uppercase block">GOVERNMENT DISPATCH</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
              High-priority response queue
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl font-medium leading-relaxed mt-1">
              P0 & P1 cases auto-flagged by AquaSafe AI. Assign the right government body — Sanitation, Medical Support, Sewage Clearers, or Water Board — and track resolution.
            </p>

            {/* Department chips row */}
            <div className="flex flex-wrap gap-2.5 mt-4">
              <span className="px-3 py-1.5 bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.05)]">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Sanitation Dept
              </span>
              <span className="px-3 py-1.5 bg-blue-950/40 border border-blue-500/20 text-blue-300 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_10px_rgba(59,130,246,0.05)]">
                <HeartPulse className="w-3.5 h-3.5 text-blue-400" /> Medical Support
              </span>
              <span className="px-3 py-1.5 bg-amber-950/40 border border-amber-500/20 text-amber-300 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.05)]">
                <Wrench className="w-3.5 h-3.5 text-amber-400" /> Sewage Clearers
              </span>
              <span className="px-3 py-1.5 bg-purple-950/40 border border-purple-500/20 text-purple-300 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_10px_rgba(168,85,247,0.05)]">
                <Building2 className="w-3.5 h-3.5 text-purple-400" /> Water Board
              </span>
            </div>
          </div>

          {/* Right stat badges */}
          <div className="flex flex-wrap gap-3 self-start lg:self-center">
            <div className="border border-rose-500/20 bg-rose-500/5 text-rose-400 font-bold px-4 py-2 rounded-full text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.05)] font-mono">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>P0 CRITICAL</span>
              <span className="bg-rose-500/20 px-2 py-0.5 rounded text-white font-black">{cases.filter(c => c.prediction?.riskLevel === 'Critical' && c.status !== 'Resolved').length}</span>
            </div>
            <div className="border border-amber-500/20 bg-amber-500/5 text-amber-400 font-bold px-4 py-2 rounded-full text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.05)] font-mono">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>P1 HIGH</span>
              <span className="bg-amber-500/20 px-2 py-0.5 rounded text-white font-black">{cases.filter(c => c.prediction?.riskLevel === 'High' && c.status !== 'Resolved').length}</span>
            </div>
            <div className="border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 font-bold px-4 py-2 rounded-full text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.05)] font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>RESOLVED</span>
              <span className="bg-emerald-500/20 px-2 py-0.5 rounded text-white font-black">{cases.filter(c => c.status === 'Resolved').length}</span>
            </div>
          </div>
        </div>

        {/* Volunteer Selector Tabs */}
        <div className="space-y-2 text-left">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Filter by Outbreak Ward Team:</span>
          <div className="flex flex-wrap items-center gap-2 bg-slate-900/40 p-1.5 border border-slate-800/80 rounded-2xl max-w-fit">
            <button
              onClick={() => setSelectedVolunteerId('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedVolunteerId === 'all'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              All Submissions
            </button>
            {volunteers.map(v => (
              <button
                key={v.id}
                onClick={() => setSelectedVolunteerId(v.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  selectedVolunteerId === v.id
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span>{v.name}</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700/60 font-mono">
                  {cases.filter(c => c.assignedVolunteer === v.name || c.assignedVolunteer.toLowerCase().includes(v.username.toLowerCase())).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* The 4-Column Board Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start mt-6">
          {/* Column 1: Pending */}
          <div className="space-y-4 bg-slate-900/15 border border-slate-800/40 p-4.5 rounded-3xl flex flex-col min-h-[550px] shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800/50 pb-3">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Pending</span>
              </h3>
              <span className="bg-slate-800 border border-slate-700/60 text-slate-300 font-mono text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                {pendingCases.length}
              </span>
            </div>

            <div className="flex-1 flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {pendingCases.length === 0 ? (
                  <div className="my-auto py-12 text-center text-xs text-slate-500 font-medium flex flex-col items-center justify-center gap-2">
                    <HelpCircle className="w-8 h-8 text-slate-700" />
                    <span>No pending cases</span>
                  </div>
                ) : (
                  pendingCases.map(c => {
                    const priority = getPriorityInfo(c.prediction?.riskLevel);
                    return (
                      <motion.div
                        key={c.id}
                        layout
                        layoutId={c.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="bg-[#0c1329]/95 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 shadow-lg shadow-black/10 hover:shadow-cyan-500/5 hover:border-slate-700 transition-all duration-300 relative overflow-hidden text-left flex flex-col gap-3"
                      >
                        <div className={`absolute top-0 left-0 right-0 h-[3px] ${priority.code === 'P0' ? 'bg-rose-500' : priority.code === 'P1' ? 'bg-amber-500' : 'bg-cyan-500'}`} />
                        
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-mono font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/40">{getShortId(c.id)}</span>
                          <div className="flex gap-1">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${priority.colorClass}`}>{priority.code}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${priority.colorClass}`}>{priority.label}</span>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-white text-sm tracking-tight">{c.citizenName}</h4>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5">{c.village} • {c.waterDetails.source}</p>
                        </div>

                        {renderDepartmentInfo(c)}

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/50 mt-1">
                          <button
                            onClick={() => setDispatchingCase(c)}
                            className="py-1.5 px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-[11px] rounded-lg transition-all shadow-md shadow-cyan-500/10 cursor-pointer text-center"
                          >
                            Assign body
                          </button>
                          <button
                            onClick={() => setDispatchingCase(c)}
                            className="py-1.5 px-3 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-bold text-[11px] rounded-lg transition-all text-center cursor-pointer flex items-center justify-center gap-1"
                          >
                            <span>Move</span>
                            <span className="text-xs">→</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Column 2: Assigned */}
          <div className="space-y-4 bg-slate-900/15 border border-slate-800/40 p-4.5 rounded-3xl flex flex-col min-h-[550px] shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800/50 pb-3">
              <h3 className="text-xs font-black uppercase text-[#06b6d4] tracking-wider flex items-center gap-1.5">
                <Send className="w-4 h-4 text-[#06b6d4]" />
                <span>Assigned</span>
              </h3>
              <span className="bg-[#06b6d4]/10 border border-[#06b6d4]/30 text-[#06b6d4] font-mono text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                {assignedCases.length}
              </span>
            </div>

            <div className="flex-1 flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {assignedCases.length === 0 ? (
                  <div className="my-auto py-12 text-center text-xs text-slate-500 font-medium flex flex-col items-center justify-center gap-2">
                    <HelpCircle className="w-8 h-8 text-slate-700" />
                    <span>No assigned cases</span>
                  </div>
                ) : (
                  assignedCases.map(c => {
                    const priority = getPriorityInfo(c.prediction?.riskLevel);
                    return (
                      <motion.div
                        key={c.id}
                        layout
                        layoutId={c.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="bg-[#0c1329]/95 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 shadow-lg shadow-black/10 hover:shadow-cyan-500/5 hover:border-slate-700 transition-all duration-300 relative overflow-hidden text-left flex flex-col gap-3"
                      >
                        <div className={`absolute top-0 left-0 right-0 h-[3px] ${priority.code === 'P0' ? 'bg-rose-500' : priority.code === 'P1' ? 'bg-amber-500' : 'bg-cyan-500'}`} />
                        
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-mono font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/40">{getShortId(c.id)}</span>
                          <div className="flex gap-1">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${priority.colorClass}`}>{priority.code}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${priority.colorClass}`}>{priority.label}</span>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-white text-sm tracking-tight">{c.citizenName}</h4>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5">{c.village} • {c.waterDetails.source}</p>
                        </div>

                        {renderDepartmentInfo(c)}

                        <div className="pt-2 border-t border-slate-800/50 mt-1">
                          <button
                            onClick={() => handleMoveToInProgress(c.id)}
                            className="w-full py-1.5 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-bold text-[11px] rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>Move</span>
                            <span className="text-xs">→</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Column 3: In Progress */}
          <div className="space-y-4 bg-slate-900/15 border border-slate-800/40 p-4.5 rounded-3xl flex flex-col min-h-[550px] shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800/50 pb-3">
              <h3 className="text-xs font-black uppercase text-amber-500 tracking-wider flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-amber-500" />
                <span>In Progress</span>
              </h3>
              <span className="bg-amber-500/10 border border-amber-500/30 text-amber-500 font-mono text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                {inProgressCases.length}
              </span>
            </div>

            <div className="flex-1 flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {inProgressCases.length === 0 ? (
                  <div className="my-auto py-12 text-center text-xs text-slate-500 font-medium flex flex-col items-center justify-center gap-2">
                    <HelpCircle className="w-8 h-8 text-slate-700" />
                    <span>No active cases</span>
                  </div>
                ) : (
                  inProgressCases.map(c => {
                    const priority = getPriorityInfo(c.prediction?.riskLevel);
                    return (
                      <motion.div
                        key={c.id}
                        layout
                        layoutId={c.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="bg-[#0c1329]/95 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 shadow-lg shadow-black/10 hover:shadow-cyan-500/5 hover:border-slate-700 transition-all duration-300 relative overflow-hidden text-left flex flex-col gap-3"
                      >
                        <div className={`absolute top-0 left-0 right-0 h-[3px] ${priority.code === 'P0' ? 'bg-rose-500' : priority.code === 'P1' ? 'bg-amber-500' : 'bg-cyan-500'}`} />
                        
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-mono font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/40">{getShortId(c.id)}</span>
                          <div className="flex gap-1">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${priority.colorClass}`}>{priority.code}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${priority.colorClass}`}>{priority.label}</span>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-white text-sm tracking-tight">{c.citizenName}</h4>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5">{c.village} • {c.waterDetails.source}</p>
                        </div>

                        {renderDepartmentInfo(c)}

                        <div className="pt-2 border-t border-slate-800/50 mt-1">
                          <button
                            onClick={() => handleMoveToResolved(c.id)}
                            className="w-full py-1.5 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-bold text-[11px] rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>Move</span>
                            <span className="text-xs">→</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Column 4: Resolved */}
          <div className="space-y-4 bg-slate-900/15 border border-slate-800/40 p-4.5 rounded-3xl flex flex-col min-h-[550px] shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800/50 pb-3">
              <h3 className="text-xs font-black uppercase text-emerald-500 tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Resolved</span>
              </h3>
              <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-mono text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                {resolvedCases.length}
              </span>
            </div>

            <div className="flex-1 flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {resolvedCases.length === 0 ? (
                  <div className="my-auto py-12 text-center text-xs text-slate-500 font-medium flex flex-col items-center justify-center gap-2">
                    <HelpCircle className="w-8 h-8 text-slate-700" />
                    <span>No resolved cases</span>
                  </div>
                ) : (
                  resolvedCases.map(c => {
                    const priority = getPriorityInfo(c.prediction?.riskLevel);
                    return (
                      <motion.div
                        key={c.id}
                        layout
                        layoutId={c.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="bg-[#0c1329]/95 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 shadow-lg shadow-black/10 hover:shadow-cyan-500/5 hover:border-slate-700 transition-all duration-300 relative overflow-hidden text-left flex flex-col gap-3"
                      >
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-emerald-500" />
                        
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-mono font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/40">{getShortId(c.id)}</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono uppercase">RESOLVED</span>
                        </div>

                        <div>
                          <h4 className="font-bold text-white text-sm tracking-tight">{c.citizenName}</h4>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5">{c.village} • {c.waterDetails.source}</p>
                        </div>

                        {renderDepartmentInfo(c)}
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Dispatch Modal Dialog (Image 2 styling) */}
      <AnimatePresence>
        {dispatchingCase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDispatchingCase(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-md bg-[#091124] border border-slate-800/80 p-6 rounded-3xl shadow-2xl flex flex-col gap-5 z-10 text-left"
            >
              {/* Header section */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center text-rose-500 shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-bold text-slate-500 tracking-wider uppercase block">DISPATCH</span>
                  <h2 className="text-xl font-black text-white leading-tight">
                    {dispatchingCase.citizenName} • {getShortId(dispatchingCase.id)}
                  </h2>
                </div>
              </div>

              {/* Sub-explanation */}
              <p className="text-xs text-slate-400 leading-relaxed">
                Select a government body to respond to this case.
              </p>

              {/* Selection Options Grid */}
              <div className="grid grid-cols-2 gap-3.5 mt-1">
                {/* 1. Sanitation Dept */}
                <button
                  onClick={() => handleDispatch(dispatchingCase.id, 'ASHA Workers')}
                  className="bg-[#0c1630]/80 border border-slate-800/80 p-4 rounded-2xl flex flex-col items-start gap-1 text-left cursor-pointer hover:border-cyan-500/50 hover:bg-[#0f2046]/80 transition-all duration-200 group shadow-lg"
                >
                  <Droplets className="w-5 h-5 text-cyan-400 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">Sanitation Dept</span>
                  <span className="text-[10px] text-slate-500">Response • &lt; 4h</span>
                </button>

                {/* 2. Medical Support */}
                <button
                  onClick={() => handleDispatch(dispatchingCase.id, 'Medical Support')}
                  className="bg-[#0c1630]/80 border border-slate-800/80 p-4 rounded-2xl flex flex-col items-start gap-1 text-left cursor-pointer hover:border-sky-500/50 hover:bg-[#0f2046]/80 transition-all duration-200 group shadow-lg"
                >
                  <HeartPulse className="w-5 h-5 text-sky-400 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">Medical Support</span>
                  <span className="text-[10px] text-slate-500">Response • &lt; 4h</span>
                </button>

                {/* 3. Sewage Clearers */}
                <button
                  onClick={() => handleDispatch(dispatchingCase.id, 'Sewage Cleaners')}
                  className="bg-[#0c1630]/80 border border-slate-800/80 p-4 rounded-2xl flex flex-col items-start gap-1 text-left cursor-pointer hover:border-amber-500/50 hover:bg-[#0f2046]/80 transition-all duration-200 group shadow-lg"
                >
                  <Wrench className="w-5 h-5 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">Sewage Clearers</span>
                  <span className="text-[10px] text-slate-500">Response • &lt; 4h</span>
                </button>

                {/* 4. Water Board */}
                <button
                  onClick={() => handleDispatch(dispatchingCase.id, 'Assign Support')}
                  className="bg-[#0c1630]/80 border border-slate-800/80 p-4 rounded-2xl flex flex-col items-start gap-1 text-left cursor-pointer hover:border-purple-500/50 hover:bg-[#0f2046]/80 transition-all duration-200 group shadow-lg"
                >
                  <Building2 className="w-5 h-5 text-purple-400 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">Water Board</span>
                  <span className="text-[10px] text-slate-500">Response • &lt; 4h</span>
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setDispatchingCase(null)}
                className="text-xs text-slate-500 hover:text-slate-300 font-extrabold tracking-wide mt-2 block mx-auto py-2 px-6 rounded-xl cursor-pointer hover:bg-slate-900/60 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
