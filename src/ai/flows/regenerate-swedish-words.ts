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

const WordSchema = z.object({
  swedish: z.string().describe('The Swedish word.'),
  english: z.string().describe('The English translation of the Swedish word.'),
});

const RegenerateSwedishWordsInputSchema = z.object({
  reason: z.string().optional().describe('The reason for regenerating the words.'),
  previousWords: z.array(WordSchema).optional().describe('The list of words that have been previously generated.'),
});
export type RegenerateSwedishWordsInput = z.infer<typeof RegenerateSwedishWordsInputSchema>;

const RegenerateSwedishWordsOutputSchema = z.object({
  words: z.array(WordSchema).length(5).describe('A list of 5 Swedish words with their English translations.'),
});
export type RegenerateSwedishWordsOutput = z.infer<typeof RegenerateSwedishWordsOutputSchema>;

export async function regenerateSwedishWords(input: RegenerateSwedishWordsInput): Promise<RegenerateSwedishWordsOutput> {
  return regenerateSwedishWordsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'regenerateSwedishWordsPrompt',
  input: {schema: RegenerateSwedishWordsInputSchema},
  output: {schema: RegenerateSwedishWordsOutputSchema},
  prompt: `You are a Swedish language tutor. Generate a list of 5 Swedish words at B1-C1 CEFR level, suitable for intermediate to upper-intermediate learners.

  The words should be:
  - Intermediate level (B1-C1 CEFR) - not basic beginner vocabulary
  - Useful in everyday conversations, work, and professional contexts
  - Include varied word types: verbs, nouns with articles, adjectives, compound words, expressions
  - Avoid overly academic or highly specialized technical terms
  - PREFER indefinite forms (en/ett) for nouns to teach gender - this is more educational than definite forms
  
  The user has requested a new set of words.
  {{#if reason}}
  Reason: {{{reason}}}. 
  {{/if}}
  
  {{#if previousWords}}
  Try to generate words that are different from the ones the user has already seen:
  {{#each previousWords}}
  - {{this.swedish}}
  {{/each}}
  {{/if}}

  Return the words in JSON format.

Example:
{
  "words": [
    {
      "swedish": "att utveckla",
      "english": "to develop"
    },
    {
      "swedish": "en utmaning",
      "english": "a challenge"
    },
   {
      "swedish": "ett projekt",
      "english": "a project"
    },
    {
      "swedish": "en möjlighet",
      "english": "an opportunity"
    },
    {
      "swedish": "betydelsefull",
      "english": "significant"
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
    try {
      let promptText = `You are a Swedish language tutor. Generate a list of 5 Swedish words at B1-C1 CEFR level, suitable for intermediate to upper-intermediate learners.

The words should be:
- Intermediate level (B1-C1 CEFR) - not basic beginner vocabulary
- Useful in everyday conversations, work, and professional contexts
- Include varied word types: verbs, nouns with articles, adjectives, compound words, expressions
- Avoid overly academic or highly specialized technical terms
- PREFER indefinite forms (en/ett) for nouns to teach gender - this is more educational than definite forms

The user has requested a new set of words.`;

      if (input.reason) {
        promptText += `\nReason: ${input.reason}.`;
      }

      if (input.previousWords && input.previousWords.length > 0) {
        promptText += `\n\nTry to generate words that are different from the ones the user has already seen:\n`;
        input.previousWords.forEach(word => {
          promptText += `- ${word.swedish}\n`;
        });
      }

      promptText += `\nReturn the words in JSON format like this example:
{
  "words": [
    {"swedish": "att utveckla", "english": "to develop"},
    {"swedish": "en utmaning", "english": "a challenge"},
    {"swedish": "ett projekt", "english": "a project"},
    {"swedish": "en möjlighet", "english": "an opportunity"},
    {"swedish": "betydelsefull", "english": "significant"}
  ]
}`;

      const result = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt: promptText,
        output: {
          schema: RegenerateSwedishWordsOutputSchema,
        },
      });

      if (!result.output) {
        throw new Error('No output generated from AI');
      }

      return result.output;
    } catch (error) {
      console.error('Error regenerating Swedish words:', error);
      throw new Error('Failed to regenerate Swedish words');
    }
  }
);
