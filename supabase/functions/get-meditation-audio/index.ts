
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9';
import { S3Client, GetObjectCommand } from 'https://esm.sh/@aws-sdk/client-s3@3.592.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // User Authentication and Subscription Check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has an active subscription
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!subscription) {
      return new Response(
        JSON.stringify({ error: 'Active subscription required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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

    // Initialize the S3 client for Cloudflare R2
    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });

    // Securely fetch the object from your private R2 bucket using the S3 API
    const command = new GetObjectCommand({
      Bucket: 'assets', // Your bucket name
      Key: 'Dhatu Meditation.mp3', // The object key (filename)
    });

    const r2Response = await s3.send(command);
    
    // Stream the audio file back to the client
    return new Response(r2Response.Body?.transformToWebStream(), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Length': r2Response.ContentLength?.toString() || '',
        'Content-Disposition': 'inline; filename="meditation.mp3"',
        'Cache-Control': 'private, max-age=3600',
      },
    });

  } catch (error) {
    console.error('Error serving meditation audio:', error);
    
    // Handle cases where the file doesn't exist in R2
    if (error.name === 'NoSuchKey') {
      return new Response(
        JSON.stringify({ error: 'Audio file not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
