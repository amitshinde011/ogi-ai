import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9'
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

function shouldPostNow(timezone: string, lastPostTime?: string): { shouldPost: boolean, mealType?: string } {
  const hour = getLocalTimeHour(timezone)
  const now = new Date()
  
  // Check if already posted in the last 3 hours
  if (lastPostTime) {
    const lastPost = new Date(lastPostTime)
    const hoursSinceLastPost = (now.getTime() - lastPost.getTime()) / (1000 * 60 * 60)
    if (hoursSinceLastPost < 3) {
      return { shouldPost: false }
    }
  }

  // Determine meal time and add randomness
  const randomOffset = Math.random() * 60 - 30 // ±30 minutes
  const effectiveHour = hour + randomOffset / 60

  if (effectiveHour >= 6 && effectiveHour <= 9) {
    return { shouldPost: Math.random() > 0.7, mealType: 'breakfast' } // 30% chance
  } else if (effectiveHour >= 12 && effectiveHour <= 14) {
    return { shouldPost: Math.random() > 0.6, mealType: 'lunch' } // 40% chance
  } else if (effectiveHour >= 18 && effectiveHour <= 20) {
    return { shouldPost: Math.random() > 0.5, mealType: 'dinner' } // 50% chance
  } else if (effectiveHour >= 15 && effectiveHour <= 17) {
    return { shouldPost: Math.random() > 0.9, mealType: 'snack' } // 10% chance
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

async function generateAndUploadMealImage(automationUser: AutomationUser, mealContent: MealContent, mealType: string): Promise<string | null> {
  try {
    // Use placeholder images for now since OffscreenCanvas is not available in Deno
    console.log(`Generating placeholder image for ${automationUser.name} - ${mealType}`)
    
    // Generate a simple placeholder URL based on meal content
    const placeholderUrl = generatePlaceholderImageUrl(mealContent, mealType)
    
    return placeholderUrl
  } catch (error) {
    console.error(`Error generating image for ${automationUser.name}:`, error)
    // Fallback to a generic food placeholder
    return `https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&crop=center`
  }
}

function generatePlaceholderImageUrl(mealContent: MealContent, mealType: string): string {
  // Use Unsplash for high-quality food photos with specific search terms
  const baseUrl = 'https://images.unsplash.com/'
  
  // Map meal types and cuisines to appropriate search terms
  const searchTerms: Record<string, Record<string, string>> = {
    indian: {
      breakfast: 'photo-1586201375761-83865001e31c', // Indian breakfast
      lunch: 'photo-1565299624946-b28f40a0ca4b', // Indian curry
      dinner: 'photo-1627662056862-9eb8705b8a77', // Indian dinner
      snack: 'photo-1599487488170-d11ec9c172f0' // Indian snacks
    },
    mediterranean: {
      breakfast: 'photo-1533089860892-a7c6f0a88666', // Mediterranean breakfast
      lunch: 'photo-1565299585323-38174c5ab96e', // Mediterranean salad
      dinner: 'photo-1565958011703-44f9829ba187', // Mediterranean dinner
      snack: 'photo-1551782450-a2132b4ba21d' // Mediterranean snacks
    }
  }
  
  // Get cuisine-specific photo or fallback to generic food photos
  const cuisine = mealContent.cuisine_type.toLowerCase()
  const photoId = searchTerms[cuisine]?.[mealType] || searchTerms.indian[mealType] || 'photo-1565299624946-b28f40a0ca4b'
  
  return `${baseUrl}${photoId}?w=800&h=600&fit=crop&crop=center`
}

// Removed the OffscreenCanvas-based image generation functions as they're not supported in Deno Edge Functions
// Now using direct Unsplash URLs for meal images

async function createPost(automationUser: AutomationUser, mealType: string) {
  try {
    // Get suitable meal content
    const { data: mealOptions } = await supabase
      .from('automation_meal_content')
      .select('*')
      .eq('meal_type', mealType)
      .in('cuisine_type', automationUser.cuisine_specialty)
      .limit(10)

    if (!mealOptions || mealOptions.length === 0) {
      console.log(`No meal content found for ${automationUser.name}, meal type: ${mealType}`)
      return false
    }

    // Randomly select meal content
    const selectedMeal = mealOptions[Math.floor(Math.random() * mealOptions.length)]

    // Generate authentic mobile food image and upload via R2
    const imageUrl = await generateAndUploadMealImage(automationUser, selectedMeal, mealType)
    if (!imageUrl) {
      console.log(`Failed to generate image for ${automationUser.name}`)
      return false
    }

    // Get caption template
    const { data: captionOptions } = await supabase
      .from('automation_captions')
      .select('*')
      .eq('meal_type', mealType)
      .eq('persona_type', automationUser.persona_type)
      .limit(5)

    if (!captionOptions || captionOptions.length === 0) {
      console.log(`No caption templates found for ${automationUser.name}`)
      return false
    }

    const selectedCaption = captionOptions[Math.floor(Math.random() * captionOptions.length)]
    const finalCaption = generateCaption(selectedCaption, selectedMeal, automationUser.persona_type)

    // Create the post
    const { error: postError } = await supabase
      .from('posts')
      .insert({
        author_id: automationUser.user_id,
        image_url: imageUrl,
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

    console.log(`✅ Created post for ${automationUser.name} (${mealType})`)
    return true

  } catch (error) {
    console.error(`Error in createPost for ${automationUser.name}:`, error)
    return false
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🤖 Running automation posting bot...')

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

      const postDecision = shouldPostNow(user.timezone, lastActivity?.created_at)
      
      if (postDecision.shouldPost && postDecision.mealType) {
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