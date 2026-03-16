'use server';
/**
 * @fileOverview Flux de recherche intelligente pour ITEtude.
 * Analyser la requête utilisateur et recommander les meilleures ressources/parcours.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AISearchInputSchema = z.object({
  query: z.string().describe('La requête de recherche en langage naturel de l\'utilisateur.'),
  availableData: z.object({
    resources: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().optional(),
      difficulty: z.string(),
    })),
    paths: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().optional(),
      difficulty: z.string(),
    })),
  }).describe('Le catalogue actuel de ressources et parcours.'),
});

export type AISearchInput = z.infer<typeof AISearchInputSchema>;

const AISearchOutputSchema = z.object({
  recommendations: z.array(z.object({
    id: z.string(),
    type: z.enum(['resource', 'path']),
    reason: z.string().describe('Explication concise de pourquoi cette ressource est recommandée.'),
  })),
  summary: z.string().describe('Un petit message d\'encouragement ou un résumé de la sélection.'),
});

export type AISearchOutput = z.infer<typeof AISearchOutputSchema>;

const aiSearchPrompt = ai.definePrompt({
  name: 'aiSearchPrompt',
  input: { schema: AISearchInputSchema },
  output: { schema: AISearchOutputSchema },
  prompt: `Tu es l'assistant pédagogique expert d'ITEtude. Ton rôle est d'aider les utilisateurs à trouver les ressources et parcours les plus adaptés à leurs besoins.

Voici la demande de l'utilisateur : "{{{query}}}"

Voici le catalogue disponible :
---
PARCOURS :
{{#each availableData.paths}}
- ID: {{id}}, Titre: {{title}}, Difficulté: {{difficulty}}, Description: {{description}}
{{/each}}

RESSOURCES :
{{#each availableData.resources}}
- ID: {{id}}, Titre: {{title}}, Difficulté: {{difficulty}}, Description: {{description}}
{{/each}}
---

Instructions :
1. Analyse l'intention de l'utilisateur (débutant, sujet spécifique, besoin d'un plan structuré).
2. Sélectionne jusqu'à 5 éléments (mélange de parcours et ressources) les plus pertinents.
3. Pour chaque élément, fournis une raison convaincante en français.
4. Si rien ne correspond, explique-le poliment dans le résumé.
`,
});

export async function aiSearch(input: AISearchInput): Promise<AISearchOutput> {
  const { output } = await aiSearchPrompt(input);
  if (!output) throw new Error("L'IA n'a pas pu générer de recommandations.");
  return output;
}
