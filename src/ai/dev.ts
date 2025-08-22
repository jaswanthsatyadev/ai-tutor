'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-explanations.ts';
import '@/ai/flows/generate-math-solution.ts';
