import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {config} from 'dotenv';

// Charge les variables d'environnement du fichier .env en local pour les outils CLI
config();

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY;

if (!apiKey && process.env.NODE_ENV === 'development') {
  console.warn("⚠️ ATTENTION : Aucune clé API Gemini trouvée. La recherche IA risque de ne pas fonctionner. Vérifiez votre fichier .env");
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
