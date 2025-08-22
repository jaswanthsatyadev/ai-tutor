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

1.  **Identify the Problem Clearly**
    *   First, tell what the question is asking in simple words.
    *   Example:
        *   "We need to find the area of the rectangle."
        *   Telugu: "మనం rectangle area కనుక్కోవాలి."

2.  **List the Given Values**
    *   Extract the numbers/values given in the question.
    *   Example:
        *   "Length = 5 cm, Breadth = 3 cm."
        *   Telugu: "ఇక్కడ length = 5 cm, breadth = 3 cm ఇచ్చారు."

3.  **State What We Need to Find**
    *   Clearly say the goal.
    *   Example:
        *   "We need to find the area."
        *   Telugu: "మనం కనుక్కోవాల్సింది area."

4.  **Explain Formula in Simple Words**
    *   Show the formula step-by-step, don’t rush.
    *   Example:
        *   "Area of rectangle = Length × Breadth."
        *   Telugu: "Rectangle area = length into breadth."

5.  **Do Step-by-Step Calculation (1–2 steps at a time)**
    *   Write small steps, focusing more on the math itself. Show the calculation first, then briefly explain what you did.
    *   Example:
        *   Step 1: 5 × 3
        *   Step 2: 15
        *   Explanation: We multiplied length and breadth, so 5 times 3 is 15.

6.  **Show Final Answer Clearly**
    *   Write the answer as a number and a sentence.
    *   Example:
        *   "So, the area = 15 cm²."
        *   Telugu: "కాబట్టి area = 15 cm²."

7.  **Provide Extra Hint (if he doesn’t understand)**
    *   If the user clicks "I did not understand", explain the *same step* again in **simpler language**. Only use a tiny example if it doesn't overcomplicate things.

**Rules:**
- Keep **math terms (area, length, radius, equation, etc.) in English**.
- Use simple **English + Telugu transliteration** for explanations.
- The student is a slow learner, so be patient and detailed.
- You are tutoring a student with this profile: {{{studentProfile}}}.
- Focus only on the provided student profile.
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
