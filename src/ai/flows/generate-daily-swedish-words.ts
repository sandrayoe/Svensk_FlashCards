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
  prompt: `You are a Swedish language expert. Generate a list of 5 Swedish words at B1-C1 CEFR level, suitable for intermediate to upper-intermediate learners.

  The words should be:
  - Intermediate level (B1-C1 CEFR) - not basic beginner vocabulary
  - Useful in everyday conversations, work, and professional contexts
  - Include varied word types: verbs, nouns with articles, adjectives, compound words, expressions
  - Avoid overly academic or highly specialized technical terms
  - PREFER indefinite forms (en/ett) for nouns to teach gender - this is more educational than definite forms

  Return the Swedish words with their English translations in the following JSON format:
  {{json examples='{"words": [{"swedish": "att utveckla", "english": "to develop"}, {"swedish": "utmaningen", "english": "the challenge"}]}'}}`,
});

const generateDailySwedishWordsFlow = ai.defineFlow(
  {
    name: 'generateDailySwedishWordsFlow',
    outputSchema: GenerateDailySwedishWordsOutputSchema,
  },
  async () => {
    try {
      const result = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt: `You are a Swedish language expert. Generate a list of 5 Swedish words at B1-C1 CEFR level, suitable for intermediate to upper-intermediate learners.

The words should be:
- Intermediate level (B1-C1 CEFR) - not basic beginner vocabulary
- Useful in everyday conversations, work, and professional contexts
- Include varied word types: verbs, nouns with articles, adjectives, compound words, expressions
- Avoid overly academic or highly specialized technical terms
- PREFER indefinite forms (en/ett) for nouns to teach gender - this is more educational than definite forms

Examples of appropriate level: "att utveckla" (to develop), "en utmaning" (a challenge), "ett projekt" (a project), "en möjlighet" (an opportunity), "betydelsefull" (significant)

Return the Swedish words with their English translations in the following JSON format:
{"words": [{"swedish": "att utveckla", "english": "to develop"}, {"swedish": "en utmaning", "english": "a challenge"}]}`,
        output: {
          schema: GenerateDailySwedishWordsOutputSchema,
        },
      });

      if (!result.output) {
        throw new Error('No output generated from AI');
      }

      return result.output;
    } catch (error) {
      console.error('Error generating Swedish words:', error);
      throw new Error('Failed to generate Swedish words');
    }
  }
);
