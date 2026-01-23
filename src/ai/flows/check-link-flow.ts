'use server';
/**
 * @fileOverview A flow to check the status of a URL.
 *
 * - checkLink - A function that fetches a URL and returns its status.
 * - CheckLinkInput - The input type for the checkLink function.
 * - CheckLinkOutput - The return type for the checkLink function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckLinkInputSchema = z.object({
  url: z.string().url().describe('The URL to check.'),
});
export type CheckLinkInput = z.infer<typeof CheckLinkInputSchema>;

const CheckLinkOutputSchema = z.object({
  status: z
    .enum(['active', 'broken', 'error'])
    .describe('The status of the link.'),
  statusCode: z.number().optional().describe('The HTTP status code if available.'),
  errorMessage: z.string().optional().describe('The error message if an error occurred.'),
});
export type CheckLinkOutput = z.infer<typeof CheckLinkOutputSchema>;

// This is not a real flow that uses AI, but we wrap it in the flow structure
// to keep the architecture consistent. It's a "tool" flow.
const checkLinkFlow = ai.defineFlow(
  {
    name: 'checkLinkFlow',
    inputSchema: CheckLinkInputSchema,
    outputSchema: CheckLinkOutputSchema,
  },
  async ({url}) => {
    try {
      // Use a HEAD request to be more efficient, we don't need the body.
      // Set a timeout to avoid waiting forever.
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout

      const response = await fetch(url, { method: 'HEAD', signal: controller.signal, redirect: 'follow' });
      clearTimeout(timeoutId);

      if (response.status >= 200 && response.status < 400) {
        // Any 2xx or 3xx status is considered active
        return {
          status: 'active',
          statusCode: response.status,
        };
      } else {
        // 4xx or 5xx status is considered broken
        return {
          status: 'broken',
          statusCode: response.status,
        };
      }
    } catch (error: any) {
      // Network errors, timeouts, etc.
      if (error.name === 'AbortError') {
         return {
            status: 'error',
            errorMessage: 'Timeout: The server took too long to respond.',
        };
      }
      return {
        status: 'error',
        errorMessage: error.message || 'An unknown error occurred while fetching the URL.',
      };
    }
  }
);

export async function checkLink(input: CheckLinkInput): Promise<CheckLinkOutput> {
    return checkLinkFlow(input);
}
