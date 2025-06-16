// src/ai/flows/suggest-ngos.ts
'use server';
/**
 * @fileOverview Suggests relevant nearby NGOs based on the description of available unused medicines.
 *
 * - suggestNgos - A function that suggests NGOs based on medicine description and location.
 * - SuggestNgosInput - The input type for the suggestNgos function.
 * - SuggestNgosOutput - The return type for the suggestNgos function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestNgosInputSchema = z.object({
  medicineDescription: z
    .string()
    .describe('The description of the unused medicine available for donation.'),
  donorLocation: z
    .string()
    .describe('The location of the donor, which will be used to find nearby NGOs.'),
});
export type SuggestNgosInput = z.infer<typeof SuggestNgosInputSchema>;

const SuggestNgosOutputSchema = z.object({
  suggestedNgos: z
    .array(z.string())
    .describe('A list of suggested NGOs that might be interested in the medicine donation.'),
});
export type SuggestNgosOutput = z.infer<typeof SuggestNgosOutputSchema>;

export async function suggestNgos(input: SuggestNgosInput): Promise<SuggestNgosOutput> {
  return suggestNgosFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNgosPrompt',
  input: {schema: SuggestNgosInputSchema},
  output: {schema: SuggestNgosOutputSchema},
  prompt: `You are a helpful assistant that suggests relevant NGOs based on a description of unused medicine and the donor's location.

  Given the following medicine description and donor location, suggest a list of NGOs that might be interested in receiving the donation. Consider the location of the NGOs relative to the donor's location.

  Medicine Description: {{{medicineDescription}}}
  Donor Location: {{{donorLocation}}}

  Suggested NGOs:`,
});

const suggestNgosFlow = ai.defineFlow(
  {
    name: 'suggestNgosFlow',
    inputSchema: SuggestNgosInputSchema,
    outputSchema: SuggestNgosOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
