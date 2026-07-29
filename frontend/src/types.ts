/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'volunteer' | 'admin';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email: string;
  avatar: string;
  villageAssigned?: string;
  district?: string;
}

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type CaseStatus = 
  | 'Assigned' 
  | 'Survey Started' 
  | 'Prediction Generated' 
  | 'Admin Review' 
  | 'Government Action' 
  | 'In Progress' 
  | 'Resolved';

export interface GPSCoordinates {
  latitude: number;
  longitude: number;
}

export interface WaterDetails {
  source: string; // e.g., Municipal, Borewell, Open Well, River, Lake, etc.
  appearance: string; // e.g., Clear, Turbid, Yellowish, Brownish
  smell: string; // e.g., None, Rotten Eggs (Sulfur), Chemical, Musty
  taste: string; // e.g., Normal, Salty, Metallic, Bitter
  visibleParticles: boolean;
  storageMethod: string; // e.g., Covered Container, Open Container, Overhead Tank
  isBoiled: boolean;
  isFiltered: boolean;
}

export interface WaterTest {
  h2sResult: 'Positive' | 'Negative' | 'Pending';
  phValue: number;
}

export interface CitizenDetails {
  name: string;
  age: number;
  gender: string;
  phone: string;
  email?: string;
  occupation: string;
  village: string;
  district: string;
  address: string;
  gps: GPSCoordinates;
}

export interface SurveyState {
  citizen: CitizenDetails;
  water: WaterDetails;
  test: WaterTest;
  symptoms: string[];
  symptomDuration: number;
  familySick: boolean;
  medicalHistory: string;
}

export interface XGBoostDiseaseProbability {
  disease: string;
  percentage: number;
  riskLevel: RiskLevel;
  description: string;
}

export interface XGBoostFeatureDriver {
  feature: string;
  importancePercentage: number;
  description: string;
}

export interface XGBoostEvaluation {
  modelName: string;
  modelConfidence: number;
  riskProbabilities: {
    Safe: number;
    Contaminated: number;
    HighlyContaminated: number;
  };
  diseaseProbabilities: XGBoostDiseaseProbability[];
  contaminantProbabilities: Array<{ category: string; percentage: number }>;
  featureDrivers: XGBoostFeatureDriver[];
}

export interface PredictionResult {
  waterStatus: 'Safe' | 'Contaminated' | 'Highly Contaminated';
  riskLevel: RiskLevel;
  likelyContaminant: string;
  predictedDiseases: string[];
  recommendations: string[];
  xgboostEvaluation?: XGBoostEvaluation;
}

export interface Case {
  id: string;
  citizenName: string;
  citizenAge: number;
  citizenGender: string;
  citizenPhone: string;
  citizenOccupation: string;
  village: string;
  district: string;
  address: string;
  gpsCoordinates: GPSCoordinates;
  waterDetails: WaterDetails;
  waterTest: WaterTest;
  symptoms: string[];
  symptomDuration: number;
  familySick: boolean;
  medicalHistory: string;
  prediction: PredictionResult | null;
  assignedVolunteer: string;
  status: CaseStatus;
  lastUpdated: string;
  dateCreated: string;
  adminResponse?: {
    actionType: 'ASHA Workers' | 'Medical Support' | 'Sewage Cleaners' | 'Chemist' | 'Assign Support' | 'Closed';
    timestamp: string;
    note?: string;
    status: string;
  };
}

export interface Volunteer {
  id: string;
  name: string;
  username: string;
  password?: string;
  assigned: number;
  completed: number;
  pending: number;
  critical: number;
  status: 'Active' | 'On Leave';
  email: string;
  villageAssigned: string;
  district?: string;
}

export interface TimelineEvent {
  id: string;
  caseId: string;
  status: CaseStatus;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
}
