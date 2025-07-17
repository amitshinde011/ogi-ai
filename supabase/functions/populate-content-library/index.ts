import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Comprehensive meal content library for authentic posts
const mealContent = [
  // Indian Breakfast
  {
    meal_type: 'breakfast',
    cuisine_type: 'indian',
    dietary_tags: ['vegetarian', 'protein_rich'],
    ingredients: ['oats', 'banana', 'almonds', 'honey', 'cardamom']
  },
  {
    meal_type: 'breakfast',
    cuisine_type: 'indian',
    dietary_tags: ['vegan', 'high_fiber'],
    ingredients: ['poha', 'peas', 'onion', 'turmeric', 'mustard_seeds']
  },
  {
    meal_type: 'breakfast',
    cuisine_type: 'indian',
    dietary_tags: ['protein_rich', 'fermented'],
    ingredients: ['idli', 'sambar', 'coconut_chutney', 'curry_leaves']
  },
  
  // Indian Lunch
  {
    meal_type: 'lunch',
    cuisine_type: 'indian',
    dietary_tags: ['vegetarian', 'balanced'],
    ingredients: ['quinoa', 'dal', 'spinach', 'tomato', 'ginger']
  },
  {
    meal_type: 'lunch',
    cuisine_type: 'indian',
    dietary_tags: ['vegan', 'spicy'],
    ingredients: ['chickpeas', 'cauliflower', 'onion', 'garam_masala', 'cilantro']
  },
  
  // Indian Dinner
  {
    meal_type: 'dinner',
    cuisine_type: 'indian',
    dietary_tags: ['vegetarian', 'comfort'],
    ingredients: ['brown_rice', 'rajma', 'yogurt', 'cucumber', 'mint']
  },
  
  // Mediterranean Breakfast
  {
    meal_type: 'breakfast',
    cuisine_type: 'mediterranean',
    dietary_tags: ['vegan', 'healthy_fats'],
    ingredients: ['avocado', 'tomato', 'sourdough', 'olive_oil', 'basil']
  },
  {
    meal_type: 'breakfast',
    cuisine_type: 'mediterranean',
    dietary_tags: ['vegetarian', 'protein_rich'],
    ingredients: ['greek_yogurt', 'berries', 'honey', 'walnuts', 'granola']
  },
  
  // Mediterranean Lunch
  {
    meal_type: 'lunch',
    cuisine_type: 'mediterranean',
    dietary_tags: ['vegan', 'antioxidant_rich'],
    ingredients: ['lentils', 'bell_pepper', 'olives', 'feta', 'oregano']
  },
  {
    meal_type: 'lunch',
    cuisine_type: 'mediterranean',
    dietary_tags: ['vegetarian', 'fresh'],
    ingredients: ['quinoa', 'cucumber', 'cherry_tomato', 'chickpeas', 'lemon']
  },
  
  // Mediterranean Dinner
  {
    meal_type: 'dinner',
    cuisine_type: 'mediterranean',
    dietary_tags: ['vegetarian', 'omega_rich'],
    ingredients: ['eggplant', 'zucchini', 'tomato_sauce', 'herbs', 'olive_oil']
  },
  
  // Asian Fusion
  {
    meal_type: 'lunch',
    cuisine_type: 'asian',
    dietary_tags: ['vegan', 'umami'],
    ingredients: ['tofu', 'bok_choy', 'mushrooms', 'ginger', 'soy_sauce']
  },
  
  // American/International
  {
    meal_type: 'breakfast',
    cuisine_type: 'american',
    dietary_tags: ['vegan', 'antioxidant'],
    ingredients: ['acai', 'banana', 'granola', 'coconut', 'chia_seeds']
  },
  
  // Snacks
  {
    meal_type: 'snack',
    cuisine_type: 'indian',
    dietary_tags: ['healthy', 'crunchy'],
    ingredients: ['roasted_chickpeas', 'cumin', 'chaat_masala', 'lemon']
  },
  {
    meal_type: 'snack',
    cuisine_type: 'mediterranean',
    dietary_tags: ['healthy_fats', 'protein'],
    ingredients: ['hummus', 'carrots', 'bell_pepper', 'olive_oil', 'paprika']
  }
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
    template_text: "💚 Love how this {meal} combines {ingredient1} and {ingredient2} for optimal nutrition! The antioxidants here are incredible. #NutritionFacts #WellnessJourney",
    meal_type: 'lunch',
    persona_type: 'nutritionist',
    variables: ['meal', 'ingredient1', 'ingredient2']
  },
  
  // Fitness Enthusiast captions
  {
    template_text: "💪 Starting my day with this protein-rich {meal}! The combination of {ingredient1} and {ingredient2} gives me sustained energy. #MorningFuel #ProteinPower",
    meal_type: 'breakfast',
    persona_type: 'fitness_enthusiast',
    variables: ['meal', 'ingredient1', 'ingredient2']
  },
  {
    template_text: "🏃‍♀️ Post-workout fuel! This {meal} with {ingredient} is exactly what my muscles need for recovery. #PostWorkout #FitnessFood #RecoveryMeal",
    meal_type: 'lunch',
    persona_type: 'fitness_enthusiast',
    variables: ['meal', 'ingredient']
  },
  
  // Plant-based captions
  {
    template_text: "🌱 Another delicious plant-powered meal! The {ingredient1} and {ingredient2} combo is pure magic. Who says vegan food is boring? #PlantBased #VeganLife",
    meal_type: 'breakfast',
    persona_type: 'plant_based',
    variables: ['ingredient1', 'ingredient2']
  },
  {
    template_text: "🌿 Loving this colorful {meal}! Each ingredient brings unique nutrients - {ingredient} is especially amazing for {benefit}. #PlantPower #Sustainable",
    meal_type: 'lunch',
    persona_type: 'plant_based',
    variables: ['meal', 'ingredient', 'benefit']
  },
  
  // Traditional Cuisine captions
  {
    template_text: "🏺 There's something special about traditional {meal} recipes. The way {ingredient1} and {ingredient2} blend together is pure comfort! #Traditional #Heritage",
    meal_type: 'dinner',
    persona_type: 'traditional_cuisine',
    variables: ['meal', 'ingredient1', 'ingredient2']
  },
  {
    template_text: "👵 Made this {meal} using my grandmother's recipe! The secret is in the {ingredient} - it makes all the difference. #FamilyRecipe #TraditionalFood",
    meal_type: 'lunch',
    persona_type: 'traditional_cuisine',
    variables: ['meal', 'ingredient']
  },
  
  // Busy Professional captions
  {
    template_text: "⏰ Quick {meal_time} that doesn't compromise on nutrition! Prepped this {meal} in 15 minutes. {ingredient} makes it so satisfying! #QuickMeals #BusyLife",
    meal_type: 'breakfast',
    persona_type: 'busy_professional',
    variables: ['meal_time', 'meal', 'ingredient']
  },
  {
    template_text: "💼 Meal prep Sunday paying off! This {meal} with {ingredient1} keeps me energized through my busy afternoon. #MealPrep #ProductiveEating",
    meal_type: 'lunch',
    persona_type: 'busy_professional',
    variables: ['meal', 'ingredient1']
  },
  
  // Wellness Coach captions
  {
    template_text: "✨ Mindful eating starts with colorful plates! This {meal} brings together {ingredient1} and {ingredient2} for beautiful balance. #MindfulEating #Wellness",
    meal_type: 'breakfast',
    persona_type: 'wellness_coach',
    variables: ['meal', 'ingredient1', 'ingredient2']
  },
  {
    template_text: "🧘‍♀️ Nourishing my body with this beautiful {meal}. The {ingredient} helps me feel grounded and energized. What's nourishing you today? #SelfCare #Nourishment",
    meal_type: 'dinner',
    persona_type: 'wellness_coach',
    variables: ['meal', 'ingredient']
  }
]

