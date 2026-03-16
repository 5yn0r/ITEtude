import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {config} from 'dotenv';

// Charge les variables d'environnement du fichier .env en local
config();

// Récupération de la clé avec plusieurs fallbacks
const apiKey = process.env.GEMINI_API_KEY || 
               process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// Log côté serveur pour débogage (visible dans les logs Vercel ou terminal local)
if (!apiKey) {
  console.error("❌ ERREUR CRITIQUE : Aucune clé API Gemini n'a été trouvée dans les variables d'environnement.");
  console.log("Variables détectées :", Object.keys(process.env).filter(k => k.includes('KEY') || k.includes('GEMINI')));
} else if (process.env.NODE_ENV === 'development') {
  console.log("✅ Clé API Gemini détectée avec succès.");
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
