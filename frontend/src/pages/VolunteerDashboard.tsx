/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { RiskBadge, StatusBadge, StatCard, EmptyState } from '../components/DashboardComponents';
import { Clipboard, AlertCircle, CheckCircle, Clock, Plus, ArrowRight, MapPin, Calendar, ClipboardCheck } from 'lucide-react';

export default function VolunteerDashboard() {
  const { cases, currentUser, setActivePage, setSelectedCaseId, timeline, isConnected } = useApp();

  // Filter cases assigned to this volunteer
  const volunteerName = currentUser?.name || 'Sneha Patil';
  const volunteerCases = cases.filter(c => c.assignedVolunteer === volunteerName || c.assignedVolunteer.includes(currentUser?.username || ''));

  // Calculate statistics
  const totalAssigned = volunteerCases.length;
  const criticalCases = volunteerCases.filter(c => c.prediction?.riskLevel === 'Critical').length;
  const completedCases = volunteerCases.filter(c => c.status === 'Resolved' || c.status === 'Government Action').length;
  const pendingCases = volunteerCases.filter(c => c.status === 'Assigned' || c.status === 'Survey Started').length;

  // Filter timeline for events related to this volunteer's cases
  const vCaseIds = volunteerCases.map(c => c.id);
  const relevantTimeline = timeline.filter(t => vCaseIds.includes(t.caseId)).slice(0, 5);

  const handleStartSurvey = (caseId: string) => {
    const c = cases.find(x => x.id === caseId);
    if (c) {
      // pre-fill survey state with client details
      // then take to New Survey
      setSelectedCaseId(caseId);
      setActivePage('new-survey');
    }
  };

  const handleViewCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActivePage('case-management');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Greeting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-cyan-900 to-slate-900 rounded-2xl p-6 text-white shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display">Welcome Back, {currentUser?.username || 'Sneha'}!</h1>
          <p className="text-xs text-cyan-200 mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> Assigned Block: <b>Kanakapura Sector 3</b> • Ramanagara District
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold px-3 py-1.5 bg-slate-950/40 border border-cyan-800/40 rounded-xl flex items-center gap-1.5 select-none">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            <span>Connection: <b>{isConnected ? 'Active' : 'Offline'}</b></span>
          </div>
          <button
            onClick={() => {
              setSelectedCaseId(null);
              setActivePage('new-survey');
            }}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-xs rounded-xl shadow-md shadow-cyan-500/10 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Conduct New Survey
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Workload"
          value={totalAssigned}
          icon={<Clipboard className="w-5 h-5" />}
          colorClass="text-blue-500"
          delay={0.05}
        />
        <StatCard
          title="Pending Investigations"
          value={pendingCases}
          icon={<Clock className="w-5 h-5" />}
          colorClass="text-amber-500"
          delay={0.1}
        />
        <StatCard
          title="Resolved/Mitigated"
          value={completedCases}
          icon={<CheckCircle className="w-5 h-5" />}
          colorClass="text-emerald-500"
          delay={0.15}
        />
        <StatCard
          title="Critical Alerts"
          value={criticalCases}
          icon={<AlertCircle className="w-5 h-5" />}
          colorClass="text-rose-500"
          delay={0.2}
        />
      </div>

      {/* Main split dashboard section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column - Assigned cases list */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-semibold text-slate-800 text-base">Your Field Assignments</h2>
              <p className="text-xs text-slate-400">Manage door-to-door physical reports and active water assessments</p>
            </div>
            <button
              onClick={() => setActivePage('case-management')}
              className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 flex items-center gap-1 cursor-pointer"
            >
              View All
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {volunteerCases.length === 0 ? (
              <div className="col-span-2">
                <EmptyState
                  title="No assigned cases"
                  message="Excellent! All assigned houses in your sector are fully assessed and water-secure."
                  actionText="Launch Fresh Survey"
                  onAction={() => setActivePage('new-survey')}
                />
              </div>
            ) : (
              volunteerCases.map((c, index) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -2 }}
                  className="bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl p-4 shadow-md shadow-slate-100/30 flex flex-col justify-between hover:shadow-lg hover:border-cyan-200/50 hover:bg-white/80 transition-all duration-300"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 font-semibold">{c.id}</span>
                      <StatusBadge status={c.status} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-700 text-sm leading-tight">{c.citizenName}</h3>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">{c.citizenAge}y • {c.citizenGender} • {c.citizenOccupation}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-50 space-y-1.5 text-[11px] text-slate-500">
                      <div className="flex justify-between">
                        <span>Water Source:</span>
                        <span className="font-semibold text-slate-700">{c.waterDetails.source}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>H₂S biological test:</span>
                        <span className={`font-mono font-semibold ${c.waterTest.h2sResult === 'Positive' ? 'text-rose-500' :
                          c.waterTest.h2sResult === 'Negative' ? 'text-emerald-500' : 'text-slate-400'
                          }`}>{c.waterTest.h2sResult}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    {c.prediction?.riskLevel ? (
                      <RiskBadge risk={c.prediction.riskLevel} className="scale-90 origin-left" />
                    ) : (
                      <span className="text-[10px] text-amber-500 font-medium flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/10">
                        <Clock className="w-3 h-3" /> Survey Pending
                      </span>
                    )}

                    <div className="flex gap-1.5">
                      {c.status === 'Assigned' || c.status === 'Survey Started' ? (
                        <button
                          onClick={() => handleStartSurvey(c.id)}
                          className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Start Survey
                        </button>
                      ) : (
                        <button
                          onClick={() => handleViewCase(c.id)}
                          className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          View Report
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Right Column - Activity Stream */}
        <div className="lg:col-span-4 space-y-4">
          <div>
            <h2 className="font-display font-semibold text-slate-800 text-base">Local Activity</h2>
            <p className="text-xs text-slate-400">Chronological history of field entries</p>
          </div>

          <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl p-5 shadow-lg shadow-slate-100/30 max-h-[460px] overflow-y-auto">
            {relevantTimeline.length === 0 ? (
              <EmptyState title="No local actions" message="Activities will record as you update cases." />
            ) : (
              <div className="relative border-l-2 border-slate-100 ml-2 pl-4 space-y-5">
                {relevantTimeline.map((item, idx) => (
                  <div key={item.id} className="relative text-[11px]">
                    <div className="absolute -left-[23px] top-0.5 w-3 h-3 rounded-full bg-cyan-500 border-2 border-white shadow-xs" />
                    <div className="space-y-0.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-700">{item.title}</span>
                        <span className="text-[9px] font-mono text-slate-400">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-500 leading-relaxed">{item.description}</p>
                      <div className="text-[9px] font-mono text-slate-300">Case ID: {item.caseId}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick survey guide promo */}
          <div className="p-4 bg-gradient-to-br from-cyan-50 to-sky-50 border border-cyan-100/50 rounded-xl space-y-2.5">
            <div className="flex items-center gap-2" style={{ color: 'rgba(0, 0, 0, 1)' }}>
              <ClipboardCheck className="w-5 h-5" />
              <span className="font-bold font-display uppercase tracking-wider" style={{ color: 'black' }}>Field Guide Reference</span>
            </div>
            <p className="text-[10px] text-black leading-relaxed">
              Unsure how to complete the <b>H₂S Paper Strip incubation</b> test or check precise pH thresholds? Open the guide.
            </p>
            <button
              onClick={() => setActivePage('survey-guide')}
              className="text-[10px] font-bold text-cyan-700 hover:text-cyan-800 flex items-center gap-1 cursor-pointer"
            >
              Access Digital Instructions
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
