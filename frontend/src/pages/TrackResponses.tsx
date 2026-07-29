/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { StatusBadge, RiskBadge } from '../components/DashboardComponents';
import { 
  Clock, MapPin, CheckCircle2, AlertTriangle, ShieldAlert, 
  Sparkles, FileText, Send, UserCheck, Calendar, Eye, Search,
  Check, Info, HelpCircle, Activity, Droplets, HeartPulse, Trash2
} from 'lucide-react';

export default function TrackResponses() {
  const { cases, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Filter cases uploaded by this volunteer
  const volunteerName = currentUser?.name || 'Sneha Patil';
  const volunteerCases = cases.filter(c => 
    c.assignedVolunteer === volunteerName || 
    c.assignedVolunteer.toLowerCase().includes(currentUser?.username?.toLowerCase() || '')
  );

  const filteredCases = volunteerCases.filter(c => 
    c.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.village.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCase = filteredCases.find(c => c.id === selectedCaseId) || filteredCases[0];

  const getActionEmoji = (actionType: string) => {
    switch (actionType) {
      case 'ASHA Workers': return '👨‍⚕️';
      case 'Medical Support': return '🚑';
      case 'Sewage Cleaners': return '🧹';
      case 'Chemist': return '🧪';
      case 'Assign Support': return '⚙️';
      case 'Closed': return '✅';
      default: return '📢';
    }
  };

  const getStepStatus = (activeCase: any, stepNum: number) => {
    const status = activeCase.status;
    const hasAdmin = !!activeCase.adminResponse;

    switch (stepNum) {
      case 1: // Survey Submitted
        return { completed: true, label: 'Success', color: 'border-emerald-500 bg-emerald-50 text-emerald-600' };
      case 2: // AI Diagnostic Output
        return { completed: !!activeCase.prediction, label: 'Completed', color: 'border-violet-500 bg-violet-50 text-violet-600' };
      case 3: // Solutions Dispatched
        if (status === 'Resolved' || hasAdmin) {
          return { completed: true, label: 'Dispatched', color: 'border-cyan-500 bg-cyan-50 text-cyan-600' };
        }
        return { completed: false, label: 'Awaiting', color: 'border-amber-400 bg-amber-50 text-amber-500 animate-pulse' };
      case 4: // Case Resolved
        if (status === 'Resolved') {
          return { completed: true, label: 'Resolved', color: 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-500/20' };
        }
        return { completed: false, label: 'Active', color: 'border-slate-300 bg-slate-50 text-slate-400' };
      default:
        return { completed: false, label: '', color: '' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black font-display text-slate-800 tracking-tight flex items-center gap-2">
          <Send className="w-5 h-5 text-cyan-600" /> Track Administrative Responses
        </h1>
        <p className="text-xs text-slate-400 font-medium">Observe live steps and dispatched solution squads assigned to your uploaded surveys to reassure citizens.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        
        {/* Left column - uploaded cases selector with search */}
        <div className="lg:col-span-5 bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl p-4 shadow-lg shadow-slate-100/30 flex flex-col h-[600px]">
          <div className="space-y-3 pb-3 border-b border-slate-50">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Your Outbreak Submissions ({filteredCases.length})</span>
            
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search citizen, block, or ID..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-cyan-500 focus:outline-none text-slate-700"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-50 pr-1 mt-2 space-y-1.5">
            {filteredCases.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 font-medium flex flex-col items-center justify-center gap-2">
                <HelpCircle className="w-8 h-8 text-slate-300" />
                <span>No reports registered to your account yet.</span>
              </div>
            ) : (
              filteredCases.map(c => {
                const isSelected = activeCase?.id === c.id;
                const step3 = getStepStatus(c, 3);
                const step4 = getStepStatus(c, 4);

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCaseId(c.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                      isSelected 
                        ? 'bg-gradient-to-r from-cyan-50/50 to-teal-50/20 border-cyan-200/60 shadow-xs' 
                        : 'bg-white border-transparent hover:bg-slate-50/60 hover:border-slate-100'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 text-xs sm:text-sm">{c.citizenName}</span>
                        {c.prediction?.riskLevel && <RiskBadge risk={c.prediction.riskLevel} className="scale-75 origin-left" />}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3 text-cyan-600" /> {c.village} • <span className="font-mono text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">{c.id}</span>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <StatusBadge status={c.status} className="scale-85 origin-right" />
                      
                      {c.adminResponse ? (
                        <div className="text-[9px] font-extrabold text-cyan-600 flex items-center justify-end gap-1.5 bg-cyan-50/60 border border-cyan-100/50 px-1.5 py-0.5 rounded-md">
                          <span>{getActionEmoji(c.adminResponse.actionType)}</span>
                          <span>Dispatched</span>
                        </div>
                      ) : (
                        <div className="text-[9px] font-bold text-amber-500 flex items-center justify-end gap-1.5 bg-amber-50 border border-amber-100/60 px-1.5 py-0.5 rounded-md animate-pulse">
                          <span>⏳</span>
                          <span>Pending Action</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right column - highly visual clinical timeline receipt */}
        <div className="lg:col-span-7 h-[600px] flex flex-col">
          <AnimatePresence mode="wait">
            {activeCase ? (
              <motion.div
                key={activeCase.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl p-5 shadow-lg shadow-slate-100/30 space-y-5 flex-1 overflow-y-auto"
              >
                {/* Visual Official Case Header Receipt */}
                <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300 ${
                  activeCase.status === 'Resolved' 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white border-emerald-500/30' 
                    : activeCase.adminResponse
                      ? 'bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 text-white border-cyan-800/40'
                      : 'bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white border-amber-800/40'
                }`}>
                  <div className="space-y-1 text-left">
                    <span className={`text-[9px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded-md ${
                      activeCase.status === 'Resolved' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-cyan-400'
                    }`}>
                      Outbreak Resolution File
                    </span>
                    <h2 className="text-base font-black font-display tracking-tight">{activeCase.citizenName}</h2>
                    <p className="text-[10px] text-slate-300/80 font-mono">UUID: {activeCase.id} • Registered Sector: {activeCase.village}</p>
                  </div>
                  
                  <div className={`px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-sm flex items-center gap-1.5 ${
                    activeCase.status === 'Resolved'
                      ? 'bg-white text-emerald-800 border border-white'
                      : 'bg-slate-800 text-amber-400 border border-slate-700 animate-pulse'
                  }`}>
                    {activeCase.status === 'Resolved' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                        <span>Resolution Completed</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        <span>Awaiting Solutions</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Patient Summary Matrix */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                  <div className="space-y-1.5 text-left">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Field Diagnostic Record</span>
                    <p className="text-slate-600">Age & Sex: <b className="text-slate-800 font-semibold">{activeCase.citizenAge}y / {activeCase.citizenGender}</b></p>
                    <p className="text-slate-600">Secure Phone: <b className="text-slate-800 font-semibold">{activeCase.citizenPhone}</b></p>
                    <p className="text-slate-600">Home Water Source: <b className="text-slate-800 font-semibold">{activeCase.waterDetails.source}</b></p>
                    <p className="text-slate-600">H₂S Biological test: <b className={activeCase.waterTest.h2sResult === 'Positive' ? 'text-rose-600 font-black' : 'text-emerald-600 font-black'}>{activeCase.waterTest.h2sResult}</b></p>
                  </div>

                  <div className="space-y-1.5 border-l border-slate-200 pl-4 text-left">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">AI Epidemiology Engine</span>
                    <p className="text-slate-600">Forecast Risk: <b className="text-slate-800 font-semibold">{activeCase.prediction?.riskLevel || 'Pending'}</b></p>
                    <p className="text-slate-600">Assigned Pathogens: <b className="text-slate-800 font-semibold">{activeCase.prediction?.likelyContaminant || 'Calculating...'}</b></p>
                    <p className="text-slate-600">Symptom Duration: <b className="text-slate-800 font-semibold">{activeCase.symptomDuration} Days</b></p>
                    <p className="text-slate-600">Multiple Sick In Home: <b className="text-slate-800 font-semibold">{activeCase.familySick ? 'Yes (High Vector)' : 'No'}</b></p>
                  </div>
                </div>

                {/* Progress Steps Timeline From Survey to Close */}
                <div className="space-y-4 text-left">
                  <h3 className="text-xs font-black font-display text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <Activity className="w-4 h-4 text-cyan-600" /> Outbreak Mitigation Steps Completed
                  </h3>

                  <div className="relative border-l-2 border-slate-100 pl-6 ml-3 space-y-5">
                    
                    {/* Step 1: Survey Submitted Card */}
                    <div className="relative">
                      {/* Step Indicator Dot with Tick */}
                      <div className="absolute -left-[35px] top-1 w-6 h-6 rounded-full border-2 border-emerald-500 bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>

                      {/* Step Content Box (Green Accent) */}
                      <div className="p-3.5 bg-gradient-to-r from-emerald-50/50 to-white border border-emerald-100 rounded-2xl space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-emerald-800 text-xs">Step 1: Survey Filed & Locked</span>
                          <span className="text-[9px] font-mono font-bold text-emerald-500">
                            {new Date(activeCase.dateCreated).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Field worker <b>{activeCase.assignedVolunteer}</b> completed the on-site physical contaminants assessment. Water chemistry and demographics filed cleanly to the district administrative databases.
                        </p>
                      </div>
                    </div>

                    {/* Step 2: AI Forecasting Engine Card */}
                    <div className="relative">
                      {/* Step Indicator Dot with Tick */}
                      <div className="absolute -left-[35px] top-1 w-6 h-6 rounded-full border-2 border-violet-500 bg-violet-50 text-violet-600 flex items-center justify-center text-xs font-bold shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>

                      {/* Step Content Box (Violet Accent) */}
                      <div className="p-3.5 bg-gradient-to-r from-violet-50/50 to-white border border-violet-100 rounded-2xl space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-violet-800 text-xs">Step 2: AI Diagnostic Assessment Run</span>
                          <span className="text-[9px] font-mono font-bold text-violet-500 bg-violet-50 px-1.5 py-0.2 rounded">Calculated</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Epidemiological algorithm processed survey vectors (Symptoms: {activeCase.symptoms.join(', ') || 'None'}) to forecast pathogen threats. Outbreak potential identified as: <b className="text-violet-700 uppercase">{activeCase.prediction?.riskLevel} Risk</b>.
                        </p>
                        {activeCase.prediction?.likelyContaminant && (
                          <div className="text-[10px] text-violet-700 bg-violet-50 p-2 rounded-xl border border-violet-100/50">
                            🔬 <b>Likely Contaminant:</b> {activeCase.prediction.likelyContaminant}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step 3: Administrative solutions dispatch Card */}
                    <div className="relative">
                      {/* Step Indicator Dot */}
                      <div className={`absolute -left-[35px] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shadow-xs transition-all duration-300 ${
                        activeCase.adminResponse 
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-600' 
                          : 'border-amber-400 bg-amber-50 text-amber-500 animate-pulse'
                      }`}>
                        {activeCase.adminResponse ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '⏳'}
                      </div>

                      {/* Step Content Box (Cyan/Amber Accent depending on status) */}
                      {activeCase.adminResponse ? (
                        <div className="p-3.5 bg-gradient-to-r from-cyan-50/50 to-white border border-cyan-100 rounded-2xl space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-cyan-800 text-xs">Step 3: District Command Intervention Dispatched</span>
                            <span className="text-[9px] font-mono font-bold text-cyan-500 bg-cyan-50 px-1.5 py-0.2 rounded">Dispatched</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            District Administration reviewed reports and dispatched specialized <b>{activeCase.adminResponse.actionType}</b> support squad to the exact household location.
                          </p>
                          <div className="text-[10px] text-cyan-700 bg-white p-2 rounded-xl border border-cyan-100/50 space-y-0.5">
                            <p>📋 <b>Mitigation Support:</b> {activeCase.adminResponse.actionType}</p>
                            {activeCase.adminResponse.note && <p className="italic text-cyan-600">"Notes: {activeCase.adminResponse.note}"</p>}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 bg-gradient-to-r from-amber-50/40 to-white border border-amber-100 rounded-2xl space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-amber-600 text-xs">Step 3: Administrative Solutions Dispatch</span>
                            <span className="text-[9px] font-mono font-bold text-amber-500 animate-pulse">Awaiting Hub Review</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            The outbreak files are in the District Administration audit pipeline. A specialist solution (ASHA workers, Chemist analysis, or Sanitation cleaners) will be dispatched instantly upon administrative tick.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Step 4: Closed / Resolved Card */}
                    <div className="relative">
                      {/* Step Indicator Dot */}
                      <div className={`absolute -left-[35px] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shadow-xs transition-all duration-300 ${
                        activeCase.status === 'Resolved' 
                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-500/20' 
                          : 'border-slate-200 bg-slate-50 text-slate-400'
                      }`}>
                        {activeCase.status === 'Resolved' ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '🔒'}
                      </div>

                      {/* Step Content Box (Emerald/Slate Accent) */}
                      {activeCase.status === 'Resolved' ? (
                        <div className="p-3.5 bg-gradient-to-r from-emerald-50/60 to-white border border-emerald-200 rounded-2xl space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-emerald-800 text-xs">Step 4: Case Cleared & File Closed</span>
                            <span className="text-[9px] font-mono font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.2 rounded">Resolved</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            Mitigation actions successfully executed at location. The household's water supply concerns were fully sanitized, analyzed, and officially marked as <b>Resolved</b> by district surveillance headquarters.
                          </p>
                        </div>
                      ) : (
                        <div className="p-3.5 bg-slate-50/50 border border-slate-150 rounded-2xl text-slate-400">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-400 text-xs">Step 4: Household Resolution & Case Closure</span>
                            <span className="text-[9px] font-mono font-bold">Active Monitoring</span>
                          </div>
                          <p className="text-[11px] leading-relaxed mt-1">
                            Once active ground solutions finish treating vectors and municipal diagnostics return clean chemistry thresholds, the case file will be formally locked and closed.
                          </p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Verifiable Hub Footprint receipt */}
                <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <UserCheck className="w-4 h-4 text-emerald-500" /> Verifiable Bio-surveillance hub receipt
                  </span>
                  <span className="font-mono text-[9px] text-slate-400">ID: #{activeCase.id.substring(activeCase.id.length - 6)}</span>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-xs text-slate-400 font-medium h-48 flex flex-col items-center justify-center gap-2 flex-1">
                <FileText className="w-10 h-10 text-slate-300" />
                <span>Select an uploaded field survey to track dynamic step updates.</span>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
