/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { 
  User, Droplets, Beaker, Activity, CheckCircle, 
  ChevronRight, ChevronLeft, MapPin, Compass, AlertCircle
} from 'lucide-react';

export default function NewSurvey() {
  const { currentSurvey, updateSurvey, submitSurvey, resetSurvey, setActivePage, isPredicting } = useApp();
  const [step, setStep] = useState(1);
  const [gpsLoading, setGpsLoading] = useState(false);

  const stepsHeader = [
    { num: 1, label: 'Person', icon: <User className="w-4 h-4" /> },
    { num: 2, label: 'Water Source', icon: <Droplets className="w-4 h-4" /> },
    { num: 3, label: 'Biological Test', icon: <Beaker className="w-4 h-4" /> },
    { num: 4, label: 'Clinical Checklist', icon: <Activity className="w-4 h-4" /> },
    { num: 5, label: 'Submit Audit', icon: <CheckCircle className="w-4 h-4" /> }
  ];

  // Manual input updates helpers
  const handleCitizenChange = (key: string, val: any) => {
    updateSurvey(prev => ({
      ...prev,
      citizen: {
        ...prev.citizen,
        [key]: val
      }
    }));
  };

  const handleWaterChange = (key: string, val: any) => {
    updateSurvey(prev => ({
      ...prev,
      water: {
        ...prev.water,
        [key]: val
      }
    }));
  };

  const handleTestChange = (key: string, val: any) => {
    updateSurvey(prev => ({
      ...prev,
      test: {
        ...prev.test,
        [key]: val
      }
    }));
  };

  const toggleSymptom = (symptom: string) => {
    updateSurvey(prev => {
      const exists = prev.symptoms.includes(symptom);
      const newSymptoms = exists 
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom];
      return {
        ...prev,
        symptoms: newSymptoms
      };
    });
  };

  // Get GPS Location
  const handleFetchGps = () => {
    setGpsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleCitizenChange('gps', {
            latitude: Number(position.coords.latitude.toFixed(5)),
            longitude: Number(position.coords.longitude.toFixed(5))
          });
          setGpsLoading(false);
        },
        () => {
          // Fallback static mocks
          handleCitizenChange('gps', {
            latitude: Number((12.5412 + Math.random() * 0.05).toFixed(5)),
            longitude: Number((77.4102 + Math.random() * 0.05).toFixed(5))
          });
          setGpsLoading(false);
        }
      );
    } else {
      setGpsLoading(false);
    }
  };

  // Validation
  const isStepValid = () => {
    if (step === 1) {
      return (
        currentSurvey.citizen.name.trim() !== '' &&
        currentSurvey.citizen.age > 0 &&
        currentSurvey.citizen.phone.trim() !== '' &&
        currentSurvey.citizen.village.trim() !== '' &&
        currentSurvey.citizen.address.trim() !== ''
      );
    }
    if (step === 2) {
      return currentSurvey.water.source !== '';
    }
    return true;
  };

  const handleNext = () => {
    if (isStepValid()) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitSurvey();
  };

  // Visual pH description
  const getPhDescription = (ph: number) => {
    if (ph < 5.0) return { label: 'Highly Acidic (Danger)', color: 'text-red-500' };
    if (ph < 6.5) return { label: 'Mildly Acidic (Incorrosive)', color: 'text-orange-400' };
    if (ph <= 8.5) return { label: 'Neutral & Optimal (Safe)', color: 'text-emerald-500' };
    if (ph <= 10.0) return { label: 'Mildly Alkaline', color: 'text-sky-500' };
    return { label: 'Highly Alkaline (Danger)', color: 'text-indigo-600' };
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Visual Title */}
      <div className="text-center space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-800">Fresh Biosurveillance Survey</h1>
        <p className="text-xs text-slate-400">Complete physical, chemical and clinical audits for outbreak forecasting</p>
      </div>

      {/* Stepper Progress bar */}
      <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs">
        <div className="flex justify-between items-center relative">
          
          {/* Horizontal connection line */}
          <div className="absolute top-[17px] left-8 right-8 h-0.5 bg-slate-100 z-0" />
          <div 
            className="absolute top-[17px] left-8 h-0.5 bg-gradient-to-r from-cyan-600 to-teal-500 transition-all duration-300 z-0"
            style={{ width: `${((step - 1) / (stepsHeader.length - 1)) * 100}%` }}
          />

          {stepsHeader.map(s => {
            const isCompleted = step > s.num;
            const isActive = step === s.num;
            return (
              <div key={s.num} className="flex flex-col items-center gap-1.5 z-10">
                <button
                  disabled={s.num > step && !isCompleted}
                  onClick={() => setStep(s.num)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer border-2 ${
                    isCompleted 
                      ? 'bg-gradient-to-r from-cyan-600 to-teal-500 border-transparent text-white' 
                      : isActive 
                        ? 'bg-white border-cyan-600 text-cyan-600 shadow-sm shadow-cyan-600/10' 
                        : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle className="w-5 h-5 stroke-[2.5]" /> : s.icon}
                </button>
                <span className={`text-[10px] font-bold tracking-tight hidden sm:inline ${
                  isActive ? 'text-cyan-700' : isCompleted ? 'text-cyan-600/80' : 'text-slate-400'
                }`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stepper Steps container */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden relative">
        <form onSubmit={handleSubmit} className="p-6">
          {isPredicting && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-50 flex flex-col items-center justify-center gap-4 rounded-2xl">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-cyan-100 border-t-cyan-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-600 animate-ping" />
                </div>
              </div>
              <div className="text-center">
                <span className="font-display font-bold text-slate-800 text-sm block">Central ML Outbreak Engine</span>
                <span className="text-[10px] text-slate-400 font-medium block mt-1 animate-pulse">Running epidemiological prediction model...</span>
              </div>
            </div>
          )}
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Person Details */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-4"
              >
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-semibold text-slate-700 text-sm">Citizen Demographics</h3>
                  <p className="text-[11px] text-slate-400">Collect primary contact and household location details</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500">Citizen Full Name *</label>
                    <input
                      type="text"
                      value={currentSurvey.citizen.name}
                      onChange={(e) => handleCitizenChange('name', e.target.value)}
                      placeholder="e.g. Ramesh Reddy"
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:outline-none text-xs font-semibold text-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500">Age *</label>
                      <input
                        type="number"
                        value={currentSurvey.citizen.age || ''}
                        onChange={(e) => handleCitizenChange('age', Number(e.target.value))}
                        placeholder="Age"
                        required
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:outline-none text-xs font-semibold text-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500">Gender *</label>
                      <select
                        value={currentSurvey.citizen.gender}
                        onChange={(e) => handleCitizenChange('gender', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:outline-none text-xs font-semibold text-slate-700"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500">Mobile Number *</label>
                    <input
                      type="tel"
                      value={currentSurvey.citizen.phone}
                      onChange={(e) => handleCitizenChange('phone', e.target.value)}
                      placeholder="e.g. +91 98765 00000"
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:outline-none text-xs font-semibold text-slate-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500">Occupation</label>
                    <input
                      type="text"
                      value={currentSurvey.citizen.occupation}
                      onChange={(e) => handleCitizenChange('occupation', e.target.value)}
                      placeholder="e.g. Agricultural Worker"
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:outline-none text-xs font-semibold text-slate-700"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[11px] font-bold text-slate-500">Street Address *</label>
                    <textarea
                      value={currentSurvey.citizen.address}
                      onChange={(e) => handleCitizenChange('address', e.target.value)}
                      placeholder="Door No, Sector, landmarks..."
                      rows={2}
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:outline-none text-xs font-semibold text-slate-700 resize-none"
                    />
                  </div>

                  {/* Location Selector Mocks */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500">Assigned Village Block *</label>
                    <select
                      value={currentSurvey.citizen.village}
                      onChange={(e) => handleCitizenChange('village', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:outline-none text-xs font-semibold text-slate-700"
                    >
                      <option value="Kanakapura">Kanakapura</option>
                      <option value="Anekal">Anekal</option>
                      <option value="Hosur">Hosur</option>
                      <option value="Devanahalli">Devanahalli</option>
                    </select>
                  </div>

                  {/* GPS Trigger */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500">Surveillance GPS Coordinates</label>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-slate-50 p-2 rounded-xl border border-slate-200/60 font-mono text-[10px] text-slate-500 flex items-center justify-between">
                        <span>Lat: {currentSurvey.citizen.gps.latitude}</span>
                        <span>Lon: {currentSurvey.citizen.gps.longitude}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleFetchGps}
                        disabled={gpsLoading}
                        className="px-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 text-white rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Compass className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Water Details */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-4"
              >
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-semibold text-slate-700 text-sm">Physical Water Characteristics</h3>
                  <p className="text-[11px] text-slate-400">Assess water extraction source and physical parameters</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500">Water Source type *</label>
                    <select
                      value={currentSurvey.water.source}
                      onChange={(e) => handleWaterChange('source', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:outline-none text-xs font-semibold text-slate-700"
                    >
                      <option value="Borewell">Borewell</option>
                      <option value="Open Well">Open Well</option>
                      <option value="Municipal Tap">Municipal Tap</option>
                      <option value="River">River</option>
                      <option value="Lake">Lake</option>
                      <option value="Canal">Canal</option>
                      <option value="RO Plant">RO Plant</option>
                      <option value="Pond">Pond</option>
                      <option value="Tanker">Tanker</option>
                      <option value="Hand Pump">Hand Pump</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500">Physical Appearance</label>
                    <select
                      value={currentSurvey.water.appearance}
                      onChange={(e) => handleWaterChange('appearance', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:outline-none text-xs font-semibold text-slate-700"
                    >
                      <option value="Clear">Clear / Transparent</option>
                      <option value="Turbid">Turbid / Cloudy</option>
                      <option value="Yellowish">Yellowish tint</option>
                      <option value="Brownish">Brownish sediment</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500">Smell / Odour</label>
                    <select
                      value={currentSurvey.water.smell}
                      onChange={(e) => handleWaterChange('smell', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:outline-none text-xs font-semibold text-slate-700"
                    >
                      <option value="None">None / Clean</option>
                      <option value="Rotten Eggs (Sulfur)">Rotten Eggs (Sulfur - Bio contaminant)</option>
                      <option value="Chemical">Chemical / Chlorine odour</option>
                      <option value="Musty">Musty / Damp algae odour</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500">Taste Profile</label>
                    <select
                      value={currentSurvey.water.taste}
                      onChange={(e) => handleWaterChange('taste', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:outline-none text-xs font-semibold text-slate-700"
                    >
                      <option value="Normal">Normal taste</option>
                      <option value="Salty">Salty (High mineral content)</option>
                      <option value="Metallic">Metallic / Rust taste</option>
                      <option value="Bitter">Bitter taste</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500">Storage Environment</label>
                    <select
                      value={currentSurvey.water.storageMethod}
                      onChange={(e) => handleWaterChange('storageMethod', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:outline-none text-xs font-semibold text-slate-700"
                    >
                      <option value="Covered Container">Covered Vessel / Pot</option>
                      <option value="Open Container">Open Vessel (High risk)</option>
                      <option value="Overhead Tank">Overhead Tank</option>
                    </select>
                  </div>

                  <div className="space-y-3 pt-4">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600">
                        <input
                          type="checkbox"
                          checked={currentSurvey.water.visibleParticles}
                          onChange={(e) => handleWaterChange('visibleParticles', e.target.checked)}
                          className="w-4 h-4 text-cyan-600 border-slate-300 rounded-sm"
                        />
                        Visible suspended particles?
                      </label>
                    </div>

                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600">
                        <input
                          type="checkbox"
                          checked={currentSurvey.water.isBoiled}
                          onChange={(e) => handleWaterChange('isBoiled', e.target.checked)}
                          className="w-4 h-4 text-cyan-600 border-slate-300 rounded-sm"
                        />
                        Is boiled daily?
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600">
                        <input
                          type="checkbox"
                          checked={currentSurvey.water.isFiltered}
                          onChange={(e) => handleWaterChange('isFiltered', e.target.checked)}
                          className="w-4 h-4 text-cyan-600 border-slate-300 rounded-sm"
                        />
                        Is filtered (Mesh/RO)?
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Chemical & Biological Test */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-semibold text-slate-700 text-sm">Bio-Chemical Field Indicator Test</h3>
                  <p className="text-[11px] text-slate-400">Record results of H₂S paper strip incubator and digital pH readings</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* H2S Strip selection */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 block">H₂S Paper Strip Test (Bacterial Indicator)</label>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Tests for hydrogen sulfide-producing enterobacteria (Coliforms/E.coli)</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { val: 'Positive', label: 'Positive (Black)', desc: 'Biological Pathogen Detected', border: 'border-rose-300 hover:border-rose-400', activeBg: 'bg-rose-50 border-rose-500 text-rose-700' },
                        { val: 'Negative', label: 'Negative (Yellow)', desc: 'No Pathogen Detected', border: 'border-emerald-300 hover:border-emerald-400', activeBg: 'bg-emerald-50 border-emerald-500 text-emerald-700' },
                        { val: 'Pending', label: 'Pending (12h)', desc: 'Strip Incubating in field', border: 'border-slate-300 hover:border-slate-400', activeBg: 'bg-slate-50 border-slate-500 text-slate-700' }
                      ].map(item => {
                        const active = currentSurvey.test.h2sResult === item.val;
                        return (
                          <button
                            key={item.val}
                            type="button"
                            onClick={() => handleTestChange('h2sResult', item.val)}
                            className={`p-3 rounded-xl border text-center flex flex-col justify-center items-center gap-1.5 transition-all cursor-pointer ${
                              active ? item.activeBg : `bg-white ${item.border} text-slate-500`
                            }`}
                          >
                            <span className="text-xs font-bold block">{item.label}</span>
                            <span className="text-[8px] leading-tight block opacity-90">{item.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* pH Slider */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-600">Digital pH Assessment</label>
                        <span className="text-sm font-mono font-bold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-100">pH: {currentSurvey.test.phValue}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Recommended drinking threshold: 6.5 - 8.5 pH index</span>
                    </div>

                    <div className="space-y-2.5">
                      <input
                        type="range"
                        min="0"
                        max="14"
                        step="0.1"
                        value={currentSurvey.test.phValue}
                        onChange={(e) => handleTestChange('phValue', Number(e.target.value))}
                        className="w-full accent-cyan-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] font-bold text-slate-400 px-1 font-mono">
                        <span className="text-red-500">0 (Acid)</span>
                        <span>7 (Neutral)</span>
                        <span className="text-indigo-600">14 (Alkali)</span>
                      </div>
                      
                      {/* Interactive chemical alert box */}
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-600" />
                        <span className="text-[11px] font-semibold text-slate-500 leading-none">
                          Calculated Acid Imbalance: 
                          <b className={`ml-1 font-bold ${getPhDescription(currentSurvey.test.phValue).color}`}>
                            {getPhDescription(currentSurvey.test.phValue).label}
                          </b>
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* STEP 4: Symptoms Checklist */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-5"
              >
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-semibold text-slate-700 text-sm">Clinical Symptoms Checklist</h3>
                  <p className="text-[11px] text-slate-400">Log physical symptoms of the citizen and surrounding community</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block">Reported Symptoms (Select all that apply)</label>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Indicative of immediate microbiological gut/water poisoning</span>
                  </div>

                  {/* Grid check of symptoms */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      'Fever', 'Diarrhea', 'Vomiting', 'Nausea', 'Headache', 
                      'Skin Irritation', 'Eye Irritation', 'Fatigue', 'Abdominal Pain', 'Weight Loss'
                    ].map(s => {
                      const selected = currentSurvey.symptoms.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSymptom(s)}
                          className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer text-xs font-semibold ${
                            selected 
                              ? 'bg-rose-50 border-rose-200 text-rose-700' 
                              : 'bg-white border-slate-100 hover:border-slate-200 text-slate-500'
                          }`}
                        >
                          {s}
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            selected ? 'bg-rose-500 border-transparent text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {selected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500">Symptom Duration (in Days)</label>
                      <input
                        type="number"
                        min="0"
                        value={currentSurvey.symptomDuration || ''}
                        onChange={(e) => updateSurvey({ symptomDuration: Number(e.target.value) })}
                        placeholder="Duration (e.g. 3)"
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:outline-none text-xs font-semibold text-slate-700"
                      />
                    </div>

                    <div className="space-y-2 pt-5">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600">
                        <input
                          type="checkbox"
                          checked={currentSurvey.familySick}
                          onChange={(e) => updateSurvey({ familySick: e.target.checked })}
                          className="w-4 h-4 text-cyan-600 border-slate-300 rounded-sm"
                        />
                        Are other family members sick?
                      </label>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[11px] font-bold text-slate-500">Chronic Medical History / Co-morbidities</label>
                      <input
                        type="text"
                        value={currentSurvey.medicalHistory}
                        onChange={(e) => updateSurvey({ medicalHistory: e.target.value })}
                        placeholder="e.g. Mild Hypertension, none..."
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-cyan-500 focus:outline-none text-xs font-semibold text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 5: Review & Submit */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-4"
              >
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-semibold text-slate-700 text-sm">Review Surveillance Record</h3>
                  <p className="text-[11px] text-slate-400">Validate physical readings before transmitting to central server</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  
                  {/* Demographics Card */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Citizen & Demographics</span>
                    <div className="space-y-1 font-semibold text-slate-600">
                      <div>Name: <b className="text-slate-800">{currentSurvey.citizen.name}</b></div>
                      <div>Demographics: <b className="text-slate-800">{currentSurvey.citizen.age}y / {currentSurvey.citizen.gender}</b></div>
                      <div>Block/Village: <b className="text-slate-800">{currentSurvey.citizen.village}</b></div>
                      <div>GPS: <b className="text-slate-800 font-mono text-[10px]">{currentSurvey.citizen.gps.latitude}, {currentSurvey.citizen.gps.longitude}</b></div>
                    </div>
                  </div>

                  {/* Physical Quality Card */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Water Extraction Qualities</span>
                    <div className="space-y-1 font-semibold text-slate-600">
                      <div>Source: <b className="text-slate-800">{currentSurvey.water.source}</b></div>
                      <div>Physical: <b className="text-slate-800">{currentSurvey.water.appearance} / {currentSurvey.water.smell}</b></div>
                      <div>Boiled daily: <b className="text-slate-800">{currentSurvey.water.isBoiled ? 'Yes' : 'No'}</b></div>
                      <div>Filtered: <b className="text-slate-800">{currentSurvey.water.isFiltered ? 'Yes' : 'No'}</b></div>
                    </div>
                  </div>

                  {/* Biological tests card */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Field Biological Readings</span>
                    <div className="space-y-1 font-semibold text-slate-600">
                      <div>H₂S Paper test: 
                        <b className={`ml-1 font-mono ${
                          currentSurvey.test.h2sResult === 'Positive' ? 'text-rose-600' : 'text-emerald-600'
                        }`}>{currentSurvey.test.h2sResult}</b>
                      </div>
                      <div>pH level: <b className="text-slate-800 font-mono">{currentSurvey.test.phValue}</b></div>
                    </div>
                  </div>

                  {/* Symptoms Card */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Clinical Assessment</span>
                    <div className="space-y-1 font-semibold text-slate-600">
                      <div>Logged Symptoms: <b className="text-rose-600">{currentSurvey.symptoms.join(', ') || 'None'}</b></div>
                      <div>Duration: <b className="text-slate-800">{currentSurvey.symptomDuration} days</b></div>
                      <div>Household sick: <b className="text-slate-800">{currentSurvey.familySick ? 'Yes' : 'No'}</b></div>
                    </div>
                  </div>

                </div>

                <div className="p-3.5 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl flex gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold block">Transmission Advisory</span>
                    <span className="text-[10px] leading-relaxed block mt-0.5">Submitting this audit triggers immediate machine-learning risk indexing. Severe biological cases automatically sound local water treatment notifications.</span>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Stepper Buttons Panel */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Step
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!isStepValid()}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white text-xs font-bold rounded-xl hover:from-cyan-700 hover:to-teal-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                Proceed Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isPredicting}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 text-white text-xs font-bold rounded-xl hover:from-cyan-700 hover:to-teal-700 transition-all flex items-center gap-1.5 shadow-md shadow-cyan-600/10 cursor-pointer disabled:opacity-50"
              >
                {isPredicting ? 'AI Analyzing Outbreak Risk...' : 'Analyze Risk Indices'}
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>

    </div>
  );
}
