
import React from 'react';
import { Control } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';

interface ComfortQuestionsSectionProps {
  control: Control<any>;
  onSliderChange?: (field: string, value: number) => void;
  fieldMessages?: {[key: string]: string};
}

const ComfortQuestionsSection = ({ control, onSliderChange, fieldMessages = {} }: ComfortQuestionsSectionProps) => {
  const getComfortLabel = (value: number) => {
    const labels = {
      1: 'Very Uncomfortable',
      2: 'Uncomfortable', 
      3: 'Somewhat Comfortable',
      4: 'Comfortable',
      5: 'Very Comfortable'
    };
    return labels[value as keyof typeof labels] || 'Somewhat Comfortable';
  };

  const questions = [
    {
      name: 'walk_10km_comfort',
      label: 'How comfortable would you feel walking 10km right now?'
    },
    {
      name: 'run_10km_comfort', 
      label: 'How comfortable would you feel running 10km right now?'
    },
    {
      name: 'climb_mountain_comfort',
      label: 'How comfortable would you feel climbing a mountain right now?'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-primary mb-6">How do you feel about these activities?</h3>
        
        {questions.map((question) => (
          <div key={question.name}>
            <FormField
              control={control}
              name={question.name}
              render={({ field }) => (
                <FormItem className="space-y-4 mb-8">
                  <FormLabel className="text-base font-medium text-gray-800">
                    {question.label}
                  </FormLabel>
                  <div className="space-y-3">
                    <FormControl>
                      <Slider
                        value={[field.value]}
                        onValueChange={(values) => {
                          field.onChange(values[0]);
                          if (onSliderChange) {
                            onSliderChange(question.name, values[0]);
                          }
                        }}
                        max={5}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </FormControl>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Very Uncomfortable</span>
                      <span className="font-medium text-primary">
                        {getComfortLabel(field.value)}
                      </span>
                      <span>Very Comfortable</span>
                    </div>
                  </div>
                </FormItem>
              )}
            />
            {fieldMessages[question.name] && (
              <div className="mt-3 mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 flex items-center">
                  <span className="mr-2">✓</span>
                  {fieldMessages[question.name]}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComfortQuestionsSection;
