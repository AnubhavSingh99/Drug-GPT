
'use client';

import type { Drug } from '@/services/chembl'; // Updated import path
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill, FileText, Database } from 'lucide-react'; // Replaced Loader2 with Database icon for source
import { Skeleton } from "@/components/ui/skeleton";

interface ChemblDetailsCardProps { // Renamed interface
  drug: Drug | null | undefined; // Type remains the same, just imported from chembl service
  isLoading: boolean; // Indicates if the analysis flow is running AND results haven't been received yet
}

export function ChemblDetailsCard({ drug, isLoading }: ChemblDetailsCardProps) { // Renamed component
  // Show skeleton only if isLoading is true (meaning analysis flow is running and we are waiting for results).
  if (isLoading) {
    return (
      <Card className="shadow-md animate-pulse mt-4"> {/* Added mt-4 */}
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Database className="mr-2 h-5 w-5 text-muted-foreground" /> {/* Changed icon */}
            ChEMBL Information {/* Updated title */}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-4"> {/* Added pt-4 */}
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

  // If loading is finished and there is no drug data (explicitly null or undefined),
  // we don't render the card here. The parent TabsContent should handle the "No data found" message.
  if (!drug) {
    return null;
  }

  // If we have drug data (and isLoading is false)
  return (
    <Card className="shadow-md mt-4"> {/* Added mt-4 */}
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Database className="mr-2 h-5 w-5 text-primary" /> {/* Changed icon */}
          ChEMBL Information {/* Updated title */}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4 text-sm"> {/* Added pt-4 */}
        <div className="flex justify-between">
          <span className="font-medium text-muted-foreground">ChEMBL ID:</span> {/* Updated label */}
          <span className="font-mono">{drug.chemblId}</span> {/* Updated field */}
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
             <p className="whitespace-pre-wrap text-foreground/90">{drug.description}</p> {/* Slightly muted description */}
           </div>
         )}
         {drug.molecularFormula && (
           <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Formula:</span>
              <span className="font-mono">{drug.molecularFormula}</span>
            </div>
         )}
         {/* Check specifically for maxPhase as weight might not always be present */}
         {drug.maxPhase !== undefined && drug.maxPhase !== null && (
            <div className="flex justify-between">
             <span className="font-medium text-muted-foreground">Max Phase:</span>
             <span>{drug.maxPhase}</span>
            </div>
         )}
         {drug.molecularWeight !== undefined && drug.molecularWeight !== null && (
           <div className="flex justify-between">
             <span className="font-medium text-muted-foreground">Mol. Weight:</span> {/* Abbreviated label */}
             <span>{drug.molecularWeight.toFixed(3)} g/mol</span>
           </div>
         )}
      </CardContent>
    </Card>
  );
}
