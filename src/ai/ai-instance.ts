
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const apiKey = process.env.GOOGLE_GENAI_API_KEY;

if (!apiKey) {
  console.error(
    'CRITICAL: GOOGLE_GENAI_API_KEY environment variable is not set. AI features WILL NOT WORK.'
  );
  // Optionally, throw an error or prevent initialization if the key is essential
  // throw new Error('GOOGLE_GENAI_API_KEY environment variable is not set.');
}

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    // Only configure the plugin if the API key is present
    apiKey ? googleAI({ apiKey }) : undefined,
  ].filter(Boolean) as any, // Filter out undefined plugin if key is missing
  logLevel: 'debug', // Enable debug logging for more details
  // Consider setting a default model or handling model selection more robustly
  // model: 'googleai/gemini-1.5-flash', // Example model, ensure it's appropriate
});
