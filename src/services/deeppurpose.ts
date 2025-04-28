'use server';

/**
 * @fileOverview Genkit service for DeepPurpose analysis.
 *
 * This file defines functions and types for interacting with DeepPurpose,
 * a tool for predicting the potential purpose or mechanism of action of a molecule.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'zod';

/**
 * Represents the result from the DeepPurpose analysis.
 */
export interface DeepPurposeResult {
  /**
   * The predicted purpose or mechanism of action analysis.
   */
  predictedPurpose: string;
  /**
   * Confidence score (0-1) for the prediction, if available.
   */
  confidence?: number;
}

// Export Zod schema for DeepPurposeResult interface
export const DeepPurposeResultSchema = z.object({
  predictedPurpose: z.string().describe('The predicted purpose or mechanism of action analysis.'),
  confidence: z.number().optional().describe('Confidence score (0-1) for the prediction, if available.'),
});

const deeppurposePrompt = ai.definePrompt({
  name: 'deeppurposePrompt',
  input: {
    schema: z.object({
      smiles: z.string().describe('The SMILES string of the molecule to analyze.'),
    }),
  },
  output: {
    schema: z.object({
      predictedPurpose: z.string().describe('The predicted purpose or mechanism of action analysis.'),
      confidence: z.number().optional().describe('Confidence score (0-1) for the prediction, if available.'),
    }),
  },
  prompt: `You are an expert AI model specializing in predicting the purpose or mechanism of action of molecules.
Given the SMILES string of a molecule, predict its potential purpose or mechanism of action.
Return a confidence score (0-1) for the prediction, if available.

SMILES: {{{smiles}}}`,
});

/**
 * Asynchronously retrieves a predicted purpose analysis for a molecule based on its SMILES string.
 *
 * @param smiles The SMILES string of the molecule to analyze.
 * @returns A promise that resolves to a DeepPurposeResult object, or null if no prediction could be made or on error.
 */
export async function getDeepPurposeAnalysis(smiles: string): Promise<DeepPurposeResult | null> {
  try {
    const result = await deeppurposePrompt({smiles: smiles});
    if (!result.output) {
      console.warn(`DeepPurpose prediction not found for SMILES: ${smiles}`);
      return null;
    }
    console.log(`DeepPurpose prediction found for SMILES: ${smiles}`);
    return result.output;
  } catch (error) {
    console.error(`Error during DeepPurpose prediction for SMILES ${smiles}:`, error);
    return null;
  }
}
