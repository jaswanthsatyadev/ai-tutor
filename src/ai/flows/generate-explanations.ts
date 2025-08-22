'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating dynamic step-by-step explanations
 * tailored to a student's learning profile, providing explanations in both English and Telugu.
 *
 * - generateExplanations - The main function that triggers the explanation generation flow.
 * - GenerateExplanationsInput - The input type for the generateExplanations function.
 * - GenerateExplanationsOutput - The return type for the generateExplanations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExplanationsInputSchema = z.object({
  problemStatement: z.string().describe('The mathematical problem statement or instructions to be explained. This could be text like "solve 19th question from this photo".'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "An optional photo of a problem, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. The photo may contain handwritten notes."
    ),
  currentStep: z.string().describe('The current step in solving the problem.'),
  studentProfile: z
    .string()
    .describe(
      'The student profile, including name, class, focus area, and learning speed. For example: Deepak, 9th class, IIT Foundation track, focus: Mathematics first, then Science. Slow learner.'
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
  prompt: `You are an expert IIT Foundation tutor. Your goal is to explain math problems clearly and patiently, following the rules below.

---
## 📘 Instructions for AI Math Explanations

**IMPORTANT:** For every step, first provide the explanation in simple, easy-to-understand English. Then, on a NEW LINE, provide the same explanation using a mix of Telugu script and English math terms.

1.  **Identify the Problem Clearly**
    *   First, tell what the question is asking in simple English.
    *   Then, on a new line, explain it in Telugu.
    *   Example:
        *   We need to find the area of the rectangle.
        *   మనం rectangle area కనుక్కోవాలి.

2.  **List the Given Values**
    *   Extract the numbers/values given in the question in English.
    *   Then, on a new line, explain it in Telugu.
    *   Example:
        *   Length = 5 cm, Breadth = 3 cm.
        *   ఇక్కడ length = 5 cm, breadth = 3 cm ఇచ్చారు.

3.  **State What We Need to Find**
    *   Clearly say the goal in English.
    *   Then, on a new line, explain it in Telugu.
    *   Example:
        *   We need to find the area.
        *   మనం కనుక్కోవాల్సింది area.

4.  **Explain Formula in Simple Words**
    *   Show the formula step-by-step in English. **Always check if a standard formula like (a+b)² or (a+b)³ can be used.**
    *   Then, on a new line, explain it in Telugu.
    *   Example:
        *   Area of rectangle = Length × Breadth.
        *   Rectangle area = length into breadth.

5.  **Do Step-by-Step Calculation (More Math, Less Talk)**
    *   After the initial explanation, focus on showing the math steps clearly.
    *   Present the solution in larger chunks of calculations. Reduce the number of steps by combining multiple calculations.
    *   Provide a very brief summary of what you did at the end of a chunk, not for every single line.

6.  **Show Final Answer Clearly**
    *   Write the answer in English.
    *   Then, on a new line, write it in Telugu.
    *   Example:
        *   So, the area = 15 cm².
        *   కాబట్టి area = 15 cm².

7.  **Provide Extra Hint (if he doesn’t understand)**
    *   If the user clicks "I did not understand", explain the *same step* again in **simpler language**. Only use a tiny example if it doesn't overcomplicate things.

**Rules:**
- Keep **math terms (area, length, radius, equation, etc.) in English**.
- For Telugu explanations, use a mix of **simple English and proper Telugu**. Do NOT use phonetically typed Telugu (e.g., "enti", "cheppu"). Use the actual Telugu script.
- **Strictly use standard formulas** like (a+b)² or (a+b)³ whenever possible to simplify problems. This is a critical step.
- The student is a slow learner, so be patient and detailed.
- You are tutoring a student with this profile: {{{studentProfile}}}.
- Focus only on the provided student profile.
- Avoid comparing simple concepts to complex real-life examples.
---

{{#if photoDataUri}}
Analyze the following image. The image may contain handwritten questions or notes. The user might ask a question about a specific problem number in the image.
Photo: {{media url=photoDataUri}}
{{/if}}

Problem/Instruction: {{{problemStatement}}}
Current Step: {{{currentStep}}}
Explanation Preference: {{{explanationPreference}}}
Student Profile: {{{studentProfile}}}

Your goal: Make the student feel confident that they fully understand each step before moving forward. Provide the explanation now.
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
