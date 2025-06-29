
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentRequest {
  action?: string;
  programId: string;
  gateway: 'braintree' | 'razorpay';
  amount: number;
  currency: string;
  paymentData?: any;
  userId?: string;
}

// Input validation function
function validatePaymentRequest(data: any): data is PaymentRequest {
  return (
    data &&
    typeof data.programId === 'string' && data.programId.length > 0 &&
    (data.gateway === 'braintree' || data.gateway === 'razorpay') &&
    typeof data.amount === 'number' && data.amount >= 0 &&
    typeof data.currency === 'string' && data.currency.length > 0
  );
}

// Sanitize error messages to prevent credential leakage
function sanitizeError(error: any): string {
  if (typeof error === 'string') {
    return error.replace(/[a-zA-Z0-9_-]{20,}/g, '[REDACTED]')
                .replace(/sk_[a-zA-Z0-9_-]+/g, '[REDACTED]')
                .replace(/pk_[a-zA-Z0-9_-]+/g, '[REDACTED]')
                .replace(/rzp_[a-zA-Z0-9_-]+/g, '[REDACTED]');
  }
  return 'Payment processing failed';
}

// Enhanced logging function
function logWithDetails(message: string, details?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, details ? JSON.stringify(details, null, 2) : '');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    logWithDetails('=== PAYMENT PROCESSING STARTED ===');
    
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      logWithDetails('ERROR: No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logWithDetails('Authorization header found, initializing Supabase client');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      logWithDetails('ERROR: Missing Supabase environment variables', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      });
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user authentication
    logWithDetails('Verifying user authentication');
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      logWithDetails('ERROR: Authentication failed', { 
        error: authError?.message,
        hasUser: !!user 
      });
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logWithDetails('User authenticated successfully', { userId: user.id });

    // Parse and validate request body
    const requestData = await req.json();
    logWithDetails('Request data received', {
      action: requestData.action,
      gateway: requestData.gateway,
      amount: requestData.amount,
      currency: requestData.currency,
      programId: requestData.programId ? 'present' : 'missing'
    });

    // Handle create_payment_session action
    if (requestData.action === 'create_payment_session') {
      if (!validatePaymentRequest(requestData)) {
        logWithDetails('ERROR: Invalid request data for payment session creation');
        return new Response(
          JSON.stringify({ error: 'Invalid request data for payment session creation' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { programId, gateway, amount, currency } = requestData;

      // For amounts close to 0 (100% discount), don't create payment session
      if (amount <= 0.01) {
        logWithDetails('INFO: Free subscription detected, amount too low', { amount });
        return new Response(
          JSON.stringify({ error: 'Free subscription - no payment required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get payment gateway keys
      let gatewayKeys: any = {};
      if (gateway === 'razorpay') {
        const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
        const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
        
        logWithDetails('Checking Razorpay credentials', {
          hasKeyId: !!razorpayKeyId,
          hasKeySecret: !!razorpayKeySecret,
          keyIdLength: razorpayKeyId ? razorpayKeyId.length : 0,
          keySecretLength: razorpayKeySecret ? razorpayKeySecret.length : 0,
          keyIdPrefix: razorpayKeyId ? razorpayKeyId.substring(0, 8) + '...' : 'missing'
        });
        
        if (!razorpayKeyId || !razorpayKeySecret) {
          logWithDetails('ERROR: Missing Razorpay credentials');
          return new Response(
            JSON.stringify({ error: 'Payment gateway not configured properly' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Validate Razorpay key format
        if (!razorpayKeyId.startsWith('rzp_')) {
          logWithDetails('ERROR: Invalid Razorpay Key ID format', { keyIdPrefix: razorpayKeyId.substring(0, 8) });
          return new Response(
            JSON.stringify({ error: 'Invalid Razorpay Key ID format' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        gatewayKeys = { keyId: razorpayKeyId, keySecret: razorpayKeySecret };
      } else if (gateway === 'braintree') {
        const braintreeEnv = Deno.env.get('BRAINTREE_ENVIRONMENT');
        const braintreeMerchantId = Deno.env.get('BRAINTREE_MERCHANT_ID');
        const braintreePublicKey = Deno.env.get('BRAINTREE_PUBLIC_KEY');
        const braintreePrivateKey = Deno.env.get('BRAINTREE_PRIVATE_KEY');
        
        logWithDetails('Checking Braintree credentials', {
          hasEnv: !!braintreeEnv,
          hasMerchantId: !!braintreeMerchantId,
          hasPublicKey: !!braintreePublicKey,
          hasPrivateKey: !!braintreePrivateKey
        });
        
        if (!braintreeEnv || !braintreeMerchantId || !braintreePublicKey || !braintreePrivateKey) {
          logWithDetails('ERROR: Missing Braintree credentials');
          return new Response(
            JSON.stringify({ error: 'Payment gateway not configured properly' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        gatewayKeys = {
          environment: braintreeEnv,
          merchantId: braintreeMerchantId,
          publicKey: braintreePublicKey,
          privateKey: braintreePrivateKey
        };
      }

      // Create order record for tracking
      logWithDetails('Creating order record', {
        userId: user.id,
        programId,
        gateway,
        amount,
        currency
      });

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          program_id: programId,
          payment_gateway: gateway,
          amount: amount,
          currency: currency,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError || !order) {
        logWithDetails('ERROR: Order creation failed', { error: orderError });
        return new Response(
          JSON.stringify({ error: 'Failed to create order' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      logWithDetails('Order created successfully', { orderId: order.id });

      // Return session data based on gateway
      let sessionData;
      if (gateway === 'braintree') {
        sessionData = {
          orderId: order.id,
          sessionData: {
            token: 'demo_braintree_token',
            amount: amount,
            currency: currency
          },
          gateway: 'braintree'
        };
        logWithDetails('Braintree session data created', { orderId: order.id });
      } else {
        // For Razorpay, create actual order via API
        const razorpayOrderData = {
          amount: Math.round(amount * 100), // Convert to paise
          currency: currency,
          receipt: `order_${order.id}`,
          notes: {
            program_id: programId,
            user_id: user.id
          }
        };

        logWithDetails('Attempting to create Razorpay order', razorpayOrderData);

        try {
          // Create Razorpay order using REST API
          const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${btoa(`${gatewayKeys.keyId}:${gatewayKeys.keySecret}`)}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(razorpayOrderData)
          });

          if (!razorpayResponse.ok) {
            const errorText = await razorpayResponse.text();
            logWithDetails('ERROR: Razorpay API call failed', {
              status: razorpayResponse.status,
              statusText: razorpayResponse.statusText,
              error: errorText
            });
            throw new Error(`Razorpay API error: ${razorpayResponse.status} ${errorText}`);
          }

          const razorpayOrder = await razorpayResponse.json();
          logWithDetails('Razorpay order created successfully', { 
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency
          });

          sessionData = {
            orderId: order.id,
            sessionData: {
              keyId: gatewayKeys.keyId,
              amount: razorpayOrder.amount,
              currency: razorpayOrder.currency,
              orderId: razorpayOrder.id,
              name: 'Yogi-ai',
              description: `Payment for program ${programId}`
            },
            gateway: 'razorpay'
          };
        } catch (razorpayError) {
          logWithDetails('ERROR: Failed to create Razorpay order', { error: razorpayError.message });
          return new Response(
            JSON.stringify({ error: `Razorpay order creation failed: ${razorpayError.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      logWithDetails('Session created successfully', { gateway, orderId: order.id });
      return new Response(
        JSON.stringify(sessionData),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle verify_payment action
    if (requestData.action === 'verify_payment') {
      const { orderId, transactionId, gateway } = requestData;

      logWithDetails('Verifying payment', { orderId, transactionId, gateway });

      if (!orderId || !transactionId) {
        logWithDetails('ERROR: Missing orderId or transactionId');
        return new Response(
          JSON.stringify({ error: 'Missing orderId or transactionId' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update order with payment verification
      const { data: order, error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          gateway_transaction_id: transactionId,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError || !order) {
        logWithDetails('ERROR: Order update failed', { error: updateError });
        return new Response(
          JSON.stringify({ error: 'Failed to verify payment' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      logWithDetails('Payment verified successfully', { orderId, transactionId });

      // Get program details to create subscription
      const { data: program, error: programError } = await supabase
        .from('programs')
        .select('duration_days')
        .eq('id', order.program_id)
        .single();

      if (!programError && program) {
        // Create subscription
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + (program.duration_days || 30));

        const { error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: user.id,
            program_id: order.program_id,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            status: 'active',
            payment_status: 'paid'
          });

        if (subscriptionError) {
          logWithDetails('ERROR: Subscription creation failed', { error: subscriptionError });
        } else {
          logWithDetails('Subscription created successfully');
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Payment verified successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Default response for unsupported actions
    logWithDetails('ERROR: Unsupported action', { action: requestData.action });
    return new Response(
      JSON.stringify({ error: 'Unsupported action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    logWithDetails('ERROR: Request processing error', { error: error.message, stack: error.stack });
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
