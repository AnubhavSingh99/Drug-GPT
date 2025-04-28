/**
 * Represents a molecule retrieved from PubChem.
 */
export interface Molecule {
  /**
   * The PubChem CID (Compound Identifier).
   */
  cid: number;
  /**
   * The molecular formula.
   */
  molecularFormula: string;
  /**
   * The IUPAC name, if available.
   */
  iupacName?: string;
  /**
   * The canonical SMILES string.
   */
  canonicalSmiles: string;
  /**
   * The molecular weight.
   */
  molecularWeight: number;
}

const PUBCHEM_API_BASE = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug';

/**
 * Asynchronously retrieves molecule information from PubChem based on a SMILES string.
 *
 * @param smiles The SMILES string of the molecule to search for.
 * @returns A promise that resolves to a Molecule object containing information about the molecule, or null if not found or on error.
 */
export async function getMoleculeBySmiles(smiles: string): Promise<Molecule | null> {
  try {
    const encodedSmiles = encodeURIComponent(smiles);
    const url = `${PUBCHEM_API_BASE}/compound/smiles/${encodedSmiles}/property/MolecularFormula,IUPACName,CanonicalSMILES,MolecularWeight/JSON`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`PubChem API request failed for SMILES ${smiles}: ${response.status} ${response.statusText}`);
      // Try to get error message from response body if possible
      try {
        const errorData = await response.json();
        console.error('PubChem error details:', errorData);
      } catch (e) {
        // Ignore if response body is not JSON or empty
      }
       // Return null instead of throwing to allow the flow to potentially continue or handle the missing data gracefully.
      // throw new Error(`PubChem API request failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    if (!data || !data.PropertyTable || !data.PropertyTable.Properties || data.PropertyTable.Properties.length === 0) {
      console.warn(`No properties found for SMILES: ${smiles}`);
      return null;
    }

    const properties = data.PropertyTable.Properties[0];

    // Basic validation to ensure expected properties exist
    if (!properties.CID || !properties.MolecularFormula || !properties.CanonicalSMILES || !properties.MolecularWeight) {
       console.error(`Incomplete data received from PubChem for SMILES: ${smiles}`, properties);
       return null; // Return null if essential data is missing
    }


    return {
      cid: properties.CID,
      molecularFormula: properties.MolecularFormula,
      iupacName: properties.IUPACName, // Optional, might not always be present
      canonicalSmiles: properties.CanonicalSMILES,
      molecularWeight: parseFloat(properties.MolecularWeight), // Ensure it's a number
    };
  } catch (error) {
    console.error(`Error fetching data from PubChem for SMILES ${smiles}:`, error);
    // Return null on any fetch or processing error
    return null;
  }
}
