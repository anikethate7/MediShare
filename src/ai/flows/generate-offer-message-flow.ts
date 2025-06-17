// src/ai/flows/generate-offer-message-flow.ts
'use server';
/**
 * @fileOverview Generates a polite message draft for a donor offering help for a specific medicine request.
 *
 * - generateOfferMessage - A function that generates the message draft.
 * - GenerateOfferMessageInput - The input type for the function.
 * - GenerateOfferMessageOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateOfferMessageInputSchema = z.object({
  ngoName: z.string().describe("The name of the NGO the donor is contacting."),
  requestedMedicineName: z
    .string()
    .describe('The name of the medicine the NGO has requested.'),
});
export type GenerateOfferMessageInput = z.infer<
  typeof GenerateOfferMessageInputSchema
>;

const GenerateOfferMessageOutputSchema = z.object({
  messageDraft: z
    .string()
    .describe('The AI-generated polite message draft for the donor.'),
});
export type GenerateOfferMessageOutput = z.infer<
  typeof GenerateOfferMessageOutputSchema
>;

export async function generateOfferMessage(
  input: GenerateOfferMessageInput
): Promise<GenerateOfferMessageOutput> {
  return generateOfferMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateOfferMessagePrompt',
  input: {schema: GenerateOfferMessageInputSchema},
  output: {schema: GenerateOfferMessageOutputSchema},
  prompt: `You are an assistant helping a medicine donor draft a message to an NGO.
The donor wants to offer help for a specific medicine request.

NGO Name: {{{ngoName}}}
Requested Medicine: {{{requestedMedicineName}}}

Generate a polite and concise message draft from the donor to the NGO. The message should:
1. Greet the NGO.
2. Mention the specific medicine request ({{{requestedMedicineName}}}) they are responding to.
3. State their intention to offer help with this medicine.
4. Ask for the next steps or how to proceed with the donation.
5. End with a polite closing.

The donor will fill in the specifics of what medicine they have. This draft is just a starter.
Keep the message friendly and to the point.
Output only the message draft in the 'messageDraft' field.
Example:
"Dear {{NGO Name}},

I saw your request for {{Requested Medicine Name}} on MediShare. I would like to offer some [Donor to specify medicine details here, e.g., 'unused Paracetamol tablets'] that might help.

Could you please let me know the best way to proceed with the donation or if you have any specific requirements?

Thank you for your work!

Sincerely,
[Donor's Name]"
`,
});

const generateOfferMessageFlow = ai.defineFlow(
  {
    name: 'generateOfferMessageFlow',
    inputSchema: GenerateOfferMessageInputSchema,
    outputSchema: GenerateOfferMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
