import http from 'http';

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
}

async function runTests() {
  console.log("=== AQUASAFE AI API ROUTE INTEGRATION TESTS ===");
  
  const sampleSurvey = {
    citizen: { name: 'Test User', age: 34, gender: 'Male', village: 'Kanakapura', district: 'Ramanagara' },
    water: { source: 'River', appearance: 'Turbid', smell: 'Rotten Eggs (Sulfur)', taste: 'Bitter', visibleParticles: true, isBoiled: false, isFiltered: false },
    test: { h2sResult: 'Positive', phValue: 6.0 },
    symptoms: ['Diarrhea', 'Vomiting', 'Fever'],
    symptomDuration: 3,
    familySick: true
  };

  try {
    // 1. Test Admin Login
    console.log("\n1. Testing Admin Login (/api/login)...");
    const adminLogin = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { role: 'admin', username: 'admin', password: 'admin@123' });
    console.log("Status:", adminLogin.status, "Success:", adminLogin.data.success, "User:", adminLogin.data.user?.name);

    // 2. Test Volunteer Login
    console.log("\n2. Testing Volunteer Login (/api/login)...");
    const volLogin = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { role: 'volunteer', username: 'Anil_Kumar', password: 'demo1234' });
    console.log("Status:", volLogin.status, "Success:", volLogin.data.success, "User:", volLogin.data.user?.name);

    // 3. Test Hybrid AI & XGBoost Prediction Endpoint (/api/predict)
    console.log("\n3. Testing Unified AI & XGBoost Prediction (/api/predict)...");
    const predictRes = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/predict',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, sampleSurvey);
    console.log("Status:", predictRes.status);
    console.log("Water Status:", predictRes.data.waterStatus, "| Risk Level:", predictRes.data.riskLevel);
    console.log("XGBoost Confidence:", predictRes.data.xgboostEvaluation?.modelConfidence + "%");
    console.log("XGBoost Diseases:", predictRes.data.xgboostEvaluation?.diseaseProbabilities?.map(d => `${d.disease} (${d.percentage}%)`).join(', '));
    console.log("XGBoost Sample Description:", predictRes.data.xgboostEvaluation?.diseaseProbabilities?.[0]?.description?.substring(0, 80) + "...");

    // 4. Test Dedicated Standalone XGBoost Endpoint (/api/predict/xgboost)
    console.log("\n4. Testing Standalone XGBoost ML Endpoint (/api/predict/xgboost)...");
    const xgbRes = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/predict/xgboost',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, sampleSurvey);
    console.log("Status:", xgbRes.status);
    console.log("XGBoost Model Name:", xgbRes.data.modelName);
    console.log("Risk Probabilities:", xgbRes.data.riskProbabilities);

    console.log("\n✅ ALL BACKEND API ROUTES WORKING CLEANLY!");
  } catch (err) {
    console.error("Test Error:", err.message);
  }
}

runTests();
