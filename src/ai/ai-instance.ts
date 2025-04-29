
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
  // Explicitly set a default model to be used if not specified in the prompt/flow
  model: apiKey ? 'googleai/gemini-1.5-flash' : undefined,
});

// If no API key is provided, log a warning that no model is configured
if (!apiKey) {
  console.warn('Warning: No Google AI API key provided, so no default model is configured. AI calls will fail.');
}
