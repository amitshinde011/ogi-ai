
import React from 'react';
import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

interface HealthConditionsSectionProps {
  control: Control<any>;
}

const HealthConditionsSection: React.FC<HealthConditionsSectionProps> = ({ control }) => {
  return (
    <div className="space-y-8">
      <FormField
        control={control}
        name="current_health_conditions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Current Health Conditions (Optional)</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Describe any current health conditions..."
                className="min-h-[80px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="comments"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Comments (Optional)</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Share your thoughts about starting the program..."
                className="min-h-[80px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default HealthConditionsSection;
