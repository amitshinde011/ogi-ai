
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { create } from "https://deno.land/x/djwt@v2.9.1/mod.ts"

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
    const CLOUDFLARE_SIGNING_KEY_ID = Deno.env.get('CLOUDFLARE_SIGNING_KEY_ID')
    const CLOUDFLARE_SIGNING_KEY = Deno.env.get('CLOUDFLARE_SIGNING_KEY')

    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_SIGNING_KEY_ID || !CLOUDFLARE_SIGNING_KEY) {
      console.log('Missing Cloudflare configuration')
      // Return fallback URL without signing
      const fallbackUrl = "https://customer-cnlj15s4to2idzsi.cloudflarestream.com/8d8f8b1aca7d0f8224683acc56a26c4f/manifest/video.m3u8"
      
      const response = {
        high: fallbackUrl,
        medium: fallbackUrl,
        low: fallbackUrl
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

    console.log('Generating signed URL with account ID:', CLOUDFLARE_ACCOUNT_ID)

    // Use the video ID from your constants
    const VIDEO_ID = '8d8f8b1aca7d0f8224683acc56a26c4f'

    try {
      // Set expiration time (1 hour from now)
      const exp = Math.floor(Date.now() / 1000) + 3600
      
      // Create the JWT payload for Cloudflare Stream
      const payload = {
        sub: VIDEO_ID,
        kid: CLOUDFLARE_SIGNING_KEY_ID,
        exp: exp,
        aud: ['video-streaming']
      }

      // Create a simple key object for signing
      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(CLOUDFLARE_SIGNING_KEY),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      )

      // Create the JWT token
      const token = await create({ alg: 'HS256', typ: 'JWT' }, payload, key)
      
      // Create the signed URL
      const baseUrl = `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${VIDEO_ID}/manifest/video.m3u8`
      const signedUrl = `${baseUrl}?token=${token}`
      
      console.log('Generated signed URL successfully')

      // Return the same URL for all qualities since Cloudflare handles adaptation
      const response = {
        high: signedUrl,
        medium: signedUrl,
        low: signedUrl
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

    } catch (signingError) {
      console.error('Error generating signed URL:', signingError)
      // Fallback to unsigned URL if signing fails
      const fallbackUrl = `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${VIDEO_ID}/manifest/video.m3u8`
      
      const response = {
        high: fallbackUrl,
        medium: fallbackUrl,
        low: fallbackUrl
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

  } catch (error) {
    console.error('Error in edge function:', error)
    
    // Return a fallback URL in case of any error
    const fallbackUrl = "https://customer-cnlj15s4to2idzsi.cloudflarestream.com/8d8f8b1aca7d0f8224683acc56a26c4f/manifest/video.m3u8"
    
    const response = {
      high: fallbackUrl,
      medium: fallbackUrl,
      low: fallbackUrl
    }

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, // Return 200 to avoid errors on frontend
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  }
})
