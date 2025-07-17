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
    return new Response(null, { headers: corsHeaders });
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
  
  console.log('✅ Generated AI image, now converting and uploading to R2...');
  
  // Convert base64 to blob
  const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
  const imageBlob = new Blob([imageBytes], { type: mimeType });
  
  // Upload to R2 (WebP conversion will be handled differently)
  const uploadedImageUrl = await convertAndUploadToR2(imageBlob, recipe.name);
  
  console.log('✅ Successfully generated and uploaded image for recipe:', recipe.name);
  return uploadedImageUrl;
}

async function convertAndUploadToR2(imageBlob: Blob, recipeName: string): Promise<string> {
  try {
    console.log(`📦 Preparing to upload image for recipe: ${recipeName}`);
    console.log(`📊 Original image size: ${imageBlob.size} bytes, type: ${imageBlob.type}`);
    
    // Since OffscreenCanvas is not available in Deno, we'll upload the original image
    // The upload-to-r2 function can handle WebP conversion if needed
    
    // Create FormData for upload
    const formData = new FormData();
    
    // Generate filename based on original type
    const fileExtension = imageBlob.type === 'image/webp' ? 'webp' : 
                         imageBlob.type === 'image/png' ? 'png' : 'jpg';
    const fileName = `automation-${Date.now()}-${recipeName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.${fileExtension}`;
    
    formData.append('file', imageBlob, fileName);
    formData.append('uploadType', 'meal');
    
    console.log(`📤 Uploading image as: ${fileName}`);
    
    // Upload to R2 using the upload function
    const { data, error } = await supabase.functions.invoke('upload-to-r2', {
      body: formData,
    });
    
    if (error) {
      console.error('❌ Error uploading to R2:', error);
      throw new Error(`R2 upload failed: ${error.message}`);
    }
    
    if (!data.success || !data.imageUrl) {
      console.error('❌ R2 upload unsuccessful:', data);
      throw new Error(data.error || 'R2 upload failed');
    }
    
    console.log('✅ Successfully uploaded image to R2:', data.imageUrl);
    return data.imageUrl;
    
  } catch (error) {
    console.error('❌ Error in convertAndUploadToR2:', error);
    throw error;
  }
}