
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentRequest {
  action?: string;
  programId: string;
  gateway: 'razorpay';
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
    data.gateway === 'razorpay' &&
    typeof data.amount === 'number' && data.amount >= 0 &&
    typeof data.currency === 'string' && data.currency.length > 0
  );
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

      // Get Razorpay credentials and create order
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

      // Create Razorpay order
      const razorpayOrderData = {
        amount: Math.round(amount * 100), // Convert to paise
        currency: currency,
        receipt: order.id,
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
            'Authorization': `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
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

        const sessionData = {
          orderId: order.id,
          sessionData: {
            keyId: razorpayKeyId,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            orderId: razorpayOrder.id,
            name: 'Yogi',
            description: `Payment for program ${programId}`
          },
          gateway: 'razorpay'
        };

        logWithDetails('Session created successfully', { gateway, orderId: order.id });
        return new Response(
          JSON.stringify(sessionData),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (razorpayError) {
        logWithDetails('ERROR: Failed to create Razorpay order', { error: razorpayError.message });
        return new Response(
          JSON.stringify({ error: `Razorpay order creation failed: ${razorpayError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
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

      // First, mark any existing active subscriptions as completed
      const { error: subscriptionUpdateError } = await supabase
        .from('user_subscriptions')
        .update({ status: 'completed' })
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (subscriptionUpdateError) {
        logWithDetails('ERROR: Failed to update existing subscriptions', { error: subscriptionUpdateError });
      } else {
        logWithDetails('Existing active subscriptions marked as completed');
      }

      // Create subscription without start/end dates (to be set later on before-assessment)
      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          program_id: order.program_id,
          start_date: null,
          end_date: null,
          status: 'active',
          payment_status: 'paid'
        });

      if (subscriptionError) {
        logWithDetails('ERROR: Subscription creation failed', { error: subscriptionError });
      } else {
        logWithDetails('Subscription created successfully without dates');
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
