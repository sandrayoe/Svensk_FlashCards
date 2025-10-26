import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Ensure the Google AI API key is available
const apiKey = process.env.GOOGLE_GENAI_API_KEY;
if (!apiKey) {
  throw new Error('GOOGLE_GENAI_API_KEY environment variable is required. Please set it in your .env.local file.');
}

export const ai = genkit({
  plugins: [googleAI({
    apiKey: apiKey,
  })],
  model: 'googleai/gemini-2.5-flash',
});
