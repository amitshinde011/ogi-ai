
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
    
    // Load Braintree scripts if not already loaded
    if (!window.braintree) {
      console.log('Loading Braintree scripts...');
      
      // Load client script
      const clientScript = document.createElement('script');
      clientScript.src = 'https://js.braintreegateway.com/web/3.103.0/js/client.min.js';
      document.head.appendChild(clientScript);
      
      await new Promise((resolve, reject) => {
        clientScript.onload = resolve;
        clientScript.onerror = reject;
      });
      
      // Load dropin script
      const dropinScript = document.createElement('script');
      dropinScript.src = 'https://js.braintreegateway.com/web/dropin/1.41.0/js/dropin.min.js';
      document.head.appendChild(dropinScript);
      
      await new Promise((resolve, reject) => {
        dropinScript.onload = resolve;
        dropinScript.onerror = reject;
      });
      
      console.log('Braintree scripts loaded');
    }

    // Create or get the dropin container
    let dropinContainer = document.getElementById('braintree-dropin-container');
    if (!dropinContainer) {
      dropinContainer = document.createElement('div');
      dropinContainer.id = 'braintree-dropin-container';
      dropinContainer.style.position = 'fixed';
      dropinContainer.style.top = '50%';
      dropinContainer.style.left = '50%';
      dropinContainer.style.transform = 'translate(-50%, -50%)';
      dropinContainer.style.zIndex = '9999';
      dropinContainer.style.backgroundColor = 'white';
      dropinContainer.style.padding = '20px';
      dropinContainer.style.borderRadius = '8px';
      dropinContainer.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
      dropinContainer.style.maxWidth = '400px';
      dropinContainer.style.width = '90%';
      
      // Add close button
      const closeButton = document.createElement('button');
      closeButton.innerHTML = '×';
      closeButton.style.position = 'absolute';
      closeButton.style.top = '10px';
      closeButton.style.right = '15px';
      closeButton.style.background = 'none';
      closeButton.style.border = 'none';
      closeButton.style.fontSize = '24px';
      closeButton.style.cursor = 'pointer';
      closeButton.onclick = () => {
        document.body.removeChild(dropinContainer);
        throw new Error('Payment was cancelled by user');
      };
      dropinContainer.appendChild(closeButton);
      
      // Add backdrop
      const backdrop = document.createElement('div');
      backdrop.style.position = 'fixed';
      backdrop.style.top = '0';
      backdrop.style.left = '0';
      backdrop.style.width = '100%';
      backdrop.style.height = '100%';
      backdrop.style.backgroundColor = 'rgba(0,0,0,0.5)';
      backdrop.style.zIndex = '9998';
      backdrop.onclick = () => {
        document.body.removeChild(dropinContainer);
        document.body.removeChild(backdrop);
        throw new Error('Payment was cancelled by user');
      };
      
      document.body.appendChild(backdrop);
      document.body.appendChild(dropinContainer);
    } else {
      // Clear existing content
      dropinContainer.innerHTML = '';
    }

    console.log('Creating Braintree Drop-in with token:', sessionData.sessionData.token);

    // Create Braintree Drop-in
    window.braintree.dropin.create({
      authorization: sessionData.sessionData.token,
      container: '#braintree-dropin-container',
      paypal: {
        flow: 'checkout',
        amount: sessionData.sessionData.amount,
        currency: sessionData.sessionData.currency
      },
      card: {
        cardholderName: {
          required: true
        }
      }
    }, (createErr: any, instance: any) => {
      if (createErr) {
        console.error('Braintree Drop-in creation error:', createErr);
        throw new Error('Failed to initialize Braintree payment form');
      }

      console.log('Braintree Drop-in created successfully');

      // Add submit button
      const submitButton = document.createElement('button');
      submitButton.textContent = 'Pay Now';
      submitButton.style.width = '100%';
      submitButton.style.padding = '12px';
      submitButton.style.backgroundColor = '#007bff';
      submitButton.style.color = 'white';
      submitButton.style.border = 'none';
      submitButton.style.borderRadius = '4px';
      submitButton.style.fontSize = '16px';
      submitButton.style.cursor = 'pointer';
      submitButton.style.marginTop = '20px';
      
      submitButton.onclick = () => {
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';
        
        instance.requestPaymentMethod((paymentErr: any, payload: any) => {
          if (paymentErr) {
            console.error('Braintree payment method error:', paymentErr);
            submitButton.disabled = false;
            submitButton.textContent = 'Pay Now';
            return;
          }

          console.log('Braintree payment method obtained:', payload.nonce);
          
          // Clean up UI
          const container = document.getElementById('braintree-dropin-container');
          const backdrop = document.querySelector('[style*="rgba(0,0,0,0.5)"]') as HTMLElement;
          if (container) document.body.removeChild(container);
          if (backdrop) document.body.removeChild(backdrop);
          
          // Call success callback with payment nonce as transaction ID
          onSuccess(sessionData.orderId, payload.nonce);
        });
      };
      
      dropinContainer.appendChild(submitButton);
    });
    
  } catch (error) {
    console.error('Braintree payment error:', error);
    // Clean up UI on error
    const container = document.getElementById('braintree-dropin-container');
    const backdrop = document.querySelector('[style*="rgba(0,0,0,0.5)"]') as HTMLElement;
    if (container) document.body.removeChild(container);
    if (backdrop) document.body.removeChild(backdrop);
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
