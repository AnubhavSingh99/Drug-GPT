
'use client';

// Import the locally defined Drug type from the flow file or a shared types file
// For simplicity, let's assume Drug type definition is accessible here or defined locally
// If defined in flow: import type { Drug } from '@/ai/flows/analyze-drug-candidate';
// For this example, let's assume a local definition or it's imported correctly.

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Pill, FileText } from 'lucide-react'; // Keep Database icon
import { Skeleton } from "@/components/ui/skeleton";

// Define Drug type here if not imported from elsewhere
interface Drug {
  chemblId: string;
  name: string;
  maxPhase?: number | null; // Allow null from DB
  molecularWeight?: number;
  molecularFormula?: string;
  description?: string;
}


interface ChemblDetailsCardProps {
  drug: Drug | null | undefined; // Use the correct Drug type
  isLoading: boolean; // Indicates if the analysis flow is running AND results haven't been received yet
}

export function ChemblDetailsCard({ drug, isLoading }: ChemblDetailsCardProps) {
  if (isLoading) {
    return (
      <Card className="shadow-md animate-pulse mt-4">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Database className="mr-2 h-5 w-5 text-muted-foreground" />
            Database Information {/* Updated title */}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          <div className="flex justify-between items-center space-x-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex justify-between items-center space-x-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/5" />
          </div>
           <Skeleton className="h-4 w-full mt-2" />
           <Skeleton className="h-4 w-5/6" />
          <div className="flex justify-between items-center space-x-4 pt-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <div className="flex justify-between items-center space-x-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!drug) {
    return null; // Parent handles "No data found"
  }

  return (
    <Card className="shadow-md mt-4">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Database className="mr-2 h-5 w-5 text-primary" />
           Database Information {/* Updated title */}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4 text-sm">
        <div className="flex justify-between">
          <span className="font-medium text-muted-foreground">ChEMBL ID:</span>
          <span className="font-mono">{drug.chemblId || 'N/A'}</span> {/* Handle potential missing ID */}
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-muted-foreground">Name:</span>
          <span>{drug.name}</span>
        </div>
        {drug.description && (
           <div>
             <span className="font-medium text-muted-foreground block mb-1 flex items-center">
                <FileText className="mr-1.5 h-4 w-4" /> Description / Indication:
            </span>
             <p className="whitespace-pre-wrap text-foreground/90">{drug.description}</p>
           </div>
         )}
         {drug.molecularFormula && (
           <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Formula:</span>
              <span className="font-mono">{drug.molecularFormula}</span>
            </div>
         )}
         {/* Check specifically for maxPhase as weight might not always be present */}
         {(drug.maxPhase !== undefined && drug.maxPhase !== null) && (
            <div className="flex justify-between">
             <span className="font-medium text-muted-foreground">Max Phase:</span>
             {/* Display 'N/A' or similar if maxPhase is 0 or null, otherwise display the number */}
             <span>{drug.maxPhase > 0 ? drug.maxPhase : 'N/A'}</span>
            </div>
         )}
         {drug.molecularWeight !== undefined && drug.molecularWeight !== null && (
           <div className="flex justify-between">
             <span className="font-medium text-muted-foreground">Mol. Weight:</span>
             <span>{drug.molecularWeight.toFixed(3)} g/mol</span>
           </div>
         )}
      </CardContent>
    </Card>
  );
}
