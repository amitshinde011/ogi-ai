import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Sample meal content (would be expanded with real images)
const mealContent = [
  // Breakfast items
  {
    meal_type: 'breakfast',
    cuisine_type: 'indian',
    image_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=breakfast1&backgroundColor=fff2e6',
    dietary_tags: ['vegetarian', 'protein_rich'],
    ingredients: ['oats', 'banana', 'almonds', 'honey']
  },
  {
    meal_type: 'breakfast',
    cuisine_type: 'mediterranean',
    image_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=breakfast2&backgroundColor=e6f3ff',
    dietary_tags: ['vegan', 'high_fiber'],
    ingredients: ['avocado', 'tomato', 'whole_grain_bread', 'olive_oil']
  },
  // Add more meal types...
]

const captionTemplates = [
  // Nutritionist captions
  {
    template_text: "🥗 This colorful bowl is packed with {nutrients}! The {ingredient} provides {benefit}. Perfect for {meal_time}! #HealthyEating #Nutrition",
    meal_type: 'breakfast',
    persona_type: 'nutritionist',
    variables: ['nutrients', 'ingredient', 'benefit', 'meal_time']
  },
  {
    template_text: "💪 Starting my day with this protein-rich {meal}! The combination of {ingredient1} and {ingredient2} gives me sustained energy. #MorningFuel #ProteinPower",
    meal_type: 'breakfast',
    persona_type: 'fitness_enthusiast',
    variables: ['meal', 'ingredient1', 'ingredient2']
  },
  // Add more templates...
]

const commentTemplates = [
  // Meal identification comments
  {
    template_text: "That looks like a delicious {identified_food}! 🥗 Great source of {nutrient_benefit}!",
    comment_type: 'meal_identification',
    context_tags: ['healthy', 'colorful', 'bowl'],
    persona_type: 'nutritionist'
  },
  {
    template_text: "I can see some beautiful {spice_or_ingredient} in there - fantastic {health_property} properties! 💛",
    comment_type: 'meal_identification',
    context_tags: ['spices', 'indian', 'colorful'],
    persona_type: 'nutritionist'
  },
  {
    template_text: "Those {cooking_method} vegetables look perfectly {description}! Did you use any specific seasoning?",
    comment_type: 'cooking_tip',
    context_tags: ['vegetables', 'cooked', 'roasted'],
    persona_type: 'traditional_cuisine'
  },
  // Add more comment types...
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Populating content library...')

    // Insert meal content
    const { error: mealError } = await supabase
      .from('automation_meal_content')
      .insert(mealContent)

    if (mealError) {
      console.error('Error inserting meal content:', mealError)
      return new Response(
        JSON.stringify({ error: mealError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Insert caption templates
    const { error: captionError } = await supabase
      .from('automation_captions')
      .insert(captionTemplates)

    if (captionError) {
      console.error('Error inserting caption templates:', captionError)
      return new Response(
        JSON.stringify({ error: captionError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Insert comment templates
    const { error: commentError } = await supabase
      .from('automation_comments')
      .insert(commentTemplates)

    if (commentError) {
      console.error('Error inserting comment templates:', commentError)
      return new Response(
        JSON.stringify({ error: commentError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Content library populated successfully',
        stats: {
          meal_content: mealContent.length,
          caption_templates: captionTemplates.length,
          comment_templates: commentTemplates.length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error populating content library:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})