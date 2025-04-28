import type { AnalyzeDrugCandidateOutput } from '@/ai/flows/analyze-drug-candidate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface ResultsDisplayProps {
  results: AnalyzeDrugCandidateOutput | null;
  error: Error | null;
  isLoading: boolean;
}

export function ResultsDisplay({ results, error, isLoading }: ResultsDisplayProps) {
  if (isLoading) {
    return (
      <Card className="mt-6 animate-pulse">
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
       <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analysis Error</AlertTitle>
          <AlertDescription>
             {error.message || 'An unexpected error occurred during analysis.'}
          </AlertDescription>
        </Alert>
    );
  }

  if (!results) {
    return null; // Don't display anything if there are no results yet (and not loading/error)
  }

  return (
    <Card className="mt-6 shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Analysis Results</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-foreground whitespace-pre-wrap">{results.analysis}</p>
      </CardContent>
    </Card>
  );
}
