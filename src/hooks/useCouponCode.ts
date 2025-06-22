
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CouponCode {
  id: string;
  code: string;
  discount_percentage: number;
  is_active: boolean;
  usage_limit?: number;
  usage_count: number;
  valid_from?: string;
  valid_until?: string;
}

export const useCouponCode = () => {
  const [appliedCoupon, setAppliedCoupon] = useState<CouponCode | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const validateCoupon = async (code: string): Promise<boolean> => {
    if (!code.trim()) {
      toast({
        title: "Invalid Coupon",
        description: "Please enter a coupon code.",
        variant: "destructive",
      });
      return false;
    }

    setIsValidating(true);
    
    try {
      const { data, error } = await supabase
        .from('coupon_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error validating coupon:', error);
        toast({
          title: "Error",
          description: "Failed to validate coupon code.",
          variant: "destructive",
        });
        return false;
      }

      if (!data) {
        toast({
          title: "Invalid Coupon",
          description: "Coupon code not found or expired.",
          variant: "destructive",
        });
        return false;
      }

      // Check if coupon is still valid by date
      const now = new Date();
      if (data.valid_from && new Date(data.valid_from) > now) {
        toast({
          title: "Invalid Coupon",
          description: "Coupon code is not yet valid.",
          variant: "destructive",
        });
        return false;
      }

      if (data.valid_until && new Date(data.valid_until) < now) {
        toast({
          title: "Invalid Coupon",
          description: "Coupon code has expired.",
          variant: "destructive",
        });
        return false;
      }

      // Check usage limit
      if (data.usage_limit && data.usage_count >= data.usage_limit) {
        toast({
          title: "Invalid Coupon",
          description: "Coupon code usage limit reached.",
          variant: "destructive",
        });
        return false;
      }

      setAppliedCoupon(data);
      toast({
        title: "Coupon Applied!",
        description: `${data.discount_percentage}% discount applied successfully.`,
      });
      return true;
    } catch (error) {
      console.error('Error validating coupon:', error);
      toast({
        title: "Error",
        description: "Failed to validate coupon code.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast({
      title: "Coupon Removed",
      description: "Coupon discount has been removed.",
    });
  };

  const getDiscountPercentage = (): number => {
    return appliedCoupon?.discount_percentage || 0;
  };

  return {
    appliedCoupon,
    isValidating,
    validateCoupon,
    removeCoupon,
    getDiscountPercentage,
  };
};
