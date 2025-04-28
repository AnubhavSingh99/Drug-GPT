import type { AnalyzeDrugCandidateOutput } from '@/ai/flows/analyze-drug-candidate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Bot } from 'lucide-react'; // Added Bot icon
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface ResultsDisplayProps {
  // Accept only the synthesized analysis string (or the full output if needed later)
  results: { analysis: string } | null;
  error: Error | null;
  isLoading: boolean; // This represents the AI analysis *flow* loading state (after PubChem)
}

export function ResultsDisplay({ results, error, isLoading }: ResultsDisplayProps) {
  // Show loading skeleton only when AI analysis is in progress
  if (isLoading) {
    return (
      <Card className="shadow-md animate-pulse mt-4"> {/* Added mt-4 */}
        <CardHeader>
           <CardTitle className="text-xl flex items-center">
             <Bot className="mr-2 h-5 w-5 text-muted-foreground" /> Analysis Results
           </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4"> {/* Added pt-4 */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
           <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
           <Skeleton className="h-4 w-4/6" />
        </CardContent>
      </Card>
    );
  }

  // Display error if it occurred during the analysis flow
  if (error) {
    return (
       <Alert variant="destructive" className="shadow-md mt-4"> {/* Added mt-4 */}
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analysis Error</AlertTitle>
          <AlertDescription>
             {error.message || 'An unexpected error occurred during analysis.'}
              {/* Specific guidance for common errors */}
               {error.message.includes('PubChem') && !error.message.includes('property fetch') && (
                  <p className="mt-2 text-xs"> This usually means the provided SMILES string is invalid or not found in PubChem. Please check the SMILES and try again.</p>
               )}
                {error.message.includes('AI model did not generate an analysis') && (
                  <p className="mt-2 text-xs"> The AI failed to produce a textual summary. This might be a temporary issue, or the query/molecule might be difficult to analyze.</p>
               )}
          </AlertDescription>
        </Alert>
    );
  }

   // Don't display the card if there are no results yet and no error/loading for analysis.
   // The parent TabsContent handles the main placeholder.
  if (!results?.analysis) {
    return null;
     // Example placeholder if needed within the card itself:
     // return (
     //    <Card className="shadow-md mt-4 border-dashed">
     //       <CardHeader>
     //          <CardTitle className="text-xl flex items-center">
     //              <Bot className="mr-2 h-5 w-5 text-muted-foreground" /> Analysis Results
     //          </CardTitle>
     //        </CardHeader>
     //       <CardContent className="pt-6 text-center text-muted-foreground">
     //          Synthesized analysis results will appear here.
     //       </CardContent>
     //    </Card>
     // );
  }

  // Display the synthesized analysis results
  return (
    <Card className="shadow-md mt-4"> {/* Added mt-4 */}
      <CardHeader>
         <CardTitle className="text-xl flex items-center">
           <Bot className="mr-2 h-5 w-5 text-primary" /> Synthesized Analysis
         </CardTitle>
      </CardHeader>
      <CardContent className="pt-4"> {/* Added pt-4 */}
        {/* Use whitespace-pre-wrap to preserve line breaks and wrap long lines */}
        <p className="text-foreground whitespace-pre-wrap">{results.analysis}</p>
      </CardContent>
    </Card>
  );
}
