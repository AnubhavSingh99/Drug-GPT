
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
    maxPhase: z.number().optional().describe('The maximum phase a drug has reached in clinical trials.'),
    molecularWeight: z.number().optional().describe('The molecular weight.'),
    molecularFormula: z.string().optional().describe('The molecular formula.'),
    description: z.string().optional().describe('Drug description, which could contain indications.'),
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
        const response = await axios.get(`${CHEMBL_API_BASE}/molecule?q=${encodeURIComponent(drugName)}&format=json`);

        if (response.status !== 200) {
            console.error(`ChEMBL API returned status: ${response.status}`);
            return null;
        }

        const data = response.data;

        if (!data || !data.molecules || data.molecules.length === 0) {
            console.warn(`Drug "${drugName}" not found in ChEMBL.`);
            return null;
        }

        // Assuming the first result is the most relevant
        const molecule = data.molecules[0];

        const drug: Drug = {
            chemblId: molecule.chembl_id,
            name: molecule.pref_name || drugName, // Use preferred name if available
            maxPhase: molecule.max_phase,
            molecularWeight: molecule.mol_weight,
            molecularFormula: molecule.mol_formula,
            description: molecule.indication || molecule.therapeutic_flag ? `${molecule.indication || 'No specific indication available.'} ${molecule.therapeutic_flag ? 'Therapeutic.' : ''}` : undefined, //Improved description
        };

        console.log(`Found drug in ChEMBL: ${drug.name}`);
        return drug;

    } catch (error: any) {
        console.error(`Error searching ChEMBL for drug "${drugName}":`, error.message);
        return null;
    }
}
