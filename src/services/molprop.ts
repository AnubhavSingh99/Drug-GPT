'use server';
/**
 * @fileOverview Genkit service for Molprop analysis.
 *
 * This file defines functions for interacting with a Molprop service
 * to predict molecular properties. It assumes an external API endpoint
 * provides these predictions.
 */

import { z } from 'zod';

// Define a flexible schema for Molprop results. Adjust properties as needed.
const MolpropResultSchema = z.object({
  logP: z.number().optional().describe('Predicted LogP (lipophilicity).'),
  solubility: z.number().optional().describe('Predicted aqueous solubility (e.g., logS).'),
  toxicityScore: z.number().optional().describe('Predicted toxicity score (0-1).'),
  // Add other relevant properties predicted by your Molprop model
}).describe('Predicted molecular properties from Molprop.');

export type MolpropResult = z.infer<typeof MolpropResultSchema>;

// This internal function simulates calling an external Molprop API.
// Replace the URL and logic with your actual Molprop API implementation.
async function fetchMolpropPrediction(smiles: string): Promise<MolpropResult | null> {
  // IMPORTANT: Replace this with the actual URL of your deployed Molprop API
  const MOLPROP_API_URL = process.env.MOLPROP_API_URL || 'http://localhost:5001/predict'; // Example URL

  console.log(`Calling Molprop API at ${MOLPROP_API_URL} for SMILES: ${smiles}`);

  if (!MOLPROP_API_URL || MOLPROP_API_URL === 'http://localhost:5001/predict') {
     console.warn("MOLPROP_API_URL environment variable not set or using default. Using mock Molprop data.");
      // Return mock data if API URL is not configured
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      return {
        logP: Math.random() * 5, // Example random data
        solubility: Math.random() * -5, // Example random data
        toxicityScore: Math.random(), // Example random data
      };
  }


  try {
    const response = await fetch(MOLPROP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ smiles }),
    });

    if (!response.ok) {
      console.error(`Molprop API error! Status: ${response.status} ${response.statusText}`);
      // Optionally log response body for more details
      // const errorBody = await response.text();
      // console.error("Molprop API error body:", errorBody);
      return null;
    }

    const data = await response.json();

    // Validate the received data against the schema
    const validation = MolpropResultSchema.safeParse(data);
    if (!validation.success) {
        console.error("Molprop API response validation failed:", validation.error.errors);
        return null;
    }

    console.log("Molprop API returned:", validation.data);
    return validation.data;

  } catch (error) {
    console.error('Error calling Molprop API:', error);
    return null;
  }
}


/**
 * Asynchronously retrieves predicted molecular properties for a molecule based on its SMILES string.
 * This function calls an external Molprop API endpoint.
 *
 * @param smiles The SMILES string of the molecule to analyze.
 * @returns A promise that resolves to an object containing predicted properties, or null on error or if no prediction is available.
 */
export async function getMolpropAnalysis(smiles: string): Promise<MolpropResult | null> {
  console.log(`Executing Molprop analysis for SMILES: ${smiles}`);
  try {
    const result = await fetchMolpropPrediction(smiles);
    if (!result) {
      console.warn(`Molprop prediction not found or failed for SMILES: ${smiles}`);
      return null;
    }
    return result;
  } catch (error) {
    console.error(`Error during Molprop analysis for SMILES ${smiles}:`, error);
    return null;
  }
}