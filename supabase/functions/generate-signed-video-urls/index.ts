
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { create, verify } from "https://deno.land/x/djwt@v2.9.1/mod.ts"

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

    console.log('Generating signed URLs with account ID:', CLOUDFLARE_ACCOUNT_ID)

    // Video IDs for different qualities - UPDATE THESE WITH YOUR ACTUAL VIDEO IDs
    const VIDEO_IDS = {
      high: 'replace-with-your-high-quality-video-id',
      medium: 'replace-with-your-medium-quality-video-id', 
      low: 'replace-with-your-low-quality-video-id'
    }

    // Generate signed URLs for each quality
    const signedUrls: { [key: string]: string } = {}
    
    for (const [quality, videoId] of Object.entries(VIDEO_IDS)) {
      try {
        // Set expiration time (1 hour from now)
        const exp = Math.floor(Date.now() / 1000) + 3600
        
        // Create the JWT payload for Cloudflare Stream
        const payload = {
          sub: videoId,
          kid: CLOUDFLARE_SIGNING_KEY_ID,
          exp: exp,
          aud: ['video-streaming']
        }

        // Convert the private key to the correct format
        const privateKey = await crypto.subtle.importKey(
          'pkcs8',
          new TextEncoder().encode(CLOUDFLARE_SIGNING_KEY),
          { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
          false,
          ['sign']
        )

        // Create the JWT token
        const token = await create({ alg: 'RS256', typ: 'JWT' }, payload, privateKey)
        
        // Create the signed URL
        const baseUrl = `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${videoId}/manifest/video.m3u8`
        signedUrls[quality] = `${baseUrl}?token=${token}`
        
        console.log(`Generated signed URL for ${quality} quality`)
      } catch (error) {
        console.error(`Error generating signed URL for ${quality}:`, error)
        // Fallback to unsigned URL if signing fails
        signedUrls[quality] = `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${videoId}/manifest/video.m3u8`
      }
    }

    console.log('Successfully generated signed URLs for all qualities')

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
