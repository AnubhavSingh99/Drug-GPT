
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
import { PubChemDetailsCard } from '@/components/pubchem-details-card';
import { DeepPurposeDetailsCard } from '@/components/deeppurpose-details-card'; // New component
import { DrugBankDetailsCard } from '@/components/drugbank-details-card'; // New component
import { Loader2, TestTubeDiagonal, Target } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" // Import Tabs components


// Dynamically import MolecularVisualization with SSR disabled
const MolecularVisualization = dynamic(
  () => import('@/components/molecular-visualization').then((mod) => mod.MolecularVisualization),
  {
    ssr: false,
    loading: () => (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Loading Visualization...</CardTitle>
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

// Simple regex to guess if a string might be a formula instead of SMILES
const seemsLikeFormula = (input: string): boolean => {
   if (/\s/.test(input)) return false;
   return /([A-Za-z][2-9])|([A-Za-z]\d{2,})|(\d[A-Za-z])/.test(input);
};

export function AnalysisForm() {
  // Separate states for different data pieces
  const [analysisResult, setAnalysisResult] = useState<AnalyzeDrugCandidateOutput | null>(null);
  const [pubChemDetails, setPubChemDetails] = useState<Molecule | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Combined loading state
  const [error, setError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState("analysis"); // Default tab
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
    setError(null);
    setAnalysisResult(null);
    setPubChemDetails(null);
    setActiveTab("pubchem"); // Switch to PubChem tab initially

    try {
      // 1. Fetch PubChem data first (essential)
      const moleculeData = await getMoleculeBySmiles(values.smiles);

      if (!moleculeData) {
        const inputIsLikelyFormula = seemsLikeFormula(values.smiles);
        const errorDescription = inputIsLikelyFormula
          ? `Invalid input: "${values.smiles}" looks like a molecular formula, not a SMILES string. Please provide a structural representation (e.g., 'c1ccccc1').`
          : `Could not retrieve molecule details for SMILES: "${values.smiles}". Please ensure the SMILES string is valid and exists in PubChem.`;

        toast({
          variant: "destructive",
          title: "PubChem Error",
          description: errorDescription,
        });
        setError(new Error('Failed to fetch PubChem data. Check SMILES validity.'));
        setIsLoading(false);
        return;
      }

      setPubChemDetails(moleculeData);
      toast({
         title: "PubChem Data Fetched",
         description: `Successfully retrieved details for CID ${moleculeData.cid}. Now running analysis...`,
      });
       setActiveTab("analysis"); // Switch to analysis tab after PubChem success


      // 2. Run the main analysis flow
      const input: AnalyzeDrugCandidateInput = {
        smiles: moleculeData.canonicalSmiles, // Use canonical SMILES
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
       // Clear AI results on error, but keep PubChem data if it was fetched
       setAnalysisResult(null);
       // setActiveTab("error"); // Or keep the current tab, maybe pubchem?
       if (!pubChemDetails) setActiveTab("pubchem"); // Go back to pubchem if it failed there
       else setActiveTab("analysis"); // Otherwise show the analysis tab with the error

    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left Column: Input Form and Visualization */}
      <div className="space-y-8">
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
                         disabled={isLoading} // Disable input while loading
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
                          disabled={isLoading} // Disable input while loading
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
                           disabled={isLoading} // Disable input while loading
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                     <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {pubChemDetails ? 'Analyzing...' : 'Fetching PubChem Data...'}
                    </>
                  ) : (
                    'Run Analysis'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

         {/* Molecular Visualization */}
         <MolecularVisualization
          smiles={pubChemDetails?.canonicalSmiles}
          isLoading={isLoading && !pubChemDetails} // Loading only when fetching pubchem
        />
      </div>

      {/* Right Column: Results Tabs */}
      <div className="space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pubchem" disabled={!pubChemDetails && !isLoading}>PubChem</TabsTrigger>
            <TabsTrigger value="drugbank" disabled={!analysisResult?.drugBankData && !isLoading}>DrugBank</TabsTrigger>
            <TabsTrigger value="deeppurpose" disabled={!analysisResult?.deepPurposeData && !isLoading}>DeepPurpose</TabsTrigger>
            <TabsTrigger value="analysis" disabled={!analysisResult?.synthesizedAnalysis && !isLoading && !error}>Analysis</TabsTrigger>
          </TabsList>

          {/* PubChem Tab Content */}
          <TabsContent value="pubchem">
             <PubChemDetailsCard molecule={pubChemDetails} isLoading={isLoading && !pubChemDetails} />
             {/* Placeholder or message if no data yet */}
             {!pubChemDetails && !isLoading && (
                <Card className="shadow-md mt-4 border-dashed">
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        PubChem details will appear here after fetching.
                    </CardContent>
                </Card>
             )}
          </TabsContent>

          {/* DrugBank Tab Content */}
           <TabsContent value="drugbank">
             <DrugBankDetailsCard drug={analysisResult?.drugBankData} isLoading={isLoading && !analysisResult} />
              {/* Message if analysis ran but no DrugBank data was found/returned */}
             {!isLoading && analysisResult && !analysisResult.drugBankData && (
                 <Card className="shadow-md mt-4 border-dashed">
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        No specific DrugBank information was found or relevant for this analysis.
                    </CardContent>
                </Card>
             )}
              {/* Placeholder before analysis runs */}
               {!isLoading && !analysisResult && !error && (
                 <Card className="shadow-md mt-4 border-dashed">
                    <CardContent className="pt-6 text-center text-muted-foreground">
                       DrugBank details will appear here if relevant to the analysis.
                    </CardContent>
                </Card>
             )}
          </TabsContent>

          {/* DeepPurpose Tab Content */}
           <TabsContent value="deeppurpose">
             <DeepPurposeDetailsCard result={analysisResult?.deepPurposeData} isLoading={isLoading && !analysisResult} />
              {/* Message if analysis ran but no DeepPurpose data was found/returned */}
              {!isLoading && analysisResult && !analysisResult.deepPurposeData && (
                 <Card className="shadow-md mt-4 border-dashed">
                    <CardContent className="pt-6 text-center text-muted-foreground">
                       No DeepPurpose prediction was generated or relevant for this analysis.
                    </CardContent>
                </Card>
             )}
              {/* Placeholder before analysis runs */}
               {!isLoading && !analysisResult && !error && (
                 <Card className="shadow-md mt-4 border-dashed">
                    <CardContent className="pt-6 text-center text-muted-foreground">
                       DeepPurpose prediction details will appear here if relevant to the analysis.
                    </CardContent>
                </Card>
             )}
          </TabsContent>

          {/* Analysis Tab Content */}
          <TabsContent value="analysis">
             <ResultsDisplay
                results={analysisResult ? { analysis: analysisResult.synthesizedAnalysis } : null} // Pass only synthesis here
                error={error} // Pass the main error state
                isLoading={isLoading && pubChemDetails != null} // Loading is true only *after* pubchem fetch succeeds
                />
                {/* Placeholder before analysis runs */}
               {!isLoading && !analysisResult && !error && (
                 <Card className="shadow-md mt-4 border-dashed">
                    <CardContent className="pt-6 text-center text-muted-foreground">
                       Synthesized analysis results will appear here.
                    </CardContent>
                </Card>
             )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
