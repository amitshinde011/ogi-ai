
import { supabase } from '@/integrations/supabase/client';

interface PaymentSessionData {
  orderId: string;
  sessionData: any;
  gateway: string;
}

export const createPaymentSession = async (
  program: any,
  gateway: 'braintree' | 'razorpay'
): Promise<PaymentSessionData> => {
  const { data: { user } } = await supabase.auth.getUser();
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

export const handleBraintreePayment = async (
  sessionData: any,
  onSuccess: (orderId: string, transactionId: string) => void
) => {
  try {
    console.log('Starting Braintree payment process');
    
    // Load Braintree script if not already loaded
    if (!window.braintree) {
      console.log('Loading Braintree script...');
      const script = document.createElement('script');
      script.src = 'https://js.braintreegateway.com/web/3.103.0/js/client.min.js';
      document.head.appendChild(script);
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });
      console.log('Braintree script loaded');
    }

    // For demo purposes, simulate successful payment after 2 seconds
    // In production, you would integrate with Braintree Drop-in UI here
    console.log('Processing Braintree payment...');
    setTimeout(async () => {
      const transactionId = 'braintree_txn_' + Date.now();
      console.log('Braintree payment completed:', transactionId);
      await onSuccess(sessionData.orderId, transactionId);
    }, 2000);
    
  } catch (error) {
    console.error('Braintree payment error:', error);
    throw new Error('Braintree payment failed: ' + error.message);
  }
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
      name: 'Yogi-ai',
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
