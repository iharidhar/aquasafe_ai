import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import crypto from 'crypto';
import { predict as localPredict } from './utils/ruleEngine.js';
import { evaluateXGBoost } from './utils/xgboostEngine.js';


// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ noServer: true });

const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('Warning: GEMINI_API_KEY is not defined in environment variables.');
}
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Initial mock state to seed the shared Server State
const initialMockVolunteers = [
  { id: 'v1', name: 'Anil Kumar', username: 'Anil_Kumar', password: 'demo1234', assigned: 8, completed: 5, pending: 2, critical: 1, status: 'Active', email: 'anil@aquasafe.org', villageAssigned: 'Kanakapura' },
  { id: 'v2', name: 'Meera Deshmukh', username: 'Meera_Deshmukh', password: 'demo1234', assigned: 12, completed: 9, pending: 1, critical: 2, status: 'Active', email: 'meera@aquasafe.org', villageAssigned: 'Anekal' },
  { id: 'v3', name: 'Vikram Singh', username: 'Vikram_Singh', password: 'demo1234', assigned: 6, completed: 3, pending: 3, critical: 0, status: 'On Leave', email: 'vikram@aquasafe.org', villageAssigned: 'Hosur' },
  { id: 'v4', name: 'Sneha Patil', username: 'Sneha_Patil', password: 'demo1234', assigned: 15, completed: 10, pending: 4, critical: 1, status: 'Active', email: 'sneha@aquasafe.org', villageAssigned: 'Kanakapura' }
];

const initialCases = [
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

const initialTimeline = [
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

let db;

// SQL Database Initialization
async function initDB() {
  db = await open({
    filename: path.join(__dirname, 'aquasafe.db'),
    driver: sqlite3.Database
  });

  // Create Volunteers table (stores name, username, sha256 password, etc.)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS volunteers (
      id TEXT PRIMARY KEY,
      name TEXT,
      username TEXT UNIQUE,
      password TEXT,
      assigned INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      pending INTEGER DEFAULT 0,
      critical INTEGER DEFAULT 0,
      status TEXT DEFAULT 'Active',
      email TEXT,
      villageAssigned TEXT,
      district TEXT,
      created_at TEXT
    )
  `);

  // Create Cases table (stores case ID, physical surveys, symptoms, ML prediction response, admin dispatch responses, etc.)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY,
      citizenName TEXT,
      citizenAge INTEGER,
      citizenGender TEXT,
      citizenPhone TEXT,
      citizenOccupation TEXT,
      village TEXT,
      district TEXT,
      address TEXT,
      latitude REAL,
      longitude REAL,
      waterDetails TEXT,
      waterTest TEXT,
      symptoms TEXT,
      symptomDuration INTEGER,
      familySick INTEGER,
      medicalHistory TEXT,
      prediction TEXT,
      assignedVolunteer TEXT,
      status TEXT,
      dateCreated TEXT,
      lastUpdated TEXT,
      adminResponse TEXT
    )
  `);

  // Create Timeline table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS timeline (
      id TEXT PRIMARY KEY,
      caseId TEXT,
      status TEXT,
      title TEXT,
      description TEXT,
      timestamp TEXT,
      actor TEXT
    )
  `);

  // Seed default data if volunteers table is empty
  const volCount = await db.get('SELECT COUNT(*) as count FROM volunteers');
  if (volCount.count === 0) {
    console.log('[Database] Seeding default volunteers...');
    for (const v of initialMockVolunteers) {
      const hashed = crypto.createHash('sha256').update(v.password || 'demo1234').digest('hex');
      await db.run(
        `INSERT INTO volunteers (id, name, username, password, assigned, completed, pending, critical, status, email, villageAssigned, district, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [v.id, v.name, v.username, hashed, v.assigned, v.completed, v.pending, v.critical, v.status, v.email, v.villageAssigned, v.district || 'Ramanagara', new Date().toISOString()]
      );
    }
  }

  // Seed cases if cases table is empty
  const caseCount = await db.get('SELECT COUNT(*) as count FROM cases');
  if (caseCount.count === 0) {
    console.log('[Database] Seeding default cases...');
    for (const c of initialCases) {
      await db.run(
        `INSERT INTO cases (id, citizenName, citizenAge, citizenGender, citizenPhone, citizenOccupation, village, district, address, latitude, longitude, waterDetails, waterTest, symptoms, symptomDuration, familySick, medicalHistory, prediction, assignedVolunteer, status, dateCreated, lastUpdated, adminResponse)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          c.id, c.citizenName, c.citizenAge, c.citizenGender, c.citizenPhone, c.citizenOccupation, c.village, c.district, c.address,
          c.gpsCoordinates.latitude, c.gpsCoordinates.longitude,
          JSON.stringify(c.waterDetails), JSON.stringify(c.waterTest), JSON.stringify(c.symptoms),
          c.symptomDuration, c.familySick ? 1 : 0, c.medicalHistory,
          JSON.stringify(c.prediction), c.assignedVolunteer, c.status, c.dateCreated, c.lastUpdated,
          c.adminResponse ? JSON.stringify(c.adminResponse) : null
        ]
      );
    }
  }

  // Seed timeline if timeline table is empty
  const timelineCount = await db.get('SELECT COUNT(*) as count FROM timeline');
  if (timelineCount.count === 0) {
    console.log('[Database] Seeding default timeline logs...');
    for (const t of initialTimeline) {
      await db.run(
        `INSERT INTO timeline (id, caseId, status, title, description, timestamp, actor)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [t.id, t.caseId, t.status, t.title, t.description, t.timestamp, t.actor]
      );
    }
  }

  console.log('[Database] Initialization completed successfully.');
}

