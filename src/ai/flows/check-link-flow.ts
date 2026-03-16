'use server';
/**
 * @fileOverview Un flux pour vérifier le statut d'une URL.
 *
 * - checkLink - Une fonction qui récupère une URL et renvoie son statut.
 * - CheckLinkInput - Le type d'entrée pour la fonction checkLink.
 * - CheckLinkOutput - Le type de retour pour la fonction checkLink.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CheckLinkInputSchema = z.object({
  url: z.string().url().describe('L\'URL à vérifier.'),
});
export type CheckLinkInput = z.infer<typeof CheckLinkInputSchema>;

const CheckLinkOutputSchema = z.object({
  status: z
    .enum(['active', 'broken', 'error'])
    .describe('Le statut du lien.'),
  statusCode: z.number().optional().describe('Le code de statut HTTP si disponible.'),
  errorMessage: z.string().optional().describe('Le message d\'erreur si une erreur s\'est produite.'),
});
export type CheckLinkOutput = z.infer<typeof CheckLinkOutputSchema>;

// Ce flux utilise Genkit pour encapsuler la logique de vérification de lien
const checkLinkFlow = ai.defineFlow(
  {
    name: 'checkLinkFlow',
    inputSchema: CheckLinkInputSchema,
    outputSchema: CheckLinkOutputSchema,
  },
  async (input) => {
    const { url } = input;
    try {
      // Utilisation d'une requête HEAD pour être plus efficace (pas de corps de réponse).
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 secondes

      const response = await fetch(url, { 
        method: 'HEAD', 
        signal: controller.signal as any, // Cast pour éviter les conflits de types AbortSignal selon l'environnement
        redirect: 'follow' 
      });
      clearTimeout(timeoutId);

      if (response.status >= 200 && response.status < 400) {
        // Tout statut 2xx ou 3xx est considéré comme actif
        return {
          status: 'active',
          statusCode: response.status,
        };
      } else {
        // Un statut 4xx ou 5xx est considéré comme cassé
        return {
          status: 'broken',
          statusCode: response.status,
        };
      }
    } catch (error: any) {
      // Erreurs réseau, timeouts, etc.
      if (error.name === 'AbortError') {
         return {
            status: 'error',
            errorMessage: 'Délai d\'attente dépassé : le serveur a mis trop de temps à répondre.',
        };
      }
      return {
        status: 'error',
        errorMessage: error.message || 'Une erreur inconnue est survenue lors de la vérification de l\'URL.',
      };
    }
  }
);

export async function checkLink(input: CheckLinkInput): Promise<CheckLinkOutput> {
    return checkLinkFlow(input);
}
