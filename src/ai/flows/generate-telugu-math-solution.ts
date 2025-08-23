'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a concise, math-only solution
 * to a given problem in Telugu.
 *
 * - generateTeluguMathSolution - The main function that triggers the math solution generation flow.
 * - GenerateTeluguMathSolutionInput - The input type for the generateTeluguMathSolution function.
 * - GenerateTeluguMathSolutionOutput - The return type for the generateTeluguMathSolution function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTeluguMathSolutionInputSchema = z.object({
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
  isRefetch: z.boolean().optional().describe('Whether the user is asking for a re-explanation of the same step because they did not understand.')
});
export type GenerateTeluguMathSolutionInput = z.infer<typeof GenerateTeluguMathSolutionInputSchema>;

const GenerateTeluguMathSolutionOutputSchema = z.object({
  solution: z
    .string()
    .describe('The concise, step-by-step mathematical solution with minimal to no explanation.'),
});
export type GenerateTeluguMathSolutionOutput = z.infer<typeof GenerateTeluguMathSolutionOutputSchema>;

export async function generateTeluguMathSolution(input: GenerateTeluguMathSolutionInput): Promise<GenerateTeluguMathSolutionOutput> {
  return generateTeluguMathSolutionFlow(input);
}

const generateTeluguMathSolutionPrompt = ai.definePrompt({
  name: 'generateTeluguMathSolutionPrompt',
  input: {schema: GenerateTeluguMathSolutionInputSchema},
  output: {schema: GenerateTeluguMathSolutionOutputSchema},
  prompt: `You are an expert IIT Foundation math solver. Your task is to provide a complete, extremely detailed, step-by-step mathematical solution to the given problem in a conversational mix of Telugu and English ("Tanglish").

{{#if isRefetch}}
The student did not understand the previous explanation. You must re-explain the entire problem in even simpler terms. Break down each step further. Use simpler analogies and metaphors. Be extremely patient and elaborate on the reasoning behind every single calculation and formula. Assume no prior knowledge. The language must still be a conversational mix of Telugu and English.
{{/if}}

**Rules:**
1.  **Maximum Clarity and Detail:** This is the most important rule. Provide extremely detailed, step-by-step explanations for each part of the solution. The explanation must be as detailed and elaborate as an English version would be. Explain the logic, reasoning, and thought process behind each step clearly and thoroughly. The user must be able to understand the "why" behind every calculation. Assume the student is a slow learner and requires very elaborate explanations.
2.  **Explain Formulas Explicitly:** **Crucially, for every formula you use, you must first state the formula clearly before applying it.** For example, "Using the formula for the area of a circle, Area = πr², we can now substitute the values." This is a strict requirement.
3.  **Proper Symbols:** Use proper mathematical symbols and notation (e.g., use '×' for multiplication, '÷' for division, not '*' or '/').
4.  **Use Standard Formulas:** Strictly use standard formulas like (a+b)², (a+b)³, etc., commonly taught in the 9th class IIT Foundation curriculum. This is a critical requirement.
5.  **Final Answer:** Clearly state the final answer at the end of the solution.
6.  **Step-by-Step:** Break down the solution into logical, well-explained steps.
7.  **Language and Style (Tanglish):**
    *   Use a conversational mix of **proper Telugu script** and common English words.
    *   **Strictly forbid using phonetically typed Telugu.** For instance, do not write "enti" or "cheppu". Instead, you MUST use the actual Telugu script, like "ఏంటి" or "చెప్పు". This is a strict rule.
    *   **Keep all mathematical and common technical terms in English script** (e.g., area, length, radius, equation, formula, calculate, find, given, solution, step, answer, etc.).
    *   The goal is to sound natural and be easy to understand for a student used to bilingual instruction. For example: "మనం rectangle area కనుక్కోవాలి." is correct.
8.  **Final Summary:** After providing the full detailed solution, add a final section titled "**Here is a quick summary of the steps:**". Under this heading, list all the mathematical steps from the solution concisely, without the detailed explanations, to give a quick overview of the calculation from start to finish.

---
{{#if photoDataUri}}
Analyze the following image. The image may contain handwritten questions or notes.
Photo: {{media url=photoDataUri}}
{{/if}}

Problem: {{{problemStatement}}}
Student Profile: {{{studentProfile}}}

Provide the complete, highly detailed solution in conversational Telugu now, following all the rules above.
`,
});

const generateTeluguMathSolutionFlow = ai.defineFlow(
  {
    name: 'generateTeluguMathSolutionFlow',
    inputSchema: GenerateTeluguMathSolutionInputSchema,
    outputSchema: GenerateTeluguMathSolutionOutputSchema,
  },
  async input => {
    const {output} = await generateTeluguMathSolutionPrompt(input);
    return output!;
  }
);
