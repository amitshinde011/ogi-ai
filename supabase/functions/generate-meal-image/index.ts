import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { ImagePool } from 'https://esm.sh/@squoosh/lib@0.6.0';

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
    
    // Get a random recipe based on meal type
    const recipe = await getRandomRecipe(mealType);
    if (!recipe) {
      throw new Error(`No recipe found for meal type: ${mealType}`);
    }
    console.log(`Selected recipe: ${recipe.name} (${recipe.category})`);

    // Generate image using Google AI Studio
    const imageUrl = await generateImageWithGoogleAI(recipe);
    
    return new Response(JSON.stringify({
      imageUrl,
      recipe: {
        id: recipe.id,
        name: recipe.name,
        category: recipe.category
      }
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error generating meal image:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});

async function getRandomRecipe(mealType) {
  let query = supabase.from('recipes').select('id, name, ingredients, category, instructions');

  // Apply filters based on mealType using actual database categories
  if (mealType === 'breakfast') {
    query = query.in('category', ['Breads & Breakfast Dishes', 'Salads', 'Beverages']);
  } else {
    // For lunch, dinner, or any other type - exclude desserts
    query = query.not('category', 'eq', 'Sweets & Desserts');
  }

  // Get all matching recipes first, then pick random one
  const { data: allRecipes, error } = await query;
  if (error) {
    console.error('Error fetching recipes:', error);
    return null;
  }
  if (!allRecipes || allRecipes.length === 0) {
    console.error(`No recipes found for meal type: ${mealType}`);
    return null;
  }

  // Pick a random recipe from the results
  const randomIndex = Math.floor(Math.random() * allRecipes.length);
  console.log(`Found ${allRecipes.length} recipes for ${mealType}, selected: ${allRecipes[randomIndex].name}`);
  return allRecipes[randomIndex];
}

async function generateImageWithGoogleAI(recipe) {
  const apiKey = Deno.env.get('GOOGLE_AI_STUDIO_API_KEY');
  if (!apiKey) {
    throw new Error('Google AI Studio API key not configured');
  }
  console.log('🔑 Google AI Studio API key is configured');

  const prompt = `Generate a realistic mobile phone photo of ${recipe.name} served on a simple white plate, natural indoor lighting, slightly imperfect angle, home kitchen setting, realistic food presentation, vegetarian healthy meal, casual phone camera quality, soft shadows, warm lighting, ingredients visible: ${recipe.ingredients.substring(0, 200)}`;
  console.log('Generated prompt:', prompt);

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
  if (!data.candidates?.[0]?.content?.parts) {
    throw new Error('No content generated from Google AI Studio');
  }

  const imagePart = data.candidates[0].content.parts.find(part => part.inlineData);
  if (!imagePart?.inlineData?.data) {
    throw new Error('No image generated from Google AI Studio');
  }

  const base64Data = imagePart.inlineData.data;
  const mimeType = imagePart.inlineData.mimeType;
  console.log('✅ Generated AI image, now converting and uploading...');

  const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
  const imageBlob = new Blob([imageBytes], { type: mimeType });

  const uploadedImageUrl = await convertAndUploadToR2(imageBlob, recipe.name);
  console.log('✅ Successfully generated and uploaded image for recipe:', recipe.name);
  return uploadedImageUrl;
}

async function convertAndUploadToR2(imageBlob, recipeName) {
  try {
    console.log(`📦 Preparing to compress and convert image for recipe: ${recipeName}`);
    
    const webpBlob = await convertToWebPServerSide(imageBlob, 85);

    const formData = new FormData();
    const fileName = `automation-${Date.now()}-${recipeName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.webp`;
    formData.append('file', webpBlob, fileName);
    formData.append('uploadType', 'meal');

    console.log(`📤 Uploading compressed WebP image as: ${fileName}`);
    console.log(`📊 Original size: ${imageBlob.size} bytes | Compressed size: ${webpBlob.size} bytes`);

    const { data, error } = await supabase.functions.invoke('upload-to-r2', { body: formData });

    if (error) {
      throw new Error(`R2 upload failed: ${error.message}`);
    }
    if (!data.success || !data.imageUrl) {
      throw new Error(data.error || 'R2 upload unsuccessful');
    }
    
    console.log('✅ Successfully uploaded compressed WebP image to R2:', data.imageUrl);
    return data.imageUrl;
  } catch (error) {
    console.error('❌ Error in convertAndUploadToR2:', error);
    // As a final fallback, try uploading the original, unconverted image.
    console.log('🔄 Attempting fallback upload with original image...');
    try {
      const formData = new FormData();
      const fallbackFileName = `automation-fallback-${Date.now()}-${recipeName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.jpg`;
      formData.append('file', imageBlob, fallbackFileName);
      formData.append('uploadType', 'meal');
      
      const { data, error: fallbackError } = await supabase.functions.invoke('upload-to-r2', { body: formData });
      if (fallbackError) throw fallbackError;
      if (!data.success) throw new Error(data.error || 'Fallback upload failed');
      
      console.log('✅ Fallback upload successful:', data.imageUrl);
      return data.imageUrl;
    } catch (fallbackError) {
      console.error('❌ Fallback upload also failed:', fallbackError);
      throw error; // Throw original error
    }
  }
}

async function convertToWebPServerSide(imageBlob, quality = 85) {
  // Use a new ImagePool for each conversion to ensure clean state
  const imagePool = new ImagePool();

  try {
    console.log('📦 Converting image with Squoosh...');
    
    // Ingest the image from the blob
    const image = imagePool.ingestImage(await imageBlob.arrayBuffer());

    // Get original dimensions for resizing
    const { width: originalWidth, height: originalHeight } = await image.decoded;
    const maxDimension = 1024;
    let newWidth = originalWidth;
    let newHeight = originalHeight;

    // Calculate new dimensions while maintaining aspect ratio
    if (originalWidth > maxDimension || originalHeight > maxDimension) {
      const ratio = Math.min(maxDimension / originalWidth, maxDimension / originalHeight);
      newWidth = Math.round(originalWidth * ratio);
      newHeight = Math.round(originalHeight * ratio);
      console.log(`📏 Resizing image from ${originalWidth}x${originalHeight} to ${newWidth}x${newHeight}`);
    }

    // Preprocess the image (resize)
    await image.preprocess({
      resize: {
        enabled: true,
        width: newWidth,
        height: newHeight,
      },
    });

    // Encode the image to WebP format
    await image.encode({
      webp: {
        quality: quality,
      },
    });

    // Get the raw binary data of the converted image
    const { binary } = await image.encodedWith.webp;
    
    // Create a new blob from the WebP data
    const webpBlob = new Blob([binary], { type: 'image/webp' });

    console.log(`✅ Successfully converted to WebP with Squoosh`);
    return webpBlob;

  } catch (error) {
    console.error('❌ Squoosh conversion failed:', error);
    console.log('🔄 Using original image due to conversion failure');
    return imageBlob; // Fallback to the original image
    
  } finally {
    // IMPORTANT: Always close the image pool to free up memory
    await imagePool.close();
  }
}