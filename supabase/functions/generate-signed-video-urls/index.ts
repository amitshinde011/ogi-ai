
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

    console.log('Generating signed URL with account ID:', CLOUDFLARE_ACCOUNT_ID)

    // Single video ID - UPDATE THIS WITH YOUR ACTUAL VIDEO ID
    const VIDEO_ID = 'replace-with-your-video-id'

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
      
      // Create the signed URL - Cloudflare will handle adaptive bitrate streaming
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

    } catch (error) {
      console.error('Error generating signed URL:', error)
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
    console.error('Error generating signed URL:', error)
    
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
