import type { AnalyzeDrugCandidateOutput } from '@/ai/flows/analyze-drug-candidate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Bot } from 'lucide-react'; // Added Bot icon
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface ResultsDisplayProps {
  results: AnalyzeDrugCandidateOutput | null;
  error: Error | null;
  isLoading: boolean; // This now represents the AI analysis loading state
}

export function ResultsDisplay({ results, error, isLoading }: ResultsDisplayProps) {
  // Show loading skeleton only when AI analysis is in progress
  if (isLoading) {
    return (
      <Card className="shadow-md animate-pulse">
        <CardHeader>
           <CardTitle className="text-xl flex items-center">
             <Bot className="mr-2 h-5 w-5" /> Analysis Results
           </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
           <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
           <Skeleton className="h-4 w-4/6" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
       <Alert variant="destructive" className="shadow-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analysis Error</AlertTitle>
          <AlertDescription>
             {error.message || 'An unexpected error occurred during analysis.'}
              {/* Optionally provide more specific guidance based on error type if possible */}
               {error.message.includes('PubChem') && (
                  <p className="mt-2 text-xs"> Please ensure the SMILES string is correct and try again.</p>
               )}
          </AlertDescription>
        </Alert>
    );
  }

   // Don't display the card if there are no results yet and no error/loading for analysis
  if (!results) {
     // You might want a subtle placeholder here instead of null,
     // e.g., indicating that results will appear here after analysis.
    return null;
     // Example placeholder:
     // return (
     //    <Card className="shadow-md border-dashed border-muted-foreground/50">
     //       <CardContent className="pt-6 text-center text-muted-foreground">
     //          Analysis results will appear here.
     //       </CardContent>
     //    </Card>
     // );
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
         <CardTitle className="text-xl flex items-center">
           <Bot className="mr-2 h-5 w-5 text-primary" /> Analysis Results
         </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Use whitespace-pre-wrap to preserve line breaks and wrap long lines */}
        <p className="text-foreground whitespace-pre-wrap">{results.analysis}</p>
      </CardContent>
    </Card>
  );
}
