import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load diseases database
const diseasesPath = path.join(__dirname, '..', 'data', 'diseases.json');
let diseases = [];

try {
  const fileContent = fs.readFileSync(diseasesPath, 'utf8');
  diseases = JSON.parse(fileContent);
} catch (e) {
  console.error('[RuleEngine] Failed to load diseases database:', e);
}

/**
 * Predicts water safety, risk level, likely contaminants, and potential diseases
 * using a local weighted rule inference system.
 * 
 * @param {Object} survey The survey details
 * @returns {Object} Structured prediction result compatible with Gemini output schema
 */
export function predict(survey) {
  if (!survey) {
    return getDefaultSafeResult();
  }

  // Safe checks and normalized attributes
  const water = survey.water || {};
  const test = survey.test || {};
  const symptoms = survey.symptoms || [];
  const source = water.source || 'Unknown';
  const appearance = water.appearance || 'Normal';
  const smell = water.smell || 'None';
  const taste = water.taste || 'Normal';
  const visibleParticles = !!water.visibleParticles;
  const isBoiled = !!water.isBoiled;
  const isFiltered = !!water.isFiltered;
  const h2sResult = test.h2sResult || 'Negative';
  const phValue = typeof test.phValue === 'number' ? test.phValue : parseFloat(test.phValue || 7.0);
  const symptomDuration = survey.symptomDuration || 0;
  const familySick = !!survey.familySick;

  // Let's compute matching confidence for all diseases in the database
  const matches = [];

  for (const disease of diseases) {
    let waterScore = 0;
    let waterMax = 0;

    // 1. Water Source Match
    if (disease.triggers.waterSource) {
      waterMax += 1;
      if (disease.triggers.waterSource.includes(source)) {
        waterScore += 1;
      }
    }

    // 2. H2S Biological Test Match (highly weighted biomarker)
    if (disease.triggers.h2sResult) {
      waterMax += 4;
      if (h2sResult === disease.triggers.h2sResult) {
        waterScore += 4;
      }
    }

    // 3. pH Range Match
    if (disease.triggers.phRange) {
      waterMax += 2;
      if (phValue >= disease.triggers.phRange.min && phValue <= disease.triggers.phRange.max) {
        waterScore += 2;
      }
    }

    // 4. Physical attributes (Turbidity, Taste, Particles)
    if (disease.triggers.appearance) {
      waterMax += 1.5;
      if (disease.triggers.appearance.includes(appearance)) {
        waterScore += 1.5;
      }
    }

    if (disease.triggers.taste) {
      waterMax += 1.5;
      if (disease.triggers.taste.includes(taste)) {
        waterScore += 1.5;
      }
    }

    if (disease.triggers.visibleParticles !== undefined) {
      waterMax += 1;
      if (visibleParticles === disease.triggers.visibleParticles) {
        waterScore += 1;
      }
    }

    // 5. Symptom Profiling
    let symptomScore = 0;
    let symptomMax = 0;

    // Required symptoms (highest weight)
    if (disease.symptoms.required && disease.symptoms.required.length > 0) {
      for (const s of disease.symptoms.required) {
        symptomMax += 3;
        if (symptoms.includes(s)) {
          symptomScore += 3;
        }
      }
    }

    // Optional symptoms (lower weight)
    if (disease.symptoms.optional && disease.symptoms.optional.length > 0) {
      for (const s of disease.symptoms.optional) {
        symptomMax += 1;
        if (symptoms.includes(s)) {
          symptomScore += 1;
        }
      }
    }

    // Normalize Jaccard scores
    const waterPct = waterMax > 0 ? (waterScore / waterMax) : 0;
    const symptomPct = symptomMax > 0 ? (symptomScore / symptomMax) : 0;

    // Overall combined score. If symptoms are present, they are highly diagnostic (50/50).
    // If no symptoms are reported, water quality triggers represent potential exposure risk.
    let overallMatch = 0;
    if (symptoms.length > 0) {
      overallMatch = (waterPct * 0.4) + (symptomPct * 0.6);
    } else {
      overallMatch = waterPct * 0.8; // exposure risk score
    }

    // Boost score slightly if family members are sick (epidemiological spread signature)
    if (familySick && symptoms.length > 0 && symptomPct > 0) {
      overallMatch = Math.min(1.0, overallMatch + 0.15);
    }

    // Apply penalty if the water was properly treated (boiled & filtered)
    if (isBoiled && isFiltered) {
      // Direct viral/bacterial ingestion risk drops substantially
      if (disease.id !== 'DIS-006' && disease.id !== 'DIS-007' && disease.id !== 'DIS-008') { 
        // Chemical contaminants (Fluoride, Arsenic, Lead) are NOT removed by boiling, so no penalty for chemical toxicity profiles.
        overallMatch *= 0.3; // 70% drop for biological vectors
      }
    } else if (isBoiled || isFiltered) {
      if (disease.id !== 'DIS-006' && disease.id !== 'DIS-007' && disease.id !== 'DIS-008') {
        overallMatch *= 0.6; // 40% drop
      }
    }

    matches.push({
      disease,
      score: overallMatch
    });
  }

  // Filter matches above a 35% threshold
  const activeMatches = matches
    .filter(m => m.score >= 0.35)
    .sort((a, b) => b.score - a.score);

  if (activeMatches.length === 0) {
    // If there is minor contamination but no disease matches
    if (h2sResult === 'Positive' || phValue < 6.0 || phValue > 8.5 || appearance !== 'Clear' || smell !== 'None') {
      return getMildContaminationResult(h2sResult, phValue, appearance, smell);
    }
    return getDefaultSafeResult();
  }

  // Compile final results based on matched diseases
  const topMatch = activeMatches[0];
  const predictedDiseases = activeMatches.map(m => m.disease.name);
  
  // Aggregate all recommendations from matching profiles without duplicates
  const recommendationsSet = new Set();
  activeMatches.forEach(m => {
    m.disease.recommendations.forEach(rec => recommendationsSet.add(rec));
  });
  const recommendations = Array.from(recommendationsSet);

  // Compile likely contaminants
  const contaminants = [];
  if (h2sResult === 'Positive') {
    contaminants.push('Hydrogen Sulfide bacteria');
    contaminants.push('Coliform/E. coli bacterial species');
  }
  if (phValue < 6.5) contaminants.push('Acidic contamination');
  if (phValue > 8.0) contaminants.push('Alkaline chemical trace minerals');
  if (smell === 'Rotten Eggs (Sulfur)') contaminants.push('Organic sulfides');
  if (smell === 'Chemical') contaminants.push('Industrial chemical runoffs');
  if (taste === 'Metallic') contaminants.push('Dissolved heavy minerals (Lead/Iron)');
  if (taste === 'Salty') contaminants.push('High TDS (Fluoride/Chloride)');

  if (contaminants.length === 0) {
    contaminants.push(topMatch.disease.transmission.split(' ')[0] || 'Microbial organisms');
  }

  // Determine maximum waterStatus and riskLevel
  let waterStatus = 'Safe';
  let riskLevel = 'Low';

  const riskLevels = ['Low', 'Medium', 'High', 'Critical'];
  const statusLevels = ['Safe', 'Contaminated', 'Highly Contaminated'];

  activeMatches.forEach(m => {
    const r = m.disease.classification.riskLevel;
    const s = m.disease.classification.waterStatus;
    if (riskLevels.indexOf(r) > riskLevels.indexOf(riskLevel)) {
      riskLevel = r;
    }
    if (statusLevels.indexOf(s) > statusLevels.indexOf(waterStatus)) {
      waterStatus = s;
    }
  });

  return {
    waterStatus,
    riskLevel,
    likelyContaminant: contaminants.join(', '),
    predictedDiseases,
    recommendations
  };
}

