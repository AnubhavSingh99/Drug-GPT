'use client';

import type { Molecule } from '@/services/pubchem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BeakerIcon, Info, Loader2 } from 'lucide-react'; // Using BeakerIcon and Info
import { Skeleton } from "@/components/ui/skeleton";

interface PubChemDetailsCardProps {
  molecule: Molecule | null;
  isLoading: boolean;
}

export function PubChemDetailsCard({ molecule, isLoading }: PubChemDetailsCardProps) {
  if (isLoading) {
     return (
      <Card className="shadow-md animate-pulse">
        <CardHeader>
           <CardTitle className="text-xl flex items-center">
            <BeakerIcon className="mr-2 h-5 w-5" />
            Molecule Details (PubChem)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
           <div className="flex justify-between">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/2" />
           </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-2/5" />
           </div>
           <div className="flex justify-between">
              <Skeleton className="h-4 w-1/5" />
              <Skeleton className="h-4 w-3/4" />
           </div>
           <div className="flex justify-between">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/2" />
           </div>
           <div className="flex justify-between">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/3" />
           </div>
        </CardContent>
      </Card>
    );
  }


  if (!molecule) {
    // Don't render the card if there's no molecule data and not loading
    return null;
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <BeakerIcon className="mr-2 h-5 w-5 text-primary" />
          Molecule Details (PubChem)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="font-medium text-muted-foreground">PubChem CID:</span>
          <span className="font-mono">{molecule.cid}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-muted-foreground">Formula:</span>
          <span className="font-mono">{molecule.molecularFormula}</span>
        </div>
         <div className="flex justify-between items-start">
          <span className="font-medium text-muted-foreground mr-2">IUPAC Name:</span>
          <span className="text-right">{molecule.iupacName || <span className="italic text-muted-foreground">Not Available</span>}</span>
        </div>
         <div className="flex justify-between items-start">
          <span className="font-medium text-muted-foreground mr-2">Canonical SMILES:</span>
          <span className="font-mono text-right break-all">{molecule.canonicalSmiles}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-muted-foreground">Molecular Weight:</span>
          <span>{molecule.molecularWeight.toFixed(3)} g/mol</span>
        </div>
      </CardContent>
    </Card>
  );
}
