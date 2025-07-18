import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface Recipe {
  id: string;
  name: string;
  ingredients: string;
  category: string;
  instructions: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
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
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating meal image:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getRandomRecipe(mealType: string): Promise<Recipe | null> {
  let query = supabase
    .from('recipes')
    .select('id, name, ingredients, category, instructions');

  // Apply filters based on mealType using actual database categories
  if (mealType === 'breakfast') {
    // Get breakfast appropriate recipes using actual category names
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

async function generateImageWithGoogleAI(recipe: Recipe): Promise<string> {
  const apiKey = Deno.env.get('GOOGLE_AI_STUDIO_API_KEY');
  if (!apiKey) {
    console.error('❌ Google AI Studio API key not configured');
    throw new Error('Google AI Studio API key not configured');
  }
  
  console.log('🔑 Google AI Studio API key is configured');

  // Create a realistic mobile photography prompt
  const prompt = `Generate a realistic mobile phone photo of ${recipe.name} served on a simple white plate, natural indoor lighting, slightly imperfect angle, home kitchen setting, realistic food presentation, vegetarian healthy meal, casual phone camera quality, soft shadows, warm lighting, ingredients visible: ${recipe.ingredients.substring(0, 200)}`;

  console.log('Generated prompt:', prompt);

  // Use Google AI Studio's image generation API
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"]
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google AI Studio API error:', errorText);
    throw new Error(`Google AI Studio API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  console.log('Google AI Studio response received');

  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
    console.error('No content in response:', JSON.stringify(data, null, 2));
    throw new Error('No content generated from Google AI Studio');
  }

  // Find the image part in the response
  const imagePart = data.candidates[0].content.parts.find((part: any) => part.inlineData);
  if (!imagePart || !imagePart.inlineData || !imagePart.inlineData.data) {
    console.error('No image data in response:', JSON.stringify(data, null, 2));
    throw new Error('No image generated from Google AI Studio');
  }

  const base64Data = imagePart.inlineData.data;
  const mimeType = imagePart.inlineData.mimeType;
  
  console.log('✅ Generated AI image, now converting and uploading to Supabase Storage...');
  
  // Convert base64 to blob
  const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
  const imageBlob = new Blob([imageBytes], { type: mimeType });
  
  // Upload to Supabase Storage (WebP conversion will be handled differently)
  const uploadedImageUrl = await convertAndUploadToSupabase(imageBlob, recipe.name);
  
  console.log('✅ Successfully generated and uploaded image for recipe:', recipe.name);
  return uploadedImageUrl;
}

async function convertAndUploadToSupabase(imageBlob: Blob, recipeName: string): Promise<string> {
  console.log(`📦 Preparing to compress and convert image for recipe: ${recipeName}`);
  console.log(`📊 Original image size: ${imageBlob.size} bytes, type: ${imageBlob.type}`);
  
  // Convert to WebP using ImageData processing similar to real user uploads
  const webpBlob = await convertToWebPServerSide(imageBlob, 0.85);
  
  // Create file path
  const fileName = `automation-${Date.now()}-${recipeName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.webp`;
  const filePath = `meals/${fileName}`;
  
  console.log(`📤 Uploading compressed WebP image as: ${fileName}`);
  console.log(`📊 Compressed size: ${webpBlob.size} bytes (${Math.round((1 - webpBlob.size / imageBlob.size) * 100)}% reduction)`);
  
  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('bot-posts')
    .upload(filePath, webpBlob, {
      contentType: 'image/webp',
      cacheControl: '3600',
      upsert: true
    });
  
  if (error) {
    console.error('❌ Error uploading to Supabase Storage:', error);
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }
  
  if (!data) {
    console.error('❌ Supabase Storage upload unsuccessful: no data returned');
    throw new Error('Supabase Storage upload failed: no data returned');
  }
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('bot-posts')
    .getPublicUrl(filePath);
  
  console.log('✅ Successfully uploaded compressed WebP image to Supabase Storage:', urlData.publicUrl);
  return urlData.publicUrl;
}

async function convertToWebPServerSide(imageBlob: Blob, quality = 0.85): Promise<Blob> {
  try {
    console.log(`🎨 Converting image to WebP format...`);
    
    // Create ImageBitmap from the blob
    const imageBitmap = await createImageBitmap(imageBlob);
    
    // Calculate compressed dimensions
    const maxDimension = 1024;
    let { width, height } = imageBitmap;
    if (width > maxDimension || height > maxDimension) {
      const ratio = Math.min(maxDimension / width, maxDimension / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }
    
    // Create canvas element for image processing
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get 2D context from OffscreenCanvas');
    }

    // Fill with white background first (important for WebP conversion)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    
    // Draw the image onto the canvas
    ctx.drawImage(imageBitmap, 0, 0, width, height);
    
    // Get ImageData to ensure proper pixel data
    const imageData = ctx.getImageData(0, 0, width, height);
    
    // Clear canvas and redraw with proper ImageData
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    ctx.putImageData(imageData, 0, 0);
    
    // Convert to WebP blob
    const webpBlob = await canvas.convertToBlob({
      type: 'image/webp',
      quality: quality
    });
    
    // Verify the conversion worked
    if (webpBlob.type !== 'image/webp') {
      throw new Error(`WebP conversion failed: got ${webpBlob.type} instead of image/webp`);
    }
    
    console.log(`✅ Successfully converted to WebP. Original: ${imageBlob.size} bytes → WebP: ${webpBlob.size} bytes (${Math.round((1 - webpBlob.size / imageBlob.size) * 100)}% reduction)`);
    return webpBlob;
    
  } catch (error) {
    console.error('❌ WebP conversion failed:', error);
    throw new Error(`WebP conversion failed: ${error.message}`);
  }
}