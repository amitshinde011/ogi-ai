
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
    console.log('Edge function called')
    
    // Get Cloudflare credentials from Supabase secrets
    const CLOUDFLARE_ACCOUNT_ID = Deno.env.get('CLOUDFLARE_ACCOUNT_ID')
    const CLOUDFLARE_SIGNING_KEY_ID = Deno.env.get('CLOUDFLARE_SIGNING_KEY_ID')
    const CLOUDFLARE_SIGNING_KEY = Deno.env.get('CLOUDFLARE_SIGNING_KEY')

    console.log('Environment check:', {
      hasAccountId: !!CLOUDFLARE_ACCOUNT_ID,
      hasSigningKeyId: !!CLOUDFLARE_SIGNING_KEY_ID,
      hasSigningKey: !!CLOUDFLARE_SIGNING_KEY
    })

    // Use the video ID from your constants
    const VIDEO_ID = '8d8f8b1aca7d0f8224683acc56a26c4f'

    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_SIGNING_KEY_ID || !CLOUDFLARE_SIGNING_KEY) {
      console.log('Missing Cloudflare configuration, returning unsigned URL')
      
      // Return fallback URL without signing - this should work for testing
      const fallbackUrl = `https://customer-${CLOUDFLARE_ACCOUNT_ID || 'cnlj15s4to2idzsi'}.cloudflarestream.com/${VIDEO_ID}/manifest/video.m3u8`
      
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

    console.log('Attempting to generate signed URL')

    try {
      // Set expiration time (1 hour from now)
      const exp = Math.floor(Date.now() / 1000) + 3600
      
      // Create the JWT payload WITHOUT kid (kid goes in header)
      const payload = {
        sub: VIDEO_ID,
        exp: exp,
        aud: ['video-streaming']
      }

      // FIXED: Decode the Base64 string first, then parse as JSON
      const decodedKey = atob(CLOUDFLARE_SIGNING_KEY)
      const jwk = JSON.parse(decodedKey)
      
      const key = await crypto.subtle.importKey(
        'jwk',
        jwk,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      )

      // Create the JWT token with kid in the header
      const token = await create(
        { alg: 'HS256', typ: 'JWT', kid: CLOUDFLARE_SIGNING_KEY_ID },
        payload,
        key
      )
      
      // Create the signed URL with token in the path
      const signedUrl = `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${token}/manifest/video.m3u8`
      
      console.log('Generated signed URL successfully with kid in header')

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
    
    // Return a working fallback URL in case of any error
    const fallbackUrl = "https://customer-cnlj15s4to2idzsi.cloudflarestream.com/8d8f8b1aca7d0f8224683acc56a26c4f/manifest/video.m3u8"
    
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
