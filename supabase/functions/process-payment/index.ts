
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentRequest {
  programId: string;
  gateway: 'braintree' | 'razorpay';
  amount: number;
  currency: string;
  paymentData?: any;
}

// Input validation function
function validatePaymentRequest(data: any): data is PaymentRequest {
  return (
    data &&
    typeof data.programId === 'string' && data.programId.length > 0 &&
    (data.gateway === 'braintree' || data.gateway === 'razorpay') &&
    typeof data.amount === 'number' && data.amount > 0 &&
    typeof data.currency === 'string' && data.currency.length > 0
  );
}

// Sanitize error messages to prevent credential leakage
function sanitizeError(error: any): string {
  if (typeof error === 'string') {
    // Remove any potential credential patterns
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

    // Rate limiting check (basic implementation)
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    // In production, implement proper rate limiting with Redis or similar

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
    if (!validatePaymentRequest(requestData)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { programId, gateway, amount, currency, paymentData } = requestData;

    // Verify program exists and get pricing
    const { data: program, error: programError } = await supabase
      .from('programs')
      .select('id, price, price_inr')
      .eq('id', programId)
      .single();

    if (programError || !program) {
      return new Response(
        JSON.stringify({ error: 'Invalid program selected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify amount matches program price
    const expectedAmount = currency === 'INR' ? program.price_inr : program.price;
    if (Math.abs(amount - expectedAmount) > 0.01) {
      return new Response(
        JSON.stringify({ error: 'Invalid payment amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create order record
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

    // Process payment based on gateway
    let paymentResult;
    
    try {
      if (gateway === 'braintree') {
        paymentResult = await processBraintreePayment(order.id, paymentData);
      } else if (gateway === 'razorpay') {
        paymentResult = await processRazorpayPayment(order.id, paymentData);
      }

      // Update order with payment result
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: paymentResult.success ? 'paid' : 'failed',
          gateway_transaction_id: paymentResult.transactionId,
          gateway_session_id: paymentResult.sessionId
        })
        .eq('id', order.id);

      if (updateError) {
        console.error('Order update failed:', sanitizeError(updateError));
      }

      // Create subscription if payment successful
      if (paymentResult.success) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + (program.duration_days || 30));

        const { error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: user.id,
            program_id: programId,
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
        JSON.stringify({
          success: paymentResult.success,
          orderId: order.id,
          message: paymentResult.success ? 'Payment processed successfully' : 'Payment failed'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (paymentError) {
      console.error('Payment processing error:', sanitizeError(paymentError));
      
      // Update order status to failed
      await supabase
        .from('orders')
        .update({ status: 'failed' })
        .eq('id', order.id);

      return new Response(
        JSON.stringify({ error: 'Payment processing failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Request processing error:', sanitizeError(error));
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Secure Braintree payment processing
async function processBraintreePayment(orderId: string, paymentData: any) {
  // Implementation with proper error handling and credential protection
  // This is a placeholder - implement actual Braintree integration
  return {
    success: false,
    transactionId: null,
    sessionId: null,
    error: 'Braintree integration not implemented'
  };
}

// Secure Razorpay payment processing
async function processRazorpayPayment(orderId: string, paymentData: any) {
  // Implementation with proper error handling and credential protection
  // This is a placeholder - implement actual Razorpay integration
  return {
    success: false,
    transactionId: null,
    sessionId: null,
    error: 'Razorpay integration not implemented'
  };
}
