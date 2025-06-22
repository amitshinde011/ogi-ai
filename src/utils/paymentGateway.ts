
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

  if (error) throw error;
  return data;
};

export const handleBraintreePayment = async (
  sessionData: any,
  onSuccess: (orderId: string, transactionId: string) => void
) => {
  // Load Braintree script
  if (!window.braintree) {
    const script = document.createElement('script');
    script.src = 'https://js.braintreegateway.com/web/3.103.0/js/client.min.js';
    document.head.appendChild(script);
    
    await new Promise((resolve) => {
      script.onload = resolve;
    });
  }

  // For demo purposes, simulate successful payment
  // In a real implementation, you'd integrate with Braintree Drop-in UI
  setTimeout(async () => {
    await onSuccess(sessionData.orderId, 'braintree_txn_' + Date.now());
  }, 2000);
};

export const handleRazorpayPayment = async (
  sessionData: any,
  program: any,
  onSuccess: (orderId: string, transactionId: string) => void
) => {
  // Load Razorpay script
  if (!window.Razorpay) {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.head.appendChild(script);
    
    await new Promise((resolve) => {
      script.onload = resolve;
    });
  }

  const options = {
    key: sessionData.sessionData.keyId,
    amount: sessionData.sessionData.amount,
    currency: sessionData.sessionData.currency,
    name: 'Yogi-ai',
    description: `Payment for ${program?.name}`,
    order_id: sessionData.sessionData.orderId,
    handler: async (response: any) => {
      await onSuccess(sessionData.orderId, response.razorpay_payment_id);
    },
    prefill: {
      name: '',
      email: '',
      contact: ''
    },
    theme: {
      color: '#3399cc'
    }
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
};
