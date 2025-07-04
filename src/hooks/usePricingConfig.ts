
import { useState, useEffect } from 'react';

interface PricingConfig {
  discountPercentage: number;
  taxPercentage: number;
  isSpecialOccasion: boolean;
  occasionName?: string;
}

export const usePricingConfig = () => {
  const [config, setConfig] = useState<PricingConfig>({
    discountPercentage: 0,
    taxPercentage: 0,
    isSpecialOccasion: false,
  });

  useEffect(() => {
    // You can fetch this from your backend or configure it here
    // For now, I'll set some example values
    const currentDate = new Date();
    const isHoliday = checkForSpecialOccasions(currentDate);
    
    setConfig({
      discountPercentage: isHoliday ? 20 : 0, // 20% discount during special occasions
      taxPercentage: 18, // 18% tax (you can adjust this)
      isSpecialOccasion: isHoliday,
      occasionName: isHoliday ? 'Today Special' : undefined,
    });
  }, []);

  const checkForSpecialOccasions = (date: Date): boolean => {
    // Add your special occasion logic here
    // For example, check for holidays, special events, etc.
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Example: New Year (January 1), Christmas (December 25)
    return (month === 1 && day === 1) || (month === 12 && day === 25);
  };

  return config;
};
