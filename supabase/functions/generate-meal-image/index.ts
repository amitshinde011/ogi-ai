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
  let categoryFilter = '';
  
  if (mealType === 'breakfast') {
    categoryFilter = `category = 'Salads'`;
  } else if (mealType === 'lunch' || mealType === 'dinner') {
    categoryFilter = `category NOT IN ('Sweets & Desserts')`;
  } else {
    categoryFilter = `category NOT IN ('Sweets & Desserts')`;
  }
  
  const { data, error } = await supabase
    .from('recipes')
    .select('id, name, ingredients, category, instructions')
    .raw(categoryFilter)
    .order('RANDOM()')
    .limit(1)
    .single();
  
  if (error) {
    console.error('Error fetching recipe:', error);
    return null;
  }
  
  return data;
}

async function generateImageWithGoogle(recipe: Recipe): Promise<string> {
  const apiKey = Deno.env.get('GOOGLE_AI_STUDIO_API_KEY');
  if (!apiKey) {
    throw new Error('Google AI Studio API key not configured');
  }

  // Create a realistic mobile photography prompt
  const prompt = `A mobile phone photo of ${recipe.name} served on a simple white plate, natural indoor lighting, slightly imperfect angle, home kitchen setting, realistic food presentation, vegetarian healthy meal, casual phone camera quality, soft shadows, warm lighting, ingredients visible: ${recipe.ingredients.substring(0, 200)}`;

  console.log('Generated prompt:', prompt);

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImage?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt,
      generationConfig: {
        aspectRatio: "1:1",
        negativePrompt: "professional food photography, studio lighting, perfect plating, restaurant quality, artificial lighting, too perfect",
        outputOptions: {
          mimeType: "image/jpeg",
          compressionQuality: 80
        }
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_ONLY_HIGH"
        }
      ]
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google AI Studio API error:', errorText);
    throw new Error(`Google AI Studio API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].image) {
    throw new Error('No image generated from Google AI Studio');
  }

  // Convert base64 to blob URL for temporary use
  const base64Data = data.candidates[0].image.imageBytes;
  const imageUrl = `data:image/jpeg;base64,${base64Data}`;
  
  console.log('Successfully generated image for recipe:', recipe.name);
  return imageUrl;
}