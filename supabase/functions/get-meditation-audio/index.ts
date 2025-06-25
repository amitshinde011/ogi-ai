
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9';
import { S3Client, GetObjectCommand } from 'https://esm.sh/@aws-sdk/client-s3@3.592.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Get Cloudflare credentials from environment variables
const accountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');
const accessKeyId = Deno.env.get('CLOUDFLARE_ACCESS_KEY_ID');
const secretAccessKey = Deno.env.get('CLOUDFLARE_SECRET_ACCESS_KEY');

// Initialize the S3 Client for Cloudflare R2 with explicit configuration
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: accessKeyId!,
    secretAccessKey: secretAccessKey!,
  },
  forcePathStyle: true,
  maxAttempts: 1, 
});

Deno.serve(async (req) => {
  console.log("Edge function 'get-meditation-audio' invoked.");

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS preflight request.");
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    // 1. VERIFY USER IS AUTHENTICATED
    console.log("Verifying user authentication...");
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Authentication Error: No Authorization header provided.");
      return new Response(
        JSON.stringify({ error: 'No authorization header' }), 
        { 
          status: 401, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          }
        }
      );
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
      console.error("Authentication Error: Invalid token.", authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { 
          status: 401, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          }
        }
      );
    }
    console.log(`User ${user.id} authenticated successfully.`);

    // 2. CHECK FOR ACTIVE SUBSCRIPTION
    console.log(`Checking subscription for user ${user.id}...`);
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();
      
    if (!subscription) {
      console.error(`Authorization Error: No active subscription for user ${user.id}.`);
      return new Response(
        JSON.stringify({ error: 'Active subscription required' }), 
        { 
          status: 403, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          }
        }
      );
    }
    console.log("User has an active subscription.");
    
    // 3. SECURELY FETCH THE FILE FROM R2
    const bucket = 'assets';
    const key = 'Dhatu Meditation.mp3';
    console.log(`Fetching object '${key}' from R2 bucket '${bucket}'...`);
    
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const r2Response = await s3.send(command);
    console.log("Successfully fetched object from R2.");
    
    // 4. STREAM THE FILE BACK
    if (!r2Response.Body) {
      throw new Error("Response from R2 is missing a body/stream.");
    }

    console.log("Streaming audio back to the client.");
    return new Response(r2Response.Body.transformToWebStream(), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Length': r2Response.ContentLength?.toString() || '0',
        'Accept-Ranges': 'bytes',
      },
    });

  } catch (error) {
    console.error('Edge Function Critical Error:', error);
    
    if (error.name === 'NoSuchKey') {
      return new Response(
        JSON.stringify({ error: 'Audio file not found in storage' }), 
        { 
          status: 404, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          }
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error',
        details: error.message 
      }), 
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});
