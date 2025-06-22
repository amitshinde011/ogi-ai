
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
                .replace(/pk_[a-zA-Z0-9_-]+/g, '[REDACTED]');
  }
  return 'Payment processing failed';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate request body
    const requestData = await req.json();
    console.log('Request data:', requestData);

    // Handle create_payment_session action
    if (requestData.action === 'create_payment_session') {
      if (!validatePaymentRequest(requestData)) {
        return new Response(
          JSON.stringify({ error: 'Invalid request data for payment session creation' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { programId, gateway, amount, currency } = requestData;

      // For amounts close to 0 (100% discount), don't create payment session
      if (amount <= 0.01) {
        return new Response(
          JSON.stringify({ error: 'Free subscription - no payment required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create order record for tracking
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
        console.error('Order creation failed:', sanitizeError(orderError));
        return new Response(
          JSON.stringify({ error: 'Failed to create order' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Return session data based on gateway
      let sessionData;
      if (gateway === 'braintree') {
        // For Braintree, return minimal session data for demo
        sessionData = {
          orderId: order.id,
          sessionData: {
            token: 'demo_braintree_token',
            amount: amount,
            currency: currency
          },
          gateway: 'braintree'
        };
      } else {
        // For Razorpay, return demo session data
        sessionData = {
          orderId: order.id,
          sessionData: {
            keyId: 'demo_razorpay_key',
            amount: Math.round(amount * 100), // Razorpay expects amount in paise
            currency: currency,
            orderId: `order_${order.id}`
          },
          gateway: 'razorpay'
        };
      }

      return new Response(
        JSON.stringify(sessionData),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle verify_payment action
    if (requestData.action === 'verify_payment') {
      const { orderId, transactionId, gateway } = requestData;

      if (!orderId || !transactionId) {
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
        console.error('Order update failed:', sanitizeError(updateError));
        return new Response(
          JSON.stringify({ error: 'Failed to verify payment' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

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
          console.error('Subscription creation failed:', sanitizeError(subscriptionError));
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Payment verified successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Default response for unsupported actions
    return new Response(
      JSON.stringify({ error: 'Unsupported action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Request processing error:', sanitizeError(error));
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
