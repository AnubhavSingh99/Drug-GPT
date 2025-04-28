import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EyeOff } from 'lucide-react';

export function VisualizationPlaceholder() {
  return (
    <Card className="mt-6 shadow-md">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.77.04"/><path d="M21 12h-6"/><path d="M3 12H9"/><path d="m12 18.5 4-4"/><path d="m8 14.5 4 4"/></svg>
          Molecular Visualization
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <EyeOff className="h-12 w-12 mb-4" />
        <p className="text-center">Visualization component to be implemented.</p>
        <p className="text-sm text-center">(Requires integration with a molecular visualization library)</p>
      </CardContent>
    </Card>
  );
}
