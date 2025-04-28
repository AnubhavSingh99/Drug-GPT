
'use client';

import type { AnalyzeDrugCandidateInput, AnalyzeDrugCandidateOutput } from '@/ai/flows/analyze-drug-candidate';
import { analyzeDrugCandidate } from '@/ai/flows/analyze-drug-candidate';
import type { Molecule } from '@/services/pubchem'; // Import Molecule type
import { getMoleculeBySmiles } from '@/services/pubchem'; // Import PubChem service
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ResultsDisplay } from '@/components/results-display';
// import { MolecularVisualization } from '@/components/molecular-visualization'; // Import new component - REMOVED for dynamic import
import { PubChemDetailsCard } from '@/components/pubchem-details-card'; // Import new component
import { Loader2, TestTubeDiagonal, Target } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import MolecularVisualization with SSR disabled
const MolecularVisualization = dynamic(
  () => import('@/components/molecular-visualization').then((mod) => mod.MolecularVisualization),
  {
    ssr: false,
    loading: () => ( // Optional: Show a skeleton loader while the component loads
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
             {/* Placeholder Icon or Text */}
             Loading Visualization...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    ),
  }
);


const formSchema = z.object({
  smiles: z.string().min(1, 'SMILES string is required.'),
  targetProtein: z.string().optional(),
  query: z.string().min(5, 'Please provide an analysis query (at least 5 characters).'),
});

type FormData = z.infer<typeof formSchema>;

export function AnalysisForm() {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeDrugCandidateOutput | null>(null);
  const [pubChemDetails, setPubChemDetails] = useState<Molecule | null>(null); // State for PubChem details
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingPubChem, setIsFetchingPubChem] = useState(false); // Separate loading state for PubChem
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      smiles: '',
      targetProtein: '',
      query: '',
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setIsFetchingPubChem(true);
    setError(null);
    setAnalysisResult(null);
    setPubChemDetails(null); // Clear previous PubChem details

    let moleculeData: Molecule | null = null;
    try {
      // 1. Fetch PubChem data first
      moleculeData = await getMoleculeBySmiles(values.smiles);
      setIsFetchingPubChem(false);

      if (!moleculeData) {
        toast({
          variant: "destructive",
          title: "PubChem Error",
          description: `Could not retrieve molecule details for SMILES: ${values.smiles}. Please check the SMILES string.`,
        });
         setError(new Error('Failed to fetch PubChem data.'));
         setIsLoading(false); // Stop loading as we can't proceed
        return;
      }

      // Update PubChem details state
      setPubChemDetails(moleculeData);
      toast({
         title: "PubChem Data Fetched",
         description: `Successfully retrieved details for CID ${moleculeData.cid}.`,
      });


      // 2. Run the main analysis flow
      const input: AnalyzeDrugCandidateInput = {
        smiles: moleculeData.canonicalSmiles, // Use canonical SMILES from PubChem for analysis consistency
        targetProtein: values.targetProtein,
        query: values.query,
      };
      const result = await analyzeDrugCandidate(input);
      setAnalysisResult(result);
      toast({
        title: "Analysis Complete",
        description: "Drug candidate analysis finished successfully.",
      });
    } catch (err: any) {
      console.error('Analysis error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during analysis.';
      setError(err instanceof Error ? err : new Error(errorMessage));
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: errorMessage,
      });
       // Clear potentially partial results on error
       setAnalysisResult(null);
       // Keep PubChem details if fetched successfully before the main analysis error
       if (isFetchingPubChem) setPubChemDetails(null);
    } finally {
      setIsLoading(false);
      setIsFetchingPubChem(false); // Ensure this is reset
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-8"> {/* Wrap left column content */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <TestTubeDiagonal className="mr-2 h-5 w-5" />
              Analyze Drug Candidate
            </CardTitle>
            <CardDescription>
              Enter a SMILES string, optional target protein, and your analysis query.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="smiles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMILES String</FormLabel>
                      <FormControl>
                        <Input
                         placeholder="e.g., c1ccccc1 (Benzene)" {...field}
                         className="font-mono"
                         aria-label="SMILES String Input"
                         />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="targetProtein"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                         <Target className="mr-2 h-4 w-4 text-muted-foreground" /> Target Protein (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                         placeholder="e.g., ACE2, EGFR" {...field}
                         aria-label="Target Protein Input"
                         />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="query"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Analysis Query</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Analyze potential efficacy and toxicity."
                          rows={4}
                          {...field}
                           aria-label="Analysis Query Input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading || isFetchingPubChem} className="w-full">
                  {isFetchingPubChem ? (
                     <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Fetching PubChem Data...
                    </>
                  ) : isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Run Analysis'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* PubChem Details Card */}
        <PubChemDetailsCard molecule={pubChemDetails} isLoading={isFetchingPubChem} />

        {/* Molecular Visualization (Dynamically Imported) */}
        <MolecularVisualization
          smiles={pubChemDetails?.canonicalSmiles}
          isLoading={isFetchingPubChem}
        />
      </div>

       {/* Results Display Area */}
       {/* Keep results display separate */}
       <div className="space-y-8">
         <ResultsDisplay results={analysisResult} error={error} isLoading={isLoading && !isFetchingPubChem} />
       </div>


    </div>
  );
}
