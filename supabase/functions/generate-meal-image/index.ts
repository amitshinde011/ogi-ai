import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
// ✅ Correctly import Squoosh from npm for deployment
import { ImagePool } from 'npm:@squoosh/lib@0.6.0';

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

  return await convertAndUploadToR2(imageBlob, recipe.name);
}

async function convertAndUploadToR2(imageBlob, recipeName) {
  try {
    const webpBlob = await convertToWebPServerSide(imageBlob, 85);
    const fileName = `automation-${Date.now()}-${recipeName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.webp`;
    
    const formData = new FormData();
    formData.append('file', webpBlob, fileName);
    formData.append('uploadType', 'meal');

    const { data, error } = await supabase.functions.invoke('upload-to-r2', { body: formData });
    if (error) throw new Error(`R2 upload failed: ${error.message}`);
    if (!data.success || !data.imageUrl) throw new Error(data.error || 'R2 upload unsuccessful');

    console.log('✅ Successfully uploaded compressed WebP image to R2:', data.imageUrl);
    return data.imageUrl;
  } catch (error) {
    console.error('❌ Conversion or upload failed:', error.message);
    console.log('🔄 Attempting fallback upload with original image...');
    return await fallbackUpload(imageBlob, recipeName);
  }
}

async function fallbackUpload(imageBlob, recipeName) {
    const fallbackFileName = `automation-fallback-${Date.now()}-${recipeName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.jpg`;
    const formData = new FormData();
    formData.append('file', imageBlob, fallbackFileName);
    formData.append('uploadType', 'meal');

    const { data, error } = await supabase.functions.invoke('upload-to-r2', { body: formData });
    if (error) throw new Error(`Fallback upload also failed: ${error.message}`);
    if (!data.success) throw new Error(data.error || 'Fallback upload failed');
    
    console.log('✅ Fallback upload successful:', data.imageUrl);
    return data.imageUrl;
}

async function convertToWebPServerSide(imageBlob, quality = 85) {
  const imagePool = new ImagePool();
  try {
    console.log('📦 Converting image with Squoosh...');
    const image = imagePool.ingestImage(await imageBlob.arrayBuffer());
    
    const { width: originalWidth, height: originalHeight } = await image.decoded;
    const maxDimension = 1024;
    let newWidth = originalWidth;
    let newHeight = originalHeight;

    if (originalWidth > maxDimension || originalHeight > maxDimension) {
      const ratio = Math.min(maxDimension / originalWidth, maxDimension / originalHeight);
      newWidth = Math.round(originalWidth * ratio);
      newHeight = Math.round(originalHeight * ratio);
    }

    await image.preprocess({ resize: { enabled: true, width: newWidth, height: newHeight } });
    await image.encode({ webp: { quality: quality } });
    
    const { binary } = await image.encodedWith.webp;
    return new Blob([binary], { type: 'image/webp' });
  } catch (error) {
    throw new Error(`Squoosh conversion failed: ${error.message}`);
  } finally {
    await imagePool.close();
  }
}