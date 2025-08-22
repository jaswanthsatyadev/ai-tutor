'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating dynamic step-by-step explanations
 * tailored to Deepak's learning profile (9th class, Math focus), providing explanations in both English and Telugu.
 *
 * - generateExplanations - The main function that triggers the explanation generation flow.
 * - GenerateExplanationsInput - The input type for the generateExplanations function.
 * - GenerateExplanationsOutput - The return type for the generateExplanations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExplanationsInputSchema = z.object({
  problemStatement: z.string().describe('The mathematical problem statement to be explained.'),
  currentStep: z.string().describe('The current step in solving the problem.'),
  studentProfile: z
    .string()
    .describe(
      'The student profile, including class, focus area, and learning speed. For example: 9th class, IIT Foundation track, focus: Mathematics first, then Science. Slow learner.'
    ),
  explanationPreference: z
    .string()
    .describe(
      'Any specific preferences for the explanation, such as Indian mathematics explanation style, step-by-step format, etc.'
    ),
});
export type GenerateExplanationsInput = z.infer<typeof GenerateExplanationsInputSchema>;

const GenerateExplanationsOutputSchema = z.object({
  explanation: z
    .string()
    .describe('The step-by-step explanation in English and Telugu, tailored to the student profile.'),
});
export type GenerateExplanationsOutput = z.infer<typeof GenerateExplanationsOutputSchema>;

export async function generateExplanations(input: GenerateExplanationsInput): Promise<GenerateExplanationsOutput> {
  return generateExplanationsFlow(input);
}

const generateExplanationsPrompt = ai.definePrompt({
  name: 'generateExplanationsPrompt',
  input: {schema: GenerateExplanationsInputSchema},
  output: {schema: GenerateExplanationsOutputSchema},
  prompt: `You are an expert IIT Foundation tutor specializing in teaching 9th class Mathematics and Science for Indian students.

You are currently tutoring Deepak (9th class, IIT Foundation track, focus: Mathematics first, then Science).
Deepak is a slow learner and needs every step explained in detail.
Always explain in **step-by-step format**, revealing only **1–2 steps at a time**.
After each step, clearly explain what was done and why, in simple English, plus a short explanation in **Telugu + basic English keywords** (so he understands but also learns terms).

For every math problem:
1.  Clearly explain the **problem statement in your own words**.
2.  Identify **what is given** in the question.
3.  Identify **what we need to find**.
4.  Then, start solving step by step (1–2 steps per stage).
5.  At the end of each stage, stop and wait for confirmation (Deepak may press “Next” to continue).
6.  If Deepak presses “I did not understand,” re-explain the same step more slowly using simpler examples from Indian teaching style, daily life metaphors, and common objects.
7.  Always prefer **Indian mathematics explanation style** (the way teachers in India explain concepts).
8.  Keep language clear, patient, and encouraging.

Rules:
- Do NOT rush.
- Do NOT skip steps, even small ones (like 1+1=2).
- Use both **English + Telugu transliteration** for clarity. Example: "So, 2 × 3 = 6 (రెండు into మూడు అంటే ఆరు)."
- Keep explanations simple, structured, and highly detailed.
- Focus only on **Deepak’s profile** for now (no need for other student profiles).

Problem Statement: {{{problemStatement}}}
Current Step: {{{currentStep}}}

Explanation Preference: {{{explanationPreference}}}

Student Profile: {{{studentProfile}}}

Your goal: Make Deepak feel confident that he fully understands each step before moving forward. Provide the explanation now.
`,
});

const generateExplanationsFlow = ai.defineFlow(
  {
    name: 'generateExplanationsFlow',
    inputSchema: GenerateExplanationsInputSchema,
    outputSchema: GenerateExplanationsOutputSchema,
  },
  async input => {
    const {output} = await generateExplanationsPrompt(input);
    return output!;
  }
);
