import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, quality = 0.8 } = await req.json();
    
    if (!imageBase64) {
      throw new Error('No image data provided');
    }

    console.log('Converting image to WebP with quality:', quality);

    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Convert base64 to Uint8Array
    const imageData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    // Create a blob from the image data
    const imageBlob = new Blob([imageData], { type: 'image/jpeg' });
    
    // Create an image element (using web APIs available in Deno)
    const imageUrl = URL.createObjectURL(imageBlob);
    
    // Use Canvas API to convert to WebP
    const canvas = new OffscreenCanvas(1024, 1024);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Create image bitmap from blob
    const imageBitmap = await createImageBitmap(imageBlob);
    
    // Set canvas dimensions to match image
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    
    // Draw image to canvas
    ctx.drawImage(imageBitmap, 0, 0);
    
    // Convert to WebP blob
    const webpBlob = await canvas.convertToBlob({
      type: 'image/webp',
      quality: quality
    });
    
    // Convert blob to base64
    const arrayBuffer = await webpBlob.arrayBuffer();
    const webpBase64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    // Clean up
    URL.revokeObjectURL(imageUrl);
    imageBitmap.close();
    
    console.log('✅ Successfully converted image to WebP');
    
    return new Response(
      JSON.stringify({ 
        webpBase64: `data:image/webp;base64,${webpBase64}`,
        originalSize: imageData.length,
        webpSize: arrayBuffer.byteLength
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ WebP conversion error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'WebP conversion failed', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});