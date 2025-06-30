
import React from 'react';

interface LegalSectionProps {
  title: string;
  children: React.ReactNode;
}

const LegalSection = ({ title, children }: LegalSectionProps) => {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <div className="text-slate-700 space-y-3">
        {children}
      </div>
    </section>
  );
};

export default LegalSection;
