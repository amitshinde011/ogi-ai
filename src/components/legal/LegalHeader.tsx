
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface LegalHeaderProps {
  title: string;
}

const LegalHeader = ({ title }: LegalHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center mb-6">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mr-4 p-2 hover:bg-white/20"
      >
        <ArrowLeft size={20} />
      </Button>
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
    </div>
  );
};

export default LegalHeader;
