/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Case, CaseStatus, SurveyState, PredictionResult, TimelineEvent, RiskLevel, Volunteer } from '../types';

interface AppContextType {
  currentUser: User | null;
  cases: Case[];
  volunteers: Volunteer[];
  timeline: TimelineEvent[];
  activePage: string;
  selectedCaseId: string | null;
  currentSurvey: SurveyState;
  login: (role: 'volunteer' | 'admin', username: string, password?: string) => Promise<boolean>;
  logout: () => void;
  setActivePage: (page: string) => void;
  setSelectedCaseId: (id: string | null) => void;
  updateSurvey: (updates: Partial<SurveyState> | ((prev: SurveyState) => SurveyState)) => void;
  resetSurvey: () => void;
  submitSurvey: () => Promise<Case>;
  updateCaseStatus: (caseId: string, newStatus: CaseStatus, description?: string) => void;
  addNewCase: (newCase: Case) => TimelineEvent;
  registerVolunteer: (volunteer: Omit<Volunteer, 'id' | 'assigned' | 'completed' | 'pending' | 'critical'> & { password?: string }) => void;
  takeAdminAction: (
    caseId: string, 
    actionType: 'ASHA Workers' | 'Medical Support' | 'Sewage Cleaners' | 'Chemist' | 'Assign Support' | 'Closed', 
    note?: string
  ) => void;
  isConnected: boolean;
  isPredicting: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial mock volunteers with login credentials
export const initialMockVolunteers: Volunteer[] = [
  { id: 'v1', name: 'Anil Kumar', username: 'Anil_Kumar', password: 'demo1234', assigned: 8, completed: 5, pending: 2, critical: 1, status: 'Active', email: 'anil@aquasafe.org', villageAssigned: 'Kanakapura' },
  { id: 'v2', name: 'Meera Deshmukh', username: 'Meera_Deshmukh', password: 'demo1234', assigned: 12, completed: 9, pending: 1, critical: 2, status: 'Active', email: 'meera@aquasafe.org', villageAssigned: 'Anekal' },
  { id: 'v3', name: 'Vikram Singh', username: 'Vikram_Singh', password: 'demo1234', assigned: 6, completed: 3, pending: 3, critical: 0, status: 'On Leave', email: 'vikram@aquasafe.org', villageAssigned: 'Hosur' },
  { id: 'v4', name: 'Sneha Patil', username: 'Sneha_Patil', password: 'demo1234', assigned: 15, completed: 10, pending: 4, critical: 1, status: 'Active', email: 'sneha@aquasafe.org', villageAssigned: 'Kanakapura' }
];

// Initial mock cases
const initialCases: Case[] = [
  {
    id: 'CASE-2026-001',
    citizenName: 'Rajesh Gowda',
    citizenAge: 42,
    citizenGender: 'Male',
    citizenPhone: '+91 98765 43210',
    citizenOccupation: 'Farmer',
    village: 'Kanakapura',
    district: 'Ramanagara',
    address: 'Near Old Temple, Kanakapura Sector 3',
    gpsCoordinates: { latitude: 12.5432, longitude: 77.4192 },
    waterDetails: {
      source: 'Open Well',
      appearance: 'Turbid',
      smell: 'Rotten Eggs (Sulfur)',
      taste: 'Metallic',
      visibleParticles: true,
      storageMethod: 'Overhead Tank',
      isBoiled: false,
      isFiltered: false
    },
    waterTest: {
      h2sResult: 'Positive',
      phValue: 5.8
    },
    symptoms: ['Fever', 'Diarrhea', 'Vomiting', 'Abdominal Pain'],
    symptomDuration: 3,
    familySick: true,
    medicalHistory: 'None',
    prediction: {
      waterStatus: 'Highly Contaminated',
      riskLevel: 'Critical',
      likelyContaminant: 'Hydrogen Sulfide, E. coli & Fecal Coliforms',
      predictedDiseases: ['Cholera', 'Acute Gastroenteritis'],
      recommendations: [
        'Strictly stop drinking water from this open well immediately.',
        'Boil water at a rolling boil for at least 3-5 minutes before any domestic use.',
        'Add chlorine tablets (bleaching powder treatment) to the well.',
        'Urgent medical consultation for Rajesh Gowda and sick family members.'
      ]
    },
    assignedVolunteer: 'Sneha Patil',
    status: 'Prediction Generated',
    dateCreated: '2026-07-06T10:30:00Z',
    lastUpdated: '2026-07-06T11:15:00Z'
  },
  {
    id: 'CASE-2026-002',
    citizenName: 'Priya Patel',
    citizenAge: 29,
    citizenGender: 'Female',
    citizenPhone: '+91 91234 56789',
    citizenOccupation: 'Homemaker',
    village: 'Anekal',
    district: 'Bangalore Rural',
    address: 'Block B, Maruthi Nagar, Anekal',
    gpsCoordinates: { latitude: 12.7121, longitude: 77.6987 },
    waterDetails: {
      source: 'Borewell',
      appearance: 'Yellowish',
      smell: 'None',
      taste: 'Salty',
      visibleParticles: false,
      storageMethod: 'Covered Container',
      isBoiled: false,
      isFiltered: true
    },
    waterTest: {
      h2sResult: 'Negative',
      phValue: 8.5
    },
    symptoms: ['Skin Irritation', 'Fatigue', 'Headache'],
    symptomDuration: 5,
    familySick: false,
    medicalHistory: 'Mild allergies',
    prediction: {
      waterStatus: 'Contaminated',
      riskLevel: 'High',
      likelyContaminant: 'High TDS & Alkaline Chemicals',
      predictedDiseases: ['Fluorosis', 'Dermatitis'],
      recommendations: [
        'Avoid direct consumption; use an advanced RO filtration unit if possible.',
        'Perform chemical laboratory testing to check for heavy metals and high fluoride.',
        'Apply soothing lotion for skin irritation and visit the local health camp.'
      ]
    },
    assignedVolunteer: 'Meera Deshmukh',
    status: 'Government Action',
    dateCreated: '2026-07-05T09:00:00Z',
    lastUpdated: '2026-07-07T14:30:00Z'
  },
  {
    id: 'CASE-2026-003',
    citizenName: 'Amit Singh',
    citizenAge: 35,
    citizenGender: 'Male',
    citizenPhone: '+91 88888 77777',
    citizenOccupation: 'Construction Worker',
    village: 'Hosur',
    district: 'Krishnagiri',
    address: 'Transit Camp Room 12, Hosur Ind Area',
    gpsCoordinates: { latitude: 12.7409, longitude: 77.8253 },
    waterDetails: {
      source: 'Municipal Tap',
      appearance: 'Clear',
      smell: 'Chemical',
      taste: 'Normal',
      visibleParticles: false,
      storageMethod: 'Open Container',
      isBoiled: false,
      isFiltered: false
    },
    waterTest: {
      h2sResult: 'Negative',
      phValue: 7.2
    },
    symptoms: ['Headache', 'Nausea'],
    symptomDuration: 2,
    familySick: false,
    medicalHistory: 'None',
    prediction: {
      waterStatus: 'Safe',
      riskLevel: 'Medium',
      likelyContaminant: 'Excessive Residual Chlorine / Air Dust',
      predictedDiseases: ['Mild Gastroenteritis (Risk)'],
      recommendations: [
        'Store water in a clean, covered container to prevent atmospheric pollution.',
        'Let the chemical smell dissipate before drinking or use a simple carbon filter.'
      ]
    },
    assignedVolunteer: 'Anil Kumar',
    status: 'Admin Review',
    dateCreated: '2026-07-08T11:00:00Z',
    lastUpdated: '2026-07-08T12:00:00Z'
  },
  {
    id: 'CASE-2026-004',
    citizenName: 'Savitha Reddy',
    citizenAge: 51,
    citizenGender: 'Female',
    citizenPhone: '+91 76543 21098',
    citizenOccupation: 'Teacher',
    village: 'Devanahalli',
    district: 'Bangalore Rural',
    address: 'Plot 45, Vidya Nagar, Devanahalli',
    gpsCoordinates: { latitude: 13.2483, longitude: 77.7137 },
    waterDetails: {
      source: 'RO Plant',
      appearance: 'Clear',
      smell: 'None',
      taste: 'Normal',
      visibleParticles: false,
      storageMethod: 'Covered Container',
      isBoiled: false,
      isFiltered: true
    },
    waterTest: {
      h2sResult: 'Negative',
      phValue: 7.0
    },
    symptoms: [],
    symptomDuration: 0,
    familySick: false,
    medicalHistory: 'Hypertension',
    prediction: {
      waterStatus: 'Safe',
      riskLevel: 'Low',
      likelyContaminant: 'None Detected',
      predictedDiseases: [],
      recommendations: [
        'Water is safe for consumption. Continue regular storage hygiene.',
        'Clean the storage vessel weekly with warm chlorinated water.'
      ]
    },
    assignedVolunteer: 'Anil Kumar',
    status: 'Resolved',
    dateCreated: '2026-07-02T15:00:00Z',
    lastUpdated: '2026-07-04T10:00:00Z'
  },
  {
    id: 'CASE-2026-005',
    citizenName: 'Vijay Naik',
    citizenAge: 19,
    citizenGender: 'Male',
    citizenPhone: '+91 99001 22334',
    citizenOccupation: 'Student',
    village: 'Kanakapura',
    district: 'Ramanagara',
    address: 'Hostel Block 3, Kanakapura Main Road',
    gpsCoordinates: { latitude: 12.5510, longitude: 77.4250 },
    waterDetails: {
      source: 'River',
      appearance: 'Brownish',
      smell: 'Musty',
      taste: 'Bitter',
      visibleParticles: true,
      storageMethod: 'Open Container',
      isBoiled: false,
      isFiltered: false
    },
    waterTest: {
      h2sResult: 'Positive',
      phValue: 6.2
    },
    symptoms: ['Fever', 'Diarrhea', 'Vomiting'],
    symptomDuration: 2,
    familySick: true,
    medicalHistory: 'None',
    prediction: null,
    assignedVolunteer: 'Sneha Patil',
    status: 'Survey Started',
    dateCreated: '2026-07-09T08:15:00Z',
    lastUpdated: '2026-07-09T08:15:00Z'
  },
  {
    id: 'CASE-2026-006',
    citizenName: 'Meena Gowda',
    citizenAge: 32,
    citizenGender: 'Female',
    citizenPhone: '+91 94455 66778',
    citizenOccupation: 'Homemaker',
    village: 'Kanakapura',
    district: 'Ramanagara',
    address: 'Vidyapeetha Circle, Kanakapura',
    gpsCoordinates: { latitude: 12.5450, longitude: 77.4210 },
    waterDetails: {
      source: 'Borewell',
      appearance: 'Clear',
      smell: 'None',
      taste: 'Normal',
      visibleParticles: false,
      storageMethod: 'Covered Container',
      isBoiled: false,
      isFiltered: false
    },
    waterTest: {
      h2sResult: 'Positive',
      phValue: 6.8
    },
    symptoms: ['Diarrhea', 'Fever'],
    symptomDuration: 2,
    familySick: false,
    medicalHistory: 'None',
    prediction: {
      waterStatus: 'Contaminated',
      riskLevel: 'High',
      likelyContaminant: 'Fecal Coliform Bacteria',
      predictedDiseases: ['Acute Gastroenteritis', 'Typhoid Fever'],
      recommendations: [
        'Boil water before drinking or domestic use.',
        'Sanitize water storage containers.',
        'Seek medical checks at the Kanapapura local health center.'
      ]
    },
    assignedVolunteer: 'Sneha Patil',
    status: 'Prediction Generated',
    dateCreated: '2026-07-10T12:00:00Z',
    lastUpdated: '2026-07-10T12:00:00Z'
  },
  {
    id: 'CASE-2026-007',
    citizenName: 'Harish Kumar',
    citizenAge: 45,
    citizenGender: 'Male',
    citizenPhone: '+91 97788 99001',
    citizenOccupation: 'Shopkeeper',
    village: 'Kanakapura',
    district: 'Ramanagara',
    address: 'Near Bus Stand, Kanakapura Sector 2',
    gpsCoordinates: { latitude: 12.5401, longitude: 77.4150 },
    waterDetails: {
      source: 'Open Well',
      appearance: 'Clear',
      smell: 'None',
      taste: 'Normal',
      visibleParticles: false,
      storageMethod: 'Covered Container',
      isBoiled: true,
      isFiltered: true
    },
    waterTest: {
      h2sResult: 'Negative',
      phValue: 7.2
    },
    symptoms: [],
    symptomDuration: 0,
    familySick: false,
    medicalHistory: 'None',
    prediction: {
      waterStatus: 'Safe',
      riskLevel: 'Low',
      likelyContaminant: 'None Detected',
      predictedDiseases: [],
      recommendations: [
        'Water is safe. Continue boiling and filtering before consumption.'
      ]
    },
    assignedVolunteer: 'Sneha Patil',
    status: 'Resolved',
    dateCreated: '2026-07-04T08:00:00Z',
    lastUpdated: '2026-07-04T08:00:00Z'
  },
  {
    id: 'CASE-2026-008',
    citizenName: 'Lakshmi Rao',
    citizenAge: 61,
    citizenGender: 'Female',
    citizenPhone: '+91 90011 22335',
    citizenOccupation: 'Retired',
    village: 'Anekal',
    district: 'Bangalore Rural',
    address: 'Shanti Nagar, Anekal',
    gpsCoordinates: { latitude: 12.7100, longitude: 77.7001 },
    waterDetails: {
      source: 'Borewell',
      appearance: 'Clear',
      smell: 'None',
      taste: 'Metallic',
      visibleParticles: false,
      storageMethod: 'Overhead Tank',
      isBoiled: false,
      isFiltered: true
    },
    waterTest: {
      h2sResult: 'Negative',
      phValue: 7.8
    },
    symptoms: ['Diarrhea'],
    symptomDuration: 1,
    familySick: false,
    medicalHistory: 'Diabetes',
    prediction: {
      waterStatus: 'Contaminated',
      riskLevel: 'Medium',
      likelyContaminant: 'High Dissolved Minerals',
      predictedDiseases: ['Mild Gastroenteritis'],
      recommendations: [
        'Filter water properly and boil before drinking.',
        'Clean overhead tank storage systems.'
      ]
    },
    assignedVolunteer: 'Meera Deshmukh',
    status: 'Admin Review',
    dateCreated: '2026-07-08T15:00:00Z',
    lastUpdated: '2026-07-08T15:00:00Z'
  },
  {
    id: 'CASE-2026-009',
    citizenName: 'Suresh N',
    citizenAge: 24,
    citizenGender: 'Male',
    citizenPhone: '+91 81122 33445',
    citizenOccupation: 'Labourer',
    village: 'Hosur',
    district: 'Krishnagiri',
    address: 'Near Old Checkpost, Hosur',
    gpsCoordinates: { latitude: 12.7420, longitude: 77.8210 },
    waterDetails: {
      source: 'River',
      appearance: 'Turbid',
      smell: 'Chemical',
      taste: 'Normal',
      visibleParticles: true,
      storageMethod: 'Open Container',
      isBoiled: false,
      isFiltered: false
    },
    waterTest: {
      h2sResult: 'Positive',
      phValue: 6.0
    },
    symptoms: ['Diarrhea', 'Vomiting', 'Fever', 'Abdominal Pain'],
    symptomDuration: 4,
    familySick: true,
    medicalHistory: 'None',
    prediction: {
      waterStatus: 'Highly Contaminated',
      riskLevel: 'Critical',
      likelyContaminant: 'Industrial runoff, E. coli & Heavy Minerals',
      predictedDiseases: ['Cholera', 'Acute Gastroenteritis'],
      recommendations: [
        'Do not drink water from this source immediately.',
        'Boil and filter water with double chlorine treatment.',
        'Urgent medical consult required for household.'
      ]
    },
    assignedVolunteer: 'Anil Kumar',
    status: 'Prediction Generated',
    dateCreated: '2026-07-11T09:30:00Z',
    lastUpdated: '2026-07-11T09:30:00Z'
  },
  {
    id: 'CASE-2026-010',
    citizenName: 'Preethi Patil',
    citizenAge: 18,
    citizenGender: 'Female',
    citizenPhone: '+91 72233 44556',
    citizenOccupation: 'Student',
    village: 'Devanahalli',
    district: 'Bangalore Rural',
    address: 'Opposite Library, Devanahalli',
    gpsCoordinates: { latitude: 13.2500, longitude: 77.7150 },
    waterDetails: {
      source: 'RO Plant',
      appearance: 'Clear',
      smell: 'None',
      taste: 'Normal',
      visibleParticles: false,
      storageMethod: 'Covered Container',
      isBoiled: false,
      isFiltered: false
    },
    waterTest: {
      h2sResult: 'Negative',
      phValue: 7.0
    },
    symptoms: [],
    symptomDuration: 0,
    familySick: false,
    medicalHistory: 'None',
    prediction: {
      waterStatus: 'Safe',
      riskLevel: 'Low',
      likelyContaminant: 'None Detected',
      predictedDiseases: [],
      recommendations: [
        'Water is safe to use. Maintain storage hygiene.'
      ]
    },
    assignedVolunteer: 'Anil Kumar',
    status: 'Resolved',
    dateCreated: '2026-07-03T10:00:00Z',
    lastUpdated: '2026-07-03T10:00:00Z'
  },
  {
    id: 'CASE-2026-011',
    citizenName: 'Venkatesh S',
    citizenAge: 50,
    citizenGender: 'Male',
    citizenPhone: '+91 93344 55667',
    citizenOccupation: 'Weaver',
    village: 'Kanakapura',
    district: 'Ramanagara',
    address: 'Weavers Lane, Kanakapura',
    gpsCoordinates: { latitude: 12.5490, longitude: 77.4200 },
    waterDetails: {
      source: 'Borewell',
      appearance: 'Clear',
      smell: 'None',
      taste: 'Normal',
      visibleParticles: false,
      storageMethod: 'Covered Container',
      isBoiled: false,
      isFiltered: false
    },
    waterTest: {
      h2sResult: 'Negative',
      phValue: 7.4
    },
    symptoms: ['Fatigue'],
    symptomDuration: 3,
    familySick: false,
    medicalHistory: 'Hypertension',
    prediction: {
      waterStatus: 'Safe',
      riskLevel: 'Medium',
      likelyContaminant: 'High TDS',
      predictedDiseases: ['Fluorosis risk'],
      recommendations: [
        'Filter water properly using RO.',
        'Maintain hydration from verified water sources.'
      ]
    },
    assignedVolunteer: 'Sneha Patil',
    status: 'Admin Review',
    dateCreated: '2026-07-07T11:00:00Z',
    lastUpdated: '2026-07-07T11:00:00Z'
  },
  {
    id: 'CASE-2026-012',
    citizenName: 'Gouri Deshmukh',
    citizenAge: 28,
    citizenGender: 'Female',
    citizenPhone: '+91 96677 88990',
    citizenOccupation: 'Homemaker',
    village: 'Anekal',
    district: 'Bangalore Rural',
    address: 'Ganesh Temple Street, Anekal',
    gpsCoordinates: { latitude: 12.7150, longitude: 77.6950 },
    waterDetails: {
      source: 'Open Well',
      appearance: 'Clear',
      smell: 'None',
      taste: 'Normal',
      visibleParticles: false,
      storageMethod: 'Open Container',
      isBoiled: false,
      isFiltered: false
    },
    waterTest: {
      h2sResult: 'Negative',
      phValue: 7.1
    },
    symptoms: ['Skin Irritation'],
    symptomDuration: 2,
    familySick: false,
    medicalHistory: 'Eczema',
    prediction: {
      waterStatus: 'Contaminated',
      riskLevel: 'Medium',
      likelyContaminant: 'Organic Dust/Pollen',
      predictedDiseases: ['Dermatitis / Contact Allergy'],
      recommendations: [
        'Filter water before domestic use.',
        'Apply skin soothing creams and boil water to kill organic vectors.'
      ]
    },
    assignedVolunteer: 'Meera Deshmukh',
    status: 'Admin Review',
    dateCreated: '2026-07-06T14:00:00Z',
    lastUpdated: '2026-07-06T14:00:00Z'
  }
];

// Initial timeline entries
const initialTimeline: TimelineEvent[] = [
  {
    id: 'TL-1',
    caseId: 'CASE-2026-001',
    status: 'Assigned',
    title: 'Case Assigned to Volunteer',
    description: 'Critical case registered in Kanakapura and assigned to Sneha Patil.',
    timestamp: '2026-07-06T10:30:00Z',
    actor: 'Admin'
  },
  {
    id: 'TL-2',
    caseId: 'CASE-2026-001',
    status: 'Survey Started',
    title: 'Water Survey & Symptoms Logged',
    description: 'Sneha Patel completed the door-to-door physical and medical assessment.',
    timestamp: '2026-07-06T11:00:00Z',
    actor: 'Sneha Patil'
  },
  {
    id: 'TL-3',
    caseId: 'CASE-2026-001',
    status: 'Prediction Generated',
    title: 'AI Prediction Generated',
    description: 'System assessed High Contamination risk (Critical). Likely Cholera/Gastroenteritis.',
    timestamp: '2026-07-06T11:15:00Z',
    actor: 'AquaSafe AI Engine'
  },
  {
    id: 'TL-4',
    caseId: 'CASE-2026-002',
    status: 'Assigned',
    title: 'Case Assigned',
    description: 'Assigned to Meera Deshmukh in Anekal.',
    timestamp: '2026-07-05T09:00:00Z',
    actor: 'Admin'
  },
  {
    id: 'TL-5',
    caseId: 'CASE-2026-002',
    status: 'Prediction Generated',
    title: 'AI Prediction Generated',
    description: 'Yellowish borehole water flagged for TDS & Alkaline contamination. High Risk.',
    timestamp: '2026-07-05T10:15:00Z',
    actor: 'AquaSafe AI Engine'
  },
  {
    id: 'TL-6',
    caseId: 'CASE-2026-002',
    status: 'Admin Review',
    title: 'Admin Verified Case Details',
    description: 'Verified contamination signatures and forwarded report to local water department.',
    timestamp: '2026-07-06T11:30:00Z',
    actor: 'Admin'
  },
  {
    id: 'TL-7',
    caseId: 'CASE-2026-002',
    status: 'Government Action',
    title: 'Government Officer Dispatched',
    description: 'Water sample collected by Taluk Health Officer for detailed lab mass spec analysis.',
    timestamp: '2026-07-07T14:30:00Z',
    actor: 'Govt Health Officer'
  }
];

// Initial empty survey state
const defaultSurvey: SurveyState = {
  citizen: {
    name: '',
    age: 0,
    gender: 'Male',
    phone: '',
    email: '',
    occupation: '',
    village: 'Kanakapura',
    district: 'Ramanagara',
    address: '',
    gps: { latitude: 12.5412, longitude: 77.4102 }
  },
  water: {
    source: 'Borewell',
    appearance: 'Clear',
    smell: 'None',
    taste: 'Normal',
    visibleParticles: false,
    storageMethod: 'Covered Container',
    isBoiled: false,
    isFiltered: false
  },
  test: {
    h2sResult: 'Pending',
    phValue: 7.0
  },
  symptoms: [],
  symptomDuration: 0,
  familySick: false,
  medicalHistory: ''
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [volunteers, setVolunteers] = useState<Volunteer[]>(() => {
    const saved = localStorage.getItem('aquasafe_volunteers');
    return saved ? JSON.parse(saved) : initialMockVolunteers;
  });

  const [cases, setCases] = useState<Case[]>(() => {
    const saved = localStorage.getItem('aquasafe_cases');
    return saved ? JSON.parse(saved) : initialCases;
  });

  const [timeline, setTimeline] = useState<TimelineEvent[]>(() => {
    const saved = localStorage.getItem('aquasafe_timeline');
    return saved ? JSON.parse(saved) : initialTimeline;
  });

  const [activePage, setActivePage] = useState<string>('landing');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [currentSurvey, setCurrentSurvey] = useState<SurveyState>(defaultSurvey);

  const [isConnected, setIsConnected] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // WebSocket Connection Lifecycle
  useEffect(() => {
    let socket: WebSocket;
    let reconnectTimer: any;

    const connectWS = () => {
      const isHttps = window.location.protocol === 'https:';
      const wsProtocol = isHttps ? 'wss:' : 'ws:';
      const host = window.location.host || 'localhost:3000';
      const wsUrl = `${wsProtocol}//${host}/ws-app`;
      console.log('[WebSocket Client] Connecting to:', wsUrl);
      
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('[WebSocket Client] Connected successfully');
        setIsConnected(true);
        setWs(socket);
      };

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          console.log('[WebSocket Client] Event received:', msg.type);

          switch (msg.type) {
            case 'SYNC': {
              const { cases: syncCases, volunteers: syncVolunteers, timeline: syncTimeline } = msg.payload;
              setCases(syncCases);
              setVolunteers(syncVolunteers);
              setTimeline(syncTimeline);
              break;
            }
            case 'ADD_CASE': {
              const { case: newCase, timelineEvent } = msg.payload;
              setCases(prev => {
                if (prev.some(c => c.id === newCase.id)) return prev;
                return [newCase, ...prev];
              });
              setTimeline(prev => {
                if (prev.some(t => t.id === timelineEvent.id)) return prev;
                return [timelineEvent, ...prev];
              });
              break;
            }
            case 'UPDATE_CASE': {
              const { case: updatedCase, timelineEvent } = msg.payload;
              setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
              setTimeline(prev => {
                if (prev.some(t => t.id === timelineEvent.id)) return prev;
                return [timelineEvent, ...prev];
              });
              break;
            }
            case 'ADD_VOLUNTEER': {
              const newVol = msg.payload;
              setVolunteers(prev => {
                if (prev.some(v => v.id === newVol.id)) return prev;
                return [newVol, ...prev];
              });
              break;
            }
          }
        } catch (err) {
          console.error('[WebSocket Client] Error parsing event:', err);
        }
      };

      socket.onclose = () => {
        console.warn('[WebSocket Client] Disconnected. Reconnecting in 3s...');
        setIsConnected(false);
        setWs(null);
        reconnectTimer = setTimeout(connectWS, 3000);
      };

      socket.onerror = (err) => {
        console.error('[WebSocket Client] Error:', err);
        socket.close();
      };
    };

