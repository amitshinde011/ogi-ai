
import React from 'react';
import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import ComfortSlider from '@/components/ComfortSlider';

interface ComfortQuestionsSectionProps {
  control: Control<any>;
}

const ComfortQuestionsSection: React.FC<ComfortQuestionsSectionProps> = ({ control }) => {
  return (
    <div className="space-y-8">
      <FormField
        control={control}
        name="walk_10km_comfort"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <ComfortSlider
                label="How comfortable do you feel walking 10km?"
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="run_10km_comfort"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <ComfortSlider
                label="How comfortable do you feel running 10km?"
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="climb_mountain_comfort"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <ComfortSlider
                label="How comfortable do you feel climbing a small mountain?"
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ComfortQuestionsSection;
