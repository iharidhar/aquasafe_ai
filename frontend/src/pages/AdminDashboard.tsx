/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { RiskBadge, StatusBadge, StatCard, InteractiveSVGMap, EmptyState } from '../components/DashboardComponents';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, LabelList 
} from 'recharts';
import { 
  ShieldAlert, Activity, CheckCircle, Users, Clipboard, AlertTriangle, 
  TrendingUp, Sliders, ChevronRight, UserPlus, MapPin 
} from 'lucide-react';
import { Case, RiskLevel } from '../types';

export default function AdminDashboard() {
  const { cases, volunteers, updateCaseStatus, setActivePage, setSelectedCaseId, isConnected } = useApp();
  const [filterVillage, setFilterVillage] = useState('All');

  // Calculate metrics
  const totalCases = cases.length;
  const criticalCount = cases.filter(c => c.prediction?.riskLevel === 'Critical').length;
  const highCount = cases.filter(c => c.prediction?.riskLevel === 'High').length;
  const pendingCount = cases.filter(c => c.status === 'Admin Review' || c.status === 'Prediction Generated').length;
  const resolvedCount = cases.filter(c => c.status === 'Resolved').length;

  // Compile Chart 1: Risk Level Distribution
  const riskChartData = [
    { name: 'Low', value: cases.filter(c => c.prediction?.riskLevel === 'Low').length, fill: '#10b981' },
    { name: 'Medium', value: cases.filter(c => c.prediction?.riskLevel === 'Medium').length, fill: '#f59e0b' },
    { name: 'High', value: cases.filter(c => c.prediction?.riskLevel === 'High').length, fill: '#f97316' },
    { name: 'Critical', value: cases.filter(c => c.prediction?.riskLevel === 'Critical').length, fill: '#f43f5e' }
  ];

  // Compile Chart 2: Predicted Diseases
  const diseaseMap: Record<string, number> = {};
  cases.forEach(c => {
    if (c.prediction?.xgboostEvaluation?.diseaseProbabilities) {
      c.prediction.xgboostEvaluation.diseaseProbabilities.forEach(dp => {
        if (dp.percentage >= 25) {
          const cleanName = dp.disease
            .replace(' (E. coli / Rotavirus)', '')
            .replace(' (Shigellosis)', '')
            .replace(' (Arsenic Toxicity)', '')
            .replace(' Stress', '')
            .replace(' Risk', '');
          diseaseMap[cleanName] = (diseaseMap[cleanName] || 0) + 1;
        }
      });
    } else if (c.prediction?.predictedDiseases) {
      c.prediction.predictedDiseases.forEach(d => {
        if (d !== 'None Predicted') {
          const cleanName = d
            .replace(' (High Risk)', '')
            .replace(' (Risk)', '')
            .replace(' (E. coli / Rotavirus)', '')
            .replace(' (Shigellosis)', '');
          diseaseMap[cleanName] = (diseaseMap[cleanName] || 0) + 1;
        }
      });
    }
  });

  const diseaseChartData = Object.entries(diseaseMap).map(([name, value]) => ({ name, value }));
  const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6'];

  // Compile Chart 3: Source Contamination
  const sourceMap: Record<string, { total: number; contaminated: number }> = {};
  cases.forEach(c => {
    const src = c.waterDetails.source;
    if (!sourceMap[src]) sourceMap[src] = { total: 0, contaminated: 0 };
    sourceMap[src].total += 1;
    if (c.prediction?.riskLevel && ['High', 'Critical'].includes(c.prediction.riskLevel)) {
      sourceMap[src].contaminated += 1;
    }
  });

  const sourceChartData = Object.entries(sourceMap).map(([name, stats]) => ({
    name,
    total: stats.total,
    contaminated: stats.contaminated
  }));

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActivePage('case-management');
  };

  const handleVerifyCase = (caseId: string) => {
    updateCaseStatus(
      caseId, 
      'Admin Review', 
      'Admin verified physical readings and triggered H₂S bio-alert report.'
    );
  };

  const criticalPendingCases = cases.filter(c => 
    (c.prediction?.riskLevel === 'Critical' || c.prediction?.riskLevel === 'High') && 
    c.status !== 'Resolved' && 
    c.status !== 'Government Action'
  );

  return (
    <div className="space-y-6">
      {/* Greeting Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-800">Administrative Epidemiological Hub</h1>
          <p className="text-xs text-slate-400">Ramanagara District Public Health & Water Security command console</p>
        </div>
        <div className="text-xs text-slate-500 font-medium bg-white border border-slate-100 rounded-xl px-4 py-2 flex items-center gap-1.5 shadow-xs">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} /> Server Connection: <b>{isConnected ? 'Active' : 'Reconnecting...'}</b> • Node-3000
        </div>
      </div>

      {/* Admin stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { title: 'Total Cases', value: totalCases, icon: <Clipboard className="w-4 h-4" />, color: 'text-cyan-500' },
          { title: 'Critical Risk', value: criticalCount, icon: <ShieldAlert className="w-4 h-4" />, color: 'text-rose-500' },
          { title: 'High Risk', value: highCount, icon: <AlertTriangle className="w-4 h-4" />, color: 'text-orange-500' },
          { title: 'Pending Audit', value: pendingCount, icon: <Activity className="w-4 h-4" />, color: 'text-indigo-500' },
          { title: 'Mitigated Cases', value: resolvedCount, icon: <CheckCircle className="w-4 h-4" />, color: 'text-emerald-500' },
          { title: 'Volunteers Active', value: volunteers.length, icon: <Users className="w-4 h-4" />, color: 'text-blue-500' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white/70 backdrop-blur-md border border-white/60 rounded-xl p-4 shadow-lg shadow-slate-100/30 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">{stat.title}</div>
              <div className="text-xl font-bold text-slate-800 mt-1 font-mono">{stat.value}</div>
            </div>
            <div className={`p-2 bg-slate-50 rounded-lg ${stat.color}`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Map Row */}
      <div className="grid grid-cols-1 gap-6">
        <InteractiveSVGMap cases={cases} onSelectCase={handleSelectCase} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Risk Level Distribution */}
        <div className="bg-white/70 backdrop-blur-md border border-white/60 p-5 rounded-2xl shadow-lg shadow-slate-100/30 space-y-4">
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-sm">Contamination Risk Levels</h3>
            <p className="text-[11px] text-slate-400">Total volume of surveyed homes categorised by AI risk</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(14, 116, 144, 0.03)' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {riskChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                  <LabelList dataKey="value" position="top" style={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} offset={6} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Predicted Pathogen Frequencies */}
        <div className="bg-white/70 backdrop-blur-md border border-white/60 p-5 rounded-2xl shadow-lg shadow-slate-100/30 space-y-4 overflow-hidden flex flex-col justify-between">
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-sm">Pathogen Distribution</h3>
            <p className="text-[11px] text-slate-400">Relative weight of predicted bacterial disease cases</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center overflow-hidden">
            {diseaseChartData.length === 0 ? (
              <span className="text-xs text-slate-400">No outbreaks forecasted</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={diseaseChartData}
                    cx="50%"
                    cy="40%"
                    innerRadius={42}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {diseaseChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => [`${val} cases`, 'Frequency']} />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center"
                    iconSize={7} 
                    iconType="circle" 
                    wrapperStyle={{ fontSize: 9, lineHeight: '14px', paddingTop: '8px' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Source Safety Vulnerability */}
        <div className="bg-white/70 backdrop-blur-md border border-white/60 p-5 rounded-2xl shadow-lg shadow-slate-100/30 space-y-4">
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-sm">Outbreak Sources</h3>
            <p className="text-[11px] text-slate-400">Total surveys vs contaminated levels by water type</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sourceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="100%">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorContam" x1="0" y1="0" x2="0" y2="100%">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                <Area type="monotone" dataKey="total" name="Total Surveys" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="contaminated" name="Contaminated" stroke="#f43f5e" fillOpacity={1} fill="url(#colorContam)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Critical Cases requiring validation & Volunteer Performance split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Critical Alerts List */}
        <div className="lg:col-span-6 bg-white/70 backdrop-blur-md border border-white/60 p-5 rounded-2xl shadow-lg shadow-slate-100/30 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-slate-800 text-sm">Critical Unverified Alerts</h3>
              <p className="text-[11px] text-slate-400">Newly recorded biosurveillance reports requiring validation</p>
            </div>
            <button
              onClick={() => setActivePage('case-management')}
              className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 flex items-center gap-1 cursor-pointer"
            >
              All Cases
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {criticalPendingCases.length === 0 ? (
              <div className="py-8">
                <EmptyState title="No critical alerts" message="All high-hazard contaminants are fully verified and forwarded for water treatment." />
              </div>
            ) : (
              criticalPendingCases.map(c => (
                <div key={c.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400 font-bold">{c.id}</span>
                      <span className="text-xs text-slate-300">•</span>
                      <span className="text-xs font-bold text-slate-700">{c.citizenName}</span>
                      <span className="text-xs text-slate-300">•</span>
                      <span className="text-[11px] text-slate-500">{c.village}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>Source: <b className="text-slate-600">{c.waterDetails.source}</b></span>
                      <span>H₂S: <b className="text-rose-500">{c.waterTest.h2sResult}</b></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <RiskBadge risk={c.prediction?.riskLevel || 'Low'} className="scale-85" />
                    {c.status === 'Prediction Generated' ? (
                      <button
                        onClick={() => handleVerifyCase(c.id)}
                        className="px-2.5 py-1 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-semibold text-[10px] rounded-lg shadow-sm cursor-pointer"
                      >
                        Verify Report
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSelectCase(c.id)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 font-medium text-[10px] rounded-lg cursor-pointer"
                      >
                        Audit
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Volunteer Audits Table */}
        <div className="lg:col-span-6 bg-white/70 backdrop-blur-md border border-white/60 p-5 rounded-2xl shadow-lg shadow-slate-100/30 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-slate-800 text-sm">Volunteer Surveillance Teams</h3>
              <p className="text-[11px] text-slate-400">Field reporting metrics and availability records</p>
            </div>
            <button className="text-xs font-semibold text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer">
              <UserPlus className="w-3.5 h-3.5" /> Deploy Volunteer
            </button>
          </div>

          <div className="overflow-x-auto text-[11px] text-slate-600">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-2">Name</th>
                  <th className="pb-2 text-center">Assigned</th>
                  <th className="pb-2 text-center">Completed</th>
                  <th className="pb-2 text-center">Critical</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {volunteers.map(v => {
                  // Calculate metrics dynamically for accurate dashboard display
                  const volCases = cases.filter(c => c.assignedVolunteer === v.name || c.assignedVolunteer.includes(v.username));
                  const assignedCount = volCases.length;
                  const completedCount = volCases.filter(c => c.status === 'Resolved').length;
                  const criticalCount = volCases.filter(c => c.prediction?.riskLevel === 'Critical').length;
                  return (
                    <tr key={v.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 text-slate-700 font-bold">{v.name}</td>
                      <td className="py-2.5 text-center font-mono">{assignedCount}</td>
                      <td className="py-2.5 text-center font-mono text-emerald-600">{completedCount}</td>
                      <td className="py-2.5 text-center font-mono text-rose-500 font-bold">{criticalCount}</td>
                      <td className="py-2.5 text-right">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          v.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/10' : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}>
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
