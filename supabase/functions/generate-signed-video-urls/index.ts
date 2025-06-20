
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Cloudflare credentials from Supabase secrets
    const CLOUDFLARE_ACCOUNT_ID = Deno.env.get('CLOUDFLARE_ACCOUNT_ID')
    const CLOUDFLARE_API_TOKEN = Deno.env.get('CLOUDFLARE_API_TOKEN')
    const CLOUDFLARE_SIGNING_KEY_ID = Deno.env.get('CLOUDFLARE_SIGNING_KEY_ID')
    const CLOUDFLARE_SIGNING_KEY = Deno.env.get('CLOUDFLARE_SIGNING_KEY')

    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN || !CLOUDFLARE_SIGNING_KEY_ID || !CLOUDFLARE_SIGNING_KEY) {
      throw new Error('Missing Cloudflare configuration')
    }

    // Video IDs for different qualities (replace with your actual video IDs)
    const VIDEO_IDS = {
      high: 'your-high-quality-video-id',
      medium: 'your-medium-quality-video-id', 
      low: 'your-low-quality-video-id'
    }

    // Generate signed URLs for each quality
    const signedUrls: { [key: string]: string } = {}
    
    for (const [quality, videoId] of Object.entries(VIDEO_IDS)) {
      // Set expiration time (e.g., 1 hour from now)
      const exp = Math.floor(Date.now() / 1000) + 3600
      
      // Create the token payload
      const payload = {
        sub: videoId,
        kid: CLOUDFLARE_SIGNING_KEY_ID,
        exp: exp,
        aud: ['video-streaming'],
        iss: 'cloudflare'
      }

      // For simplicity, we'll use the video ID directly
      // In production, you should implement proper JWT signing
      const baseUrl = `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${videoId}/manifest/video.m3u8`
      
      // Add signed token as query parameter
      signedUrls[quality] = `${baseUrl}?token=signed-token-here`
    }

    return new Response(
      JSON.stringify(signedUrls),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )

  } catch (error) {
    console.error('Error generating signed URLs:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  }
})
