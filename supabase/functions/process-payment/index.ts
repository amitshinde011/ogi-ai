
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...payload } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    switch (action) {
      case 'create_payment_session':
        return await createPaymentSession(payload, supabase);
      case 'verify_payment':
        return await verifyPayment(payload, supabase);
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function createPaymentSession(payload: any, supabase: any) {
  const { userId, programId, gateway, amount, currency } = payload;

  // Create order record
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      program_id: programId,
      payment_gateway: gateway,
      amount,
      currency,
      status: 'pending'
    })
    .select()
    .single();

  if (orderError) {
    throw new Error(`Failed to create order: ${orderError.message}`);
  }

  let sessionData;

  if (gateway === 'braintree') {
    sessionData = await createBraintreeSession(order, amount, currency);
  } else if (gateway === 'razorpay') {
    sessionData = await createRazorpaySession(order, amount, currency);
  } else {
    throw new Error('Invalid payment gateway');
  }

  // Update order with session ID
  await supabase
    .from('orders')
    .update({ gateway_session_id: sessionData.sessionId })
    .eq('id', order.id);

  return new Response(
    JSON.stringify({ 
      orderId: order.id, 
      sessionData,
      gateway 
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

async function createBraintreeSession(order: any, amount: number, currency: string) {
  const braintreeEndpoint = Deno.env.get('BRAINTREE_ENVIRONMENT') === 'production' 
    ? 'https://api.braintreegateway.com' 
    : 'https://api.sandbox.braintreegateway.com';

  const auth = btoa(`${Deno.env.get('BRAINTREE_PUBLIC_KEY')}:${Deno.env.get('BRAINTREE_PRIVATE_KEY')}`);

  const response = await fetch(`${braintreeEndpoint}/merchants/${Deno.env.get('BRAINTREE_MERCHANT_ID')}/client_token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error('Failed to create Braintree session');
  }

  const data = await response.json();
  
  return {
    sessionId: data.client_token,
    clientToken: data.client_token,
    amount,
    currency
  };
}

async function createRazorpaySession(order: any, amount: number, currency: string) {
  const auth = btoa(`${Deno.env.get('RAZORPAY_KEY_ID')}:${Deno.env.get('RAZORPAY_KEY_SECRET')}`);

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: currency.toUpperCase(),
      receipt: order.id,
    })
  });

  if (!response.ok) {
    throw new Error('Failed to create Razorpay order');
  }

  const data = await response.json();
  
  return {
    sessionId: data.id,
    orderId: data.id,
    amount: data.amount,
    currency: data.currency,
    keyId: Deno.env.get('RAZORPAY_KEY_ID')
  };
}

async function verifyPayment(payload: any, supabase: any) {
  const { orderId, transactionId, gateway } = payload;

  // Update order status
  const { error: updateError } = await supabase
    .from('orders')
    .update({ 
      status: 'paid',
      gateway_transaction_id: transactionId 
    })
    .eq('id', orderId);

  if (updateError) {
    throw new Error(`Failed to update order: ${updateError.message}`);
  }

  // Get order details to create subscription
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*, programs(*)')
    .eq('id', orderId)
    .single();

  if (orderError) {
    throw new Error(`Failed to get order: ${orderError.message}`);
  }

  // Create user subscription
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + order.programs.duration_days);

  const { error: subscriptionError } = await supabase
    .from('user_subscriptions')
    .insert({
      user_id: order.user_id,
      program_id: order.program_id,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      status: 'active',
      payment_status: 'paid'
    });

  if (subscriptionError) {
    throw new Error(`Failed to create subscription: ${subscriptionError.message}`);
  }

  return new Response(
    JSON.stringify({ success: true }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}
