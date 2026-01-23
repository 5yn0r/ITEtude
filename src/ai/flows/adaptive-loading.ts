'use server';

/**
 * @fileOverview Implements adaptive loading based on network connection quality.
 *
 * - adaptiveLoading - A function that determines whether to limit image loading based on connection quality.
 * - AdaptiveLoadingInput - The input type for the adaptiveLoading function.
 * - AdaptiveLoadingOutput - The return type for the adaptiveLoading function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptiveLoadingInputSchema = z.object({
  connectionType: z
    .string()
    .describe(
      'The type of network connection (e.g., cellular, wifi, ethernet, none).' // From navigator.connection.effectiveType
    ),
  dataWeight: z
    .string()
    .describe(
      'The data weight of the resource being loaded.  Possible values: Plume, Standard, Media, Flux'
    ),
});
export type AdaptiveLoadingInput = z.infer<typeof AdaptiveLoadingInputSchema>;

const AdaptiveLoadingOutputSchema = z.object({
  limitImageLoading: z
    .boolean()
    .describe(
      'Whether to limit image loading based on connection type and data weight.'
    ),
});
export type AdaptiveLoadingOutput = z.infer<typeof AdaptiveLoadingOutputSchema>;

export async function adaptiveLoading(input: AdaptiveLoadingInput): Promise<AdaptiveLoadingOutput> {
  return adaptiveLoadingFlow(input);
}

const adaptiveLoadingPrompt = ai.definePrompt({
  name: 'adaptiveLoadingPrompt',
  input: {schema: AdaptiveLoadingInputSchema},
  output: {schema: AdaptiveLoadingOutputSchema},
  prompt: `You are an expert in optimizing web application performance for users with slow internet connections.  Given the user's connection type ({{{connectionType}}}) and the data weight of the resource being loaded ({{{dataWeight}}}), determine whether to limit image loading.

  Here is information about the different data weights:

  - Plume: < 500 KB, optimized for textual content.  Always load these.
  - Standard: Up to 1 MB, may contain some images.  Load unless the connection is very slow.
  - Media: Up to 5 MB, contains multiple images or a video.  Defer loading on slower connections.
  - Flux:  Up to 10 MB, contains high-resolution images or video.  Defer loading on slower connections.

  Respond with whether to limit image loading or not. Consider "cellular" and "none" connections to be slow, and "wifi" and "ethernet" to be fast. But ultimately, use your best judgement.
`,
});

const adaptiveLoadingFlow = ai.defineFlow(
  {
    name: 'adaptiveLoadingFlow',
    inputSchema: AdaptiveLoadingInputSchema,
    outputSchema: AdaptiveLoadingOutputSchema,
  },
  async input => {
    const {output} = await adaptiveLoadingPrompt(input);
    return output!;
  }
);
