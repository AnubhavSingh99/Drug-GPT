
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const apiKey = process.env.GOOGLE_GENAI_API_KEY;

if (!apiKey) {
  console.warn(
    'GOOGLE_GENAI_API_KEY environment variable is not set. AI features may not work.'
  );
}

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: apiKey, // Use the checked apiKey variable
    }),
  ],
  logLevel: 'debug', // Enable debug logging for more details
  model: 'googleai/gemini-1.5-flash', // Use a supported model
});
