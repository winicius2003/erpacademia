// workout-recommendation.ts
'use server';
/**
 * @fileOverview Provides personalized workout recommendations to students based on their workout history and goals.
 *
 * - getWorkoutRecommendation - A function that generates workout recommendations.
 * - WorkoutRecommendationInput - The input type for the getWorkoutRecommendation function.
 * - WorkoutRecommendationOutput - The return type for the getWorkoutRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WorkoutRecommendationInputSchema = z.object({
  workoutHistory: z
    .string()
    .describe(
      'A summary of the student\'s workout history, including exercises, reps, sets, and dates.'
    ),
  fitnessGoals: z
    .string()
    .describe('The student\'s fitness goals, e.g., weight loss, muscle gain, improved endurance.'),
  studentPreferences: z
    .string()
    .optional()
    .describe('Optional student preferences, such as preferred workout types or equipment.'),
});
export type WorkoutRecommendationInput = z.infer<typeof WorkoutRecommendationInputSchema>;

const WorkoutRecommendationOutputSchema = z.object({
  workoutRecommendation: z
    .string()
    .describe('A personalized workout recommendation including exercises, sets, reps, and rest periods.'),
  reasoning: z
    .string()
    .optional()
    .describe('An explanation of why the workout was recommended based on history and goals.'),
});
export type WorkoutRecommendationOutput = z.infer<typeof WorkoutRecommendationOutputSchema>;

export async function getWorkoutRecommendation(input: WorkoutRecommendationInput): Promise<WorkoutRecommendationOutput> {
  return workoutRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'workoutRecommendationPrompt',
  input: {schema: WorkoutRecommendationInputSchema},
  output: {schema: WorkoutRecommendationOutputSchema},
  prompt: `You are a personal trainer who provides workout recommendations based on a student's workout history and fitness goals.

  Workout History: {{{workoutHistory}}}
  Fitness Goals: {{{fitnessGoals}}}
  Student Preferences: {{{studentPreferences}}}

  Provide a detailed workout recommendation including exercises, sets, reps, and rest periods. Explain your reasoning for the recommendation.
  Ensure that the recommendation aligns with the workout history and goals, and consider any student preferences.
  Format the workout recommendation in a clear and easy-to-follow manner.
  Include reasoning to provide context for your recommendation.
  `,
});

const workoutRecommendationFlow = ai.defineFlow(
  {
    name: 'workoutRecommendationFlow',
    inputSchema: WorkoutRecommendationInputSchema,
    outputSchema: WorkoutRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
