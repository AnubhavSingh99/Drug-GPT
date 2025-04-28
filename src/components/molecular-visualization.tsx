
'use client';

import React, { useEffect, useRef } from 'react';
// Note: $3Dmol import remains, but the component itself is dynamically imported elsewhere.
import $3Dmol from '3dmol'; // Import the standard 3Dmol library
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { View } from 'lucide-react'; // Using a generic view icon

interface MolecularVisualizationProps {
  smiles: string | null | undefined; // Accept canonical SMILES
  isLoading: boolean; // Prop to indicate if related data (PubChem) is loading AND no smiles data is yet available
}

// Molecule Icon SVG
const MoleculeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5">
     <path d="M12 2v10"/>
     <path d="M18.4 6.6a9 9 0 1 1-12.77.04"/>
     <path d="M21 12h-6"/>
     <path d="M3 12H9"/>
     <path d="m12 18.5 4-4"/>
     <path d="m8 14.5 4 4"/>
  </svg>
);

export function MolecularVisualization({ smiles, isLoading }: MolecularVisualizationProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const glviewer = useRef<any>(null); // To store the viewer instance

  useEffect(() => {
    // Ensure the viewer container exists and $3Dmol is available (client-side check)
    if (!viewerRef.current || typeof $3Dmol === 'undefined') return;

    // Cleanup previous viewer instance if smiles changes or component unmounts
    if (glviewer.current) {
       // $3Dmol doesn't have a standard destroy method. Clearing the container is a common approach.
       viewerRef.current.innerHTML = '';
       glviewer.current = null;
    }

    // If we have a SMILES string, create a new viewer
    if (smiles) {
      try {
        // Add a small delay to ensure the container is ready after potential skeleton removal
        setTimeout(() => {
          if (!viewerRef.current) return; // Check again in case component unmounted quickly
          const config = { backgroundColor: 'white' };
          const viewer = $3Dmol.createViewer(viewerRef.current, config);
          viewer.addModel(smiles, 'smiles');
          viewer.setStyle({}, { stick: {} });
          viewer.zoomTo();
          viewer.render();
          glviewer.current = viewer; // Store the instance
        }, 50); // 50ms delay, adjust if needed
      } catch (error) {
        console.error('Error creating 3Dmol viewer:', error);
        // Optionally, display an error message in the container
        if (viewerRef.current) {
          viewerRef.current.innerText = 'Error rendering molecule.';
        }
      }
    } else {
       // Clear the viewer area if smiles is null/undefined after being previously set
       if (viewerRef.current) {
           viewerRef.current.innerHTML = ''; // Clear previous rendering
       }
       glviewer.current = null;
    }

    // Cleanup function for component unmount
    return () => {
      if (glviewer.current && viewerRef.current) {
         // Basic cleanup, replace innerHTML
         viewerRef.current.innerHTML = '';
         glviewer.current = null;
      }
    };
  }, [smiles]); // Rerun effect when SMILES changes


  const renderContent = () => {
    // Show skeleton only when isLoading is true (meaning PubChem is fetching AND we don't have smiles yet).
    if (isLoading) {
      return <Skeleton className="h-64 w-full" />;
    }

    // If not loading and no SMILES string is available, show placeholder.
    if (!smiles) {
       return (
         <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-muted/20 rounded">
           <View className="h-12 w-12 mb-4" />
           <p className="text-center">Enter a valid SMILES string above to visualize the molecule.</p>
         </div>
       );
    }

    // If not loading and we have a SMILES string, render the viewer container div.
    // The useEffect hook will populate this div.
    return (
      <div
        ref={viewerRef}
        className="h-64 w-full relative bg-white rounded" // Added bg-white for consistency
        aria-label="Molecular structure visualization area"
      >
        {/* 3Dmol viewer will be rendered here by useEffect */}
      </div>
    );
  };


  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <MoleculeIcon />
          Molecular Visualization
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
