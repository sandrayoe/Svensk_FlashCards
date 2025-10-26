'use server';

/**
 * @fileOverview Generates a set of 5 random but common and useful Swedish words daily.
 *
 * - generateDailySwedishWords - A function that generates a set of Swedish words.
 * - GenerateDailySwedishWordsInput - The input type for the generateDailySwedishWords function.  (void)
 * - GenerateDailySwedishWordsOutput - The return type for the generateDailySwedishWords function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDailySwedishWordsOutputSchema = z.object({
  words: z.array(
    z.object({
      swedish: z.string().describe('The Swedish word.'),
      english: z.string().describe('The English translation of the Swedish word.'),
    })
  ).length(5).describe('An array of 5 Swedish words with their English translations.'),
});

export type GenerateDailySwedishWordsOutput = z.infer<typeof GenerateDailySwedishWordsOutputSchema>;

export async function generateDailySwedishWords(): Promise<GenerateDailySwedishWordsOutput> {
  return generateDailySwedishWordsFlow({});
}

const prompt = ai.definePrompt({
  name: 'generateDailySwedishWordsPrompt',
  output: {schema: GenerateDailySwedishWordsOutputSchema},
  prompt: `You are a Swedish language expert. Generate a list of 5 common and useful Swedish words, suitable for language learners.

  The Swedish words should be common and useful, and avoid rare or difficult-to-understand vocabulary.
  Avoid including nouns without definite articles (en or ett).

  Return the Swedish words with their English translations in the following JSON format:
  {{json examples='{"words": [{"swedish": "ordet", "english": "the word"}, {"swedish": "att tala", "english": "to speak"}]}'}}`,
});

const generateDailySwedishWordsFlow = ai.defineFlow(
  {
    name: 'generateDailySwedishWordsFlow',
    outputSchema: GenerateDailySwedishWordsOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output!;
  }
);
