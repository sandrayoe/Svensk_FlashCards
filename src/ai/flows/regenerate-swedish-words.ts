'use server';
/**
 * @fileOverview Regenerates a new set of 5 Swedish words if the user is not satisfied with the initial set.
 *
 * - regenerateSwedishWords - A function that handles the regeneration of Swedish words.
 * - RegenerateSwedishWordsInput - The input type for the regenerateSwedishWords function.
 * - RegenerateSwedishWordsOutput - The return type for the regenerateSwedishWords function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RegenerateSwedishWordsInputSchema = z.object({
  reason: z.string().optional().describe('The reason for regenerating the words.'),
});
export type RegenerateSwedishWordsInput = z.infer<typeof RegenerateSwedishWordsInputSchema>;

const RegenerateSwedishWordsOutputSchema = z.object({
  words: z.array(
    z.object({
      swedish: z.string().describe('The Swedish word.'),
      english: z.string().describe('The English translation of the Swedish word.'),
    })
  ).describe('A list of 5 Swedish words with their English translations.'),
});
export type RegenerateSwedishWordsOutput = z.infer<typeof RegenerateSwedishWordsOutputSchema>;

export async function regenerateSwedishWords(input: RegenerateSwedishWordsInput): Promise<RegenerateSwedishWordsOutput> {
  return regenerateSwedishWordsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'regenerateSwedishWordsPrompt',
  input: {schema: RegenerateSwedishWordsInputSchema},
  output: {schema: RegenerateSwedishWordsOutputSchema},
  prompt: `You are a Swedish language tutor. Generate a list of 5 common Swedish words with their English translations. Exclude rare or difficult-to-understand words. Also, avoid nouns without definite articles to avoid confusing the user. The user has requested a new set of words because: {{{reason}}}. Return the words in JSON format.

Example:
{
  "words": [
    {
      "swedish": "en bok",
      "english": "a book"
    },
    {
      "swedish": "att läsa",
      "english": "to read"
    },
   {
      "swedish": "blå",
      "english": "blue"
    },
    {
      "swedish": "huset",
      "english": "the house"
    },
    {
      "swedish": "springa",
      "english": "to run"
    }
  ]
}
`,
});

const regenerateSwedishWordsFlow = ai.defineFlow(
  {
    name: 'regenerateSwedishWordsFlow',
    inputSchema: RegenerateSwedishWordsInputSchema,
    outputSchema: RegenerateSwedishWordsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
