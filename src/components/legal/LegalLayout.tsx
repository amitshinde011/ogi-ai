
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface LegalLayoutProps {
  children: React.ReactNode;
  lastUpdated: string;
}

const LegalLayout = ({ children, lastUpdated }: LegalLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-peaceful p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-8 space-y-6">
            <div className="text-sm text-slate-600 mb-4">
              Last updated: {lastUpdated}
            </div>
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LegalLayout;
