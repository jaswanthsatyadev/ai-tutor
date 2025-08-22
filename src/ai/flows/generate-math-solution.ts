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
    .describe('The concise, step-by-step mathematical solution with minimal to no explanation.'),
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
1.  **Math Only:** Provide only the mathematical steps. Keep explanations to a bare minimum (e.g., "Given:", "Formula:", "Solution:").
2.  **Proper Symbols:** Use proper mathematical symbols and notation (e.g., use '×' for multiplication, '÷' for division, not '*' or '/').
3.  **Clarity is Key:** Ensure the entire solution, from the initial values to the final answer, is easy to follow.
4.  **Use Standard Formulas:** Strictly use standard formulas like (a+b)², (a+b)³, etc., commonly taught in the 9th class IIT Foundation curriculum. This is a critical requirement.
5.  **Final Answer:** Clearly state the final answer at the end of the solution.
6.  **Concise Steps:** Combine calculations into a maximum of 5 logical steps.

---
{{#if photoDataUri}}
Analyze the following image. The image may contain handwritten questions or notes.
Photo: {{media url=photoDataUri}}
{{/if}}

Problem: {{{problemStatement}}}
Student Profile: {{{studentProfile}}}

Provide the concise, math-only solution now.
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
