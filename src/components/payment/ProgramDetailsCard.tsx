
import React from 'react';

interface Program {
  id: string;
  name: string;
  price: number;
  duration_days: number;
  displayPrice: number;
  currency: string;
}

interface ProgramDetailsCardProps {
  program: Program;
  currencySymbol: string;
}

export const ProgramDetailsCard: React.FC<ProgramDetailsCardProps> = ({
  program,
  currencySymbol
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="font-semibold text-lg mb-2">{program.name}</h3>
      <div className="flex justify-between items-center">
        <span>Duration: {program.duration_days} days</span>
        <span className="text-2xl font-bold text-primary">
          {currencySymbol}{program.displayPrice}
        </span>
      </div>
    </div>
  );
};
