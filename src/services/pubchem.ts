
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
 * Fetches the PubChem CID for a given SMILES string.
 * Handles potential API errors gracefully.
 * @param smiles The SMILES string.
 * @returns A promise that resolves to the CID number, or null if not found or on error.
 */
async function getCidBySmiles(smiles: string): Promise<number | null> {
  try {
    // Basic check for empty/invalid SMILES input
    if (!smiles || typeof smiles !== 'string' || smiles.trim() === '') {
        console.warn(`Invalid SMILES string provided for CID lookup: "${smiles}"`);
        return null;
    }
    const encodedSmiles = encodeURIComponent(smiles.trim());
    const url = `${PUBCHEM_API_BASE}/compound/smiles/${encodedSmiles}/cids/JSON`;
    // console.log(`Fetching CID for SMILES: ${smiles} from URL: ${url}`); // Debug log
    const response = await fetch(url);

    if (!response.ok) {
      // Log specific PubChem error if available
      let errorDetails = `${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.error('PubChem CID lookup error details:', errorData);
        if(errorData.Fault) {
            errorDetails += ` - ${errorData.Fault.Code}: ${errorData.Fault.Message}`;
        }
      } catch (e) { /* Ignore JSON parsing error if body is not JSON */ }
      console.error(`PubChem CID lookup failed for SMILES "${smiles}": ${errorDetails}`);
      return null;
    }

    const data = await response.json();

    if (!data || !data.IdentifierList || !data.IdentifierList.CID || data.IdentifierList.CID.length === 0) {
      console.warn(`No CID found for SMILES: "${smiles}"`);
      return null;
    }

    const cid = data.IdentifierList.CID[0];
     // Ensure the CID is a positive number
    if (typeof cid !== 'number' || cid <= 0) {
        console.warn(`Invalid CID (${cid}) received for SMILES: "${smiles}"`);
        return null;
    }

    // console.log(`Found CID ${cid} for SMILES: ${smiles}`); // Debug log
    return cid;
  } catch (error) {
    console.error(`Error during CID lookup for SMILES "${smiles}":`, error);
    return null;
  }
}

/**
 * Fetches molecule properties from PubChem using the CID.
 * Handles potential API errors and incomplete data gracefully.
 * @param cid The PubChem CID. Must be a positive integer.
 * @returns A promise that resolves to a Molecule object, or null if properties are not found or on error.
 */
async function getPropertiesByCid(cid: number): Promise<Molecule | null> {
   // Pre-check for invalid CID
   if (typeof cid !== 'number' || cid <= 0) {
        console.error(`Invalid CID provided for property fetch: ${cid}`);
        return null;
   }

   try {
    const propertiesList = 'MolecularFormula,IUPACName,CanonicalSMILES,MolecularWeight';
    const url = `${PUBCHEM_API_BASE}/compound/cid/${cid}/property/${propertiesList}/JSON`;
    // console.log(`Fetching properties for CID: ${cid} from URL: ${url}`); // Debug log
    const response = await fetch(url);

     if (!response.ok) {
        // Log specific PubChem error if available
        let errorDetails = `${response.status} ${response.statusText}`;
        try {
            const errorData = await response.json();
            console.error('PubChem property fetch error details:', errorData);
            if(errorData.Fault) {
                errorDetails += ` - ${errorData.Fault.Code}: ${errorData.Fault.Message}`;
            }
        } catch (e) { /* Ignore JSON parsing error if body is not JSON */ }
        console.error(`PubChem property fetch failed for CID ${cid}: ${errorDetails}`);
        return null;
    }

     const data = await response.json();

     if (!data || !data.PropertyTable || !data.PropertyTable.Properties || data.PropertyTable.Properties.length === 0) {
      console.warn(`No properties found for CID: ${cid}`);
      return null;
    }

     const properties = data.PropertyTable.Properties[0];

     // Validate essential properties received from PubChem
     if (!properties.CID || !properties.MolecularFormula || !properties.CanonicalSMILES || !properties.MolecularWeight) {
       console.error(`Incomplete essential data received from PubChem for CID: ${cid}`, properties);
       return null; // Return null if critical data is missing
     }

     // Convert MolecularWeight to number, handle potential non-numeric values
     const molecularWeight = parseFloat(properties.MolecularWeight);
     if (isNaN(molecularWeight)) {
        console.error(`Invalid MolecularWeight received from PubChem for CID ${cid}: "${properties.MolecularWeight}"`);
        // Decide how to handle: return null or proceed without weight? Returning null for safety.
        return null;
     }


     // Construct the molecule object
     // Use || '' to provide default empty string if a property is missing but not essential (like IUPACName)
     const molecule: Molecule = {
        cid: properties.CID, // Should match input CID
        molecularFormula: properties.MolecularFormula,
        iupacName: properties.IUPACName, // Can be undefined/null
        canonicalSmiles: properties.CanonicalSMILES,
        molecularWeight: molecularWeight,
     };

     // Final check on constructed object (redundant if initial check is good, but safe)
     if (!molecule.cid || !molecule.molecularFormula || !molecule.canonicalSmiles) {
        console.error(`Failed to construct valid molecule object from PubChem data for CID: ${cid}`, molecule);
        return null;
     }

     // console.log(`Successfully fetched properties for CID: ${cid}`, molecule); // Debug log
     return molecule;
   } catch (error) {
      console.error(`Error fetching properties for CID ${cid}:`, error);
      return null;
   }
}


/**
 * Asynchronously retrieves molecule information from PubChem based on a SMILES string.
 * It first tries to find the CID for the SMILES, then uses the CID to fetch properties.
 * Includes delays between API calls as recommended by PubChem.
 *
 * @param smiles The SMILES string of the molecule to search for.
 * @returns A promise that resolves to a Molecule object containing information about the molecule, or null if not found or on error.
 */
export async function getMoleculeBySmiles(smiles: string): Promise<Molecule | null> {
  // Step 1: Get CID from SMILES
  // console.log(`Starting PubChem lookup for SMILES: ${smiles}`); // Debug log
  const cid = await getCidBySmiles(smiles);

  // Ensure CID is valid (not null and positive number) before proceeding
  if (cid === null || cid <= 0) {
    console.log(`PubChem lookup failed or returned invalid CID (${cid}) for SMILES: "${smiles}"`);
    return null; // Exit early if CID is invalid or not found
  }

   // Add a small delay between API calls as recommended by PubChem guidelines
   // PubChem recommends no more than 5 requests per second. 200ms delay is safe.
  await new Promise(resolve => setTimeout(resolve, 200));


  // Step 2: Get properties using the *validated* CID
  const moleculeData = await getPropertiesByCid(cid);

   if (moleculeData === null) {
     // Error/warning logged in getPropertiesByCid
     console.log(`PubChem lookup failed at properties stage for CID: ${cid} (SMILES: "${smiles}")`); // Debug log
     return null;
   }

   // Optional: Validate that the canonical SMILES from the properties matches the input SMILES
   // or handle cases where they might differ due to tautomerism, etc.
   // For now, we return the data associated with the resolved CID.
  // console.log(`PubChem lookup successful for SMILES: ${smiles}`, moleculeData); // Debug log
  return moleculeData;
}