function getDefaultSafeResult() {
  return {
    waterStatus: 'Safe',
    riskLevel: 'Low',
    likelyContaminant: 'None Detected',
    predictedDiseases: [],
    recommendations: [
      'Water indices appear safe for consumption. Continue regular storage hygiene.',
      'Always clean and wash the storage vessel weekly with safe water.'
    ]
  };
}

function getMildContaminationResult(h2s, ph, appearance, smell) {
  const recommendations = [
    'Boil drinking water as a precautionary measure.',
    'Store water in thoroughly cleaned and covered containers.'
  ];
  const contaminants = [];

  if (h2s === 'Positive') {
    contaminants.push('Hydrogen Sulfide biological indicators');
    recommendations.push('Add bleaching powder/chlorine tablets to disinfect.');
  }
  if (ph < 6.5 || ph > 8.5) contaminants.push('pH imbalance');
  if (appearance !== 'Clear') contaminants.push('Suspended colloidal particles');
  if (smell !== 'None') contaminants.push('Volatile organic compounds');

  return {
    waterStatus: 'Contaminated',
    riskLevel: 'Medium',
    likelyContaminant: contaminants.join(', ') || 'Suspended particulate matter',
    predictedDiseases: ['Mild Gastroenteritis Risk'],
    recommendations
  };
}
