
export interface PricingCalculation {
  originalPrice: number;
  discountPercentage: number;
  discountAmount: number;
  discountedPrice: number;
  taxPercentage: number;
  taxAmount: number;
  finalPrice: number;
}

export const calculatePricing = (
  originalPrice: number,
  discountPercentage: number = 0,
  taxPercentage: number = 0
): PricingCalculation => {
  const discountAmount = (originalPrice * discountPercentage) / 100;
  const discountedPrice = originalPrice - discountAmount;
  const taxAmount = (discountedPrice * taxPercentage) / 100;
  const finalPrice = discountedPrice + taxAmount;

  return {
    originalPrice,
    discountPercentage,
    discountAmount,
    discountedPrice,
    taxPercentage,
    taxAmount,
    finalPrice
  };
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const symbol = currency === 'INR' ? '₹' : '$';
  return `${symbol}${amount.toFixed(2)}`;
};
