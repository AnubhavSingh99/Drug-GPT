
'use client';

import type { MolpropResult } from '@/services/molprop';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer, Sigma, FlaskConical, HelpCircle, Loader2 } from 'lucide-react'; // Example icons
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MolpropDetailsCardProps {
  result: MolpropResult | null | undefined; // Accept null or undefined
  isLoading: boolean; // Indicates if the analysis flow is running AND results haven't been received yet
}

// Helper to format numbers, handling undefined
const formatNumber = (num: number | undefined, decimalPlaces = 2): string => {
    if (num === undefined || num === null || isNaN(num)) {
        return "N/A";
    }
    return num.toFixed(decimalPlaces);
}

export function MolpropDetailsCard({ result, isLoading }: MolpropDetailsCardProps) {
  // Show skeleton only if isLoading is true
  if (isLoading) {
     return (
      <Card className="shadow-md animate-pulse mt-4">
        <CardHeader>
           <CardTitle className="text-xl flex items-center">
            <Sigma className="mr-2 h-5 w-5 text-muted-foreground" /> {/* Using Sigma icon */}
             Molprop Predictions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
            <div className="flex justify-between items-center space-x-4">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
             <div className="flex justify-between items-center space-x-4">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-2/5" />
            </div>
            <div className="flex justify-between items-center space-x-4">
                <Skeleton className="h-4 w-1/5" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        </CardContent>
      </Card>
    );
  }

  // If loading is finished and there is no result data, don't render the card here.
  // The parent TabsContent should handle the "No data found" message.
  if (!result) {
    return null;
  }

  // If we have result data (and isLoading is false)
  return (
    <Card className="shadow-md mt-4">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Sigma className="mr-2 h-5 w-5 text-primary" /> {/* Using Sigma icon */}
          Molprop Predictions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4 text-sm">
        {/* LogP */}
        <div className="flex justify-between items-center">
          <span className="font-medium text-muted-foreground flex items-center">
             <Thermometer className="mr-1 h-4 w-4" /> {/* Lipophilicity icon */}
             Predicted LogP
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 ml-1 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Logarithm of the partition coefficient (Octanol/Water). Higher indicates more lipid-soluble.</p>
                    </TooltipContent>
                </Tooltip>
             </TooltipProvider>
          </span>
          <span className="font-mono">{formatNumber(result.logP)}</span>
        </div>

        {/* Solubility */}
        <div className="flex justify-between items-center">
          <span className="font-medium text-muted-foreground flex items-center">
            <FlaskConical className="mr-1 h-4 w-4" /> {/* Solubility icon */}
            Predicted Solubility (logS)
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 ml-1 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Logarithm of the molar solubility in water. More negative indicates less soluble.</p>
                    </TooltipContent>
                </Tooltip>
             </TooltipProvider>
          </span>
          <span className="font-mono">{formatNumber(result.solubility)}</span>
        </div>

        {/* Toxicity Score */}
        <div className="flex justify-between items-center">
          <span className="font-medium text-muted-foreground flex items-center">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-1.15-.5L9.95 18.5l-1.1 1.3a1 1 0 0 1-1.1 1.05c-4.54-1.45-7.75-4.5-7.75-9.35A8 8 0 0 1 8 5a7.7 7.7 0 0 1 8 0 8 8 0 0 1 4 8Z"/><path d="m12 12 4 4"/><path d="m16 12-4 4"/></svg> {/* Toxicity icon */}
             Predicted Toxicity Score
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 ml-1 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Predicted toxicity score (0-1). Higher suggests greater potential toxicity.</p>
                    </TooltipContent>
                </Tooltip>
             </TooltipProvider>
          </span>
          <span className="font-mono">{formatNumber(result.toxicityScore)}</span>
        </div>

        {/* Add other properties here following the same pattern */}

      </CardContent>
    </Card>
  );
}
