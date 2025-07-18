import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface AutomationUser {
  id: string
  user_id: string
  name: string
  timezone: string
  persona_type: string
  cuisine_specialty: string[]
}

interface MealContent {
  id: string
  image_url: string
  meal_type: string
  cuisine_type: string
  ingredients: string[]
}

interface CaptionTemplate {
  template_text: string
  variables: string[]
}

function getLocalTimeHour(timezone: string): number {
  try {
    const now = new Date()
    const localTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }))
    return localTime.getHours()
  } catch (error) {
    console.error(`Invalid timezone: ${timezone}`, error)
    // Fallback to UTC if timezone is invalid
    return new Date().getUTCHours()
  }
}

function shouldPostNow(timezone: string, lastPostTime?: string, isManualTrigger = false): { shouldPost: boolean, mealType?: string } {
  const hour = getLocalTimeHour(timezone)
  const now = new Date()
  
  // For manual triggers, always post if not posted in last 10 minutes
  if (isManualTrigger) {
    if (lastPostTime) {
      const lastPost = new Date(lastPostTime)
      const minutesSinceLastPost = (now.getTime() - lastPost.getTime()) / (1000 * 60)
      if (minutesSinceLastPost < 10) {
        return { shouldPost: false }
      }
    }
    
    // Force post with appropriate meal type for manual triggers
    if (hour >= 6 && hour <= 9) {
      return { shouldPost: true, mealType: 'breakfast' }
    } else if (hour >= 12 && hour <= 14) {
      return { shouldPost: true, mealType: 'lunch' }
    } else if (hour >= 18 && hour <= 20) {
      return { shouldPost: true, mealType: 'dinner' }
    } else if (hour >= 15 && hour <= 17) {
      return { shouldPost: true, mealType: 'snack' }
    } else {
      // Default to lunch for manual triggers outside meal times
      return { shouldPost: true, mealType: 'lunch' }
    }
  }
  
  // Check if already posted in the last 1 hour (reduced cooldown) - skip for manual triggers
  if (lastPostTime) {
    const lastPost = new Date(lastPostTime)
    const hoursSinceLastPost = (now.getTime() - lastPost.getTime()) / (1000 * 60 * 60)
    if (hoursSinceLastPost < 1) {
      return { shouldPost: false }
    }
  }

  // Determine meal time and add randomness
  const randomOffset = Math.random() * 30 - 15 // ±15 minutes
  const effectiveHour = hour + randomOffset / 60

  if (effectiveHour >= 6 && effectiveHour <= 9) {
    return { shouldPost: Math.random() > 0.3, mealType: 'breakfast' } // 70% chance
  } else if (effectiveHour >= 12 && effectiveHour <= 14) {
    return { shouldPost: Math.random() > 0.2, mealType: 'lunch' } // 80% chance
  } else if (effectiveHour >= 18 && effectiveHour <= 20) {
    return { shouldPost: Math.random() > 0.1, mealType: 'dinner' } // 90% chance
  } else if (effectiveHour >= 15 && effectiveHour <= 17) {
    return { shouldPost: Math.random() > 0.7, mealType: 'snack' } // 30% chance
  }

  return { shouldPost: false }
}

function generateCaption(template: CaptionTemplate, mealContent: MealContent, persona: string): string {
  let caption = template.template_text

  // Simple variable replacement based on meal content
  const replacements: Record<string, string> = {
    meal: mealContent.meal_type,
    ingredient: mealContent.ingredients[0] || 'healthy ingredient',
    ingredient1: mealContent.ingredients[0] || 'protein',
    ingredient2: mealContent.ingredients[1] || 'fiber',
    nutrients: mealContent.ingredients.slice(0, 2).join(' and '),
    benefit: 'sustained energy and nutrition',
    meal_time: mealContent.meal_type === 'breakfast' ? 'starting the day' : 
              mealContent.meal_type === 'lunch' ? 'midday fuel' : 'evening nourishment'
  }

  // Replace variables in template
  template.variables?.forEach(variable => {
    const replacement = replacements[variable] || variable
    caption = caption.replace(`{${variable}}`, replacement)
  })

  return caption
}

async function generateMealImage(automationUser: AutomationUser, mealType: string): Promise<{ imageUrl: string, recipe: any } | null> {
  try {
    console.log(`🎨 Generating AI image for ${automationUser.name} - ${mealType}`)
    
    // Call the AI image generation function
    const { data, error } = await supabase.functions.invoke('generate-meal-image', {
      body: {
        mealType: mealType,
        userId: automationUser.user_id
      }
    })
    
    if (error) {
      console.error(`❌ Error generating image for ${automationUser.name}:`, error)
      throw new Error(`Image generation failed: ${error.message}`)
    }
    
    if (!data || !data.imageUrl) {
      console.error(`❌ No image generated for ${automationUser.name}:`, data)
      throw new Error('No image generated')
    }
    
    console.log(`✅ Generated AI image for ${automationUser.name} using recipe: ${data.recipe?.name}`)
    return data
  } catch (error) {
    console.error(`❌ Error in generateMealImage for ${automationUser.name}:`, error)
    return null
  }
}


