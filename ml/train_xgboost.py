import os
import json
import csv
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASETS_DIR = os.path.join(BASE_DIR, 'datasets')
MODELS_DIR = os.path.join(BASE_DIR, 'models')
DISEASES_JSON = os.path.join(BASE_DIR, '..', 'backend', 'data', 'diseases.json')
SYMPTOM_DESC_CSV = os.path.join(DATASETS_DIR, 'symptom_Description.csv')

os.makedirs(MODELS_DIR, exist_ok=True)

# 1. Load Symptom Descriptions
disease_descriptions = {}

if os.path.exists(SYMPTOM_DESC_CSV):
    with open(SYMPTOM_DESC_CSV, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            d_name = row.get('Disease', '').strip()
            desc = row.get('Description', '').strip()
            if d_name and desc:
                disease_descriptions[d_name.lower()] = desc

# Load diseases.json for waterborne pathogens & toxicity definitions
waterborne_diseases = []
if os.path.exists(DISEASES_JSON):
    with open(DISEASES_JSON, 'r', encoding='utf-8') as f:
        waterborne_diseases = json.load(f)

# Populate descriptions for waterborne diseases if not in symptom_Description.csv
default_descriptions = {
    "cholera": "Cholera is an acute diarrheal infection caused by ingestion of food or water contaminated with the bacterium Vibrio cholerae. It can cause severe acute watery diarrhea and rapid dehydration.",
    "typhoid fever": "Typhoid fever is a life-threatening infection caused by the bacterium Salmonella Typhi. It is usually spread through contaminated food or water.",
    "acute gastroenteritis (e. coli / rotavirus)": "Acute gastroenteritis is an inflammation of the stomach and intestines caused by pathogenic bacterial or viral infections from contaminated water.",
    "bacillary dysentery (shigellosis)": "Dysentery is an intestinal infection that causes severe diarrhea with blood and mucus, accompanied by fever and abdominal cramps.",
    "hepatitis a & e": "Hepatitis A and E are viral liver infections transmitted through ingestion of fecal-contaminated drinking water, leading to jaundice and liver inflammation.",
    "giardiasis": "Giardiasis is a diarrheal illness caused by the microscopic parasite Giardia duodenalis, which survives in surface water sources.",
    "cryptosporidiosis": "Cryptosporidiosis is a microscopic parasite disease caused by Cryptosporidium, causing watery diarrhea, stomach cramps, and dehydration.",
    "schistosomiasis (bilharzia)": "Schistosomiasis is a disease caused by parasitic flatworms found in contaminated freshwater bodies.",
    "leptospirosis": "Leptospirosis is a bacterial infection transmitted through water contaminated by the urine of infected animals.",
    "dental & skeletal fluorosis": "Fluorosis is a chronic toxic condition caused by excessive fluoride intake in drinking water, leading to tooth discoloration and joint deformation.",
    "arsenicosis (arsenic toxicity)": "Arsenicosis is chronic arsenic poisoning caused by drinking water with high dissolved arsenic levels, leading to skin lesions and systemic organ damage.",
    "lead toxicity": "Lead poisoning occurs when heavy metal lead accumulates in drinking water from industrial runoff or corroded piping.",
    "cadmium toxicity (itai-itai disease)": "Cadmium toxicity is heavy metal poisoning affecting kidneys and bone mineral density due to industrial groundwater pollution.",
    "acute nitrate toxicity (blue baby syndrome)": "High nitrate levels in groundwater impair blood oxygen transport, particularly hazardous for infants and vulnerable populations.",
    "agricultural pesticide toxicity": "Pesticide contamination in water bodies caused by agricultural runoff, causing acute organ distress and neurotoxicity.",
    "high salinity / tds water stress": "High Total Dissolved Solids (TDS) and excessive salinity cause severe dehydration, digestive discomfort, and kidney stress."
}

for d in waterborne_diseases:
    name = d['name']
    key = name.lower()
    if key not in disease_descriptions:
        # Check partial match
        matched = False
        for desc_key in disease_descriptions:
            if desc_key in key or key in desc_key:
                disease_descriptions[key] = disease_descriptions[desc_key]
                matched = True
                break
        if not matched:
            disease_descriptions[key] = default_descriptions.get(key, f"{name} is a waterborne health hazard associated with contaminated water vectors.")

# 2. Build Training Dataset for XGBoost Classifier
WATER_SOURCES = ['Municipal Tap', 'Borewell', 'Open Well', 'River', 'Lake', 'Pond', 'Spring', 'RO Plant']
APPEARANCES = ['Clear', 'Turbid', 'Yellowish', 'Brownish']
SMELLS = ['None', 'Rotten Eggs (Sulfur)', 'Chemical', 'Musty']
TASTES = ['Normal', 'Salty', 'Metallic', 'Bitter']
H2S_RESULTS = ['Negative', 'Positive']
ALL_SYMPTOMS = ['Diarrhea', 'Vomiting', 'Fever', 'Abdominal Pain', 'Joint Pain', 'Rash', 'Nausea', 'Fatigue', 'Headache', 'Chills', 'Jaundice']

DISEASE_TARGETS = [
    'Cholera', 'Typhoid Fever', 'Acute Gastroenteritis (E. coli / Rotavirus)',
    'Bacillary Dysentery (Shigellosis)', 'Hepatitis A & E', 'Giardiasis',
    'Dental & Skeletal Fluorosis', 'Arsenicosis (Arsenic Toxicity)',
    'Lead Toxicity', 'Agricultural Pesticide Toxicity', 'High Salinity / TDS Water Stress',
    'Safe / No Outbreak Vector'
]

RISK_TARGETS = ['Safe', 'Contaminated', 'Highly Contaminated']

# Generate feature schema
features_list = [
    'phValue',
    'visibleParticles',
    'isBoiled',
    'isFiltered',
    'symptomDuration',
    'familySick'
]
# One-hot features
for s in WATER_SOURCES: features_list.append(f'source_{s}')
for a in APPEARANCES: features_list.append(f'appearance_{a}')
for sm in SMELLS: features_list.append(f'smell_{sm}')
for t in TASTES: features_list.append(f'taste_{t}')
for h in H2S_RESULTS: features_list.append(f'h2s_{h}')
for sym in ALL_SYMPTOMS: features_list.append(f'symptom_{sym}')

np.random.seed(42)
num_samples = 3000
X_data = []
y_disease = []
y_risk = []

for _ in range(num_samples):
    # Select a target disease scenario
    target = np.random.choice(DISEASE_TARGETS, p=[0.1, 0.1, 0.12, 0.08, 0.08, 0.07, 0.06, 0.05, 0.05, 0.05, 0.04, 0.20])
    
    # Defaults
    ph = np.random.uniform(6.5, 7.5)
    particles = 0
    boiled = np.random.choice([0, 1])
    filtered = np.random.choice([0, 1])
    duration = 0
    fam_sick = 0
    source = np.random.choice(WATER_SOURCES)
    appearance = 'Clear'
    smell = 'None'
    taste = 'Normal'
    h2s = 'Negative'
    symptoms = []
    
    if target == 'Cholera':
        ph = np.random.uniform(5.5, 7.5)
        h2s = 'Positive'
        appearance = np.random.choice(['Turbid', 'Brownish', 'Clear'])
        symptoms = ['Diarrhea', 'Vomiting'] + list(np.random.choice(['Fever', 'Abdominal Pain', 'Nausea'], size=np.random.randint(0, 2), replace=False))
        duration = np.random.randint(1, 5)
        fam_sick = np.random.choice([0, 1], p=[0.3, 0.7])
        risk = 'Highly Contaminated'
    elif target == 'Typhoid Fever':
        ph = np.random.uniform(5.5, 7.5)
        h2s = 'Positive'
        symptoms = ['Fever'] + list(np.random.choice(['Headache', 'Fatigue', 'Abdominal Pain', 'Diarrhea'], size=np.random.randint(1, 3), replace=False))
        duration = np.random.randint(2, 8)
        fam_sick = np.random.choice([0, 1], p=[0.4, 0.6])
        risk = 'Highly Contaminated'
    elif target == 'Acute Gastroenteritis (E. coli / Rotavirus)':
        h2s = np.random.choice(['Positive', 'Negative'], p=[0.75, 0.25])
        appearance = np.random.choice(['Turbid', 'Clear'], p=[0.6, 0.4])
        symptoms = ['Diarrhea'] + list(np.random.choice(['Vomiting', 'Nausea', 'Abdominal Pain'], size=np.random.randint(1, 3), replace=False))
        duration = np.random.randint(1, 4)
        risk = 'Contaminated' if h2s == 'Negative' else 'Highly Contaminated'
    elif target == 'Dental & Skeletal Fluorosis':
        ph = np.random.uniform(8.0, 9.5)
        taste = 'Salty'
        symptoms = ['Joint Pain']
        risk = 'Contaminated'
    elif target == 'Arsenicosis (Arsenic Toxicity)':
        ph = np.random.uniform(7.8, 8.8)
        symptoms = ['Rash', 'Fatigue']
        risk = 'Highly Contaminated'
    elif target == 'Lead Toxicity':
        taste = 'Metallic'
        smell = 'Chemical'
        symptoms = ['Headache', 'Abdominal Pain', 'Fatigue']
        risk = 'Highly Contaminated'
    elif target == 'Hepatitis A & E':
        h2s = 'Positive'
        symptoms = ['Fever', 'Jaundice', 'Nausea', 'Fatigue']
        duration = np.random.randint(3, 10)
        risk = 'Highly Contaminated'
    elif target == 'Safe / No Outbreak Vector':
        ph = np.random.uniform(6.8, 7.6)
        h2s = 'Negative'
        appearance = 'Clear'
        smell = 'None'
        taste = 'Normal'
        symptoms = []
        duration = 0
        fam_sick = 0
        risk = 'Safe'
    else:
        h2s = np.random.choice(['Positive', 'Negative'], p=[0.6, 0.4])
        symptoms = list(np.random.choice(ALL_SYMPTOMS, size=np.random.randint(1, 3), replace=False))
        risk = 'Contaminated'

    # Build feature row vector
    row = {
        'phValue': ph,
        'visibleParticles': particles,
        'isBoiled': boiled,
        'isFiltered': filtered,
        'symptomDuration': duration,
        'familySick': fam_sick
    }
    for s in WATER_SOURCES: row[f'source_{s}'] = 1 if source == s else 0
    for a in APPEARANCES: row[f'appearance_{a}'] = 1 if appearance == a else 0
    for sm in SMELLS: row[f'smell_{sm}'] = 1 if smell == sm else 0
    for t in TASTES: row[f'taste_{t}'] = 1 if taste == t else 0
    for h in H2S_RESULTS: row[f'h2s_{h}'] = 1 if h2s == h else 0
    for sym in ALL_SYMPTOMS: row[f'symptom_{sym}'] = 1 if sym in symptoms else 0
    
    X_data.append([row[col] for col in features_list])
    y_disease.append(target)
    y_risk.append(risk)

X_df = pd.DataFrame(X_data, columns=features_list)

# Encode Labels
disease_encoder = LabelEncoder()
y_disease_encoded = disease_encoder.fit_transform(y_disease)

risk_encoder = LabelEncoder()
y_risk_encoded = risk_encoder.fit_transform(y_risk)

# Train XGBoost Disease Classifier
X_train, X_test, y_train, y_test = train_test_split(X_df, y_disease_encoded, test_size=0.2, random_state=42)

disease_model = xgb.XGBClassifier(
    n_estimators=100,
    max_depth=5,
    learning_rate=0.1,
    eval_metric='mlogloss',
    use_label_encoder=False,
    random_state=42
)
disease_model.fit(X_train, y_train)

disease_preds = disease_model.predict(X_test)
print("XGBoost Disease Model Accuracy:", accuracy_score(y_test, disease_preds))

# Train XGBoost Risk Classifier
X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(X_df, y_risk_encoded, test_size=0.2, random_state=42)
risk_model = xgb.XGBClassifier(
    n_estimators=80,
    max_depth=4,
    learning_rate=0.1,
    eval_metric='mlogloss',
    use_label_encoder=False,
    random_state=42
)
risk_model.fit(X_train_r, y_train_r)

# Save Trained Models & Encoders
disease_model.save_model(os.path.join(MODELS_DIR, 'xgboost_disease_model.json'))
risk_model.save_model(os.path.join(MODELS_DIR, 'xgboost_risk_model.json'))

schema_meta = {
    "features": features_list,
    "disease_classes": disease_encoder.classes_.tolist(),
    "risk_classes": risk_encoder.classes_.tolist(),
    "water_sources": WATER_SOURCES,
    "appearances": APPEARANCES,
    "smells": SMELLS,
    "tastes": TASTES,
    "h2s_results": H2S_RESULTS,
    "all_symptoms": ALL_SYMPTOMS
}

with open(os.path.join(MODELS_DIR, 'feature_schema.json'), 'w', encoding='utf-8') as f:
    json.dump(schema_meta, f, indent=2)

with open(os.path.join(MODELS_DIR, 'disease_descriptions.json'), 'w', encoding='utf-8') as f:
    json.dump(disease_descriptions, f, indent=2)

print("Successfully trained and exported XGBoost models and disease descriptions to ml/models/")
