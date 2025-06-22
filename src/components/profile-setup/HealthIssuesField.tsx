
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface HealthIssuesFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const HealthIssuesField: React.FC<HealthIssuesFieldProps> = ({ value, onChange }) => {
  return (
    <div>
      <Label htmlFor="health-issues" className="text-dark-text">Existing Health Issues (if any)</Label>
      <Textarea
        id="health-issues"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Please describe any health conditions, medications, or concerns..."
        rows={3}
        className="bg-white border-gray-300 text-dark-text placeholder:text-gray-500 mt-2"
      />
    </div>
  );
};

export default HealthIssuesField;