async function createPost(automationUser: AutomationUser, mealType: string) {
  try {
    console.log(`🚀 Creating post for ${automationUser.name} - ${mealType}`)
    
    // Generate AI image - if it fails, don't create post
    const imageResult = await generateMealImage(automationUser, mealType)
    if (!imageResult) {
      console.log(`❌ Failed to generate AI image for ${automationUser.name}, skipping post`)
      return false
    }

    console.log(`📸 Using AI-generated image for ${automationUser.name}`)

    // Get caption template with fallback to other persona types
    let { data: captionOptions } = await supabase
      .from('automation_captions')
      .select('*')
      .eq('meal_type', mealType)
      .eq('persona_type', automationUser.persona_type)
      .limit(5)

    // If no exact match, try any persona type for this meal type
    if (!captionOptions || captionOptions.length === 0) {
      const { data: fallbackOptions } = await supabase
        .from('automation_captions')
        .select('*')
        .eq('meal_type', mealType)
        .limit(10)
      
      captionOptions = fallbackOptions
    }

    if (!captionOptions || captionOptions.length === 0) {
      console.log(`No caption templates found for meal type: ${mealType}`)
      return false
    }

    const selectedCaption = captionOptions[Math.floor(Math.random() * captionOptions.length)]
    
    // Create mock meal content for caption generation using recipe data
    const mealContentForCaption: MealContent = {
      id: imageResult.recipe.id,
      image_url: imageResult.imageUrl,
      meal_type: mealType,
      cuisine_type: imageResult.recipe.category || 'healthy',
      ingredients: imageResult.recipe.name ? [imageResult.recipe.name] : ['healthy ingredients']
    }
    
    const finalCaption = generateCaption(selectedCaption, mealContentForCaption, automationUser.persona_type)

    // Create the post
    const { error: postError } = await supabase
      .from('posts')
      .insert({
        author_id: automationUser.user_id,
        image_url: imageResult.imageUrl,
        caption: finalCaption,
        category: mealType
      })

    if (postError) {
      console.error(`Error creating post for ${automationUser.name}:`, postError)
      return false
    }

    // Log the activity
    await supabase
      .from('automation_activity_log')
      .insert({
        automation_user_id: automationUser.id,
        activity_type: 'post'
      })

    console.log(`✅ Created post for ${automationUser.name} (${mealType}) using recipe: ${imageResult.recipe.name}`)
    return true

  } catch (error) {
    console.error(`Error in createPost for ${automationUser.name}:`, error)
    return false
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Check if this is a manual trigger
    const requestBody = req.method === 'POST' ? await req.json().catch(() => ({})) : {}
    const isManualTrigger = requestBody?.manual_trigger === true
    
    console.log(`🤖 Running automation posting bot... ${isManualTrigger ? '(Manual trigger)' : '(Scheduled)'}`)
    console.log('Request body:', JSON.stringify(requestBody))

    // Get all active automation users
    const { data: automationUsers, error: usersError } = await supabase
      .from('automation_users')
      .select('*')
      .eq('is_active', true)

    if (usersError) {
      throw usersError
    }

    if (!automationUsers || automationUsers.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No automation users found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${automationUsers.length} automation users`)

    let postsCreated = 0
    const results = []

    for (const user of automationUsers) {
      // Get last post time for this user
      const { data: lastActivity } = await supabase
        .from('automation_activity_log')
        .select('created_at')
        .eq('automation_user_id', user.id)
        .eq('activity_type', 'post')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      const postDecision = shouldPostNow(user.timezone, lastActivity?.created_at, isManualTrigger)
      
      console.log(`📊 ${user.name} (${user.timezone}): hour=${getLocalTimeHour(user.timezone)}, shouldPost=${postDecision.shouldPost}, mealType=${postDecision.mealType}, lastPost=${lastActivity?.created_at || 'never'}`)
      
      if (postDecision.shouldPost && postDecision.mealType) {
        console.log(`🚀 Creating post for ${user.name} - ${postDecision.mealType}`)
        const success = await createPost(user, postDecision.mealType)
        if (success) {
          postsCreated++
          results.push({ user: user.name, mealType: postDecision.mealType, success: true })
        } else {
          results.push({ user: user.name, mealType: postDecision.mealType, success: false })
        }
      } else {
        console.log(`⏭️ Skipping ${user.name} (timezone: ${user.timezone}, hour: ${getLocalTimeHour(user.timezone)})`)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Posting automation completed`,
        stats: {
          total_users: automationUsers.length,
          posts_created: postsCreated,
          results
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in automation posting bot:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})