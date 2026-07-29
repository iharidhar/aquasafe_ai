/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { RiskBadge, PDFButton } from '../components/DashboardComponents';
import { 
  ShieldAlert, Activity, CheckCircle, Droplet, Home, 
  AlertTriangle, RefreshCw, Cpu, Percent, ChevronDown, ChevronUp, Info, Sparkles, BarChart3
} from 'lucide-react';

export default function PredictionResult() {
  const { cases, selectedCaseId, setActivePage, resetSurvey } = useApp();
  const [expandedDisease, setExpandedDisease] = useState<string | null>(null);

  const currentCase = cases.find(c => c.id === selectedCaseId) || cases[0];

  if (!currentCase || !currentCase.prediction) {
    return (
      <div className="max-w-md mx-auto py-12 text-center bg-white border border-slate-100 rounded-2xl p-8 space-y-4 shadow-sm">
        <Activity className="w-12 h-12 text-slate-300 mx-auto animate-spin" />
        <h2 className="text-sm font-semibold text-slate-700">Generating AI Risk Index...</h2>
        <p className="text-xs text-slate-400">Biological contaminants and pathogen vectors are being calculated by the diagnostic engine.</p>
        <button
          onClick={() => setActivePage('volunteer-dashboard')}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl"
        >
          Return Home
        </button>
      </div>
    );
  }

  const prediction = currentCase.prediction;
  const xgboost = prediction.xgboostEvaluation;
  
  const citizenName = currentCase.citizenName || (currentCase as any).citizen?.name || 'Citizen';
  const village = currentCase.village || (currentCase as any).citizen?.village || 'Local Area';
  const waterDetails = currentCase.waterDetails || (currentCase as any).water || {};
  const waterTest = currentCase.waterTest || (currentCase as any).test || {};
  const symptoms = currentCase.symptoms || [];
  const symptomDuration = currentCase.symptomDuration || 0;
  const familySick = !!currentCase.familySick;

  // Gauge configurations
  const riskAngles = {
    Low: -60,
    Medium: -20,
    High: 20,
    Critical: 60
  };

  const needleAngle = riskAngles[prediction.riskLevel] || -60;

  const bgColors = {
    Low: 'from-emerald-50 to-emerald-100/30 border-emerald-200/50 text-emerald-800',
    Medium: 'from-amber-50 to-amber-100/30 border-amber-200/50 text-amber-800',
    High: 'from-orange-50 to-orange-100/30 border-orange-200/50 text-orange-800',
    Critical: 'from-rose-50 to-rose-100/30 border-rose-200/50 text-rose-800'
  };

  const textColors = {
    Low: 'text-emerald-500',
    Medium: 'text-amber-500',
    High: 'text-orange-500',
    Critical: 'text-rose-500'
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8">
      
      {/* Upper Status Cards */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`p-6 rounded-2xl border bg-gradient-to-br ${bgColors[prediction.riskLevel] || bgColors.Low} flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm`}
      >
        <div className="space-y-2 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Automated AI Assessment</span>
            <RiskBadge risk={prediction.riskLevel} />
          </div>
          <h1 className="text-2xl font-extrabold font-display leading-tight">
            Water Quality Status: <span className={textColors[prediction.riskLevel]}>{prediction.waterStatus}</span>
          </h1>
          <p className="text-xs text-slate-500 max-w-md font-medium">
            Risk analysis for <b>{citizenName} ({village})</b> calculated based on biological paper reaction and visual physical attributes.
          </p>
        </div>

        {/* Dynamic Semicircular Gauge */}
        <div className="relative w-40 h-24 flex items-end justify-center select-none shrink-0">
          <svg className="w-36 h-20" viewBox="0 0 100 50">
            {/* Background Arc */}
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Colored Segment Rings */}
            <path
              d="M 10 50 A 40 40 0 0 1 30 20"
              fill="none"
              stroke="#10b981"
              strokeWidth="8"
              strokeOpacity="0.8"
            />
            <path
              d="M 30 20 A 40 40 0 0 1 50 10"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="8"
              strokeOpacity="0.8"
            />
            <path
              d="M 50 10 A 40 40 0 0 1 70 20"
              fill="none"
              stroke="#f97316"
              strokeWidth="8"
              strokeOpacity="0.8"
            />
            <path
              d="M 70 20 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="8"
              strokeOpacity="0.8"
            />
            {/* Indicator Needle */}
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="18"
              stroke="#334155"
              strokeWidth="3"
              strokeLinecap="round"
              transform={`rotate(${needleAngle}, 50, 50)`}
              className="transition-transform duration-1000 ease-out"
            />
            <circle cx="50" cy="50" r="4" fill="#334155" />
          </svg>
          <div className="absolute bottom-0 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {prediction.riskLevel} Risk
          </div>
        </div>
      </motion.div>

      {/* Outbreak Vector Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Bio-chemical signatures */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-4">
          <h3 className="font-semibold text-slate-700 text-sm flex items-center gap-1.5 border-b border-slate-50 pb-2">
            <Droplet className="w-4 h-4 text-cyan-600" /> Bio-Chemical Signatures
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Water Extraction Source:</span>
              <span className="font-bold text-slate-700">{waterDetails.source}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Physical Appearance:</span>
              <span className="font-bold text-slate-700">{waterDetails.appearance}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Hydrogen Sulfide (H₂S):</span>
              <span className={`font-mono font-bold ${waterTest.h2sResult === 'Positive' ? 'text-rose-500' : 'text-emerald-500'}`}>
                {waterTest.h2sResult}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Measured Acid Level (pH):</span>
              <span className="font-mono font-bold text-slate-700">{waterTest.phValue} pH</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400 font-medium">Identified Contaminants:</span>
              <span className="font-semibold text-cyan-800 text-right max-w-[160px] truncate block" title={prediction.likelyContaminant}>
                {prediction.likelyContaminant}
              </span>
            </div>
          </div>
        </div>

        {/* Outbreak Pathogen vectors */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-4">
          <h3 className="font-semibold text-slate-700 text-sm flex items-center gap-1.5 border-b border-slate-50 pb-2">
            <ShieldAlert className="w-4 h-4 text-rose-500" /> Outbreak Infectious Hazards
          </h3>

          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Estimated Waterborne Disease Warnings</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {prediction.predictedDiseases.map(disease => (
                  <span key={disease} className="px-3 py-1.5 bg-rose-50 border border-rose-100/50 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    {disease}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase">Symptom Vector Log</span>
              <p className="text-xs text-slate-600 font-medium mt-1 leading-normal">
                Patient reports symptoms of <b>{symptoms.join(', ') || 'none'}</b> for <b>{symptomDuration} days</b>. Sick relatives: <b>{familySick ? 'Yes' : 'No'}</b>.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* XGBoost Machine Learning Percentage Evaluation Section */}
      {xgboost && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-500/20 space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-400/30 text-indigo-400">
                <Cpu className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base tracking-wide text-white">XGBoost ML Diagnostic Engine</h3>
                  <span className="px-2 py-0.5 bg-indigo-500/30 border border-indigo-400/40 text-[10px] font-mono font-bold text-indigo-300 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-300" />
                    Gradient Boosting v2.1
                  </span>
                </div>
                <p className="text-xs text-indigo-200/70 font-medium mt-0.5">
                  Percentage evaluations computed from water parameters and clinical symptom vectors.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl shrink-0">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <div className="text-left">
                <span className="text-[9px] font-mono uppercase text-slate-400 block font-bold">Model Confidence</span>
                <span className="text-sm font-extrabold text-emerald-400 font-mono">{xgboost.modelConfidence}%</span>
              </div>
            </div>
          </div>

          {/* Risk Probability Distribution Bar */}
          <div className="space-y-2 bg-white/5 border border-white/10 p-4 rounded-xl">
            <div className="flex justify-between items-center text-xs font-bold font-mono">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-cyan-400" /> XGBoost Risk Class Probabilities
              </span>
              <span className="text-rose-400">Highly Contaminated: {xgboost.riskProbabilities.HighlyContaminated}%</span>
            </div>
            
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-slate-700">
              <div 
                style={{ width: `${xgboost.riskProbabilities.Safe}%` }} 
                className="bg-emerald-500 h-full rounded-l-full transition-all duration-1000"
                title={`Safe: ${xgboost.riskProbabilities.Safe}%`}
              />
              <div 
                style={{ width: `${xgboost.riskProbabilities.Contaminated}%` }} 
                className="bg-amber-500 h-full transition-all duration-1000"
                title={`Contaminated: ${xgboost.riskProbabilities.Contaminated}%`}
              />
              <div 
                style={{ width: `${xgboost.riskProbabilities.HighlyContaminated}%` }} 
                className="bg-rose-500 h-full rounded-r-full transition-all duration-1000"
                title={`Highly Contaminated: ${xgboost.riskProbabilities.HighlyContaminated}%`}
              />
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 font-medium pt-1">
              <span className="text-emerald-400 flex items-center gap-1">● Safe: {xgboost.riskProbabilities.Safe}%</span>
              <span className="text-amber-400 flex items-center gap-1">● Contaminated: {xgboost.riskProbabilities.Contaminated}%</span>
              <span className="text-rose-400 flex items-center gap-1">● Highly Contaminated: {xgboost.riskProbabilities.HighlyContaminated}%</span>
            </div>
          </div>

          {/* Disease Probabilities List with Clear Disease Descriptions */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" /> XGBoost Predicted Diseases (Probability & Explanations)
            </h4>

            <div className="space-y-3">
              {xgboost.diseaseProbabilities.map((dp) => {
                const isExpanded = expandedDisease === dp.disease;
                return (
                  <div 
                    key={dp.disease}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 transition-all hover:border-indigo-400/40 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <h5 className="font-extrabold text-sm text-white">{dp.disease}</h5>
                          <span className={`px-2 py-0.5 text-[10px] font-bold font-mono rounded-md ${
                            dp.riskLevel === 'Critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                            dp.riskLevel === 'High' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                            'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {dp.riskLevel} Risk
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs font-extrabold font-mono text-cyan-300">{dp.percentage}%</span>
                          <span className="text-[9px] text-slate-400 block font-medium">Match Probability</span>
                        </div>
                        <button
                          onClick={() => setExpandedDisease(isExpanded ? null : dp.disease)}
                          className="px-2.5 py-1 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 text-[11px] font-semibold rounded-lg border border-indigo-400/30 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Info className="w-3.5 h-3.5" />
                          {isExpanded ? 'Hide Details' : 'What is this disease?'}
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${dp.percentage}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full ${
                          dp.percentage >= 70 ? 'bg-gradient-to-r from-orange-500 to-rose-500' :
                          dp.percentage >= 40 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                          'bg-gradient-to-r from-cyan-500 to-amber-500'
                        }`}
                      />
                    </div>

                    {/* Expandable Disease Description Callout from symptom_Description.csv */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-2 border-t border-white/10"
                        >
                          <div className="p-3.5 bg-indigo-950/60 border border-indigo-400/30 rounded-xl space-y-1.5">
                            <span className="text-[10px] font-mono font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                              <Info className="w-3.5 h-3.5 text-cyan-400" />
                              Disease Profile & Pathogen Vector Explanation
                            </span>
                            <p className="text-xs text-slate-200 leading-relaxed font-normal">
                              {dp.description}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feature Drivers / Importance Score */}
          {xgboost.featureDrivers && xgboost.featureDrivers.length > 0 && (
            <div className="space-y-3 border-t border-indigo-500/20 pt-4">
              <h4 className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" /> Key Feature Importance Drivers (XGBoost Split Weights)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {xgboost.featureDrivers.map((fd, idx) => (
                  <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-200">{fd.feature}</span>
                      <span className="font-mono text-emerald-400 font-bold">{fd.importancePercentage}% Weight</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${Math.min(100, fd.importancePercentage * 3)}%` }} 
                        className="h-full bg-emerald-400 rounded-full" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Mitigation Actions Checklist */}
      <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-4">
        <h3 className="font-semibold text-slate-700 text-sm border-b border-slate-50 pb-2">
          Sanitation & Household Mitigation Directives
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {prediction.recommendations.map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-start gap-3"
            >
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-emerald-700">Mitigation Step {i+1}</span>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">{rec}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Nav Actions Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 p-4 border border-slate-200/60 rounded-2xl">
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => {
              resetSurvey();
              setActivePage('new-survey');
            }}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-slate-400" />
            Fresh Survey
          </button>
          
          <button
            onClick={() => setActivePage('volunteer-dashboard')}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Home className="w-4 h-4 text-slate-400" />
            Dashboard
          </button>
        </div>

        <PDFButton report={currentCase} />
      </div>

    </div>
  );
}
