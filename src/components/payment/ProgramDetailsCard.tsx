
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
    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg w-full">
      <h3 className="font-semibold text-base sm:text-lg mb-2">{program.name}</h3>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <span className="text-sm sm:text-base">Duration: {program.duration_days} days</span>
        <span className="text-xl sm:text-2xl font-bold text-primary">
          {currencySymbol}{program.displayPrice}
        </span>
      </div>
    </div>
  );
};
