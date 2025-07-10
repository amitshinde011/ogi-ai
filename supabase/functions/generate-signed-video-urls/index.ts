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

    // --- Fallback for local development or missing credentials ---
    // If credentials aren't set, return the direct, unsigned URL.
    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
      console.warn('Cloudflare credentials not found. Returning direct HLS URL.');
      const directUrl = `https://customer-5491c5fc7c145a8cd12ae3c66d6bb24b.cloudflarestream.com/${VIDEO_ID}/manifest/video.m3u8`;
      return new Response(JSON.stringify({ high: directUrl, medium: directUrl, low: directUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // --- Generate Signed URL if Required ---
    console.log('Attempting to generate signed URL for video:', VIDEO_ID);

    // 1. Check if the video requires signed URLs by fetching its details.
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

      // --- *** UPDATED AND CORRECTED PART *** ---
      // The request body should only contain parameters for the one-time token,
      // like 'exp' (expiration). 'id' and 'pem' are not used here.
      const tokenResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/${VIDEO_ID}/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // Set the token to expire in 1 hour (3600 seconds).
          exp: Math.floor(Date.now() / 1000) + 3600
        })
      });

      if (!tokenResponse.ok) {
        const errorBody = await tokenResponse.text();
        console.error('Failed to generate token:', tokenResponse.status, errorBody);
        throw new Error(`Failed to generate token: ${tokenResponse.statusText}`);
      }

      const tokenData = await tokenResponse.json();
      const token = tokenData.result.token;

      // 3. Construct the signed URL with the new token.
      const signedUrl = `https://customer-5491c5fc7c145a8cd12ae3c66d6bb24b.cloudflarestream.com/${token}/manifest/video.m3u8`;
      
      console.log('Successfully generated signed URL.');
      
      const response = { high: signedUrl, medium: signedUrl, low: signedUrl };
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else {
      // If the video is public, return the direct URL.
      console.log('Video does not require signed URLs. Returning direct URL.');
      const directUrl = `https://customer-5491c5fc7c145a8cd12ae3c66d6bb24b.cloudflarestream.com/${VIDEO_ID}/manifest/video.m3u8`;
      const response = { high: directUrl, medium: directUrl, low: directUrl };
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Error in edge function:', error.message);
    // Fallback to a working URL in case of any unexpected error.
    const fallbackUrl = `https://customer-5491c5fc7c145a8cd12ae3c66d6bb24b.cloudflarestream.com/${'8d8f8b1aca7d0f8224683acc56a26c4f'}/manifest/video.m3u8`;
    const response = { high: fallbackUrl, medium: fallbackUrl, low: fallbackUrl };
    return new Response(JSON.stringify(response), {
      status: 500, // Internal Server Error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
