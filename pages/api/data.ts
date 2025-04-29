
import type { NextApiRequest, NextApiResponse } from 'next';
import { database } from '@/lib/firebase/firebaseConfig'; // Import Realtime Database instance
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';

// Define the structure of your data if possible (optional but recommended)
interface ChemblData {
  // Define the fields you expect in your ChEMBL data objects
  // Example:
  chemblId: string;
  name: string;
  maxPhase?: number;
  molecularWeight?: number;
  molecularFormula?: string;
  description?: string;
  // Add other relevant fields
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ChemblData[] | ChemblData | { error: string } | { message: string }>
) {
  const { drugName } = req.query;

  if (!drugName || typeof drugName !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid drugName query parameter' });
  }

  console.log(`API route received request for drugName: ${drugName}`);

  try {
    // Define the path to your ChEMBL data in the Realtime Database
    // IMPORTANT: Replace 'chembl_data' with the actual path/key where your data is stored.
    const dataRef = ref(database, 'chembl_data');

    // Query the database to find entries where the 'name' field matches the drugName (case-insensitive search might require different setup or client-side filtering)
    // Realtime Database querying is limited. A common pattern is to structure data for efficient lookups or fetch broader data and filter.
    // Example: Querying for exact match (case-sensitive unless data keys are structured differently)
    // For case-insensitive, you might store a lowercased version of the name and query that.
    const dataQuery = query(dataRef, orderByChild('name'), equalTo(drugName));

    const snapshot = await get(dataQuery);

    if (snapshot.exists()) {
      const results: ChemblData[] = [];
      snapshot.forEach((childSnapshot) => {
        // Assuming each child under 'chembl_data' is a drug object
        results.push({ id: childSnapshot.key, ...childSnapshot.val() } as any); // Adjust 'id' field if needed
      });

      console.log(`Found ${results.length} matches for ${drugName} in Firebase RTDB.`);
      if (results.length > 0) {
        // Decide whether to return all matches or just the first one
        // Returning the first match for simplicity, similar to previous ChEMBL service
        res.status(200).json(results[0]);
      } else {
         // This case might not be hit if equalTo guarantees results, but good for safety
         console.log(`Query executed, but no exact match found for ${drugName} after processing snapshot.`);
         res.status(404).json({ message: `No data found for drug: ${drugName}` });
      }
    } else {
      console.log(`No data found in Firebase RTDB for drug: ${drugName}`);
      res.status(404).json({ message: `No data found for drug: ${drugName}` });
    }
  } catch (error: any) {
    console.error("Error fetching data from Firebase Realtime Database:", error);
    res.status(500).json({ error: `Failed to fetch data: ${error.message || 'Unknown error'}` });
  }
}
