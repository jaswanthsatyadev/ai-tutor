'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a concise, math-only solution
 * to a given problem.
 *
 * - generateMathSolution - The main function that triggers the math solution generation flow.
 * - GenerateMathSolutionInput - The input type for the generateMathSolution function.
 * - GenerateMathSolutionOutput - The return type for the generateMathSolution function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMathSolutionInputSchema = z.object({
  problemStatement: z.string().describe('The mathematical problem statement or instructions to be solved. This could be text like "solve 19th question from this photo".'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "An optional photo of a problem, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. The photo may contain handwritten notes."
    ),
   studentProfile: z
    .string()
    .describe(
      'The student profile, including name, class, focus area, and learning speed. For example: Deepak, 9th class, IIT Foundation track, focus: Mathematics first, then Science. Slow learner.'
    ),
});
export type GenerateMathSolutionInput = z.infer<typeof GenerateMathSolutionInputSchema>;

const GenerateMathSolutionOutputSchema = z.object({
  solution: z
    .string()
    .describe('The complete, step-by-step mathematical solution with minimal to no explanation.'),
});
export type GenerateMathSolutionOutput = z.infer<typeof GenerateMathSolutionOutputSchema>;

export async function generateMathSolution(input: GenerateMathSolutionInput): Promise<GenerateMathSolutionOutput> {
  return generateMathSolutionFlow(input);
}

const generateMathSolutionPrompt = ai.definePrompt({
  name: 'generateMathSolutionPrompt',
  input: {schema: GenerateMathSolutionInputSchema},
  output: {schema: GenerateMathSolutionOutputSchema},
  prompt: `You are an expert IIT Foundation math solver. Your task is to provide a complete, step-by-step mathematical solution to the given problem.

**Rules:**
1.  **Focus on Math:** Provide only the mathematical steps for the solution.
2.  **Minimal Explanations:** Do NOT include detailed explanations, prose, or introductions. A one or two-word hint for a step is acceptable if absolutely necessary (e.g., "Formula:" or "Substitute:").
3.  **Use Standard Formulas:** Strictly use standard formulas like (a+b)², (a+b)³, etc., commonly taught in the 9th class IIT Foundation curriculum.
4.  **Complete Solution:** Provide the entire solution from the first step to the final answer.
5.  **Clarity:** Ensure the mathematical notation is clear and easy to follow.

---
{{#if photoDataUri}}
Analyze the following image. The image may contain handwritten questions or notes.
Photo: {{media url=photoDataUri}}
{{/if}}

Problem: {{{problemStatement}}}
Student Profile: {{{studentProfile}}}

Provide the complete mathematical solution now.
`,
});

const generateMathSolutionFlow = ai.defineFlow(
  {
    name: 'generateMathSolutionFlow',
    inputSchema: GenerateMathSolutionInputSchema,
    outputSchema: GenerateMathSolutionOutputSchema,
  },
  async input => {
    const {output} = await generateMathSolutionPrompt(input);
    return output!;
  }
);
