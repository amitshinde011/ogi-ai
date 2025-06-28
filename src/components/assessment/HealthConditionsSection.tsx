
import React from 'react';
import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

interface HealthConditionsSectionProps {
  control: Control<any>;
  onFieldChange?: (field: string, value: string) => void;
  fieldMessages?: {[key: string]: string};
}

const HealthConditionsSection: React.FC<HealthConditionsSectionProps> = ({ 
  control, 
  onFieldChange,
  fieldMessages = {} 
}) => {
  return (
    <div className="space-y-8">
      <div>
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
                  onChange={(e) => {
                    field.onChange(e);
                    if (onFieldChange) {
                      onFieldChange('current_health_conditions', e.target.value);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {fieldMessages.current_health_conditions && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 flex items-center">
              <span className="mr-2">✓</span>
              {fieldMessages.current_health_conditions}
            </p>
          </div>
        )}
      </div>

      <div>
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
                  onChange={(e) => {
                    field.onChange(e);
                    if (onFieldChange) {
                      onFieldChange('comments', e.target.value);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {fieldMessages.comments && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 flex items-center">
              <span className="mr-2">✓</span>
              {fieldMessages.comments}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthConditionsSection;