// SQL Fetch Helper Functions
async function getCasesFromDB() {
  const rows = await db.all('SELECT * FROM cases ORDER BY dateCreated DESC');
  return rows.map(r => ({
    id: r.id,
    citizenName: r.citizenName,
    citizenAge: r.citizenAge,
    citizenGender: r.citizenGender,
    citizenPhone: r.citizenPhone,
    citizenOccupation: r.citizenOccupation,
    village: r.village,
    district: r.district,
    address: r.address,
    gpsCoordinates: { latitude: r.latitude, longitude: r.longitude },
    waterDetails: JSON.parse(r.waterDetails),
    waterTest: JSON.parse(r.waterTest),
    symptoms: JSON.parse(r.symptoms),
    symptomDuration: r.symptomDuration,
    familySick: r.familySick === 1,
    medicalHistory: r.medicalHistory,
    prediction: r.prediction ? JSON.parse(r.prediction) : null,
    assignedVolunteer: r.assignedVolunteer,
    status: r.status,
    dateCreated: r.dateCreated,
    lastUpdated: r.lastUpdated,
    adminResponse: r.adminResponse ? JSON.parse(r.adminResponse) : undefined
  }));
}

async function getVolunteersFromDB() {
  const rows = await db.all('SELECT * FROM volunteers ORDER BY name ASC');
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    username: r.username,
    assigned: r.assigned,
    completed: r.completed,
    pending: r.pending,
    critical: r.critical,
    status: r.status,
    email: r.email,
    villageAssigned: r.villageAssigned,
    district: r.district
  }));
}

async function getTimelineFromDB() {
  return await db.all('SELECT * FROM timeline ORDER BY timestamp DESC');
}

// Structured Prediction Handler using Gemini 2.5 Flash / Local Rule-Based + XGBoost ML Evaluation
async function handlePrediction(survey) {
  let basePrediction;

  if (!ai) {
    console.log('[Prediction] GEMINI_API_KEY is not configured. Falling back to local Rule-Based Engine...');
    basePrediction = localPredict(survey);
  } else {
    const prompt = `
You are an AI Epidemiological and Water Security Expert analyzing a local water and health survey.
Based on the survey details below, predict the water safety status, contamination risk level, likely contaminants, predicted diseases, and provide clear recommendations to solve or prevent the issues.

Survey Details:
- Citizen Name: ${survey.citizen?.name || 'Unknown'}
- Citizen Age: ${survey.citizen?.age || 'Unknown'}
- Citizen Gender: ${survey.citizen?.gender || 'Unknown'}
- Citizen Occupation: ${survey.citizen?.occupation || 'Unknown'}
- Location: ${survey.citizen?.village || 'Unknown'}, ${survey.citizen?.district || 'Unknown'}
- Water Source: ${survey.water?.source || 'Unknown'}
- Water Appearance: ${survey.water?.appearance || 'Unknown'}
- Water Smell: ${survey.water?.smell || 'Unknown'}
- Water Taste: ${survey.water?.taste || 'Unknown'}
- Visible Particles: ${survey.water?.visibleParticles ? 'Yes' : 'No'}
- Storage Method: ${survey.water?.storageMethod || 'Unknown'}
- Is Water Boiled: ${survey.water?.isBoiled ? 'Yes' : 'No'}
- Is Water Filtered: ${survey.water?.isFiltered ? 'Yes' : 'No'}
- H2S Paper Test Result: ${survey.test?.h2sResult || 'Pending'}
- pH Value of Water: ${survey.test?.phValue || 7.0}
- Citizen Symptoms: ${(survey.symptoms || []).join(', ') || 'None'}
- Symptoms Duration: ${survey.symptomDuration || 0} days
- Family Members Sick: ${survey.familySick ? 'Yes' : 'No'}
- Medical History: ${survey.medicalHistory || 'None'}

Please provide the prediction output in the requested JSON structure.
`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'object',
            properties: {
              waterStatus: {
                type: 'string',
                enum: ['Safe', 'Contaminated', 'Highly Contaminated'],
              },
              riskLevel: {
                type: 'string',
                enum: ['Low', 'Medium', 'High', 'Critical'],
              },
              likelyContaminant: { type: 'string' },
              predictedDiseases: {
                type: 'array',
                items: { type: 'string' },
              },
              recommendations: {
                type: 'array',
                items: { type: 'string' },
              },
            },
            required: ['waterStatus', 'riskLevel', 'likelyContaminant', 'predictedDiseases', 'recommendations'],
          },
        },
      });

      if (!response.text) {
        throw new Error('Empty response received from Gemini model.');
      }

      basePrediction = JSON.parse(response.text);
    } catch (err) {
      console.warn('[Prediction] Gemini prediction failed. Falling back to local Rule-Based Engine. Error:', err.message);
      basePrediction = localPredict(survey);
    }
  }

  // Attach XGBoost Percentage Evaluation
  try {
    const xgboostEval = await evaluateXGBoost(survey);
    basePrediction.xgboostEvaluation = xgboostEval;
  } catch (xgbErr) {
    console.error('[Prediction] XGBoost evaluation error:', xgbErr.message);
  }

  return basePrediction;
}

