
// Import Supabase and AWS S3 SDK clients for Deno
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9';
import { S3Client, GetObjectCommand } from 'https://esm.sh/@aws-sdk/client-s3@3.592.0';

// Define standard CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Start the Deno server
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. VERIFY USER IS AUTHENTICATED
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }

    // 2. CHECK IF USER HAS AN ACTIVE SUBSCRIPTION
    const { data: subscription } = await supabase.from('user_subscriptions').select('status').eq('user_id', user.id).eq('status', 'active').single();
    if (!subscription) {
      return new Response(JSON.stringify({ error: 'Active subscription required' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }

    // Get Cloudflare credentials from environment variables
    const accountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');
    const accessKeyId = Deno.env.get('CLOUDFLARE_ACCESS_KEY_ID');
    const secretAccessKey = Deno.env.get('CLOUDFLARE_SECRET_ACCESS_KEY');

    if (!accountId || !accessKeyId || !secretAccessKey) {
      return new Response(
        JSON.stringify({ error: 'Cloudflare configuration missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =================================================================
    // IMPORTANT: Initialize the S3 Client for Cloudflare R2
    // =================================================================
    const s3 = new S3Client({
      region: 'auto',
      // Construct the R2 endpoint URL using your Cloudflare Account ID from secrets
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        // Get R2 API credentials from Supabase secrets
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });
    
    // 3. SECURELY FETCH THE FILE FROM YOUR PRIVATE R2 BUCKET
    // The user is authenticated and subscribed, so we can proceed.
    const command = new GetObjectCommand({
      Bucket: 'assets',                     // The name of your R2 bucket
      Key: 'Dhatu Meditation.mp3',      // The exact filename (Object Key) in your bucket
    });

    const r2Response = await s3.send(command);
    
    // 4. STREAM THE FILE BACK TO THE AUTHORIZED USER
    return new Response(r2Response.Body?.transformToWebStream(), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Length': r2Response.ContentLength!.toString(),
        'Content-Disposition': 'inline; filename="meditation.mp3"',
        'Cache-Control': 'private, max-age=3600', // Cache on user's browser for 1 hour
      },
    });

  } catch (error) {
    console.error('Edge Function Error:', error);
    if (error.name === 'NoSuchKey') {
      return new Response(JSON.stringify({ error: 'Audio file not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  }
});
