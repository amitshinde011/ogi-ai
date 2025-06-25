
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
    console.log('Starting meditation audio request processing');
    
    // 1. VERIFY USER IS AUTHENTICATED
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('No authorization header provided');
      return new Response(JSON.stringify({ error: 'No authorization header' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!, 
      Deno.env.get('SUPABASE_ANON_KEY')!, 
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('Authentication failed:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('User authenticated:', user.id);

    // 2. CHECK IF USER HAS AN ACTIVE SUBSCRIPTION
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();
      
    if (!subscription) {
      console.log('No active subscription found for user:', user.id);
      return new Response(JSON.stringify({ error: 'Active subscription required' }), { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('User has active subscription');

    // Get Cloudflare credentials from environment variables
    const accountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');
    const accessKeyId = Deno.env.get('CLOUDFLARE_ACCESS_KEY_ID');
    const secretAccessKey = Deno.env.get('CLOUDFLARE_SECRET_ACCESS_KEY');

    if (!accountId || !accessKeyId || !secretAccessKey) {
      console.log('Missing Cloudflare configuration:', { accountId: !!accountId, accessKeyId: !!accessKeyId, secretAccessKey: !!secretAccessKey });
      return new Response(
        JSON.stringify({ error: 'Cloudflare configuration missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Cloudflare credentials loaded successfully');

    // Initialize the S3 Client for Cloudflare R2 with explicit configuration
    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
      // Disable AWS SDK configuration file loading
      forcePathStyle: true,
      // Prevent SDK from trying to load config files
      maxAttempts: 1,
    });
    
    console.log('S3 client initialized for Cloudflare R2');
    
    // 3. SECURELY FETCH THE FILE FROM YOUR PRIVATE R2 BUCKET
    const command = new GetObjectCommand({
      Bucket: 'assets',
      Key: 'Dhatu Meditation.mp3',
    });

    console.log('Attempting to fetch audio file from R2 bucket');
    const r2Response = await s3.send(command);
    console.log('Audio file fetched successfully from R2');
    
    // 4. STREAM THE FILE BACK TO THE AUTHORIZED USER
    if (!r2Response.Body) {
      console.log('No response body from R2');
      return new Response(JSON.stringify({ error: 'Audio file not found' }), { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Streaming audio file to client');
    return new Response(r2Response.Body.transformToWebStream(), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Length': r2Response.ContentLength!.toString(),
        'Content-Disposition': 'inline; filename="meditation.mp3"',
        'Cache-Control': 'private, max-age=3600',
      },
    });

  } catch (error) {
    console.error('Edge Function Error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    if (error.name === 'NoSuchKey') {
      return new Response(JSON.stringify({ error: 'Audio file not found' }), { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error',
      details: error.message 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