    connectWS();

    return () => {
      if (socket) {
        socket.close();
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
    };
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('aquasafe_volunteers', JSON.stringify(volunteers));
  }, [volunteers]);

  useEffect(() => {
    localStorage.setItem('aquasafe_cases', JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    localStorage.setItem('aquasafe_timeline', JSON.stringify(timeline));
  }, [timeline]);

  // Restore session if available
  useEffect(() => {
    const savedUser = localStorage.getItem('aquasafe_user');
    const savedPage = localStorage.getItem('aquasafe_page');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      if (savedPage) {
        setActivePage(savedPage);
      } else {
        const u = JSON.parse(savedUser) as User;
        setActivePage(u.role === 'admin' ? 'admin-dashboard' : 'volunteer-dashboard');
      }
    }
  }, []);

  const login = async (role: 'volunteer' | 'admin', username: string, password?: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, username, password })
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      if (result.success && result.user) {
        setCurrentUser(result.user);
        localStorage.setItem('aquasafe_user', JSON.stringify(result.user));
        
        const targetPage = result.user.role === 'admin' ? 'admin-dashboard' : 'volunteer-dashboard';
        setActivePage(targetPage);
        localStorage.setItem('aquasafe_page', targetPage);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error logging in:', err);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setActivePage('landing');
    setSelectedCaseId(null);
    setCurrentSurvey(defaultSurvey);
    localStorage.removeItem('aquasafe_user');
    localStorage.removeItem('aquasafe_page');
  };

  const setPageAndSave = (page: string) => {
    setActivePage(page);
    localStorage.setItem('aquasafe_page', page);
  };

  const updateSurvey = (updates: Partial<SurveyState> | ((prev: SurveyState) => SurveyState)) => {
    if (typeof updates === 'function') {
      setCurrentSurvey(prev => updates(prev));
    } else {
      setCurrentSurvey(prev => ({
        ...prev,
        ...updates
      }));
    }
  };

  const resetSurvey = () => {
    // Attempt real GPS fetch
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentSurvey(prev => ({
            ...prev,
            citizen: {
              ...prev.citizen,
              gps: {
                latitude: Number(position.coords.latitude.toFixed(5)),
                longitude: Number(position.coords.longitude.toFixed(5))
              }
            }
          }));
        },
        () => {}
      );
    }
    setCurrentSurvey(prev => ({
      ...defaultSurvey,
      citizen: {
        ...defaultSurvey.citizen,
        gps: prev.citizen.gps // keep current position
      }
    }));
  };

  const calculateAIResult = (state: SurveyState): PredictionResult => {
    // Advanced algorithm that looks at symptoms, water characteristics, and test results
    let contaminatedPoints = 0;
    const contaminants: string[] = [];
    const recommendedActions: string[] = [];
    const predictedIllnesses: string[] = [];

    // Water properties
    if (state.water.appearance !== 'Clear') {
      contaminatedPoints += 2;
      contaminants.push(`${state.water.appearance} sediment`);
    }
    if (state.water.smell !== 'None') {
      contaminatedPoints += 3;
      if (state.water.smell.includes('Rotten Eggs')) {
        contaminants.push('Hydrogen Sulfide (H2S)');
        contaminants.push('Anaerobic Bacteria');
      } else {
        contaminants.push('Volatile Organic Chemicals');
      }
    }
    if (state.water.taste !== 'Normal') {
      contaminatedPoints += 2;
      contaminants.push('Dissolved Mineral Salts');
    }
    if (state.water.visibleParticles) {
      contaminatedPoints += 2;
      contaminants.push('Suspended Solids');
    }

    // Hydrogen Sulfide paper test result
    if (state.test.h2sResult === 'Positive') {
      contaminatedPoints += 5;
      contaminants.push('Fecal Coliform Bacteria (E. coli)');
    }

    // pH value
    if (state.test.phValue < 6.5 || state.test.phValue > 8.5) {
      contaminatedPoints += 3;
      contaminants.push(`Acidic/Alkaline imbalance (pH: ${state.test.phValue})`);
    }

    // Storage and treatment mitigations
    let isMitigated = false;
    if (state.water.isBoiled || state.water.isFiltered) {
      isMitigated = true;
    }

    // Symptoms trigger diseases
    const hasGastroSymptoms = state.symptoms.some(s => ['Diarrhea', 'Vomiting', 'Fever', 'Abdominal Pain', 'Nausea'].includes(s));
    const hasSkinSymptoms = state.symptoms.some(s => ['Skin Irritation', 'Eye Irritation'].includes(s));
    
    if (hasGastroSymptoms) {
      if (state.symptoms.includes('Vomiting') && state.symptoms.includes('Diarrhea')) {
        predictedIllnesses.push('Cholera (High Risk)');
        predictedIllnesses.push('Acute Gastroenteritis');
      } else {
        predictedIllnesses.push('Typhoid Fever');
        predictedIllnesses.push('Bacillary Dysentery');
      }
    }
    if (hasSkinSymptoms) {
      predictedIllnesses.push('Dermatitis / Contact Allergy');
    }
    if (state.symptoms.includes('Fatigue') && state.test.phValue > 8.0) {
      predictedIllnesses.push('Fluorosis risk');
    }

    // Determine final Risk Level and status
    let riskLevel: RiskLevel = 'Low';
    let waterStatus: 'Safe' | 'Contaminated' | 'Highly Contaminated' = 'Safe';

    if (contaminatedPoints >= 8 || (contaminatedPoints >= 5 && hasGastroSymptoms)) {
      riskLevel = 'Critical';
      waterStatus = 'Highly Contaminated';
    } else if (contaminatedPoints >= 5 || hasGastroSymptoms || hasSkinSymptoms) {
      riskLevel = 'High';
      waterStatus = 'Contaminated';
    } else if (contaminatedPoints >= 2) {
      riskLevel = 'Medium';
      waterStatus = 'Contaminated';
    }

    // Override if treated well but still high symptoms
    if (isMitigated && riskLevel === 'Critical' && !hasGastroSymptoms) {
      riskLevel = 'Medium';
      waterStatus = 'Contaminated';
    }

    // Recommendations builder
    if (waterStatus === 'Highly Contaminated' || riskLevel === 'Critical') {
      recommendedActions.push('CRITICAL: Strictly prohibit drinking of unboiled water immediately.');
      recommendedActions.push('Filter water using a pore filter and bring to a continuous rolling boil for at least 5 minutes.');
      recommendedActions.push('Treat the source with chlorinated bleaching solution (1.5g per 1000L).');
      recommendedActions.push('Ensure immediate clinical attention for all family members reporting symptoms.');
    } else if (waterStatus === 'Contaminated' || riskLevel === 'High') {
      recommendedActions.push('Advise boiling water before drinking and food preparation.');
      recommendedActions.push('Inspect the storage container and keep it tightly sealed and elevated.');
      recommendedActions.push('Conduct secondary chemical analysis at a district public health laboratory.');
    } else if (riskLevel === 'Medium') {
      recommendedActions.push('Recommend filtration and cleaning of all storage tanks weekly.');
      recommendedActions.push('Monitor water taste and smell over the next 7 days.');
    } else {
      recommendedActions.push('Water is safe to drink. Maintain excellent domestic hygiene.');
      recommendedActions.push('Ensure storage containers are cleaned and dried regularly.');
    }

    return {
      waterStatus,
      riskLevel,
      likelyContaminant: contaminants.length > 0 ? contaminants.join(', ') : 'None Identified',
      predictedDiseases: predictedIllnesses.length > 0 ? predictedIllnesses : ['None Predicted'],
      recommendations: recommendedActions
    };
  };

  const submitSurvey = async (): Promise<Case> => {
    const caseId = 'CASE-2026-' + String(cases.length + 1).padStart(3, '0');
    setIsPredicting(true);

    let prediction: PredictionResult;
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentSurvey)
      });
      if (!response.ok) throw new Error('API failed');
      prediction = await response.json();
      console.log('Gemini ML prediction success:', prediction);
    } catch (err) {
      console.warn('Fallback to client-side rules:', err);
      prediction = calculateAIResult(currentSurvey);
    } finally {
      setIsPredicting(false);
    }

    const newCase: Case = {
      id: caseId,
      citizenName: currentSurvey.citizen.name,
      citizenAge: Number(currentSurvey.citizen.age),
      citizenGender: currentSurvey.citizen.gender,
      citizenPhone: currentSurvey.citizen.phone,
      citizenOccupation: currentSurvey.citizen.occupation,
      village: currentSurvey.citizen.village,
      district: currentSurvey.citizen.district,
      address: currentSurvey.citizen.address,
      gpsCoordinates: currentSurvey.citizen.gps,
      waterDetails: { ...currentSurvey.water },
      waterTest: { ...currentSurvey.test },
      symptoms: [...currentSurvey.symptoms],
      symptomDuration: Number(currentSurvey.symptomDuration),
      familySick: currentSurvey.familySick,
      medicalHistory: currentSurvey.medicalHistory || 'None',
      prediction,
      assignedVolunteer: currentUser ? currentUser.name : 'Sneha Patil',
      status: 'Prediction Generated',
      dateCreated: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    const event = addNewCase(newCase);

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'ADD_CASE',
        payload: { case: newCase, timelineEvent: event }
      }));
    }

    setSelectedCaseId(caseId);
    setPageAndSave('prediction-result');
    return newCase;
  };

  const addNewCase = (newCase: Case): TimelineEvent => {
    setCases(prev => {
      if (prev.some(c => c.id === newCase.id)) return prev;
      return [newCase, ...prev];
    });

    const event: TimelineEvent = {
      id: 'TL-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      caseId: newCase.id,
      status: 'Prediction Generated',
      title: 'Survey Submitted & AI Assessed',
      description: `Survey completed for ${newCase.citizenName}. AI predicted risk: ${newCase.prediction?.riskLevel}.`,
      timestamp: new Date().toISOString(),
      actor: currentUser ? currentUser.name : 'Sneha Patil'
    };
    setTimeline(prev => {
      if (prev.some(t => t.id === event.id)) return prev;
      return [event, ...prev];
    });
    return event;
  };

  const registerVolunteer = (newVol: Omit<Volunteer, 'id' | 'assigned' | 'completed' | 'pending' | 'critical'> & { password?: string }) => {
    const id = 'v-' + Math.floor(Math.random() * 10000);
    const volunteer: Volunteer = {
      ...newVol,
      id,
      assigned: 0,
      completed: 0,
      pending: 0,
      critical: 0,
      status: 'Active',
      password: newVol.password || 'demo1234'
    };
    setVolunteers(prev => [volunteer, ...prev]);

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'ADD_VOLUNTEER',
        payload: volunteer
      }));
    }
  };

  const takeAdminAction = (
    caseId: string, 
    actionType: 'ASHA Workers' | 'Medical Support' | 'Sewage Cleaners' | 'Chemist' | 'Assign Support' | 'Closed', 
    note?: string
  ) => {
    let finalStatus: CaseStatus = 'Government Action';
    let statusMsg = '';

    switch (actionType) {
      case 'ASHA Workers':
        statusMsg = `Dispatched ASHA Healthcare Workers to provide community checks, diagnostic assistance, and ORS distribution.`;
        break;
      case 'Medical Support':
        statusMsg = `Dispatched District Mobile Medical Support & emergency medications.`;
        break;
      case 'Sewage Cleaners':
        statusMsg = `Dispatched Specialized Municipal Sewage & Drainage Cleaners to flush contamination sources.`;
        break;
      case 'Chemist':
        statusMsg = `Dispatched District Chemist to analyze water chemistry and identify biological vectors.`;
        break;
      case 'Assign Support':
        statusMsg = `Assigned community water purification and diagnostic guidance team.`;
        break;
      case 'Closed':
        finalStatus = 'Resolved';
        statusMsg = `Case reviewed, purified, and officially marked as Resolved by Administrative Hub.`;
        break;
    }

    if (note) {
      statusMsg += ` Action notes: "${note}"`;
    }

    const targetCase = cases.find(c => c.id === caseId);
    if (!targetCase) return;

    const updatedCase: Case = {
      ...targetCase,
      status: finalStatus,
      lastUpdated: new Date().toISOString(),
      adminResponse: {
        actionType,
        timestamp: new Date().toISOString(),
        note: note || '',
        status: finalStatus
      }
    };

    setCases(prev => prev.map(c => c.id === caseId ? updatedCase : c));

    const event: TimelineEvent = {
      id: 'TL-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      caseId,
      status: finalStatus,
      title: `Admin Action: Dispatched ${actionType}`,
      description: statusMsg,
      timestamp: new Date().toISOString(),
      actor: 'Dr. Sarah Alvares (Admin)'
    };
    setTimeline(prev => [event, ...prev]);

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'UPDATE_CASE',
        payload: { case: updatedCase, timelineEvent: event }
      }));
    }
  };

  const updateCaseStatus = (caseId: string, newStatus: CaseStatus, description?: string) => {
    const targetCase = cases.find(c => c.id === caseId);
    if (!targetCase) return;

    const updatedCase: Case = {
      ...targetCase,
      status: newStatus,
      lastUpdated: new Date().toISOString()
    };

    setCases(prev => prev.map(c => c.id === caseId ? updatedCase : c));

    const statusDesc = description || `Status updated to ${newStatus}`;

    const event: TimelineEvent = {
      id: 'TL-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      caseId,
      status: newStatus,
      title: `Case Status: ${newStatus}`,
      description: statusDesc,
      timestamp: new Date().toISOString(),
      actor: currentUser ? currentUser.name : 'System Admin'
    };
    setTimeline(prev => [event, ...prev]);

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'UPDATE_CASE',
        payload: { case: updatedCase, timelineEvent: event }
      }));
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      cases,
      volunteers,
      timeline,
      activePage,
      selectedCaseId,
      currentSurvey,
      login,
      logout,
      setActivePage: setPageAndSave,
      setSelectedCaseId,
      updateSurvey,
      resetSurvey,
      submitSurvey,
      updateCaseStatus,
      addNewCase,
      registerVolunteer,
      takeAdminAction,
      isConnected,
      isPredicting
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
