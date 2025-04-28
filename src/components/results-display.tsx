import type { AnalyzeDrugCandidateOutput } from '@/ai/flows/analyze-drug-candidate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Bot } from 'lucide-react'; // Added Bot icon
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface ResultsDisplayProps {
  // Accept only the synthesized analysis string (or the full output if needed later)
  results: { analysis: string } | null;
  error: Error | null;
  // isLoading should be true specifically when the AI analysis flow is running
  // (i.e., after PubChem data is fetched successfully but before AI results are back)
  isLoading: boolean;
}

export function ResultsDisplay({ results, error, isLoading }: ResultsDisplayProps) {
  // Show loading skeleton only when AI analysis is in progress
  if (isLoading) {
    return (
      <Card className="shadow-md animate-pulse mt-4"> {/* Added mt-4 */}
        <CardHeader>
           <CardTitle className="text-xl flex items-center">
             <Bot className="mr-2 h-5 w-5 text-muted-foreground" /> Synthesized Analysis
           </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4"> {/* Added pt-4 */}
           <Skeleton className="h-4 w-[80%]" />
           <Skeleton className="h-4 w-full" />
           <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
           <Skeleton className="h-4 w-[60%]" />
        </CardContent>
      </Card>
    );
  }

  // Display error if it occurred (could be PubChem error passed down or AI analysis error)
  if (error) {
    return (
       <Alert variant="destructive" className="shadow-md mt-4"> {/* Added mt-4 */}
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analysis Error</AlertTitle>
          <AlertDescription>
             {error.message || 'An unexpected error occurred.'}
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
   // The parent TabsContent handles the main placeholder when nothing has run.
  if (!results?.analysis) {
    // Only return null if not loading and no error exists.
    // If analysis ran but returned empty string (unlikely with current setup), this would also hit.
    // The parent component handles the initial "waiting for submission" placeholder.
    return null;
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
        <p className="text-foreground whitespace-pre-wrap leading-relaxed">{results.analysis}</p>
      </CardContent>
    </Card>
  );
}

    