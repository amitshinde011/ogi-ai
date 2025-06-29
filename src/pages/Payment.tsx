import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, CreditCard, CheckCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePayment } from '@/hooks/usePayment';
import { usePricingConfig } from '@/hooks/usePricingConfig';
import { useLocationDetection } from '@/hooks/useLocationDetection';
import { useCouponCode } from '@/hooks/useCouponCode';
import ProgramDetailsCard from '@/components/payment/ProgramDetailsCard';
import LocationGatewayInfo from '@/components/payment/LocationGatewayInfo';
import PaymentButton from '@/components/payment/PaymentButton';
import CouponCodeInput from '@/components/CouponCodeInput';
import PricingDisplay from '@/components/PricingDisplay';
import { Link } from 'react-router-dom';

const Payment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const programId = searchParams.get('program');
  const { processPayment, isLoading } = usePayment();
  const { config, isLoading: configLoading } = usePricingConfig();
  const { country, isIndia } = useLocationDetection();
  const {
    couponCode,
    setCouponCode,
    discount,
    isValidating,
    error: couponError,
    applyCoupon,
    removeCoupon
  } = useCouponCode();

  const [program, setProgram] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          navigate('/login');
          return;
        }

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', authUser.id)
          .single();

        setUser({ ...authUser, profile });

        // Fetch program data
        if (programId) {
          const { data: programData, error } = await supabase
            .from('programs')
            .select('*')
            .eq('id', programId)
            .single();

          if (error) throw error;
          setProgram(programData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load payment information",
          variant: "destructive"
        });
        navigate('/subscriptions');
      }
    };

    fetchData();
  }, [programId, navigate, toast]);

  if (configLoading || !program || !user || !config) {
    return (
      <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage"></div>
      </div>
    );
  }

  const basePrice = isIndia ? config.price_inr : config.price_usd;
  const currency = isIndia ? 'INR' : 'USD';
  const currencySymbol = isIndia ? '₹' : '$';
  const discountAmount = discount ? Math.round(basePrice * discount.discount_percentage / 100) : 0;
  const finalPrice = basePrice - discountAmount;

  const handlePayment = async () => {
    if (!program) return;

    try {
      await processPayment({
        programId: program.id,
        amount: finalPrice,
        currency,
        couponCode: discount?.code
      });
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-peaceful p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mr-4 p-2 hover:bg-white/20"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">Complete Payment</h1>
        </div>

        <div className="space-y-6">
          {/* Program Details */}
          <ProgramDetailsCard program={program} />

          {/* Location and Gateway Info */}
          <LocationGatewayInfo country={country} isIndia={isIndia} />

          {/* Coupon Code */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Coupon Code</CardTitle>
            </CardHeader>
            <CardContent>
              <CouponCodeInput
                couponCode={couponCode}
                setCouponCode={setCouponCode}
                discount={discount}
                isValidating={isValidating}
                error={couponError}
                onApply={applyCoupon}
                onRemove={removeCoupon}
              />
            </CardContent>
          </Card>

          {/* Pricing Summary */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <PricingDisplay
                basePrice={basePrice}
                discount={discount}
                finalPrice={finalPrice}
                currencySymbol={currencySymbol}
              />
            </CardContent>
          </Card>

          {/* Payment Button */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <PaymentButton
                onPayment={handlePayment}
                isLoading={isLoading}
                amount={finalPrice}
                currencySymbol={currencySymbol}
                disabled={!program}
              />
              
              {/* Legal Notice */}
              <div className="mt-4 text-center text-xs text-slate-600 space-y-2">
                <p>
                  By completing your payment, you agree to our{' '}
                  <Link to="/terms-and-conditions" className="text-sage hover:underline">
                    Terms & Conditions
                  </Link>
                  {' '}and{' '}
                  <Link to="/privacy-policy" className="text-sage hover:underline">
                    Privacy Policy
                  </Link>
                </p>
                <p>
                  Your data is protected and payment information is secure. View our{' '}
                  <Link to="/cancellations-refunds" className="text-sage hover:underline">
                    Cancellation & Refund Policy
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
            <Shield size={16} />
            <span>Payments are processed securely</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
