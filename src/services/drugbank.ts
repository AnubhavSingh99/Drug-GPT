import { z } from 'zod';

/**
 * Represents a drug entry potentially from DrugBank or a similar source.
 */
export interface Drug {
  /**
   * The DrugBank ID or a similar unique identifier.
   */
  drugbankId: string;
  /**
   * The generic name of the drug.
   */
  name: string;
  /**
   * A brief description or indication of the drug's use.
   */
  description?: string;
  /**
   * The molecular formula.
   */
  molecularFormula?: string;
  /**
   * The average molecular weight.
   */
  averageMolecularWeight?: number;
}

// Export Zod schema for Drug interface
export const DrugSchema = z.object({
  drugbankId: z.string().describe('The DrugBank ID.'),
  name: z.string().describe('The generic name of the drug.'),
  description: z.string().optional().describe('A brief description or indication of the drug\'s use.'),
  molecularFormula: z.string().optional().describe('The molecular formula.'),
  averageMolecularWeight: z.number().optional().describe('The average molecular weight.'),
});


// NOTE: Direct access to the official DrugBank API often requires licensing and authentication.
// This implementation uses a placeholder/mock logic.
// In a real-world scenario, you would replace this with actual API calls
// using appropriate authentication (e.g., an API key).

// Example placeholder data structure. Replace with real API fetching logic.
const MOCK_DRUG_DATABASE: { [key: string]: Drug } = {
  'epinephrine': {
    drugbankId: 'DB00668', // Corrected ID (DB00316 is generally Levodopa)
    name: 'Epinephrine',
    description: 'A hormone and neurotransmitter used to treat severe allergic reactions (anaphylaxis), cardiac arrest, and asthma attacks.',
    molecularFormula: 'C9H13NO3',
    averageMolecularWeight: 183.204
  },
  'aspirin': {
    drugbankId: 'DB00945',
    name: 'Aspirin',
    description: 'A nonsteroidal anti-inflammatory drug (NSAID) used to reduce pain, fever, and inflammation. Also used as an antiplatelet agent.',
    molecularFormula: 'C9H8O4',
    averageMolecularWeight: 180.158
  },
  'metformin': {
    drugbankId: 'DB00331',
    name: 'Metformin',
    description: 'An oral antihyperglycemic agent used for the management of type 2 diabetes mellitus.',
    molecularFormula: 'C4H11N5',
    averageMolecularWeight: 129.164
  },
   'paracetamol': {
    drugbankId: 'DB00316', // Also known as Acetaminophen
    name: 'Paracetamol',
    description: 'A common analgesic and antipyretic drug used to treat pain and fever.',
    molecularFormula: 'C8H9NO2',
    averageMolecularWeight: 151.163
  },
   'acetaminophen': {
    drugbankId: 'DB00316', // Same as Paracetamol
    name: 'Acetaminophen',
    description: 'A common analgesic and antipyretic drug used to treat pain and fever.',
    molecularFormula: 'C8H9NO2',
    averageMolecularWeight: 151.163
  },
   // Adding Chlorcyclizine example from DeepPurpose for potential DrugBank lookup
   'chlorcyclizine': {
    drugbankId: 'DB00491', // Example DrugBank ID
    name: 'Chlorcyclizine',
    description: 'An antihistamine of the piperazine class used to treat symptoms of allergy such as hay fever and urticaria.',
    molecularFormula: 'C18H21ClN2',
    averageMolecularWeight: 300.829
  },
};


/**
 * Asynchronously retrieves drug information based on the drug name (using placeholder logic).
 *
 * @param drugName The name of the drug to search for (case-insensitive).
 * @returns A promise that resolves to a Drug object containing information about the drug, or null if not found.
 */
export async function getDrugByName(drugName: string): Promise<Drug | null> {
  console.log(`Searching mock database for drug: ${drugName}`);
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay

  // Attempt to find a match, considering potential variations in naming (e.g., IUPAC vs common name)
  const lowerCaseDrugName = drugName?.toLowerCase().trim();
  if (!lowerCaseDrugName) return null;

  // Direct lookup by key
  let drug = MOCK_DRUG_DATABASE[lowerCaseDrugName];

  // If direct lookup fails, try searching by name field (more robust for variations)
   if (!drug) {
     for (const key in MOCK_DRUG_DATABASE) {
       const entry = MOCK_DRUG_DATABASE[key];
       if (entry.name.toLowerCase() === lowerCaseDrugName) {
         drug = entry;
         break;
       }
       // Add more sophisticated matching if needed (e.g., contains, startsWith)
     }
   }

  if (drug) {
    console.log(`Found drug in mock database: ${drug.name}`);
    return drug;
  } else {
    console.warn(`Drug "${drugName}" not found in mock database.`);
    return null;
  }
}
