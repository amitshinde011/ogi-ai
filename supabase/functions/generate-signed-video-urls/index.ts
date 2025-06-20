
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
      console.log('Missing Cloudflare configuration, returning fallback URL')
      
      // Return fallback URL - use the correct account ID from the curl
      const fallbackUrl = `https://customer-5491c5fc7c145a8cd12ae3c66d6bb24b.cloudflarestream.com/${VIDEO_ID}/manifest/video.m3u8`
      
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
      
      // Create the JWT payload for Cloudflare Stream
      const payload = {
        sub: VIDEO_ID,
        exp: exp,
        aud: ['video-streaming']
      }

      // Decode the Base64 string and parse as JSON
      const decodedKey = atob(CLOUDFLARE_SIGNING_KEY)
      const jwk = JSON.parse(decodedKey)
      
      console.log('JWK type:', jwk.kty)
      
      // Handle different key types that Cloudflare might provide
      let key;
      let algorithm;
      
      if (jwk.kty === 'oct') {
        // HMAC symmetric key
        key = await crypto.subtle.importKey(
          'jwk',
          jwk,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        )
        algorithm = 'HS256'
      } else if (jwk.kty === 'RSA') {
        // RSA key
        key = await crypto.subtle.importKey(
          'jwk',
          jwk,
          { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
          false,
          ['sign']
        )
        algorithm = 'RS256'
      } else if (jwk.kty === 'EC') {
        // ECDSA key
        key = await crypto.subtle.importKey(
          'jwk',
          jwk,
          { name: 'ECDSA', namedCurve: 'P-256' },
          false,
          ['sign']
        )
        algorithm = 'ES256'
      } else {
        throw new Error(`Unsupported key type: ${jwk.kty}`)
      }

      // Create the JWT token with kid in the header and appropriate algorithm
      const token = await create(
        { alg: algorithm, typ: 'JWT', kid: CLOUDFLARE_SIGNING_KEY_ID },
        payload,
        key
      )
      
      // Create signed HLS manifest URLs using the correct account ID format
      // Based on the curl, the correct format is customer-{hash}.cloudflarestream.com
      const signedUrl = `https://customer-5491c5fc7c145a8cd12ae3c66d6bb24b.cloudflarestream.com/${token}/manifest/video.m3u8`
      
      console.log('Generated signed HLS URL successfully with algorithm:', algorithm)

      // Return the same signed URL for all qualities (Cloudflare Stream handles adaptive bitrate)
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
      
      // Fallback to unsigned HLS URL if signing fails
      const fallbackUrl = `https://customer-5491c5fc7c145a8cd12ae3c66d6bb24b.cloudflarestream.com/${VIDEO_ID}/manifest/video.m3u8`
      
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
