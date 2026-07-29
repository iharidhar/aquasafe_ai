/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Droplet, Beaker, ShieldCheck, Heart, AlertCircle, HelpCircle, ArrowRight } from 'lucide-react';

export default function SurveyGuide() {
  const guides = [
    {
      title: 'Water Sample Collection Protocol',
      icon: <Droplet className="w-5 h-5 text-cyan-600" />,
      desc: 'How to collect sterile representative field samples without cross-contamination.',
      steps: [
        'Select clean, sterile 100mL collection vials.',
        'If collecting from a tap, let water flow for 1-2 minutes to flush pipe sediment.',
        'If collecting from an open well, submerge bottle 30cm below surface to avoid surface grease.',
        'Tightly seal immediately and write Case ID, Date, and Source on the vial label.'
      ],
      alert: 'Do not touch the inside of the cap or vial mouth with bare hands.'
    },
    {
      title: 'H₂S Paper Strip Culturing test',
      icon: <Beaker className="w-5 h-5 text-purple-600" />,
      desc: 'How to conduct the biological incubation test for hydrogen sulfide coliforms.',
      steps: [
        'Uncap the chemical paper strip tube using sterilized forceps.',
        'Fill water to the 20mL line and close tightly.',
        'Store in a dark cupboard/pouch at room temp (25°C - 37°C) for 12-24 hours.',
        'Inspect colour reaction: Yellow indicates negative. Complete blackening indicates positive coliforms.'
      ],
      alert: 'Blackening signifies biological contamination (fecal E. coli). Treat with high hazard urgency.'
    },
    {
      title: 'Digital pH Meter Calibration',
      icon: <BookOpen className="w-5 h-5 text-indigo-600" />,
      desc: 'Ensuring accurate alkaline and acid readings before logging values.',
      steps: [
        'Rinse electrode tip in distilled water before turning on.',
        'Immerse in pH 7.0 buffer solution to calibrate baseline accuracy.',
        'Dip 2cm into collected water sample and stir gently for 10 seconds.',
        'Wait for the digital display value to stabilize before recording pH on the survey stepper.'
      ],
      alert: 'Extreme levels (<4.5 or >9.5 pH) indicate chemical discharge and require admin escalations.'
    },
    {
      title: 'Field Safety & Personal hygiene',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
      desc: 'Crucial self-care protocols for healthcare workers in contaminated outbreak sectors.',
      steps: [
        'Always wear gloves and sanitize hands between door-to-door surveys.',
        'Do not ingest raw field samples or local municipal tap water under any circumstances.',
        'If symptoms of nausea or gastro cramps appear, report immediately to Dr. Sarah Alvares.',
        'Ensure proper hazardous waste disposal of black reaction H₂S strip tests.'
      ],
      alert: 'Keep emergency hydration kits (ORS salts) in your field kit at all times.'
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Title */}
      <div className="text-center space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-800">Digital Biosurveillance Field Manual</h1>
        <p className="text-xs text-slate-400">Authorized medical procedures and chemical testing calibration for community volunteers</p>
      </div>

      {/* Guide Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map((g, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-slate-50 rounded-xl shrink-0">
                  {g.icon}
                </div>
                <h3 className="font-display font-bold text-slate-800 text-sm">{g.title}</h3>
              </div>

              <p className="text-xs text-slate-500 font-medium">{g.desc}</p>

              {/* Steps lists */}
              <ol className="space-y-2 text-xs text-slate-600 font-medium">
                {g.steps.map((s, i) => (
                  <li key={i} className="flex gap-2 items-start">
                    <span className="font-mono font-bold text-cyan-600 shrink-0">{i+1}.</span>
                    <span className="leading-normal">{s}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Alert Box */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex gap-2">
              <AlertCircle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
              <span className="text-[10px] text-slate-500 leading-normal font-semibold">
                <b>Caution Advisory:</b> {g.alert}
              </span>
            </div>

          </motion.div>
        ))}
      </div>

      {/* Embedded video simulated placeholder */}
      <div className="bg-slate-900 text-white rounded-2xl overflow-hidden shadow-md flex flex-col md:flex-row">
        <div className="p-6 md:p-8 flex-1 space-y-3 flex flex-col justify-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950 border border-cyan-800/50 w-fit">
            <Heart className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-[9px] font-bold tracking-wider text-cyan-200 uppercase">Field Training Video</span>
          </div>
          <h2 className="text-lg font-bold font-display tracking-tight">Active Biological Inoculation training</h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
            Watch Dr. Sarah Alvares calibrate water sensors and incubate H₂S strips in real-time under standard field climates. Learn E. coli colony counting methods.
          </p>
          <div className="pt-2 text-xs text-slate-400 font-medium flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
            Request official video download <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Mock frame */}
        <div className="md:w-72 bg-slate-950 relative flex items-center justify-center p-8 border-t md:border-t-0 md:border-l border-slate-800 min-h-36">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-teal-900/30 opacity-70" />
          <div className="relative text-center space-y-2 z-10">
            <div className="w-10 h-10 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center mx-auto shadow-md shadow-cyan-600/20 transition-all cursor-pointer">
              <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-8 border-l-white ml-0.5" />
            </div>
            <span className="text-[10px] font-mono text-slate-400 block font-bold">12 mins HD tutorial</span>
          </div>
        </div>
      </div>

    </div>
  );
}
