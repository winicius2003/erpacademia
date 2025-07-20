
'use server';
/**
 * @fileOverview An AI agent for searching for a face within a database of registered faces.
 *
 * - searchFaceInDatabase - A function that compares a live photo against multiple registered photos to find a match.
 * - FacialSearchInput - The input type for the function.
 * - FacialSearchOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RegisteredFaceSchema = z.object({
  studentId: z.string().describe("The unique identifier for the student."),
  photoDataUri: z
    .string()
    .describe(
      "The student's registered reference photo, as a data URI."
    ),
});

const FacialSearchInputSchema = z.object({
  registeredFaces: z.array(RegisteredFaceSchema).describe("An array of all registered student faces to search against."),
  livePhotoDataUri: z
    .string()
    .describe(
      "The live photo captured by the webcam for verification, as a data URI."
    ),
});
export type FacialSearchInput = z.infer<typeof FacialSearchInputSchema>;

const FacialSearchOutputSchema = z.object({
  matchFound: z.boolean().describe('Whether a confident match was found in the database.'),
  studentId: z.string().nullable().describe('The ID of the matched student, or null if no match was found.'),
  reasoning: z.string().describe('A brief explanation for the decision.'),
});
export type FacialSearchOutput = z.infer<typeof FacialSearchOutputSchema>;

export async function searchFaceInDatabase(input: FacialSearchInput): Promise<FacialSearchOutput> {
  return facialSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'facialSearchPrompt',
  input: { schema: FacialSearchInputSchema },
  output: { schema: FacialSearchOutputSchema },
  prompt: `You are a highly advanced AI security system for a gym, specializing in real-time facial recognition. Your task is to compare a single live photo against a database of registered student photos and identify if there is a match.

You will be given:
1.  A "live photo" captured from a webcam.
2.  An array of "registered faces", each with a unique studentId and their corresponding photo.

Your analysis must be very strict. You are looking for a high-confidence match.

-   Iterate through each registered face in the database.
-   Compare it against the live photo.
-   If you find a strong match, set 'matchFound' to true and return the 'studentId' of that registered face. The reasoning should be a simple confirmation.
-   If, after checking all registered faces, you do not find a high-confidence match, set 'matchFound' to false and 'studentId' to null. The reasoning should state that no match was found.

Live Photo to identify:
{{media url=livePhotoDataUri}}

Database of Registered Faces to search within:
{{#each registeredFaces}}
---
Student ID: {{{this.studentId}}}
Photo: {{media url=this.photoDataUri}}
---
{{/each}}
`,
});

const facialSearchFlow = ai.defineFlow(
  {
    name: 'facialSearchFlow',
    inputSchema: FacialSearchInputSchema,
    outputSchema: FacialSearchOutputSchema,
  },
  async (input) => {
    // If there are no faces to search against, return immediately.
    if (input.registeredFaces.length === 0) {
      return {
        matchFound: false,
        studentId: null,
        reasoning: "Nenhuma face cadastrada no sistema para comparação."
      };
    }
    
    const { output } = await prompt(input);
    return output!;
  }
);
