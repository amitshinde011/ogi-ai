
export interface PricingCalculation {
  originalPrice: number;
  discountPercentage: number;
  discountAmount: number;
  discountedPrice: number;
  couponDiscountPercentage: number;
  couponDiscountAmount: number;
  taxPercentage: number;
  taxAmount: number;
  finalPrice: number;
}

export const calculatePricing = (
  originalPrice: number,
  discountPercentage: number = 0,
  taxPercentage: number = 0,
  couponDiscountPercentage: number = 0
): PricingCalculation => {
  const discountAmount = (originalPrice * discountPercentage) / 100;
  const discountedPrice = originalPrice - discountAmount;
  
  // Apply coupon discount to the already discounted price
  const couponDiscountAmount = (discountedPrice * couponDiscountPercentage) / 100;
  const priceAfterCoupon = discountedPrice - couponDiscountAmount;
  
  const taxAmount = (priceAfterCoupon * taxPercentage) / 100;
  const finalPrice = priceAfterCoupon + taxAmount;

  return {
    originalPrice,
    discountPercentage,
    discountAmount,
    discountedPrice,
    couponDiscountPercentage,
    couponDiscountAmount,
    taxPercentage,
    taxAmount,
    finalPrice
  };
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const symbol = currency === 'INR' ? '₹' : '$';
  return `${symbol}${amount.toFixed(2)}`;
};