const commentTemplates = [
  // Meal identification comments - Nutritionist
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
    template_text: "Love the nutrient density in this meal! The {ingredient} provides excellent {vitamin_mineral} content. 🌟",
    comment_type: 'nutritional_tip',
    context_tags: ['healthy', 'balanced', 'nutrition'],
    persona_type: 'nutritionist'
  },
  
  // Cooking tips - Traditional Cuisine
  {
    template_text: "Those {cooking_method} vegetables look perfectly {description}! Did you use any specific seasoning?",
    comment_type: 'cooking_tip',
    context_tags: ['vegetables', 'cooked', 'roasted'],
    persona_type: 'traditional_cuisine'
  },
  {
    template_text: "The color on that {dish} is absolutely perfect! I can tell you nailed the {cooking_technique}. 👨‍🍳",
    comment_type: 'cooking_tip',
    context_tags: ['cooked', 'golden', 'traditional'],
    persona_type: 'traditional_cuisine'
  },
  
  // Fitness motivation - Fitness Enthusiast
  {
    template_text: "Perfect post-workout fuel! 💪 That {protein_source} will help with muscle recovery beautifully.",
    comment_type: 'encouragement',
    context_tags: ['protein_rich', 'healthy', 'fitness'],
    persona_type: 'fitness_enthusiast'
  },
  {
    template_text: "Now that's what I call balanced nutrition! The {macro_nutrient} ratio looks spot on. 🎯",
    comment_type: 'nutritional_tip',
    context_tags: ['balanced', 'protein', 'healthy'],
    persona_type: 'fitness_enthusiast'
  },
  
  // Plant-based enthusiasm 
  {
    template_text: "Plant power at its finest! 🌱 The {plant_food} in this meal is such a nutritional powerhouse!",
    comment_type: 'encouragement',
    context_tags: ['vegan', 'plant_based', 'colorful'],
    persona_type: 'plant_based'
  },
  {
    template_text: "This is why I love plant-based eating! So much {nutrient_type} in one beautiful bowl. 🌈",
    comment_type: 'meal_identification',
    context_tags: ['colorful', 'vegan', 'bowl'],
    persona_type: 'plant_based'
  },
  
  // Wellness & mindfulness - Wellness Coach
  {
    template_text: "What a nourishing choice! 🙏 This meal looks like it was prepared with so much love and intention.",
    comment_type: 'encouragement',
    context_tags: ['healthy', 'mindful', 'beautiful'],
    persona_type: 'wellness_coach'
  },
  {
    template_text: "I love how this meal embodies the principle of eating the rainbow! 🌈 Each color brings unique benefits.",
    comment_type: 'nutritional_tip',
    context_tags: ['colorful', 'variety', 'healthy'],
    persona_type: 'wellness_coach'
  },
  
  // Quick meal appreciation - Busy Professional
  {
    template_text: "This looks both nutritious AND time-efficient! ⏰ Perfect for busy days. Mind sharing your prep time?",
    comment_type: 'cooking_tip',
    context_tags: ['quick', 'simple', 'healthy'],
    persona_type: 'busy_professional'
  },
  {
    template_text: "Love seeing healthy meals that don't require hours in the kitchen! The {ingredient} is such a smart choice. 🧠",
    comment_type: 'encouragement',
    context_tags: ['quick', 'efficient', 'smart'],
    persona_type: 'busy_professional'
  }
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