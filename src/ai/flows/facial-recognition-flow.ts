
'use server';
/**
 * @fileOverview An AI agent for facial recognition verification.
 *
 * - performFacialRecognition - A function that compares two faces to verify identity.
 * - FacialRecognitionInput - The input type for the function.
 * - FacialRecognitionOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FacialRecognitionInputSchema = z.object({
  registeredPhotoDataUri: z
    .string()
    .describe(
      "The student's registered reference photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  livePhotoDataUri: z
    .string()
    .describe(
      "The live photo captured by the webcam for verification, as a data URI."
    ),
  studentName: z.string().describe("The name of the student being verified."),
});
export type FacialRecognitionInput = z.infer<typeof FacialRecognitionInputSchema>;

const FacialRecognitionOutputSchema = z.object({
  isMatch: z.boolean().describe('Whether the person in the live photo is the same as in the registered photo.'),
  reasoning: z.string().describe('A brief explanation for the decision, suitable for displaying to the receptionist.'),
});
export type FacialRecognitionOutput = z.infer<typeof FacialRecognitionOutputSchema>;

export async function performFacialRecognition(input: FacialRecognitionInput): Promise<FacialRecognitionOutput> {
  return facialRecognitionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'facialRecognitionPrompt',
  input: { schema: FacialRecognitionInputSchema },
  output: { schema: FacialRecognitionOutputSchema },
  prompt: `You are a highly accurate AI security system for a gym, specializing in facial verification. Your task is to compare two images and determine if they are of the same person.

  - The first image is the official, registered photo of the student, named {{{studentName}}}.
  - The second image is a live photo just taken by a webcam at the gym's entrance.

  Your analysis must be strict. If there is any significant doubt, you must deny access.

  Based on your comparison, set the 'isMatch' field to true if you are highly confident it's the same person, and false otherwise.
  Provide a brief, clear reasoning for your decision in the 'reasoning' field.
  
  - If it's a match, the reasoning should be a welcoming confirmation. Example: "Confirmação positiva. Acesso liberado para {{{studentName}}}."
  - If it's not a match, explain briefly why, focusing on clear differences. Example: "Verificação falhou. As características faciais, como formato do nariz e linha da mandíbula, não correspondem à foto de cadastro."

  Registered Photo: {{media url=registeredPhotoDataUri}}
  Live Photo: {{media url=livePhotoDataUri}}`,
});

const facialRecognitionFlow = ai.defineFlow(
  {
    name: 'facialRecognitionFlow',
    inputSchema: FacialRecognitionInputSchema,
    outputSchema: FacialRecognitionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
