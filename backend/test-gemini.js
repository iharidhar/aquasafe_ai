import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file directly from disk to bypass cached shell environment variables
const envPath = path.join(__dirname, '.env');
let apiKey = '';

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.trim().startsWith('GEMINI_API_KEY=')) {
      apiKey = line.split('GEMINI_API_KEY=')[1].trim();
      break;
    }
  }
} catch (e) {
  console.error('Failed to read .env file directly:', e.message);
}

if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
  console.error('Error: GEMINI_API_KEY is not configured in backend/.env file on disk.');
  process.exit(1);
}

console.log('API Key detected directly from file:', apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 5));
console.log('Initializing GoogleGenAI client...');
const ai = new GoogleGenAI({ apiKey });

async function testConnection() {
  try {
    console.log('Sending test request to gemini-2.5-flash model...');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Hello, reply with exactly the words: "Gemini is connected and working successfully!"'
    });

    console.log('\n--- API Response ---');
    console.log(response.text.trim());
    console.log('--------------------');
    console.log('\nSuccess: Your Gemini API key is working perfectly!');
  } catch (err) {
    console.error('\nError: Failed to connect to Gemini API.');
    console.error('Details:', err.message);
    process.exit(1);
  }
}

testConnection();
