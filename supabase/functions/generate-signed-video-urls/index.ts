
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Edge function called')
    
    // Get Cloudflare credentials from Supabase secrets
    const CLOUDFLARE_ACCOUNT_ID = Deno.env.get('CLOUDFLARE_ACCOUNT_ID')
    const CLOUDFLARE_API_TOKEN = Deno.env.get('CLOUDFLARE_API_TOKEN')

    console.log('Environment check:', {
      hasAccountId: !!CLOUDFLARE_ACCOUNT_ID,
      hasApiToken: !!CLOUDFLARE_API_TOKEN
    })

    // Use the video ID from your constants
    const VIDEO_ID = '8d8f8b1aca7d0f8224683acc56a26c4f'

    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
      console.log('Missing Cloudflare configuration, returning direct HLS URL')
      
      // Return direct HLS URL without signing (for development/testing)
      const directUrl = `https://customer-5491c5fc7c145a8cd12ae3c66d6bb24b.cloudflarestream.com/${VIDEO_ID}/manifest/video.m3u8`
      
      const response = {
        high: directUrl,
        medium: directUrl,
        low: directUrl
      }

      return new Response(
        JSON.stringify(response),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          } 
        }
      )
    }

    console.log('Attempting to generate signed URL using Cloudflare Stream API')

    try {
      // First, check if the video requires signed URLs by getting video details
      const videoDetailsResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/${VIDEO_ID}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!videoDetailsResponse.ok) {
        console.error('Failed to fetch video details:', videoDetailsResponse.status, videoDetailsResponse.statusText);
        throw new Error(`Failed to fetch video details: ${videoDetailsResponse.statusText}`);
      }

      const videoDetails = await videoDetailsResponse.json();
      console.log('Video details fetched:', videoDetails.result?.requireSignedURLs);

      // If the video requires signed URLs, generate a token
      if (videoDetails.result?.requireSignedURLs) {
        console.log('Video requires signed URLs, generating token...');
        
        // Generate signed URL token using Cloudflare Stream API
        const tokenResponse = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/${VIDEO_ID}/token`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: VIDEO_ID,
              pem: null, // Use default signing key
              exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
              nbf: Math.floor(Date.now() / 1000) - 60, // Valid from 1 minute ago
              downloadable: false,
              accessRules: [
                {
                  type: "any",
                  action: "allow"
                }
              ]
            }),
          }
        );

        if (!tokenResponse.ok) {
          console.error('Failed to generate token:', tokenResponse.status, tokenResponse.statusText);
          throw new Error(`Failed to generate token: ${tokenResponse.statusText}`);
        }

        const tokenData = await tokenResponse.json();
        console.log('Token generated successfully');

        // Create signed URLs with the token
        const baseUrl = `https://customer-5491c5fc7c145a8cd12ae3c66d6bb24b.cloudflarestream.com/${VIDEO_ID}`;
        const signedUrl = `${baseUrl}/manifest/video.m3u8?token=${tokenData.result}`;
        
        console.log('Generated signed HLS URL successfully');

        const response = {
          high: signedUrl,
          medium: signedUrl,
          low: signedUrl
        };

        return new Response(
          JSON.stringify(response),
          { 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json'
            } 
          }
        );

      } else {
        console.log('Video does not require signed URLs, using direct URL');
        
        // Video doesn't require signed URLs, use direct URL
        const directUrl = `https://customer-5491c5fc7c145a8cd12ae3c66d6bb24b.cloudflarestream.com/${VIDEO_ID}/manifest/video.m3u8`;
        
        const response = {
          high: directUrl,
          medium: directUrl,
          low: directUrl
        };

        return new Response(
          JSON.stringify(response),
          { 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json'
            } 
          }
        );
      }

    } catch (apiError) {
      console.error('Error with Cloudflare API:', apiError);
      
      // Fallback to direct HLS URL if API calls fail
      const fallbackUrl = `https://customer-5491c5fc7c145a8cd12ae3c66d6bb24b.cloudflarestream.com/${VIDEO_ID}/manifest/video.m3u8`;
      
      const response = {
        high: fallbackUrl,
        medium: fallbackUrl,
        low: fallbackUrl
      };

      return new Response(
        JSON.stringify(response),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          } 
        }
      );
    }

  } catch (error) {
    console.error('Error in edge function:', error)
    
    // Return a working fallback HLS URL in case of any error
    const fallbackUrl = "https://customer-5491c5fc7c145a8cd12ae3c66d6bb24b.cloudflarestream.com/8d8f8b1aca7d0f8224683acc56a26c4f/manifest/video.m3u8"
    
    const response = {
      high: fallbackUrl,
      medium: fallbackUrl,
      low: fallbackUrl
    }

    return new Response(
      JSON.stringify(response),
      { 
        status: 200,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  }
})
