
'use client';

// Import flow types including Molprop
import type { AnalyzeDrugCandidateInput, AnalyzeDrugCandidateOutput } from '@/ai/flows/analyze-drug-candidate';
import { analyzeDrugCandidate } from '@/ai/flows/analyze-drug-candidate';
// Import Molprop type
import type { MolpropResult } from '@/services/molprop';
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
// Import the new Molprop details card
import { MolpropDetailsCard } from '@/components/molprop-details-card';
import { Loader2, TestTubeDiagonal, Target } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define Molecule type locally based on the expected output from the flow
interface Molecule {
  cid: number;
  molecularFormula: string;
  iupacName?: string;
  canonicalSmiles: string;
  molecularWeight: number;
}

// Dynamic import for molecular visualization
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

// Form schema remains the same
const formSchema = z.object({
  smiles: z.string().min(1, 'SMILES string is required.'),
  targetProtein: z.string().optional(),
  query: z.string().min(5, 'Please provide an analysis query (at least 5 characters).'),
});

type FormData = z.infer<typeof formSchema>;

// Helper function for basic SMILES/formula check
const seemsLikeFormula = (input: string): boolean => {
   if (/\s/.test(input)) return false;
   return /([A-Z][a-z]?\d{2,})|([A-Z][a-z]?[2-9](?![a-zA-Z\(]))/.test(input);
};

export function AnalysisForm() {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeDrugCandidateOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'idle' | 'analysis'>('idle');
  const [error, setError] = useState<Error | null>(null);
  // Default to PubChem tab initially
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
    setLoadingStage('analysis');
    setActiveTab("analysis"); // Switch to analysis tab view immediately

    try {
      const input: AnalyzeDrugCandidateInput = {
        smiles: values.smiles,
        targetProtein: values.targetProtein,
        query: values.query,
      };

      console.log("Calling analyzeDrugCandidate flow...");
      const result = await analyzeDrugCandidate(input);
      console.log("analyzeDrugCandidate flow returned:", result);

       if (!result.pubChemData) {
            console.error("Analysis flow succeeded but missing PubChem data unexpectedly.");
            throw new Error("Analysis completed, but essential PubChem data is missing.");
       }

       setAnalysisResult(result);

      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed molecule CID ${result.pubChemData.cid}.`,
      });

    } catch (err: any) {
      console.error('Analysis error caught in form:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during analysis.';
      setError(err instanceof Error ? err : new Error(errorMessage));

      let toastDescription = errorMessage;
       if (errorMessage.includes('PubChem tool execution failed')) {
          const inputIsLikelyFormula = seemsLikeFormula(values.smiles);
          toastDescription = inputIsLikelyFormula
            ? `Invalid input: "${values.smiles}" looks like a molecular formula, not a SMILES string. Please provide a structural representation (e.g., 'c1ccccc1').`
            : `Could not retrieve molecule details for SMILES: "${values.smiles}". Please ensure the SMILES string is valid and exists in PubChem.`;
        } else if (errorMessage.includes('Analysis failed: The AI model did not generate')) {
          toastDescription = 'The AI failed to generate an analysis. This might be a temporary issue or the query/molecule is complex.';
        } else if (errorMessage.includes('Analysis Flow Error:')) {
            toastDescription = errorMessage.replace('Analysis Flow Error: ', '');
             if (errorMessage.includes('Molprop tool execution failed')) {
                toastDescription = `Failed to get Molprop predictions for ${values.smiles}. The Molprop service might be unavailable or the SMILES invalid for prediction.`;
             }
        }


      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: toastDescription,
      });
       setAnalysisResult(null);
       setActiveTab("analysis");

    } finally {
      console.log("Analysis process finished (finally block).");
      setLoadingStage('idle');
      setIsLoading(false);
    }
  }

  // Derive PubChem and Molprop details from the analysis result
  const pubChemDetails = analysisResult?.pubChemData;
  const molpropDetails = analysisResult?.molpropData; // Use molpropData

  // Simplified tab disabling logic
  const isAnalysisRunning = loadingStage === 'analysis';
  const isPubChemTabDisabled = !pubChemDetails && !isAnalysisRunning;
  // Update disabling logic for Molprop tab
  const isMolpropTabDisabled = !molpropDetails && !isAnalysisRunning;
  const isAnalysisTabDisabled = !analysisResult?.synthesizedAnalysis && !isAnalysisRunning && !error;


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

         <MolecularVisualization
          smiles={pubChemDetails?.canonicalSmiles}
          isLoading={isAnalysisRunning && !pubChemDetails}
        />
      </div>

      {/* Right Column: Results Tabs */}
      <div className="space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
           <TabsList className="grid w-full grid-cols-3"> {/* Ensure 3 columns */}
            <TabsTrigger value="pubchem" disabled={isPubChemTabDisabled}>PubChem</TabsTrigger>
            {/* Update trigger for Molprop */}
            <TabsTrigger value="molprop" disabled={isMolpropTabDisabled}>Molprop</TabsTrigger>
            <TabsTrigger value="analysis" disabled={isAnalysisTabDisabled}>Analysis</TabsTrigger>
          </TabsList>

          {/* PubChem Tab Content */}
          <TabsContent value="pubchem">
             <PubChemDetailsCard
                molecule={pubChemDetails}
                isLoading={isAnalysisRunning && !pubChemDetails}
             />
             {!isLoading && !analysisResult && !error && (
                <Card className="shadow-md mt-4 border-dashed">
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        PubChem details will appear here after running an analysis.
                    </CardContent>
                </Card>
             )}
          </TabsContent>

          {/* Molprop Tab Content */}
           <TabsContent value="molprop">
               {(isAnalysisRunning || molpropDetails) && (
                 <MolpropDetailsCard
                    result={molpropDetails} // Pass molprop details
                    isLoading={isAnalysisRunning && !molpropDetails} // Show loading until Molprop data specifically arrives
                 />
              )}
              {/* Message when Molprop data is explicitly null/undefined after analysis */}
              {!isLoading && analysisResult && !molpropDetails && (
                 <Card className="shadow-md mt-4 border-dashed">
                    <CardContent className="pt-6 text-center text-muted-foreground">
                       No Molprop prediction was generated or requested for this analysis.
                    </CardContent>
                </Card>
             )}
              {/* Placeholder when no analysis has run yet */}
               {!isLoading && !analysisResult && !error && (
                 <Card className="shadow-md mt-4 border-dashed">
                    <CardContent className="pt-6 text-center text-muted-foreground">
                       Molprop prediction details will appear here if relevant to the analysis.
                    </CardContent>
                </Card>
             )}
          </TabsContent>

          {/* Analysis Tab Content */}
          <TabsContent value="analysis">
             <ResultsDisplay
                results={analysisResult ? { analysis: analysisResult.synthesizedAnalysis } : null}
                error={error}
                isLoading={isAnalysisRunning && !analysisResult?.synthesizedAnalysis}
                />
              {!isLoading && !analysisResult && !error && (
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
