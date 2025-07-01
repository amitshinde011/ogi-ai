
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
  return new Promise((resolve, reject) => {
    try {
      console.log('Starting Braintree payment process');
      
      // Create payment modal
      const modal = document.createElement('div');
      modal.id = 'payment-modal';
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
      `;

      const modalContent = document.createElement('div');
      modalContent.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 8px;
        width: 90%;
        max-width: 500px;
        position: relative;
      `;

      const closeButton = document.createElement('button');
      closeButton.innerHTML = '×';
      closeButton.style.cssText = `
        position: absolute;
        top: 10px;
        right: 15px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
      `;
      closeButton.onclick = () => {
        document.body.removeChild(modal);
        reject(new Error('Payment cancelled'));
      };

      const title = document.createElement('h2');
      title.textContent = 'Complete Payment';
      title.style.cssText = 'margin-bottom: 1rem; color: #333;';

      const dropinContainer = document.createElement('div');
      dropinContainer.id = 'dropin-container';
      dropinContainer.style.cssText = 'margin-bottom: 1rem;';

      const payButton = document.createElement('button');
      payButton.textContent = 'Pay Now';
      payButton.style.cssText = `
        width: 100%;
        padding: 12px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;
        margin-top: 1rem;
      `;
      payButton.disabled = true;

      modalContent.appendChild(closeButton);
      modalContent.appendChild(title);
      modalContent.appendChild(dropinContainer);
      modalContent.appendChild(payButton);
      modal.appendChild(modalContent);
      document.body.appendChild(modal);

      // Load Braintree scripts
      const loadBraintreeScripts = () => {
        return new Promise((resolveScript, rejectScript) => {
          if (window.braintree) {
            resolveScript(null);
            return;
          }

          const clientScript = document.createElement('script');
          clientScript.src = 'https://js.braintreegateway.com/web/3.103.0/js/client.min.js';
          clientScript.onload = () => {
            const dropinScript = document.createElement('script');
            dropinScript.src = 'https://js.braintreegateway.com/web/dropin/1.41.0/js/dropin.min.js';
            dropinScript.onload = () => resolveScript(null);
            dropinScript.onerror = () => rejectScript(new Error('Failed to load Braintree Drop-in script'));
            document.head.appendChild(dropinScript);
          };
          clientScript.onerror = () => rejectScript(new Error('Failed to load Braintree client script'));
          document.head.appendChild(clientScript);
        });
      };

      loadBraintreeScripts().then(() => {
        console.log('Braintree scripts loaded, creating Drop-in');
        
        // Clear any existing content
        dropinContainer.innerHTML = '';
        
        // Create Drop-in
        window.braintree.dropin.create({
          authorization: sessionData.sessionData.token,
          container: dropinContainer,
          card: {
            cardholderName: {
              required: false
            }
          }
        }, (createErr, instance) => {
          if (createErr) {
            console.error('Braintree Drop-in creation error:', createErr);
            document.body.removeChild(modal);
            reject(new Error('Failed to initialize payment form: ' + createErr.message));
            return;
          }

          console.log('Braintree Drop-in created successfully');
          payButton.disabled = false;
          
          payButton.onclick = () => {
            payButton.disabled = true;
            payButton.textContent = 'Processing...';
            
            instance.requestPaymentMethod((paymentErr, payload) => {
              if (paymentErr) {
                console.error('Payment method error:', paymentErr);
                payButton.disabled = false;
                payButton.textContent = 'Pay Now';
                alert('Payment failed: ' + paymentErr.message);
                return;
              }

              console.log('Payment method obtained:', payload.nonce);
              document.body.removeChild(modal);
              onSuccess(sessionData.orderId, payload.nonce);
              resolve(null);
            });
          };
        });
      }).catch((scriptError) => {
        console.error('Script loading error:', scriptError);
        document.body.removeChild(modal);
        reject(scriptError);
      });
      
    } catch (error) {
      console.error('Braintree payment error:', error);
      reject(new Error('Braintree payment failed: ' + error.message));
    }
  });
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
