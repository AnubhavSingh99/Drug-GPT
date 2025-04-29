
import axios from 'axios';
import { z } from 'zod';

/**
 * Represents a drug entry from ChEMBL.
 */
export interface Drug {
  /**
   * The ChEMBL ID.
   */
  chemblId: string;
  /**
   * The compound name.
   */
  name: string;
   /**
   * The maximum phase a drug has reached in clinical trials.
   */
  maxPhase?: number;
  /**
   * The molecular weight.
   */
  molecularWeight?: number;
  /**
   * The molecular formula.
   */
  molecularFormula?: string;

  /**
   * Drug description, which could contain indications.
   */
  description?: string;
}

// Zod schema for Drug interface
export const DrugSchema = z.object({
    chemblId: z.string().describe('The ChEMBL ID.'),
    name: z.string().describe('The compound name.'),
    maxPhase: z.number().nullable().optional().describe('The maximum phase a drug has reached in clinical trials (0-4).'), // Allow null
    molecularWeight: z.number().optional().describe('The molecular weight.'),
    molecularFormula: z.string().optional().describe('The molecular formula.'),
    description: z.string().optional().describe('Drug description, which could contain indications or therapeutic flags.'), // Updated description
});


const CHEMBL_API_BASE = 'https://www.ebi.ac.uk/chembl/api/data';

/**
 * Asynchronously retrieves drug information from ChEMBL based on the drug name.
 *
 * @param drugName The name of the drug to search for (case-insensitive).
 * @returns A promise that resolves to a Drug object containing information about the drug, or null if not found.
 */
export async function getDrugByName(drugName: string): Promise<Drug | null> {
    console.log(`Searching ChEMBL for drug: ${drugName}`);

    try {
        // Search for molecule by preferred name or synonym
        const response = await axios.get(`${CHEMBL_API_BASE}/molecule.json`, {
             params: {
                // Use 'molecule_synonyms__molecule_synonym__iexact' for case-insensitive name matching
                // or 'pref_name__iexact' for preferred name matching
                // Let's try preferred name first, then maybe synonyms if needed
                pref_name__iexact: drugName,
                // Request specific fields to minimize response size
                fields: 'molecule_chembl_id,pref_name,max_phase,molecule_properties,molecule_type'
             }
        });


        if (response.status !== 200) {
            console.error(`ChEMBL API returned status: ${response.status} for drug: ${drugName}`);
            return null;
        }

        const data = response.data;

        if (!data || !data.molecules || data.molecules.length === 0) {
            console.warn(`Drug "${drugName}" not found in ChEMBL.`);
            return null;
        }

        // Find the best match (e.g., exact match if multiple results)
        // For simplicity, we take the first one for now. More robust matching might be needed.
        const molecule = data.molecules[0];

        // Extract properties safely
        const props = molecule.molecule_properties;
        const mw = props?.full_mwt ? parseFloat(props.full_mwt) : undefined;
        const formula = props?.full_molformula;

        // Try to fetch additional details like description/indication from the 'drug_indication' endpoint if needed
        // This requires a separate API call using the chembl_id. For simplicity, we'll skip this for now
        // and rely on molecule_type or other basic info if available.
        let descriptionText: string | undefined = molecule.molecule_type ? `Type: ${molecule.molecule_type}` : undefined;


        const drug: Drug = {
            chemblId: molecule.molecule_chembl_id,
            name: molecule.pref_name || drugName, // Use preferred name
            maxPhase: molecule.max_phase !== null ? Number(molecule.max_phase) : undefined, // Ensure max_phase is number or undefined
            molecularWeight: mw && !isNaN(mw) ? mw : undefined,
            molecularFormula: formula,
            description: descriptionText,
        };

        console.log(`Found drug in ChEMBL: ${drug.name} (ID: ${drug.chemblId})`);
        // Validate with Zod before returning
        try {
             DrugSchema.parse(drug);
             return drug;
        } catch (validationError) {
             console.error(`ChEMBL data validation failed for ${drugName}:`, validationError);
             console.log("Raw ChEMBL data:", molecule);
             console.log("Parsed Drug object:", drug);
             return null; // Return null if validation fails
        }


    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response?.status === 400) {
             console.warn(`ChEMBL API returned 400 Bad Request for drug "${drugName}". This might indicate an issue with the search query or the name format.`);
        } else if (axios.isAxiosError(error)) {
           console.error(`Axios error searching ChEMBL for drug "${drugName}":`, error.message, error.response?.status);
        } else {
             console.error(`Unexpected error searching ChEMBL for drug "${drugName}":`, error);
        }
        return null;
    }
}

