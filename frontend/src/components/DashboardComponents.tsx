/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, CheckCircle, Shield, AlertCircle, Info, MapPin, 
  Droplet, Users, Clipboard, Activity, TrendingUp, Calendar, Clock, 
  ArrowRight, Download, FileText, ChevronRight, Wrench
} from 'lucide-react';
import { RiskLevel, CaseStatus, Case, TimelineEvent } from '../types';

// Risk Badge component
export const RiskBadge: React.FC<{ risk: RiskLevel; className?: string }> = ({ risk, className = '' }) => {
  const styles = {
    Low: {
      bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      dot: 'bg-emerald-500'
    },
    Medium: {
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
      dot: 'bg-amber-500'
    },
    High: {
      bg: 'bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400',
      dot: 'bg-orange-500'
    },
    Critical: {
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 font-semibold shadow-xs',
      dot: 'bg-rose-600 animate-pulse'
    }
  };

  const current = styles[risk] || styles.Low;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${current.bg} ${className}`}>
      <span className={`w-2.5 h-2.5 rounded-full ${current.dot}`} />
      {risk}
    </span>
  );
};

// Status Badge component
export const StatusBadge: React.FC<{ status: CaseStatus; className?: string }> = ({ status, className = '' }) => {
  const styles: Record<CaseStatus, string> = {
    'Assigned': 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',
    'Survey Started': 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400',
    'Prediction Generated': 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400',
    'Admin Review': 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
    'Government Action': 'bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400',
    'In Progress': 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400',
    'Resolved': 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
  };

  const current = styles[status] || 'bg-gray-500/10 border-gray-500/20 text-gray-600';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${current} ${className}`}>
      {status}
    </span>
  );
};

