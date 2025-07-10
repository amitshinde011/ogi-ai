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
    const VIDEO_ID = '8d8f8b1aca7d0f8224683acc56a26c4f'; // Your video ID
    const CUSTOMER_ID = 'customer-cnj15s4to2idzsi'; // Your Cloudflare customer ID

    // --- Fallback for local development or missing credentials ---
    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
      console.warn('Cloudflare credentials not found. Returning direct HLS URL.');
      const baseUrl = `https://${CUSTOMER_ID}.cloudflarestream.com/${VIDEO_ID}`;
      return new Response(JSON.stringify({
        high: `${baseUrl}/manifest/video.m3u8`,
        medium: `${baseUrl}/manifest/video.m3u8`,
        low: `${baseUrl}/manifest/video.m3u8`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // --- Generate Signed URL if Required ---
    console.log('Attempting to generate signed URL for video:', VIDEO_ID);

    // 1. Check if the video requires signed URLs.
    const videoDetailsResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/${VIDEO_ID}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}` }
    });

    if (!videoDetailsResponse.ok) {
      throw new Error(`Failed to fetch video details: ${videoDetailsResponse.statusText}`);
    }

    const videoDetails = await videoDetailsResponse.json();

    // 2. If signing is required, generate a one-time token.
    if (videoDetails.result?.requireSignedURLs) {
      console.log('Video requires signed URLs. Generating token...');

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

      // 3. Construct signed HLS manifest URL.
      const signedUrl = `https://${CUSTOMER_ID}.cloudflarestream.com/${token}/manifest/video.m3u8`;
      
      // --- UPDATED: Only return streaming URLs ---
      const response = {
        high: signedUrl,
        medium: signedUrl,
        low: signedUrl
      };
      
      console.log('Successfully generated streaming-only signed URLs.');
      
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else {
      // If the video is public, return the direct HLS URL.
      console.log('Video does not require signed URLs. Returning direct HLS URL.');
      const baseUrl = `https://${CUSTOMER_ID}.cloudflarestream.com/${VIDEO_ID}`;
      
      // --- UPDATED: Only return streaming URLs ---
      const response = {
        high: `${baseUrl}/manifest/video.m3u8`,
        medium: `${baseUrl}/manifest/video.m3u8`,
        low: `${baseUrl}/manifest/video.m3u8`
      };
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Error in edge function:', error.message);
    // Fallback to a working URL in case of any unexpected error.
    const fallbackUrl = `https://customer-cnj15s4to2idzsi.cloudflarestream.com/${'8d8f8b1aca7d0f8224683acc56a26c4f'}/manifest/video.m3u8`;
    const response = { high: fallbackUrl, medium: fallbackUrl, low: fallbackUrl };
    return new Response(JSON.stringify(response), {
      status: 500, // Internal Server Error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
