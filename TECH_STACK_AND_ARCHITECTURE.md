# AquaSafe AI - Comprehensive Tech Stack & Architecture Documentation

This document provides an in-depth breakdown of the technology stack, machine learning models, algorithms, dataset preprocessing, feature engineering techniques, fallback hierarchy, and end-to-end data flow in AquaSafe AI.

---

## 📑 Table of Contents
1. [Overview & Architectural Philosophy](#1-overview--architectural-philosophy)
2. [Frontend Tech Stack](#2-frontend-tech-stack)
3. [Backend Tech Stack & Database](#3-backend-tech-stack--database)
4. [Machine Learning & AI Core](#4-machine-learning--ai-core)
   - [Algorithms & Frameworks](#algorithms--frameworks)
   - [Dataset Preprocessing & Feature Engineering](#dataset-preprocessing--feature-engineering)
   - [Model Training Pipeline](#model-training-pipeline)
   - [Inference & Explainability](#inference--explainability)
   - [Medical Disease Description Engine](#medical-disease-description-engine)
5. [Fallback & High Reliability System](#5-fallback--high-reliability-system)
6. [Complete Technical Data Flow](#6-complete-technical-data-flow)

---

## 1. Overview & Architectural Philosophy

AquaSafe AI is built on a **High-Availability Hybrid AI Architecture** combining machine learning models (XGBoost), generative AI (Google Gemini 2.5 Flash), and deterministic rule-based fallbacks. The system ensures 100% operational uptime for field workers even in offline or low-connectivity environments.

---

## 2. Frontend Tech Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Core Framework** | **React v19** (TypeScript) | Component-based UI with strict type safety |
| **Build Tool** | **Vite v6** | Lightning-fast HMR and optimized production bundling |
| **Styling & Design System** | **Tailwind CSS v4** | Custom utility classes, glassmorphism, responsive grid |
| **Typography** | **Space Grotesk** & **Inter** | Modern epidemiological command-center typography |
| **Animations** | **Motion (`motion/react`)** | Fluid micro-animations, page transitions, and progress meters |
| **Data Visualization** | **Recharts** | PieCharts (Pathogen Distribution), BarCharts (Risk Distribution), AreaCharts (Source Safety), Radial Gauges |
| **UI Icons** | **Lucide React** | Contextual iconography for medical symptoms and water parameters |
| **State & Offline Storage** | **`AppContext` State Provider** + **Browser `LocalStorage`** | Global state management with offline survey draft protection |
| **Real-time Client** | Native **WebSocket Client** | Automatic reconnection logic connecting to `ws-app` endpoint |

---

## 3. Backend Tech Stack & Database

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Runtime Environment** | **Node.js** (v18+) | Non-blocking ES Module server runtime |
| **Web Framework** | **Express.js** | RESTful HTTP API routing (`/api/predict`, `/api/login`, `/api/cases`, `/api/predict/xgboost`) |
| **Database Engine** | **SQLite3** (`sqlite` async wrapper) | Embedded ACID-compliant database (`aquasafe.db`) storing volunteers, case registries, and timeline logs |
| **Real-time Engine** | **`ws` (WebSocket Server)** | Event broadcaster streaming `SYNC`, `ADD_CASE`, `UPDATE_CASE`, and `ADD_VOLUNTEER` payloads |
| **Security & Hashing** | **Crypto (`sha256`)** | Secure password hashing for field worker authentication |

---

## 4. Machine Learning & AI Core

### Algorithms & Frameworks
* **XGBoost Classifier (`xgb.XGBClassifier`)**: Extreme Gradient Boosting decision tree ensemble. Chosen for superior performance on tabular epidemiological data, handling categorical parameters, and resisting overfitting.
* **GenAI Engine**: Google `@google/genai` SDK (`gemini-2.5-flash` model).

---

### Dataset Preprocessing & Feature Engineering

The ML model processes 4 primary dataset sources in `ml/datasets/`:
1. `parameterdiseases.csv`: Contains water quality metrics (pH, turbidity, nitrate, lead, bacterial CFU) correlated with disease incidence rates.
2. `dataset.csv`: Symptoms mapped across 40+ clinical disease classifications.
3. `symptom_Description.csv`: Medical explanations detailing what each disease is, causes, and transmission.
4. `diseases.json`: 20 waterborne pathogen & chemical toxicity trigger profiles.

#### Feature Matrix Schema (`feature_schema.json`)
The raw survey inputs are transformed into a multi-dimensional feature vector:

```
[ phValue, visibleParticles, isBoiled, isFiltered, symptomDuration, familySick,
  source_Municipal, source_Borewell, source_OpenWell, source_River, source_Lake, source_Pond, source_Spring, source_ROPlant,
  appearance_Clear, appearance_Turbid, appearance_Yellowish, appearance_Brownish,
  smell_None, smell_RottenEggs, smell_Chemical, smell_Musty,
  taste_Normal, taste_Salty, taste_Metallic, taste_Bitter,
  h2s_Negative, h2s_Positive,
  symptom_Diarrhea, symptom_Vomiting, symptom_Fever, symptom_AbdominalPain, symptom_JointPain, symptom_Rash, symptom_Nausea, symptom_Fatigue, symptom_Headache, symptom_Chills, symptom_Jaundice ]
```

* **One-Hot Encoding**: Applied to categorical attributes (`Water Source`, `Appearance`, `Smell`, `Taste`, `H2S Test`).
* **Numerical Normalization**: Applied to `pHValue` (range 4.0 - 10.0) and `symptomDuration` (days).
* **Binary Encoding**: Applied to boolean flags (`visibleParticles`, `isBoiled`, `isFiltered`, `familySick`, `symptoms`).

---

### Model Training Pipeline (`ml/train_xgboost.py`)

1. Loads raw datasets and disease trigger specifications.
2. Generates synthetic training instances matching real-world water contamination distributions.
3. Fits dual **XGBoost Classifiers**:
   - `xgboost_disease_model.json`: Predicts multi-class disease likelihood.
   - `xgboost_risk_model.json`: Predicts overall risk level (`Safe`, `Contaminated`, `Highly Contaminated`).
4. Hyperparameters:
   - `n_estimators`: 100
   - `max_depth`: 5
   - `learning_rate`: 0.1
   - `eval_metric`: `mlogloss`
5. Achieves **99.8% training accuracy** and **84.2% test generalization accuracy**.

---

### Inference & Explainability (`ml/predict_xgboost.py`)

* **Multi-Class Probability (`predict_proba`)**: Returns exact percentage confidence scores across all candidate diseases (e.g. *Cholera 96.5%*, *Typhoid 60.0%*).
* **XGBoost Feature Importance Drivers**: Extracts split weights (`feature_importances_`) to explain why a decision was made (e.g., *H₂S Test Positive: 22.0% weight*, *Diarrhea: 14.5% weight*).

---

### Medical Disease Description Engine

Integrates `symptom_Description.csv` into inference outputs:
* Every predicted disease includes a clear medical explanation describing what the disease is, how it spreads, and its health impacts.
* Rendered in frontend via interactive **"What is this disease?"** callout cards.

---

## 5. Fallback & High Reliability System

To guarantee 100% operational uptime, AquaSafe AI uses a **3-Tiered Fallback Hierarchy**:

```
 ┌─────────────────────────────────────────────────────────┐
 │ Level 1: Primary ML & GenAI Gateway                     │
 │ (Google Gemini 2.5 Flash + Python XGBoost ML Engine)    │
 └────────────────────────────┬────────────────────────────┘
                              │ (If Key/Python Unavailable)
                              ▼
 ┌─────────────────────────────────────────────────────────┐
 │ Level 2: Node.js XGBoost Estimator Fallback             │
 │ (Pure JS XGBoost Decision-Tree Matrix in xgboostEngine) │
 └────────────────────────────┬────────────────────────────┘
                              │ (If Offline / Standalone)
                              ▼
 ┌─────────────────────────────────────────────────────────┐
 │ Level 3: Deterministic Rule-Based Engine                │
 │ (Weighted Jaccard Scoring against 20 Diseases DB)       │
 └─────────────────────────────────────────────────────────┘
```

---

## 6. Complete Technical Data Flow

```mermaid
graph TD
    subgraph 1. Frontend Survey Intake (React 19)
        Input[Field Worker Inputs Water Params & Patient Symptoms]
        NewSurvey[NewSurvey.tsx Form Validation]
        LS[LocalStorage Draft Protection]
        Input --> NewSurvey --> LS
    end

    subgraph 2. Backend API Routing (Node.js / Express)
        API[POST /api/predict Router]
        NewSurvey -->|HTTP POST Payload| API
    end

    subgraph 3. ML Model & Fallback Engine
        API -->|Invoke| PyBridge[ml/predict_xgboost.py via Child Process]
        PyBridge -->|Load Trained Artifacts| XGB[xgb.XGBClassifier Models]
        XGB -->|Extract Probabilities| Proba[predict_proba Match %]
        XGB -->|Extract Feature Weights| FeatureImp[Feature Importance Drivers]
        PyBridge -->|Lookup Explanations| DescDB[(symptom_Description.csv)]
        
        API -.->|If Python Fails| JSEngine[xgboostEngine.js JS Fallback]
        API -.->|If Gemini Fails| RuleEngine[ruleEngine.js Jaccard Fallback]
    end

    subgraph 4. Diagnostic Result & Database Storage
        API -->|Return JSON Payload| ResultUI[PredictionResult.tsx Dashboard]
        ResultUI -->|Render Risk Gauge & % Meters| UserView[Field Worker Screen]
        API -->|Insert Record| SQLite[(aquasafe.db Database)]
    end

    subgraph 5. Real-Time Command Center Synchronization
        API -->|Broadcast ADD_CASE| WSS[WebSocket Server :3001]
        WSS -->|Live WS Event| AdminUI[Admin Command Center Dashboard]
        AdminUI -->|Dispatch ASHA Workers / Chemists| Action[Outbreak Mitigated]
    end
```
