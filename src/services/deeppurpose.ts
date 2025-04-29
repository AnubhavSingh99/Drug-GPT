'use server';

/**
 * @fileOverview Genkit service for DeepPurpose analysis.
 *
 * This file defines functions and types for interacting with DeepPurpose,
 * a tool for predicting the potential purpose or mechanism of action of a molecule.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'zod';

// Define the schema internally but DO NOT export it from the 'use server' file.
const DeepPurposeResultSchemaInternal = z.object({
  predictedPurpose: z.string().describe('The predicted purpose or mechanism of action analysis.'),
  confidence: z.number().optional().describe('Confidence score (0-1) for the prediction, if available.'),
});

// Define the type internally based on the internal schema. DO NOT export it.
type DeepPurposeResultInternal = z.infer<typeof DeepPurposeResultSchemaInternal>;


// This prompt remains internal to this file
const deeppurposePrompt = ai.definePrompt({
  name: 'deeppurposePrompt',
  input: {
    schema: z.object({
      smiles: z.string().describe('The SMILES string of the molecule to analyze.'),
    }),
  },
  output: {
    // Use the internal schema definition here
    schema: DeepPurposeResultSchemaInternal,
  },
  prompt: `You are an expert AI model specializing in predicting the purpose or mechanism of action of molecules.
Given the SMILES string of a molecule, predict its potential purpose or mechanism of action.
Return a confidence score (0-1) for the prediction, if available.

SMILES: {{{smiles}}}`,
});

/**
 * Asynchronously retrieves a predicted purpose analysis for a molecule based on its SMILES string.
 * The return type is defined structurally here to avoid exporting the Zod schema or inferred type.
 * The calling flow will be responsible for validating this structure against its own schema definition.
 *
 * @param smiles The SMILES string of the molecule to analyze.
 * @returns A promise that resolves to an object containing predictedPurpose and optional confidence, or null on error.
 */
export async function getDeepPurposeAnalysis(smiles: string): Promise<{ predictedPurpose: string; confidence?: number } | null> {
  console.log(`Executing DeepPurpose analysis for SMILES: ${smiles}`);
  try {
    const result = await deeppurposePrompt({smiles: smiles});
    if (!result.output) {
      console.warn(`DeepPurpose prediction not found for SMILES: ${smiles}`);
      return null;
    }
    // Validate the output structure before returning, although formal validation happens in the flow
    if (typeof result.output.predictedPurpose !== 'string') {
        console.error(`DeepPurpose prompt for SMILES ${smiles} returned invalid structure. Missing predictedPurpose.`);
        return null;
    }
     // The output type matches DeepPurposeResultInternal structurally.
    console.log(`DeepPurpose prediction found for SMILES: ${smiles}:`, result.output);
    return result.output;
  } catch (error) {
    console.error(`Error during DeepPurpose prediction for SMILES ${smiles}:`, error);
    return null;
  }
}
