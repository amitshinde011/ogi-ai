import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { postIds } = await req.json()

    if (!postIds || !Array.isArray(postIds)) {
      throw new Error('postIds array is required')
    }

    const results = []

    for (const postId of postIds) {
      try {
        // Get post data
        const { data: post, error: postError } = await supabaseClient
          .from('posts')
          .select('id, image_url')
          .eq('id', postId)
          .single()

        if (postError) throw postError

        // Skip if not a JPEG
        if (!post.image_url.match(/\.(jpg|jpeg)$/i)) {
          results.push({ post_id: postId, status: 'skipped', reason: 'not_jpeg' })
          continue
        }

        // Download the original image
        const imageResponse = await fetch(post.image_url)
        if (!imageResponse.ok) throw new Error('Failed to download image')
        
        const imageBlob = await imageResponse.blob()

        // Convert JPEG to WebP with compression
        const imageArrayBuffer = await imageBlob.arrayBuffer()
        
        // Create a new filename
        const originalFilename = post.image_url.split('/').pop()
        const webpFilename = originalFilename?.replace(/\.(jpg|jpeg)$/i, '.webp') || `converted-${Date.now()}.webp`

        // Convert to WebP using Canvas API in Deno
        const imageData = new Uint8Array(imageArrayBuffer)
        
        // Create an Image object and canvas for conversion
        const canvas = new OffscreenCanvas(1, 1)
        const ctx = canvas.getContext('2d')
        
        // Create image bitmap from JPEG data
        const imageBlob2 = new Blob([imageData], { type: 'image/jpeg' })
        const imageBitmap = await createImageBitmap(imageBlob2)
        
        // Set canvas size to match image
        canvas.width = imageBitmap.width
        canvas.height = imageBitmap.height
        
        // Draw image to canvas
        ctx?.drawImage(imageBitmap, 0, 0)
        
        // Convert to WebP with compression (quality 80%)
        const webpBlob = await canvas.convertToBlob({
          type: 'image/webp',
          quality: 0.8
        })

        // Upload WebP version
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
          .from('bot-posts')
          .upload(webpFilename, webpBlob, {
            contentType: 'image/webp',
            cacheControl: '3600'
          })

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabaseClient.storage
          .from('bot-posts')
          .getPublicUrl(webpFilename)

        // Update post with WebP URL using service role (bypasses RLS)
        const { error: updateError } = await supabaseClient
          .from('posts')
          .update({ image_url: publicUrl })
          .eq('id', post.id)

        if (updateError) throw updateError

        results.push({ 
          post_id: postId, 
          status: 'success', 
          old_url: post.image_url,
          new_url: publicUrl 
        })

      } catch (error) {
        console.error(`Failed to convert post ${postId}:`, error)
        results.push({ 
          post_id: postId, 
          status: 'error', 
          error: error.message 
        })
      }
    }

    return new Response(
      JSON.stringify({ results }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in convert-image-to-webp function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})