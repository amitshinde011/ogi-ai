
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

  const prompt = `A candid, high-quality mobile phone photo of a freshly made vegetarian meal, "${recipe.name}".
The final dish should look exactly as if prepared following these instructions: "${recipe.instructions}".
Present the meal realistically in an appropriate serving vessel as suggested by the recipe, for example: a deep bowl for soup, salad, or gravy; a glass for a smoothie or drink; a baking dish for a casserole; or a plate for main courses.
The setting is a real home kitchen with warm, natural indoor lighting creating soft shadows. Capture the photo from a casual, slightly imperfect angle, as if taken by the person who just cooked it. Include a subtle, natural human element, like a hand resting near the dish or a fork partway through a bite. The food presentation should be appealing but not overly perfect, emphasizing its home-cooked nature. Make sure key visual ingredients like ${recipe.ingredients} are identifiable in the dish.`;
  console.log(`Prompt: ${prompt}`);
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

  // Upload original JPEG (WebP conversion will be handled by admin interface)
  return await convertAndUploadToSupabase(imageBlob, recipe.name, 'jpg');
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
      return await fallbackSupabaseUpload(imageBlob, recipeName, fileExtension);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('bot-posts')
      .getPublicUrl(fileName);

    console.log(`✅ Successfully uploaded ${fileExtension.toUpperCase()} image to Supabase`);
    return publicUrl;

  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    return await fallbackSupabaseUpload(imageBlob, recipeName, fileExtension);
  }
}

async function fallbackSupabaseUpload(imageBlob, recipeName, fileExtension = 'jpg') {
  const fallbackFileName = `automation-fallback-${Date.now()}-${recipeName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.${fileExtension}`;
  const contentType = fileExtension === 'webp' ? 'image/webp' : 'image/jpeg';
  
  const { data, error } = await supabase.storage
    .from('bot-posts')
    .upload(fallbackFileName, imageBlob, {
      contentType: contentType,
      upsert: false
    });

  if (error) throw new Error(`Fallback Supabase upload failed: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage
    .from('bot-posts')
    .getPublicUrl(fallbackFileName);
  
  console.log(`✅ Fallback upload successful: ${fileExtension.toUpperCase()}`);
  return publicUrl;
}