// Health Check Endpoint for Render & Monitoring
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'AquaSafe AI Backend Engine',
    timestamp: new Date().toISOString()
  });
});

// GET endpoints for cases and volunteers
app.get('/api/cases', async (req, res) => {
  try {
    const casesList = await getCasesFromDB();
    res.json(casesList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/volunteers', async (req, res) => {
  try {
    const volList = await getVolunteersFromDB();
    res.json(volList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User login API (verifies credentials from database)
app.post('/api/login', async (req, res) => {
  try {
    const { role, username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const cleanUsername = username.trim();

    if (role === 'admin') {
      // Default admin login credentials from user requirement: admin / admin@123
      if (cleanUsername.toLowerCase() === 'admin' && password === 'admin@123') {
        return res.json({
          success: true,
          user: {
            id: 'u-admin',
            username: 'admin',
            name: 'Dr. Sarah Alvares (Admin)',
            role: 'admin',
            email: 'sarah.alvares@health.gov.in',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop',
            district: 'Ramanagara'
          }
        });
      }
      // Keep fallback legacy admin credential just in case they click demo button (Dr_Alvares)
      if (cleanUsername.toLowerCase() === 'dr_alvares' && password === 'admin1234') {
        return res.json({
          success: true,
          user: {
            id: 'u-admin',
            username: 'Dr_Alvares',
            name: 'Dr. Sarah Alvares (Admin)',
            role: 'admin',
            email: 'sarah.alvares@health.gov.in',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop',
            district: 'Ramanagara'
          }
        });
      }

      return res.json({ success: false, error: 'Invalid admin credentials' });
    } else {
      // Volunteer login: query the SQLite volunteers table
      const hashed = crypto.createHash('sha256').update(password).digest('hex');
      const volunteer = await db.get(
        'SELECT * FROM volunteers WHERE LOWER(username) = ? AND password = ?',
        [cleanUsername.toLowerCase(), hashed]
      );

      if (volunteer) {
        return res.json({
          success: true,
          user: {
            id: volunteer.id,
            username: volunteer.username,
            name: volunteer.name,
            role: 'volunteer',
            email: volunteer.email,
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
            villageAssigned: volunteer.villageAssigned,
            district: volunteer.district || 'Ramanagara'
          }
        });
      }
      return res.json({ success: false, error: 'Invalid volunteer credentials' });
    }
  } catch (err) {
    console.error('[Login API] Error:', err);
    res.status(500).json({ error: 'Server error during authentication' });
  }
});

// HTTP POST endpoint for predictions
app.post('/api/predict', async (req, res) => {
  try {
    const survey = req.body;
    if (!survey) {
      return res.status(400).json({ error: 'No survey body provided' });
    }
    const result = await handlePrediction(survey);
    res.json(result);
  } catch (err) {
    console.error('[Backend Server API] Prediction error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

// HTTP POST endpoint for standalone XGBoost ML evaluation
app.post('/api/predict/xgboost', async (req, res) => {
  try {
    const survey = req.body;
    if (!survey) {
      return res.status(400).json({ error: 'No survey body provided' });
    }
    const evaluation = await evaluateXGBoost(survey);
    res.json(evaluation);
  } catch (err) {
    console.error('[Backend Server API] XGBoost evaluation error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

// Serve frontend build static files in production if available
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
    return next();
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('AquaSafe AI API Server is running. (Frontend assets not built)');
    }
  });
});

// Setup server upgrades for websockets
server.on('upgrade', (request, socket, head) => {
  const { pathname } = new URL(request.url || '', `http://${request.headers.host}`);
  if (pathname === '/ws-app') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on('connection', async (ws) => {
  console.log('[Backend WS Server] Client connected');

  try {
    // Fetch fresh synchronized data directly from SQLite
    const syncCases = await getCasesFromDB();
    const syncVolunteers = await getVolunteersFromDB();
    const syncTimeline = await getTimelineFromDB();

    // Send state to newly connected client
    ws.send(JSON.stringify({
      type: 'SYNC',
      payload: {
        cases: syncCases,
        volunteers: syncVolunteers,
        timeline: syncTimeline
      }
    }));
  } catch (e) {
    console.error('[Backend WS Server] Error during initial sync:', e);
  }

  ws.on('message', async (message) => {
    try {
      const event = JSON.parse(message.toString());
      console.log(`[Backend WS Server] Received event: ${event.type}`);

      switch (event.type) {
        case 'ADD_CASE': {
          const { case: newCase, timelineEvent } = event.payload;
          
          await db.run(
            `INSERT INTO cases (id, citizenName, citizenAge, citizenGender, citizenPhone, citizenOccupation, village, district, address, latitude, longitude, waterDetails, waterTest, symptoms, symptomDuration, familySick, medicalHistory, prediction, assignedVolunteer, status, dateCreated, lastUpdated, adminResponse)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              newCase.id, newCase.citizenName, newCase.citizenAge, newCase.citizenGender, newCase.citizenPhone, newCase.citizenOccupation, newCase.village, newCase.district, newCase.address,
              newCase.gpsCoordinates.latitude, newCase.gpsCoordinates.longitude,
              JSON.stringify(newCase.waterDetails), JSON.stringify(newCase.waterTest), JSON.stringify(newCase.symptoms),
              newCase.symptomDuration, newCase.familySick ? 1 : 0, newCase.medicalHistory,
              JSON.stringify(newCase.prediction), newCase.assignedVolunteer, newCase.status, newCase.dateCreated, newCase.lastUpdated,
              newCase.adminResponse ? JSON.stringify(newCase.adminResponse) : null
            ]
          );

          await db.run(
            `INSERT INTO timeline (id, caseId, status, title, description, timestamp, actor)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [timelineEvent.id, timelineEvent.caseId, timelineEvent.status, timelineEvent.title, timelineEvent.description, timelineEvent.timestamp, timelineEvent.actor]
          );

          // Update volunteer workload count in SQL
          await db.run(
            `UPDATE volunteers SET assigned = assigned + 1, pending = pending + 1 WHERE name = ?`,
            [newCase.assignedVolunteer]
          );
          break;
        }
        case 'UPDATE_CASE': {
          const { case: updatedCase, timelineEvent } = event.payload;

          await db.run(
            `UPDATE cases 
             SET status = ?, lastUpdated = ?, adminResponse = ? 
             WHERE id = ?`,
            [
              updatedCase.status, 
              updatedCase.lastUpdated, 
              updatedCase.adminResponse ? JSON.stringify(updatedCase.adminResponse) : null, 
              updatedCase.id
            ]
          );

          await db.run(
            `INSERT INTO timeline (id, caseId, status, title, description, timestamp, actor)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [timelineEvent.id, timelineEvent.caseId, timelineEvent.status, timelineEvent.title, timelineEvent.description, timelineEvent.timestamp, timelineEvent.actor]
          );

          // If resolved/closed, adjust volunteer completed counters in SQL
          if (updatedCase.status === 'Resolved') {
            await db.run(
              `UPDATE volunteers 
               SET completed = completed + 1, pending = MAX(0, pending - 1) 
               WHERE name = ?`,
              [updatedCase.assignedVolunteer]
            );
          }
          break;
        }
        case 'ADD_VOLUNTEER': {
          const newVol = event.payload;
          const hashed = crypto.createHash('sha256').update(newVol.password || 'demo1234').digest('hex');
          
          await db.run(
            `INSERT INTO volunteers (id, name, username, password, assigned, completed, pending, critical, status, email, villageAssigned, district, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              newVol.id, newVol.name, newVol.username, hashed, 
              newVol.assigned, newVol.completed, newVol.pending, newVol.critical, 
              newVol.status, newVol.email, newVol.villageAssigned, newVol.district || 'Ramanagara', 
              new Date().toISOString()
            ]
          );
          break;
        }
      }

      // Broadcast to other connected client sockets
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === 1) {
          client.send(message.toString());
        }
      });
    } catch (e) {
      console.error('[Backend WS Server] Error handling message:', e);
    }
  });

  ws.on('close', () => {
    console.log('[Backend WS Server] Client disconnected');
  });
});

// Boot Database first, then launch Web Server
initDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize SQLite database:', err);
  process.exit(1);
});
