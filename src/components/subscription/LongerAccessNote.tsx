import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles } from 'lucide-react';

export const LongerAccessNote: React.FC = () => {
  return (
    <aside aria-label="Longer access note" className="max-w-3xl mx-auto mt-2 sm:mt-4 mb-6">
      <Alert className="bg-primary/10 border-primary/30 text-primary shadow-sm">
        <Sparkles className="h-5 w-5" />
        <AlertDescription className="text-sm sm:text-base font-medium">
          Longer access unlocks deeper diet support—designed to keep you active, ecstatic, and energized.
        </AlertDescription>
      </Alert>
    </aside>
  );
};
