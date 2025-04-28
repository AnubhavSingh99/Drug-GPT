
'use client';

import type { DeepPurposeResult } from '@/services/deeppurpose';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, HelpCircle, Loader2 } from 'lucide-react'; // Using BrainCircuit icon
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DeepPurposeDetailsCardProps {
  result: DeepPurposeResult | null | undefined; // Accept null or undefined
  isLoading: boolean; // Indicates if the analysis flow is running
}

export function DeepPurposeDetailsCard({ result, isLoading }: DeepPurposeDetailsCardProps) {
  // Show skeleton only if isLoading is true AND we don't have result data yet.
  if (isLoading && !result) {
     return (
      <Card className="shadow-md animate-pulse mt-4"> {/* Added mt-4 */}
        <CardHeader>
           <CardTitle className="text-xl flex items-center">
            <BrainCircuit className="mr-2 h-5 w-5 text-muted-foreground" />
             DeepPurpose Prediction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4"> {/* Added pt-4 */}
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center space-x-2 pt-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </CardContent>
      </Card>
    );
  }

  // If loading is finished and still no result (or explicitly null/undefined), show placeholder/message.
  if (!result) {
     // Don't render the card if there's simply no data and not loading.
     // The parent TabsContent handles the "No data found" message.
    return null;
    // Example placeholder if needed within the card itself:
    // return (
    //   <Card className="shadow-md mt-4 border-dashed">
    //     <CardHeader>
    //        <CardTitle className="text-xl flex items-center">
    //          <BrainCircuit className="mr-2 h-5 w-5 text-muted-foreground" />
    //          DeepPurpose Prediction
    //       </CardTitle>
    //     </CardHeader>
    //     <CardContent className="pt-6 text-center text-muted-foreground">
    //       DeepPurpose prediction details will appear here if generated.
    //     </CardContent>
    //   </Card>
    // );
  }

  // If we have result data
  const confidenceValue = result.confidence !== undefined ? result.confidence * 100 : null;

  return (
    <Card className="shadow-md mt-4"> {/* Added mt-4 */}
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <BrainCircuit className="mr-2 h-5 w-5 text-primary" />
          DeepPurpose Prediction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4 text-sm"> {/* Added pt-4 */}
        <div>
          <span className="font-medium text-muted-foreground block mb-1">Predicted Purpose / MoA:</span>
          <p className="whitespace-pre-wrap">{result.predictedPurpose}</p>
        </div>

        {confidenceValue !== null && (
          <div className="pt-2">
             <div className="flex justify-between items-center mb-1">
                 <span className="font-medium text-muted-foreground">Confidence:</span>
                 <TooltipProvider>
                    <Tooltip>
                       <TooltipTrigger asChild>
                         <span className="flex items-center font-mono text-sm">
                             {confidenceValue.toFixed(1)}%
                             <HelpCircle className="h-3 w-3 ml-1 text-muted-foreground cursor-help" />
                         </span>
                       </TooltipTrigger>
                       <TooltipContent>
                         <p>Model's confidence in the prediction (0-100%).</p>
                       </TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
            </div>
             <Progress value={confidenceValue} className="h-2" />
          </div>
        )}
         {result.confidence === undefined && (
             <div className="flex items-center text-muted-foreground text-xs pt-2">
                <HelpCircle className="h-3 w-3 mr-1"/>
                Confidence score not available for this prediction.
             </div>
         )}
      </CardContent>
    </Card>
  );
}
