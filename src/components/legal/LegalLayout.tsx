
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ContentContainer from '../ContentContainer';

interface LegalLayoutProps {
  children: React.ReactNode;
  lastUpdated: string;
}

const LegalLayout = ({ children, lastUpdated }: LegalLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-peaceful p-4">
      <ContentContainer variant="legal">
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-8 space-y-6">
            <div className="text-sm text-slate-600 mb-4">
              Last updated: {lastUpdated}
            </div>
            {children}
          </CardContent>
        </Card>
      </ContentContainer>
    </div>
  );
};

export default LegalLayout;
