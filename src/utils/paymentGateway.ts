
import { supabase } from '@/integrations/supabase/client';

interface PaymentSessionData {
  orderId: string;
  sessionData: any;
  gateway: string;
}

export const createPaymentSession = async (
  program: any,
  user: any,
  gateway: 'razorpay'
): Promise<PaymentSessionData> => {
  if (!user) {
    throw new Error('User not authenticated');
  }

  // If the final price is 0 or very close to 0 (100% discount), don't create a payment session
  const finalPrice = program.finalPrice || program.displayPrice;
  if (finalPrice <= 0.01) {
    throw new Error('FREE_SUBSCRIPTION');
  }

  console.log('Creating payment session:', {
    userId: user.id,
    programId: program.id,
    gateway,
    amount: finalPrice,
    currency: program.currency
  });

  const { data, error } = await supabase.functions.invoke('process-payment', {
    body: {
      action: 'create_payment_session',
      userId: user.id,
      programId: program.id,
      gateway,
      amount: finalPrice,
      currency: program.currency
    }
  });

  if (error) {
    console.error('Payment session creation error:', error);
    throw new Error(error.message || 'Failed to create payment session');
  }

  console.log('Payment session created successfully:', data);
  return data;
};

export const handleRazorpayPayment = async (
  sessionData: any,
  program: any,
  onSuccess: (orderId: string, transactionId: string) => void
) => {
  try {
    console.log('Starting Razorpay payment process');
    
    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      console.log('Loading Razorpay script...');
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.head.appendChild(script);
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });
      console.log('Razorpay script loaded');
    }

    const options = {
      key: sessionData.sessionData.keyId,
      amount: sessionData.sessionData.amount,
      currency: sessionData.sessionData.currency,
      name: 'Yogi',
      description: `Payment for ${program?.name || 'Program'}`,
      order_id: sessionData.sessionData.orderId,
      handler: async (response: any) => {
        console.log('Razorpay payment completed:', response);
        await onSuccess(sessionData.orderId, response.razorpay_payment_id);
      },
      prefill: {
        name: '',
        email: '',
        contact: ''
      },
      theme: {
        color: '#3399cc'
      },
      modal: {
        ondismiss: () => {
          console.log('Razorpay payment dismissed');
          throw new Error('Payment was cancelled by user');
        }
      }
    };

    console.log('Opening Razorpay checkout with options:', options);
    const razorpay = new window.Razorpay(options);
    razorpay.open();
    
  } catch (error) {
    console.error('Razorpay payment error:', error);
    throw new Error('Razorpay payment failed: ' + error.message);
  }
};
