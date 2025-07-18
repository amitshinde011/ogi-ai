import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const { mealType, userId } = await req.json();
    console.log(`Generating image for meal type: ${mealType}, user: ${userId}`);
    
    const recipe = await getRandomRecipe(mealType);
    if (!recipe) {
      throw new Error(`No recipe found for meal type: ${mealType}`);
    }
    console.log(`Selected recipe: ${recipe.name} (${recipe.category})`);

    const imageUrl = await generateImageWithGoogleAI(recipe);
    
    return new Response(JSON.stringify({
      imageUrl,
      recipe: {
        id: recipe.id,
        name: recipe.name,
        category: recipe.category
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error generating meal image:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function getRandomRecipe(mealType) {
  let query = supabase.from('recipes').select('id, name, ingredients, category, instructions');

  if (mealType === 'breakfast') {
    query = query.in('category', ['Breads & Breakfast Dishes', 'Salads', 'Beverages']);
  } else {
    query = query.not('category', 'eq', 'Sweets & Desserts');
  }

  const { data: allRecipes, error } = await query;
  if (error) throw new Error('Error fetching recipes: ' + error.message);
  if (!allRecipes || allRecipes.length === 0) throw new Error(`No recipes found for meal type: ${mealType}`);

  const randomIndex = Math.floor(Math.random() * allRecipes.length);
  return allRecipes[randomIndex];
}

async function generateImageWithGoogleAI(recipe) {
  const apiKey = Deno.env.get('GOOGLE_AI_STUDIO_API_KEY');
  if (!apiKey) throw new Error('Google AI Studio API key not configured');

  const prompt = `Generate a realistic mobile phone photo of ${recipe.name} served on a simple white plate, natural indoor lighting, slightly imperfect angle, home kitchen setting, realistic food presentation, vegetarian healthy meal, casual phone camera quality, soft shadows, warm lighting, ingredients visible: ${recipe.ingredients.substring(0, 200)}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ["TEXT", "IMAGE"] }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google AI Studio API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const imagePart = data.candidates?.[0]?.content?.parts.find(part => part.inlineData);
  if (!imagePart?.inlineData?.data) throw new Error('No image generated from Google AI Studio');

  const imageBytes = Uint8Array.from(atob(imagePart.inlineData.data), c => c.charCodeAt(0));
  const imageBlob = new Blob([imageBytes], { type: imagePart.inlineData.mimeType });

  // Convert JPEG to WebP using dedicated conversion service
  console.log('🔄 Converting image to WebP...');
  const conversionResponse = await supabase.functions.invoke('convert-to-webp', {
    body: { 
      imageBase64: `data:image/jpeg;base64,${imagePart.inlineData.data}`,
      quality: 0.8 
    }
  });

  let finalImageBlob;
  let fileExtension = 'jpg';
  
  if (conversionResponse.error) {
    console.log('⚠️ WebP conversion failed, using original JPEG:', conversionResponse.error);
    finalImageBlob = imageBlob;
  } else {
    console.log('✅ Successfully converted to WebP');
    const { webpBase64 } = conversionResponse.data;
    
    // Convert WebP base64 back to blob
    const webpData = webpBase64.replace(/^data:image\/webp;base64,/, '');
    const webpBytes = Uint8Array.from(atob(webpData), c => c.charCodeAt(0));
    finalImageBlob = new Blob([webpBytes], { type: 'image/webp' });
    fileExtension = 'webp';
  }

  return await convertAndUploadToSupabase(finalImageBlob, recipe.name, fileExtension);
}

async function convertAndUploadToSupabase(imageBlob, recipeName, fileExtension = 'jpg') {
  try {
    console.log(`🔄 Uploading ${fileExtension.toUpperCase()} to Supabase...`);
    
    const fileName = `automation-${Date.now()}-${recipeName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${fileExtension}`;
    const contentType = fileExtension === 'webp' ? 'image/webp' : 'image/jpeg';
    
    const { data, error } = await supabase.storage
      .from('bot-posts')
      .upload(fileName, imageBlob, {
        contentType: contentType,
        cacheControl: '3600'
      });

    if (error) {
      console.log('⚠️ Upload failed, trying fallback...', error);
      return await fallbackSupabaseUpload(imageBlob, recipeName);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('bot-posts')
      .getPublicUrl(fileName);

    console.log(`✅ Successfully uploaded ${fileExtension.toUpperCase()} image to Supabase`);
    return publicUrl;

  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    return await fallbackSupabaseUpload(imageBlob, recipeName);
  }
}

// ✅ Fallback also uses JPEG
async function fallbackSupabaseUpload(imageBlob, recipeName) {
  const fallbackFileName = `automation-fallback-${Date.now()}-${recipeName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.jpg`;
  
  const { data, error } = await supabase.storage
    .from('bot-posts')
    .upload(fallbackFileName, imageBlob, {
      contentType: 'image/jpeg',
      upsert: false
    });

  if (error) throw new Error(`Fallback Supabase upload failed: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage
    .from('bot-posts')
    .getPublicUrl(fallbackFileName);
  
  console.log('✅ Fallback upload successful:', publicUrl);
  return publicUrl;
}

// ✅ Replaced Squoosh/WebP logic with reliable Canvas/JPEG logic
async function resizeImageAsJpeg(imageBlob, quality = 0.85) {
  try {
    const imageBitmap = await createImageBitmap(imageBlob);

    const maxDimension = 1024;
    let { width, height } = imageBitmap;
    if (width > maxDimension || height > maxDimension) {
      const ratio = Math.min(maxDimension / width, maxDimension / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');

    ctx.drawImage(imageBitmap, 0, 0, width, height);
    
    const jpegBlob = await canvas.convertToBlob({
      type: 'image/jpeg',
      quality: quality
    });

    console.log('✅ Successfully resized image to JPEG.');
    return jpegBlob;
  } catch (error) {
    throw new Error(`JPEG resizing failed: ${error.message}`);
  }
}