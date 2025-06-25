import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9';
// ** NEW: Using a Deno-native S3 client to avoid all previous errors **
import { S3Bucket } from 'https://deno.land/x/s3@0.5.0/mod.ts';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
// ** NEW: Simplified R2 Bucket Configuration **
const bucket = new S3Bucket({
  accessKeyID: Deno.env.get('CLOUDFLARE_ACCESS_KEY_ID'),
  secretKey: Deno.env.get('CLOUDFLARE_SECRET_ACCESS_KEY'),
  bucket: 'assets',
  region: 'auto',
  endpointURL: `https://${Deno.env.get('CLOUDFLARE_ACCOUNT_ID')}.r2.cloudflarestorage.com`
});
Deno.serve(async (req)=>{
  // Handle CORS preflight request for browser permission
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    // 1. VERIFY USER IS AUTHENTICATED
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({
        error: 'No authorization header'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_ANON_KEY'), {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // 2. CHECK FOR ACTIVE SUBSCRIPTION
    const { data: subscription } = await supabase.from('user_subscriptions').select('status').eq('user_id', user.id).eq('status', 'active').single();
    if (!subscription) {
      return new Response(JSON.stringify({
        error: 'Active subscription required'
      }), {
        status: 403,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // 3. SECURELY FETCH THE FILE FROM R2
    const fileKey = 'Dhatu Meditation.mp3';
    const r2Response = await bucket.getObject(fileKey);
    if (!r2Response || !r2Response.body) {
      throw new Error("Audio file not found or response body is empty.");
    }
    // 4. STREAM THE FILE BACK TO THE AUTHORIZED USER
    return new Response(r2Response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Length': r2Response.contentLength.toString()
      }
    });
  } catch (error) {
    console.error('Edge Function Critical Error:', error.message);
    // Check for the "key does not exist" error from this specific library
    if (error.message.includes('The specified key does not exist')) {
      return new Response(JSON.stringify({
        error: 'Audio file not found in storage'
      }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    return new Response(JSON.stringify({
      error: 'Internal Server Error'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
