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
    console.log('Edge function invoked to get video URL.');

    // --- Get Cloudflare credentials from environment variables ---
    const CLOUDFLARE_ACCOUNT_ID = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');
    const CLOUDFLARE_API_TOKEN = Deno.env.get('CLOUDFLARE_API_TOKEN');
    const VIDEO_ID = '9a47db5c27ea07a0648ee96f16d02'; 
    const CUSTOMER_ID = 'customer-cnj15s4to2idzsi';

    // --- Fallback for local development or missing credentials ---
    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
      console.warn('Cloudflare credentials not found. Returning direct, unsigned HLS URL as a fallback.');
      const baseUrl = `https://${CUSTOMER_ID}.cloudflarestream.com/${VIDEO_ID}`;
      return new Response(JSON.stringify({
        high: `${baseUrl}/manifest/video.m3u8`,
        medium: `${baseUrl}/manifest/video.m3u8`,
        low: `${baseUrl}/manifest/video.m3u8`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // --- Always Generate a Signed URL ---
    // This simplifies the logic and avoids potential issues with checking video settings.
    console.log('Always generating a signed URL for video:', VIDEO_ID);

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
      console.error('Failed to generate token:', tokenResponse.status, errorBody);
      throw new Error(`Failed to generate token: ${tokenResponse.statusText}`);
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
    
    console.log('Successfully generated streaming-only signed URLs.');
    
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in edge function:', error.message);
    // Fallback to a working URL in case of any unexpected error.
    const fallbackUrl = `https://customer-cnj15s4to2idzsi.cloudflarestream.com/${'9a47db5c27ea07a0648ee96f16d02'}/manifest/video.m3u8`;
    const response = { high: fallbackUrl, medium: fallbackUrl, low: fallbackUrl };
    return new Response(JSON.stringify(response), {
      status: 500, // Internal Server Error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
