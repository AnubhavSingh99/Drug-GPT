
'use client';

import type { Drug } from '@/services/drugbank';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill, FileText, Loader2 } from 'lucide-react'; // Using Pill and FileText icons
import { Skeleton } from "@/components/ui/skeleton";

interface DrugBankDetailsCardProps {
  drug: Drug | null | undefined; // Accept null or undefined
  isLoading: boolean; // Indicates if the analysis flow is running
}

export function DrugBankDetailsCard({ drug, isLoading }: DrugBankDetailsCardProps) {
  // Show skeleton only if isLoading is true AND we don't have drug data yet.
  if (isLoading && !drug) {
    return (
      <Card className="shadow-md animate-pulse mt-4"> {/* Added mt-4 */}
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Pill className="mr-2 h-5 w-5 text-muted-foreground" />
            DrugBank Information
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

  // If loading is finished and still no drug data, show placeholder/message.
  if (!drug) {
     // Don't render the card if there's simply no data and not loading.
     // The parent TabsContent handles the "No data found" message.
    return null;
    // Example placeholder if needed within the card itself:
    // return (
    //   <Card className="shadow-md mt-4 border-dashed">
    //     <CardHeader>
    //       <CardTitle className="text-xl flex items-center">
    //         <Pill className="mr-2 h-5 w-5 text-muted-foreground" />
    //         DrugBank Information
    //       </CardTitle>
    //     </CardHeader>
    //     <CardContent className="pt-6 text-center text-muted-foreground">
    //       DrugBank details will appear here if relevant.
    //     </CardContent>
    //   </Card>
    // );
  }

  // If we have drug data
  return (
    <Card className="shadow-md mt-4"> {/* Added mt-4 */}
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Pill className="mr-2 h-5 w-5 text-primary" />
          DrugBank Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4 text-sm"> {/* Added pt-4 */}
        <div className="flex justify-between">
          <span className="font-medium text-muted-foreground">DrugBank ID:</span>
          <span className="font-mono">{drug.drugbankId}</span>
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
             <p className="whitespace-pre-wrap">{drug.description}</p>
           </div>
         )}
         {drug.molecularFormula && (
           <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Formula:</span>
              <span className="font-mono">{drug.molecularFormula}</span>
            </div>
         )}
         {drug.averageMolecularWeight !== undefined && (
           <div className="flex justify-between">
             <span className="font-medium text-muted-foreground">Avg. Mol. Weight:</span>
             <span>{drug.averageMolecularWeight.toFixed(3)} g/mol</span>
           </div>
         )}
      </CardContent>
    </Card>
  );
}
