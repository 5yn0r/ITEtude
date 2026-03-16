import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {config} from 'dotenv';

// Charge les variables d'environnement du fichier .env en local
config();

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
