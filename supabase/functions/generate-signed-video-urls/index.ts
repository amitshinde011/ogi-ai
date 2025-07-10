import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Standard CORS headers to allow requests from any origin.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

serve(async (req) => {
  // Handle CORS preflight requests.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Edge function invoked.');

    // --- Get Cloudflare credentials from environment variables ---
    const CLOUDFLARE_ACCOUNT_ID = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');
    const CLOUDFLARE_API_TOKEN = Deno.env.get('CLOUDFLARE_API_TOKEN');
    
    // --- *** UPDATED: Using the correct Video ID from your Cloudflare dashboard *** ---
    const VIDEO_ID = '1229a47db5c27ea07a0648ee96f16d02'; 
    const CUSTOMER_ID = 'customer-cnj15s4to2idzsi';

    // --- Strict check for secrets ---
    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
      console.error('CRITICAL: Cloudflare secrets are not available in the function environment.');
      throw new Error('Missing Cloudflare credentials. Please ensure secrets are set and the function is redeployed.');
    }
    
    console.log('Successfully loaded Cloudflare credentials.');

    // --- Always Generate a Signed URL ---
    console.log('Attempting to generate a signed URL for video:', VIDEO_ID);

    const tokenResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/${VIDEO_ID}/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        exp: Math.floor(Date.now() / 1000) + 3600 // Token expires in 1 hour
      })
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();
      console.error('Cloudflare API Error:', tokenResponse.status, errorBody);
      throw new Error(`Failed to generate token from Cloudflare: ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    const token = tokenData.result.token;

    // Construct the signed HLS manifest URL.
    const signedUrl = `https://${CUSTOMER_ID}.cloudflarestream.com/${token}/manifest/video.m3u8`;
    
    const response = {
      high: signedUrl,
      medium: signedUrl,
      low: signedUrl
    };
    
    console.log('Successfully generated signed URL.');
    
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('An error occurred in the edge function:', error.message);
    // Return a clear error message in the response for easier debugging.
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
