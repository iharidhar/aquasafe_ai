/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { RiskBadge, StatusBadge, Timeline, PDFButton, EmptyState } from '../components/DashboardComponents';
import { 
  Search, SlidersHorizontal, MapPin, Phone, User, Calendar, 
  Droplet, Beaker, Heart, Shield, CheckCircle, ArrowRight, X, ChevronRight, Play 
} from 'lucide-react';
import { Case, CaseStatus, RiskLevel } from '../types';

export default function CaseManagement() {
  const { cases, timeline, updateCaseStatus, selectedCaseId, setSelectedCaseId } = useApp();
  
  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVillage, setFilterVillage] = useState('All');
  const [filterRisk, setFilterRisk] = useState('All');
  const [filterSource, setFilterSource] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showAdvanceDropdown, setShowAdvanceDropdown] = useState(false);

  // Derive filter values
  const villages = ['All', ...Array.from(new Set(cases.map(c => c.village)))];
  const sources = ['All', ...Array.from(new Set(cases.map(c => c.waterDetails.source)))];
  const risks = ['All', 'Low', 'Medium', 'High', 'Critical'];
  const statuses = [
    'All', 'Assigned', 'Survey Started', 'Prediction Generated', 
    'Admin Review', 'Government Action', 'Resolved'
  ];

  // Filter cases
  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesVillage = filterVillage === 'All' || c.village === filterVillage;
    const matchesRisk = filterRisk === 'All' || c.prediction?.riskLevel === filterRisk;
    const matchesSource = filterSource === 'All' || c.waterDetails.source === filterSource;
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;

    return matchesSearch && matchesVillage && matchesRisk && matchesSource && matchesStatus;
  });

  const activeCase = cases.find(c => c.id === selectedCaseId) || filteredCases[0] || null;

  // Compile timeline for the selected case
  const activeTimeline = activeCase 
    ? timeline.filter(t => t.caseId === activeCase.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    : [];

  const handleAdvanceStatus = (nextStatus: CaseStatus) => {
    if (!activeCase) return;
    
    let description = '';
    switch (nextStatus) {
      case 'Survey Started':
        description = 'Survey active in the field. Physical samples and clinical checklist loaded.';
        break;
      case 'Prediction Generated':
        description = 'AI Risk Model calculated biological & chemical water status index.';
        break;
      case 'Admin Review':
        description = 'Admin reviewed data signatures and validated contaminant triggers.';
        break;
      case 'Government Action':
        description = 'Case escalated to block development health department. Chemical mitigation dispatched.';
        break;
      case 'Resolved':
        description = 'Water sources sanitized, chlorine kits distributed, symptoms resolved. Case closed.';
        break;
    }

    updateCaseStatus(activeCase.id, nextStatus, description);
    setShowAdvanceDropdown(false);
  };

  const getNextStatuses = (current: CaseStatus): CaseStatus[] => {
    switch (current) {
      case 'Assigned': return ['Survey Started'];
      case 'Survey Started': return ['Prediction Generated'];
      case 'Prediction Generated': return ['Admin Review'];
      case 'Admin Review': return ['Government Action', 'Resolved'];
      case 'Government Action': return ['Resolved'];
      case 'Resolved': return [];
      default: return [];
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[calc(100vh-160px)] lg:overflow-hidden">
      
      {/* Left Column: Filter Sidebar & Case List */}
      <div className="lg:col-span-5 flex flex-col gap-4 lg:h-full lg:overflow-hidden">
        
        {/* Advanced Filters Card */}
        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs space-y-4 shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-cyan-600" />
            <h3 className="font-display font-semibold text-slate-700 text-sm">Filter Registry</h3>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Citizen name or Case ID..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:outline-none text-slate-700 text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11px] font-semibold text-slate-500">
            <div className="space-y-1">
              <label>Village Block</label>
              <select 
                value={filterVillage}
                onChange={(e) => setFilterVillage(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200/60 rounded-lg text-slate-700 font-medium"
              >
                {villages.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label>Risk Assessment</label>
              <select 
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200/60 rounded-lg text-slate-700 font-medium"
              >
                {risks.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label>Water Source</label>
              <select 
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200/60 rounded-lg text-slate-700 font-medium"
              >
                {sources.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label>Workflow Status</label>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200/60 rounded-lg text-slate-700 font-medium"
              >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Case List Card */}
        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs flex-1 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-3 shrink-0">
            <span className="text-xs font-bold text-slate-400 font-display uppercase tracking-wider">Surveillance Files ({filteredCases.length})</span>
          </div>

          <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
            {filteredCases.length === 0 ? (
              <div className="py-8">
                <EmptyState title="No matches found" message="Try relaxing your filters or check spelling." />
              </div>
            ) : (
              filteredCases.map(c => {
                const isSelected = activeCase?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCaseId(c.id)}
                    className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex justify-between items-center gap-3 ${
                      isSelected 
                        ? 'bg-white border-cyan-500 shadow-md -translate-y-0.5 scale-[1.01]' 
                        : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="space-y-1 truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono font-bold text-slate-400">{c.id}</span>
                        <span className="text-[9px] text-slate-300">•</span>
                        <span className="text-[10px] text-slate-500 font-semibold">{c.village}</span>
                      </div>
                      <h4 className="font-bold text-slate-700 text-xs truncate leading-snug">{c.citizenName}</h4>
                      <p className="text-[10px] text-slate-400">Source: <b className="text-slate-500 font-semibold">{c.waterDetails.source}</b></p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <RiskBadge risk={c.prediction?.riskLevel || 'Low'} className="scale-75 origin-right" />
                      <StatusBadge status={c.status} className="scale-85 origin-right" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Right Column: Case Dossier Detail Drawer */}
      <div className="lg:col-span-7 lg:h-full lg:overflow-hidden">
        <AnimatePresence mode="wait">
          {activeCase ? (
            <motion.div
              key={activeCase.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden lg:h-full lg:flex lg:flex-col"
            >
              
              {/* Dossier Header */}
              <div className="p-6 bg-slate-900 text-white flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">{activeCase.id}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-xs text-slate-300">Registered: {new Date(activeCase.dateCreated).toLocaleDateString()}</span>
                  </div>
                  <h2 className="text-xl font-bold font-display tracking-tight">{activeCase.citizenName}</h2>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                    {activeCase.address}, {activeCase.village}, {activeCase.district}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <RiskBadge risk={activeCase.prediction?.riskLevel || 'Low'} />
                  <StatusBadge status={activeCase.status} />
                </div>
              </div>

              {/* Dossier Content Tabs */}
              <div className="p-6 space-y-6 lg:flex-1 lg:overflow-y-auto">

                {/* Workflow Actions Row */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="text-xs font-bold text-slate-700">Update Field Progress</div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Advance this file to trigger next step alerts</p>
                  </div>

                  <div className="relative shrink-0 w-full sm:w-auto">
                    {getNextStatuses(activeCase.status).length > 0 ? (
                      <div className="flex gap-2">
                        {getNextStatuses(activeCase.status).map(ns => (
                          <button
                            key={ns}
                            onClick={() => handleAdvanceStatus(ns)}
                            className="w-full sm:w-auto px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-teal-600 text-white text-[11px] font-bold rounded-lg hover:from-cyan-700 hover:to-teal-700 transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                          >
                            <Play className="w-3 h-3 fill-white" />
                            Advance: {ns}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                        <CheckCircle className="w-3.5 h-3.5" /> Case Resolved & Closed
                      </span>
                    )}
                  </div>
                </div>

                {/* Section 1: Demographics & GPS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" /> Demographic Info
                    </div>
                    <div className="text-xs text-slate-600 font-semibold space-y-1 mt-1">
                      <div>Age: <b className="text-slate-800">{activeCase.citizenAge} years</b></div>
                      <div>Gender: <b className="text-slate-800">{activeCase.citizenGender}</b></div>
                      <div>Phone: <b className="text-slate-800">{activeCase.citizenPhone}</b></div>
                      <div>Occupation: <b className="text-slate-800">{activeCase.citizenOccupation}</b></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Droplet className="w-3.5 h-3.5 text-slate-400" /> Physical Water Attributes
                    </div>
                    <div className="text-xs text-slate-600 font-semibold space-y-1 mt-1">
                      <div>Source: <b className="text-slate-800">{activeCase.waterDetails.source}</b></div>
                      <div>Appearance: <b className="text-slate-800">{activeCase.waterDetails.appearance}</b></div>
                      <div>Smell: <b className="text-slate-800">{activeCase.waterDetails.smell}</b></div>
                      <div>Taste: <b className="text-slate-800">{activeCase.waterDetails.taste}</b></div>
                      <div>Suspended Solids: <b className="text-slate-800">{activeCase.waterDetails.visibleParticles ? 'Yes' : 'No'}</b></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Beaker className="w-3.5 h-3.5 text-slate-400" /> Biological Metrics
                    </div>
                    <div className="text-xs text-slate-600 font-semibold space-y-1 mt-1">
                      <div>H₂S biological test: 
                        <b className={`ml-1 font-mono ${
                          activeCase.waterTest.h2sResult === 'Positive' ? 'text-rose-500' :
                          activeCase.waterTest.h2sResult === 'Negative' ? 'text-emerald-500' : 'text-slate-400'
                        }`}>{activeCase.waterTest.h2sResult}</b>
                      </div>
                      <div>pH Level: <b className="text-slate-800 font-mono">{activeCase.waterTest.phValue}</b></div>
                      <div>Treatment boiled: <b className="text-slate-800">{activeCase.waterDetails.isBoiled ? 'Yes' : 'No'}</b></div>
                      <div>Treatment filtered: <b className="text-slate-800">{activeCase.waterDetails.isFiltered ? 'Yes' : 'No'}</b></div>
                      <div>GPS: <b className="text-slate-800 font-mono text-[10px]">{activeCase.gpsCoordinates.latitude}, {activeCase.gpsCoordinates.longitude}</b></div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Outbreak Risk Analysis */}
                <div className="border-t border-slate-100 pt-6">
                  <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 mb-3">
                    <Heart className="w-3.5 h-3.5 text-slate-400" /> Patient Symptoms & Outbreak Vector
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                      <span className="text-[10px] font-bold text-slate-500">Active Symptoms Reported</span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeCase.symptoms.length === 0 ? (
                          <span className="text-xs text-slate-400 font-medium italic">No physical symptoms logged</span>
                        ) : (
                          activeCase.symptoms.map(s => (
                            <span key={s} className="px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-semibold rounded-md">
                              {s}
                            </span>
                          ))
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        Symptom Duration: <b>{activeCase.symptomDuration} days</b> • Other family members sick: <b>{activeCase.familySick ? 'Yes' : 'No'}</b>
                      </div>
                    </div>

                    <div className="p-3 bg-cyan-50/40 border border-cyan-100/40 rounded-xl space-y-1.5">
                      <span className="text-[10px] font-bold text-cyan-800 flex items-center gap-1">
                        <Shield className="w-4 h-4 text-cyan-600" /> Likely Outbreak Predictor
                      </span>
                      {activeCase.prediction ? (
                        <div className="space-y-1 text-xs">
                          <div className="text-[11px] text-slate-500">Likely Contaminant: <b className="text-cyan-800 font-semibold">{activeCase.prediction.likelyContaminant}</b></div>
                          <div className="text-[11px] text-slate-500">Hazardous Diseases: <b className="text-rose-600 font-bold">{activeCase.prediction.predictedDiseases.join(', ')}</b></div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium italic">Complete the physical and biological assessments to generate outbreak forecast.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 3: Mitigation recommendations */}
                {activeCase.prediction && (
                  <div className="border-t border-slate-100 pt-6 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <Beaker className="w-3.5 h-3.5 text-slate-400" /> Actionable Treatment Recommendations
                      </div>
                      <PDFButton report={activeCase} />
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                      {activeCase.prediction.recommendations.map((rec, i) => (
                        <li key={i} className="p-3 bg-emerald-50/40 border border-emerald-100/40 rounded-xl flex gap-2.5 items-start">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
                          <span className="leading-normal">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Section 4: Progress Audit Logs */}
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Complete Audit Timeline & Actions
                  </div>
                  <Timeline events={activeTimeline} />
                </div>

              </div>

            </motion.div>
          ) : (
            <div className="h-full bg-white border border-slate-100 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
              <EmptyState title="No case selected" message="Select an active dossier file from the registry sidebar to audit its chemical qualities." />
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