// Stat Card component
export const StatCard: React.FC<{
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
  colorClass?: string;
  delay?: number;
}> = ({ title, value, change, isPositive = true, icon, colorClass = 'text-cyan-600', delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="p-5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/60 shadow-lg shadow-slate-100/30 flex items-center justify-between hover:shadow-xl transition-all duration-300"
    >
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <h3 className="text-3xl font-bold tracking-tight text-slate-800">{value}</h3>
        {change && (
          <div className="flex items-center gap-1 text-xs">
            <span className={`font-semibold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
              {change}
            </span>
            <span className="text-slate-400">vs last month</span>
          </div>
        )}
      </div>
      <div className={`p-3.5 rounded-xl bg-slate-50 ${colorClass}`}>
        {icon}
      </div>
    </motion.div>
  );
};

// Timeline component
export const Timeline: React.FC<{ events: TimelineEvent[] }> = ({ events }) => {
  if (events.length === 0) {
    return <EmptyState title="No activity recorded" message="Timeline events will appear once actions are taken." />;
  }

  const iconMap: Record<CaseStatus, React.ReactNode> = {
    'Assigned': <Users className="w-4 h-4 text-blue-500" />,
    'Survey Started': <Clipboard className="w-4 h-4 text-indigo-500" />,
    'Prediction Generated': <Activity className="w-4 h-4 text-purple-500" />,
    'Admin Review': <Shield className="w-4 h-4 text-amber-500" />,
    'Government Action': <AlertTriangle className="w-4 h-4 text-orange-500" />,
    'In Progress': <Wrench className="w-4 h-4 text-yellow-500" />,
    'Resolved': <CheckCircle className="w-4 h-4 text-emerald-500" />
  };

  const borderColors: Record<CaseStatus, string> = {
    'Assigned': 'border-blue-500',
    'Survey Started': 'border-indigo-500',
    'Prediction Generated': 'border-purple-500',
    'Admin Review': 'border-amber-500',
    'Government Action': 'border-orange-500',
    'In Progress': 'border-yellow-500',
    'Resolved': 'border-emerald-500'
  };

  return (
    <div className="relative border-l-2 border-slate-100 ml-4 pl-6 space-y-6">
      {events.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="relative"
        >
          {/* Custom Node dot */}
          <div className={`absolute -left-[35px] top-1 w-6 h-6 rounded-full bg-white border-2 ${borderColors[event.status] || 'border-slate-300'} flex items-center justify-center shadow-xs z-10`}>
            {iconMap[event.status] || <Info className="w-3 h-3 text-slate-400" />}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">
                {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-500">{event.actor}</span>
              <StatusBadge status={event.status} className="scale-90" />
            </div>
            <h4 className="text-sm font-semibold text-slate-700">{event.title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{event.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Interactive SVG Map Component (acting as district map)
export const InteractiveSVGMap: React.FC<{
  cases: Case[];
  onSelectCase?: (caseId: string) => void;
}> = ({ cases, onSelectCase }) => {
  const [selectedVillage, setSelectedVillage] = useState<string | null>(null);

  // Hardcoded coordinate mapping on our custom SVG layout for demonstration
  // We can group Ramanagara villages: Kanakapura, Anekal, Hosur, Devanahalli
  const villages = [
    { name: 'Kanakapura', cx: 120, cy: 190, r: 24, path: 'M 80,140 Q 120,120 160,150 T 150,230 Q 100,240 80,190 Z', fill: 'fill-cyan-500/20 stroke-cyan-500/40' },
    { name: 'Anekal', cx: 280, cy: 160, r: 22, path: 'M 220,130 Q 270,110 320,140 T 310,210 Q 250,230 220,180 Z', fill: 'fill-sky-500/20 stroke-sky-500/40' },
    { name: 'Hosur', cx: 340, cy: 260, r: 20, path: 'M 290,220 Q 330,200 370,230 T 360,300 Q 310,310 290,270 Z', fill: 'fill-teal-500/20 stroke-teal-500/40' },
    { name: 'Devanahalli', cx: 180, cy: 80, r: 26, path: 'M 130,50 Q 180,30 230,60 T 220,120 Q 170,130 130,90 Z', fill: 'fill-indigo-500/20 stroke-indigo-500/40' }
  ];

  const getVillageRiskCount = (vName: string) => {
    const vCases = cases.filter(c => c.village.toLowerCase() === vName.toLowerCase());
    const critical = vCases.filter(c => c.prediction?.riskLevel === 'Critical').length;
    const high = vCases.filter(c => c.prediction?.riskLevel === 'High').length;
    const medium = vCases.filter(c => c.prediction?.riskLevel === 'Medium').length;
    const low = vCases.filter(c => c.prediction?.riskLevel === 'Low').length;

    return { total: vCases.length, critical, high, medium, low };
  };

  return (
    <div className="relative rounded-2xl border border-white/60 bg-white/70 backdrop-blur-md p-5 overflow-hidden shadow-lg shadow-slate-100/30">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-slate-800 text-base">District Surveillance Heat Map</h3>
          <p className="text-xs text-slate-400">Interactive hot spots across blocks in Ramanagara Block</p>
        </div>
        <div className="flex gap-2 text-[10px] font-medium text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Critical</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> High</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Med</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Low</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Map SVG */}
        <div className="lg:col-span-2 relative bg-slate-50/50 rounded-xl border border-slate-100/50 flex justify-center items-center py-4">
          <svg viewBox="0 0 450 340" className="w-full max-w-[400px] h-auto drop-shadow-sm select-none">
            {/* Background Map Contours */}
            <g className="opacity-90">
              {villages.map(v => {
                const stats = getVillageRiskCount(v.name);
                const isSelected = selectedVillage === v.name;
                
                // Color intensity depends on critical levels
                let blockColor = v.fill;
                if (stats.critical > 0) {
                  blockColor = isSelected 
                    ? 'fill-rose-500/30 stroke-rose-500/80' 
                    : 'fill-rose-500/15 stroke-rose-500/40 hover:fill-rose-500/25';
                } else if (stats.high > 0) {
                  blockColor = isSelected 
                    ? 'fill-orange-500/30 stroke-orange-500/80' 
                    : 'fill-orange-500/15 stroke-orange-500/40 hover:fill-orange-500/25';
                } else if (isSelected) {
                  blockColor = 'fill-cyan-500/35 stroke-cyan-500/80';
                }

                return (
                  <path
                    key={v.name}
                    d={v.path}
                    className={`${blockColor} transition-colors duration-200 cursor-pointer stroke-2`}
                    onClick={() => setSelectedVillage(v.name === selectedVillage ? null : v.name)}
                  />
                );
              })}
            </g>

            {/* Labels and Hotspots */}
            {villages.map(v => {
              const stats = getVillageRiskCount(v.name);
              const isSelected = selectedVillage === v.name;

              return (
                <g key={'lbl-' + v.name} className="pointer-events-none">
                  {/* Village Central Indicator */}
                  <circle
                    cx={v.cx}
                    cy={v.cy}
                    r={stats.critical > 0 ? 8 : 5}
                    className={`${
                      stats.critical > 0 ? 'fill-rose-600 animate-pulse' :
                      stats.high > 0 ? 'fill-orange-500' :
                      stats.medium > 0 ? 'fill-amber-500' : 'fill-emerald-500'
                    }`}
                  />
                  {stats.critical > 0 && (
                    <circle
                      cx={v.cx}
                      cy={v.cy}
                      r={16}
                      className="fill-none stroke-rose-500/50 stroke-1 animate-ping"
                    />
                  )}

                  {/* Village Label text */}
                  <text
                    x={v.cx}
                    y={v.cy - 12}
                    textAnchor="middle"
                    className="font-display font-bold text-[10px] fill-slate-700"
                  >
                    {v.name}
                  </text>
                  <text
                    x={v.cx}
                    y={v.cy + 16}
                    textAnchor="middle"
                    className="font-mono text-[8px] fill-slate-400"
                  >
                    ({stats.total} {stats.total === 1 ? 'case' : 'cases'})
                  </text>
                </g>
              );
            })}

            {/* Water Flow Line (Visual River running through) */}
            <path
              d="M 20,290 C 130,220 220,330 310,240 T 430,130"
              fill="none"
              className="stroke-cyan-300/30 stroke-8"
              strokeLinecap="round"
            />
            <path
              d="M 20,290 C 130,220 220,330 310,240 T 430,130"
              fill="none"
              className="stroke-cyan-400/50 stroke-2 dash-river"
              strokeDasharray="4 8"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Info panel */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <AnimatePresence mode="wait">
              {selectedVillage ? (
                <motion.div
                  key={selectedVillage}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-cyan-600" />
                      {selectedVillage} Sector
                    </h4>
                    <button 
                      onClick={() => setSelectedVillage(null)} 
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-2 rounded-lg border border-slate-100 text-center">
                      <div className="text-[10px] text-slate-400">Critical Risks</div>
                      <div className="text-lg font-bold text-rose-500 font-mono">
                        {getVillageRiskCount(selectedVillage).critical}
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-100 text-center">
                      <div className="text-[10px] text-slate-400">High Risks</div>
                      <div className="text-lg font-bold text-orange-500 font-mono">
                        {getVillageRiskCount(selectedVillage).high}
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    <div className="font-semibold text-slate-600 mb-1">Active Cases:</div>
                    <ul className="space-y-1.5 max-h-32 overflow-y-auto">
                      {cases
                        .filter(c => c.village.toLowerCase() === selectedVillage.toLowerCase())
                        .map(c => (
                          <li 
                            key={c.id} 
                            onClick={() => onSelectCase?.(c.id)}
                            className="p-1.5 bg-white hover:bg-cyan-50 border border-slate-100 rounded-md flex justify-between items-center cursor-pointer transition-colors"
                          >
                            <span className="truncate max-w-[80px] font-medium">{c.citizenName}</span>
                            <div className="flex gap-1.5 items-center">
                              <RiskBadge risk={c.prediction?.riskLevel || 'Low'} className="scale-75 origin-right py-0 px-1.5" />
                              <ChevronRight className="w-3 h-3 text-slate-400" />
                            </div>
                          </li>
                        ))}
                    </ul>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="default"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-6"
                >
                  <MapPin className="w-8 h-8 text-cyan-300 mx-auto mb-2 animate-float" />
                  <p className="text-xs text-slate-500 font-medium">Click a region on the map to inspect waterborne hot spots, village cases, and active risks.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-3.5 bg-cyan-50/50 border border-cyan-100/50 rounded-xl flex gap-3">
            <Droplet className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-cyan-800">Hotspot Intelligence</div>
              <p className="text-[10px] text-cyan-600/90 leading-normal mt-0.5">
                Kanakapura is flagged with high biological risk due to <b>H₂S positive open well</b> water sources. Boiled hygiene is strictly enforced in Sector 3.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// PDF Button simulator
export const PDFButton: React.FC<{ report: Case }> = ({ report }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      // Simulate download
      const element = document.createElement('a');
      const file = new Blob([
        `AQUASAFE AI WATERBORN DISEASE RISK ASSESSMENT\n`,
        `============================================\n`,
        `CASE ID: ${report.id}\n`,
        `CITIZEN: ${report.citizenName} (${report.citizenAge}y / ${report.citizenGender})\n`,
        `OCCUPATION: ${report.citizenOccupation}\n`,
        `LOCATION: ${report.village}, ${report.district}\n`,
        `GPS: Lat ${report.gpsCoordinates.latitude}, Lon ${report.gpsCoordinates.longitude}\n`,
        `DATE RECORDED: ${new Date(report.dateCreated).toLocaleDateString()}\n\n`,
        `WATER DETAILS:\n`,
        ` - Source: ${report.waterDetails.source}\n`,
        ` - Physical: Appearance: ${report.waterDetails.appearance}, Smell: ${report.waterDetails.smell}, Taste: ${report.waterDetails.taste}\n`,
        ` - Storage: ${report.waterDetails.storageMethod} (Boiled: ${report.waterDetails.isBoiled ? 'Yes' : 'No'}, Filtered: ${report.waterDetails.isFiltered ? 'Yes' : 'No'})\n\n`,
        `WATER TESTING:\n`,
        ` - H2S Paper Strip Test: ${report.waterTest.h2sResult}\n`,
        ` - pH level: ${report.waterTest.phValue}\n\n`,
        `HEALTH SYMPTOMS:\n`,
        ` - Logged: ${report.symptoms.length > 0 ? report.symptoms.join(', ') : 'None'}\n`,
        ` - Duration: ${report.symptomDuration} days (Family sick: ${report.familySick ? 'Yes' : 'No'})\n\n`,
        `AI DIAGNOSTIC PREDICTION:\n`,
        ` - Risk Status: ${report.prediction?.waterStatus || 'Unassigned'}\n`,
        ` - Threat Level: ${report.prediction?.riskLevel || 'Low'}\n`,
        ` - Likely Contaminants: ${report.prediction?.likelyContaminant || 'None'}\n`,
        ` - Predicted Illness Hazards: ${report.prediction?.predictedDiseases.join(', ') || 'None'}\n\n`,
        `RECOMMENDED TREATMENT STEPS:\n`,
        `${report.prediction?.recommendations.map((r, i) => `${i+1}. ${r}`).join('\n') || 'None'}\n\n`,
        `SYSTEM VERIFIED BY SNEHA PATIL / MEERA DESHMUKH. OFFICIALLY LOGGED REPORT.`
      ], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `AquaSafe_Report_${report.id}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setDownloading(false);
    }, 1200);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-medium text-sm rounded-xl hover:from-cyan-700 hover:to-teal-700 active:scale-95 transition-all shadow-md shadow-cyan-600/10 disabled:opacity-75 cursor-pointer"
    >
      {downloading ? (
        <>
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Preparing Report...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Export Official PDF
        </>
      )}
    </button>
  );
};

// Empty State component
export const EmptyState: React.FC<{
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}> = ({ title, message, actionText, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-white/60 text-center space-y-3 bg-white/60 backdrop-blur-sm">
      <div className="p-3.5 rounded-full bg-slate-50 text-slate-300">
        <Droplet className="w-10 h-10 stroke-1" />
      </div>
      <div className="max-w-xs space-y-1">
        <h3 className="font-semibold text-slate-700 text-sm">{title}</h3>
        <p className="text-xs text-slate-400 leading-normal">{message}</p>
      </div>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          {actionText}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
