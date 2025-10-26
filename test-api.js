// Simple test to verify Google AI API key works
require('dotenv').config({ path: '.env.local' });

console.log('Testing Google AI API key...');
console.log('API Key exists:', !!process.env.GOOGLE_GENAI_API_KEY);
console.log('API Key length:', process.env.GOOGLE_GENAI_API_KEY?.length || 0);

// Test a simple HTTP request to Google AI
const https = require('https');

const testApiKey = async () => {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ No API key found');
    return;
  }

  // Test URL for Google AI Gemini
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  https.get(url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ API key is valid! Google AI is accessible.');
        try {
          const parsed = JSON.parse(data);
          console.log('Available models:', parsed.models?.length || 0);
        } catch (e) {
          console.log('Response received but not JSON');
        }
      } else {
        console.error('❌ API key test failed');
        console.error('Status:', res.statusCode);
        console.error('Response:', data);
      }
    });
  }).on('error', (err) => {
    console.error('❌ Network error:', err.message);
  });
};

testApiKey();