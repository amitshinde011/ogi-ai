
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
      
      // Validate session data
      if (!sessionData?.sessionData?.token) {
        throw new Error('Invalid session data: missing client token');
      }
      
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
      dropinContainer.style.cssText = 'margin-bottom: 1rem; min-height: 200px;';

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

      const loadingDiv = document.createElement('div');
      loadingDiv.textContent = 'Loading payment form...';
      loadingDiv.style.cssText = 'text-align: center; padding: 2rem; color: #666;';
      dropinContainer.appendChild(loadingDiv);

      modalContent.appendChild(closeButton);
      modalContent.appendChild(title);
      modalContent.appendChild(dropinContainer);
      modalContent.appendChild(payButton);
      modal.appendChild(modalContent);
      document.body.appendChild(modal);

      // Load Braintree scripts with better error handling
      const loadBraintreeScripts = () => {
        return new Promise((resolveScript, rejectScript) => {
          if (window.braintree?.dropin) {
            console.log('Braintree scripts already loaded');
            resolveScript(null);
            return;
          }

          console.log('Loading Braintree client script...');
          const clientScript = document.createElement('script');
          clientScript.src = 'https://js.braintreegateway.com/web/3.103.0/js/client.min.js';
          
          clientScript.onload = () => {
            console.log('Braintree client script loaded, loading Drop-in...');
            const dropinScript = document.createElement('script');
            dropinScript.src = 'https://js.braintreegateway.com/web/dropin/1.41.0/js/dropin.min.js';
            
            dropinScript.onload = () => {
              console.log('Braintree Drop-in script loaded successfully');
              resolveScript(null);
            };
            
            dropinScript.onerror = (error) => {
              console.error('Failed to load Braintree Drop-in script:', error);
              rejectScript(new Error('Failed to load Braintree Drop-in script'));
            };
            
            document.head.appendChild(dropinScript);
          };
          
          clientScript.onerror = (error) => {
            console.error('Failed to load Braintree client script:', error);
            rejectScript(new Error('Failed to load Braintree client script'));
          };
          
          document.head.appendChild(clientScript);
        });
      };

      loadBraintreeScripts().then(() => {
        // Extract the raw token string - this is the critical fix
        const clientToken = sessionData.sessionData.token;
        
        console.log('Using Braintree client token (first 50 chars):', clientToken.substring(0, 50) + '...');
        console.log('Token type:', typeof clientToken);
        
        // Clear loading message
        dropinContainer.innerHTML = '';
        
        // Create Drop-in with the correct token format
        const dropinConfig = {
          authorization: clientToken, // Pass the raw string token directly
          container: dropinContainer,
          card: {
            cardholderName: {
              required: false
            }
          },
          paypal: {
            flow: 'checkout',
            amount: sessionData.sessionData.amount,
            currency: sessionData.sessionData.currency || 'USD'
          }
        };

        console.log('Creating Braintree Drop-in with raw token string');

        window.braintree.dropin.create(dropinConfig, (createErr, instance) => {
          if (createErr) {
            console.error('Braintree Drop-in creation error:', createErr);
            dropinContainer.innerHTML = `
              <div style="text-align: center; padding: 2rem; color: #d32f2f;">
                <p>Failed to initialize payment form</p>
                <p style="font-size: 0.9em; margin-top: 1rem;">${createErr.message}</p>
              </div>
            `;
            return;
          }

          console.log('Braintree Drop-in created successfully');
          payButton.disabled = false;
          payButton.style.background = '#28a745';
          
          payButton.onclick = () => {
            payButton.disabled = true;
            payButton.textContent = 'Processing...';
            payButton.style.background = '#6c757d';
            
            instance.requestPaymentMethod((paymentErr, payload) => {
              if (paymentErr) {
                console.error('Payment method error:', paymentErr);
                payButton.disabled = false;
                payButton.textContent = 'Pay Now';
                payButton.style.background = '#28a745';
                
                // Show error in the UI
                const errorDiv = document.createElement('div');
                errorDiv.style.cssText = 'color: #d32f2f; text-align: center; margin-top: 1rem; font-size: 0.9em;';
                errorDiv.textContent = `Payment failed: ${paymentErr.message}`;
                modalContent.appendChild(errorDiv);
                
                setTimeout(() => {
                  if (errorDiv.parentNode) {
                    modalContent.removeChild(errorDiv);
                  }
                }, 5000);
                return;
              }

              console.log('Payment method obtained successfully:', payload.nonce);
              document.body.removeChild(modal);
              onSuccess(sessionData.orderId, payload.nonce);
              resolve(null);
            });
          };
        });
      }).catch((scriptError) => {
        console.error('Script loading error:', scriptError);
        dropinContainer.innerHTML = `
          <div style="text-align: center; padding: 2rem; color: #d32f2f;">
            <p>Failed to load payment scripts</p>
            <p style="font-size: 0.9em; margin-top: 1rem;">${scriptError.message}</p>
          </div>
        `;
      });
      
    } catch (error) {
      console.error('Braintree payment setup error:', error);
      reject(new Error('Failed to initialize Braintree payment: ' + error.message));
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
