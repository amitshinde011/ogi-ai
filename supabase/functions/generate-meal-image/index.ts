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
    const imageUrl = await generateImageWithGoogle(recipe);
    
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

async function generateImageWithGoogle(recipe: Recipe): Promise<string> {
  const apiKey = Deno.env.get('GOOGLE_AI_STUDIO_API_KEY');
  if (!apiKey) {
    console.error('❌ Google AI Studio API key not configured');
    throw new Error('Google AI Studio API key not configured');
  }
  
  console.log('🔑 Google AI Studio API key is configured');

  // Create a realistic mobile photography prompt
  const prompt = `Generate an image: A mobile phone photo of ${recipe.name} served on a simple white plate, natural indoor lighting, slightly imperfect angle, home kitchen setting, realistic food presentation, vegetarian healthy meal, casual phone camera quality, soft shadows, warm lighting, ingredients visible: ${recipe.ingredients.substring(0, 200)}`;

  console.log('Generated prompt:', prompt);

  // Use the correct Gemini 1.5 Pro model and API endpoint
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    // Use the correct Gemini API request format
    body: JSON.stringify({
      "contents": [
        {
          "parts": [
            { "text": "Generate an image with the following prompt, do not add any text or commentary, just generate the image." },
            { "text": prompt }
          ]
        }
      ],
      "tools": [
        {
          "function_declarations": [
            {
              "name": "image_generator",
              "description": "Generates an image based on a textual prompt.",
              "parameters": {
                "type": "OBJECT",
                "properties": {
                  "prompt": {
                    "type": "STRING",
                    "description": "The textual prompt to generate the image from."
                  }
                },
                "required": ["prompt"]
              }
            }
          ]
        }
      ],
      "tool_config": {
        "function_calling_config": {
          "mode": "ANY",
          "allowed_function_names": ["image_generator"]
        }
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google AI Studio API error:', errorText);
    throw new Error(`Google AI Studio API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  console.log('Google AI Studio response:', JSON.stringify(data, null, 2));

  // Update response parsing for the Gemini API format
  const imageDataPart = data.candidates?.[0]?.content?.parts?.[0];
  if (!imageDataPart || !imageDataPart.fileData || !imageDataPart.fileData.fileUri) {
     console.error('No image data in response:', JSON.stringify(data, null, 2));
     throw new Error('No image generated from Google AI Studio');
  }

  // The image data is in fileUri as a base64 string
  const base64Data = imageDataPart.fileData.fileUri.replace('data:image/jpeg;base64,', '');
  const imageUrl = `data:image/jpeg;base64,${base64Data}`;

  console.log('✅ Successfully generated image for recipe:', recipe.name);
  return imageUrl;
}