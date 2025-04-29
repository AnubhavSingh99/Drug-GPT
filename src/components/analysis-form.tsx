
'use client';

// Import locally defined types from flow or shared types file
import type { AnalyzeDrugCandidateInput, AnalyzeDrugCandidateOutput } from '@/ai/flows/analyze-drug-candidate';
import { analyzeDrugCandidate } from '@/ai/flows/analyze-drug-candidate';
import type { Molecule } from '@/services/pubchem';
import { getMoleculeBySmiles } from '@/services/pubchem';
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
import { DeepPurposeDetailsCard } from '@/components/deeppurpose-details-card';
import { ChemblDetailsCard } from '@/components/chembl-details-card'; // Stays same, but represents DB data now
import { Loader2, TestTubeDiagonal, Target } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const seemsLikeFormula = (input: string): boolean => {
   if (/\s/.test(input)) return false;
   return /([A-Z][a-z]?\d{2,})|([A-Z][a-z]?[2-9](?![a-zA-Z\(]))/.test(input);
};

export function AnalysisForm() {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeDrugCandidateOutput | null>(null);
  const [pubChemDetails, setPubChemDetails] = useState<Molecule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'idle' | 'pubchem' | 'analysis'>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState("pubchem");
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
    console.log("Form submitted with values:", values);
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setPubChemDetails(null);
    setLoadingStage('pubchem');
    setActiveTab("pubchem");

    try {
      console.log("Step 1: Calling getMoleculeBySmiles...");
      const moleculeData = await getMoleculeBySmiles(values.smiles);
      console.log("Step 1: getMoleculeBySmiles returned:", moleculeData);

      if (!moleculeData) {
        console.log("Step 1: PubChem data not found.");
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
        setLoadingStage('idle');
        setIsLoading(false);
        return;
      }

      console.log("Step 1: PubChem data fetched successfully.");
      setPubChemDetails(moleculeData);
      toast({
         title: "PubChem Data Fetched",
         description: `Successfully retrieved details for CID ${moleculeData.cid}. Now running analysis...`,
      });
      setLoadingStage('analysis');
      setActiveTab("analysis");


      console.log("Step 2: Calling analyzeDrugCandidate...");
      const input: AnalyzeDrugCandidateInput = {
        smiles: moleculeData.canonicalSmiles,
        targetProtein: values.targetProtein,
        query: values.query,
      };
      const result = await analyzeDrugCandidate(input);
      console.log("Step 2: analyzeDrugCandidate returned:", result);
      setAnalysisResult(result);
      toast({
        title: "Analysis Complete",
        description: "Drug candidate analysis finished successfully.",
      });

    } catch (err: any) {
      console.error('Analysis error caught in form:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during analysis.';
      setError(err instanceof Error ? err : new Error(errorMessage));
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: errorMessage,
      });
       setAnalysisResult(null);
       if (loadingStage === 'pubchem') {
            setActiveTab("pubchem");
       } else {
           setActiveTab("analysis");
       }

    } finally {
      console.log("Analysis process finished (finally block).");
      setLoadingStage('idle');
      setIsLoading(false);
    }
  }

  const isPubChemTabDisabled = !pubChemDetails && loadingStage !== 'pubchem';
  const isAnalysisRunning = loadingStage === 'analysis';
  // Updated variable name and logic to reflect Database check
  const isDatabaseTabDisabled = (!analysisResult?.chemblData && !isAnalysisRunning) || isLoading;
  const isDeepPurposeTabDisabled = (!analysisResult?.deepPurposeData && !isAnalysisRunning) || isLoading;
  const isAnalysisTabDisabled = (!analysisResult?.synthesizedAnalysis && !isAnalysisRunning && !error) || isLoading;


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
                         disabled={isLoading}
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
                          disabled={isLoading}
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
                           disabled={isLoading}
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
                      {loadingStage === 'pubchem' ? 'Fetching PubChem Data...' : 'Analyzing...'}
                    </>
                  ) : (
                    'Run Analysis'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

         <MolecularVisualization
          smiles={pubChemDetails?.canonicalSmiles}
          isLoading={loadingStage === 'pubchem'}
        />
      </div>

      {/* Right Column: Results Tabs */}
      <div className="space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
           <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pubchem" disabled={isPubChemTabDisabled && !isLoading}>PubChem</TabsTrigger>
            {/* Updated tab name */}
            <TabsTrigger value="database" disabled={isDatabaseTabDisabled}>Database</TabsTrigger>
            <TabsTrigger value="deeppurpose" disabled={isDeepPurposeTabDisabled}>DeepPurpose</TabsTrigger>
            <TabsTrigger value="analysis" disabled={isAnalysisTabDisabled}>Analysis</TabsTrigger>
          </TabsList>

          {/* PubChem Tab Content */}
          <TabsContent value="pubchem">
             <PubChemDetailsCard molecule={pubChemDetails} isLoading={loadingStage === 'pubchem'} />
             {!pubChemDetails && !isLoading && !error && (
                <Card className="shadow-md mt-4 border-dashed">
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        PubChem details will appear here after submitting a valid SMILES string.
                    </CardContent>
                </Card>
             )}
          </TabsContent>

          {/* Database (ChEMBL) Tab Content */}
           <TabsContent value="database"> {/* Updated tab value */}
              {(isAnalysisRunning || analysisResult?.chemblData) && (
                 <ChemblDetailsCard // Component name stays the same
                    drug={analysisResult?.chemblData} // Prop name stays same
                    isLoading={isAnalysisRunning && !analysisResult}
                />
              )}
              {!isLoading && analysisResult && !analysisResult.chemblData && (
                 <Card className="shadow-md mt-4 border-dashed">
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        No relevant information was found in the database or requested for this analysis. {/* Updated text */}
                    </CardContent>
                </Card>
             )}
               {!isLoading && !analysisResult && !error && !pubChemDetails && (
                 <Card className="shadow-md mt-4 border-dashed">
                    <CardContent className="pt-6 text-center text-muted-foreground">
                       Database details will appear here if relevant to the analysis. {/* Updated text */}
                    </CardContent>
                </Card>
             )}
          </TabsContent>

          {/* DeepPurpose Tab Content */}
           <TabsContent value="deeppurpose">
               {(isAnalysisRunning || analysisResult?.deepPurposeData) && (
                 <DeepPurposeDetailsCard
                    result={analysisResult?.deepPurposeData}
                    isLoading={isAnalysisRunning && !analysisResult}
                 />
              )}
              {!isLoading && analysisResult && !analysisResult.deepPurposeData && (
                 <Card className="shadow-md mt-4 border-dashed">
                    <CardContent className="pt-6 text-center text-muted-foreground">
                       No DeepPurpose prediction was generated or requested for this analysis.
                    </CardContent>
                </Card>
             )}
               {!isLoading && !analysisResult && !error && !pubChemDetails && (
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
                results={analysisResult ? { analysis: analysisResult.synthesizedAnalysis } : null}
                error={error}
                isLoading={isAnalysisRunning && !analysisResult}
                />
               {!isLoading && !analysisResult && !error && !pubChemDetails && (
                 <Card className="shadow-md mt-4 border-dashed">
                    <CardContent className="pt-6 text-center text-muted-foreground">
                       Synthesized analysis results will appear here after submitting the form.
                    </CardContent>
                </Card>
             )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
