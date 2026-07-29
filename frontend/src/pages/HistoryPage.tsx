/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { RiskBadge, StatusBadge, EmptyState } from '../components/DashboardComponents';
import { Calendar, Search, ArrowRight, Clipboard, Beaker, MapPin } from 'lucide-react';

export default function HistoryPage() {
  const { cases, setSelectedCaseId, setActivePage } = useApp();
  const [query, setQuery] = useState('');

  const filteredHistory = cases.filter(c => {
    return (
      c.citizenName.toLowerCase().includes(query.toLowerCase()) ||
      c.id.toLowerCase().includes(query.toLowerCase()) ||
      c.village.toLowerCase().includes(query.toLowerCase())
    );
  });

  const handleSelectCase = (id: string) => {
    setSelectedCaseId(id);
    setActivePage('case-management');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Title */}
      <div className="text-center space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-800">Historical Outbreak Registry</h1>
        <p className="text-xs text-slate-400">Search and audit finalized water samples, resolved infections, and previous intervention timelines</p>
      </div>

      {/* Search Filter bar */}
      <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search archive by Citizen Name, Case ID, or Village Block..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:outline-none text-xs font-semibold text-slate-700"
          />
        </div>
      </div>

      {/* History timeline list */}
      <div className="space-y-3.5">
        {filteredHistory.length === 0 ? (
          <EmptyState title="Archive empty" message="No historical files match your current search query." />
        ) : (
          filteredHistory.map((c, idx) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-all"
            >
              <div className="space-y-1.5 truncate">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400">{c.id}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[10px] text-slate-500 font-bold flex items-center gap-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" /> {c.village}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                    <Calendar className="w-3 h-3 text-slate-400" /> {new Date(c.dateCreated).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-bold text-slate-700 text-xs sm:text-sm">{c.citizenName}</h3>
                <div className="flex items-center gap-3 text-[10px] text-slate-500">
                  <span>Source: <b className="text-slate-600 font-semibold">{c.waterDetails.source}</b></span>
                  <span>H₂S biological test: <b className={`font-mono font-bold ${c.waterTest.h2sResult === 'Positive' ? 'text-rose-500' : 'text-emerald-500'}`}>{c.waterTest.h2sResult}</b></span>
                </div>
              </div>

              {/* Badges & Trigger */}
              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-0 pt-3 sm:pt-0">
                <div className="flex gap-2">
                  <RiskBadge risk={c.prediction?.riskLevel || 'Low'} className="scale-85" />
                  <StatusBadge status={c.status} className="scale-85" />
                </div>

                <button
                  onClick={() => handleSelectCase(c.id)}
                  className="p-1.5 bg-slate-50 hover:bg-cyan-50 text-slate-400 hover:text-cyan-600 border border-slate-200 hover:border-cyan-200 rounded-lg transition-colors cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </motion.div>
          ))
        )}
      </div>

    </div>
  );
}
