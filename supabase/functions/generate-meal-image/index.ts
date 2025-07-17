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
    
    // Generate image using OpenAI
    const imageUrl = await generateImageWithOpenAI(recipe);
    
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

async function generateImageWithOpenAI(recipe: Recipe): Promise<string> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    console.error('❌ OpenAI API key not configured');
    throw new Error('OpenAI API key not configured');
  }
  
  console.log('🔑 OpenAI API key is configured');

  // Create a realistic mobile photography prompt
  const prompt = `A mobile phone photo of ${recipe.name} served on a simple white plate, natural indoor lighting, slightly imperfect angle, home kitchen setting, realistic food presentation, vegetarian healthy meal, casual phone camera quality, soft shadows, warm lighting, ingredients visible: ${recipe.ingredients.substring(0, 200)}`;

  console.log('Generated prompt:', prompt);

  // Use OpenAI's image generation API
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard'
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', errorText);
    throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  console.log('OpenAI response received');

  if (!data.data || !data.data[0] || !data.data[0].url) {
    console.error('No image data in response:', JSON.stringify(data, null, 2));
    throw new Error('No image generated from OpenAI');
  }

  const imageUrl = data.data[0].url;
  console.log('✅ Successfully generated image for recipe:', recipe.name);
  return imageUrl;
}