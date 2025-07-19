import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { optimizedSupabase } from '../_shared/optimized-client.ts'
import { rateLimiter, retryWithBackoff } from '../_shared/rate-limiter.ts'

interface AutomationUser {
  id: string
  user_id: string
  name: string
  timezone: string
  persona_type: string
  cuisine_specialty: string[]
}

interface PostCreationTask {
  user: AutomationUser
  mealType: string
  shouldPost: boolean
}

function getLocalTimeHour(timezone: string): number {
  try {
    const now = new Date()
    const localTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }))
    return localTime.getHours()
  } catch (error) {
    console.error(`Invalid timezone: ${timezone}`, error)
    return new Date().getUTCHours()
  }
}

function shouldPostNow(timezone: string, lastPostTime?: string, isManualTrigger = false): { shouldPost: boolean, mealType?: string } {
  const hour = getLocalTimeHour(timezone)
  const now = new Date()
  
  if (isManualTrigger) {
    if (lastPostTime) {
      const lastPost = new Date(lastPostTime)
      const minutesSinceLastPost = (now.getTime() - lastPost.getTime()) / (1000 * 60)
      if (minutesSinceLastPost < 10) {
        return { shouldPost: false }
      }
    }
    
    if (hour >= 6 && hour <= 9) return { shouldPost: true, mealType: 'breakfast' }
    if (hour >= 12 && hour <= 14) return { shouldPost: true, mealType: 'lunch' }
    if (hour >= 18 && hour <= 20) return { shouldPost: true, mealType: 'dinner' }
    if (hour >= 15 && hour <= 17) return { shouldPost: true, mealType: 'snack' }
    return { shouldPost: true, mealType: 'lunch' }
  }
  
  if (lastPostTime) {
    const lastPost = new Date(lastPostTime)
    const hoursSinceLastPost = (now.getTime() - lastPost.getTime()) / (1000 * 60 * 60)
    if (hoursSinceLastPost < 1) {
      return { shouldPost: false }
    }
  }

  const randomOffset = Math.random() * 30 - 15
  const effectiveHour = hour + randomOffset / 60

  if (effectiveHour >= 6 && effectiveHour <= 9) {
    return { shouldPost: Math.random() > 0.3, mealType: 'breakfast' }
  } else if (effectiveHour >= 12 && effectiveHour <= 14) {
    return { shouldPost: Math.random() > 0.2, mealType: 'lunch' }
  } else if (effectiveHour >= 18 && effectiveHour <= 20) {
    return { shouldPost: Math.random() > 0.1, mealType: 'dinner' }
  } else if (effectiveHour >= 15 && effectiveHour <= 17) {
    return { shouldPost: Math.random() > 0.7, mealType: 'snack' }
  }

  return { shouldPost: false }
}

async function generateCaption(mealType: string, persona: string, recipe?: any): Promise<string> {
  const captionOptions = await optimizedSupabase.cachedQuery(
    `captions_${mealType}_${persona}`,
    async () => {
      const { data } = await optimizedSupabase.supabase
        .from('automation_captions')
        .select('*')
        .eq('meal_type', mealType)
        .eq('persona_type', persona)
      return data || []
    }
  )

  let selectedTemplate = ''
  
  if (captionOptions.length === 0) {
    const fallbackOptions = await optimizedSupabase.cachedQuery(
      `captions_${mealType}_fallback`,
      async () => {
        const { data } = await optimizedSupabase.supabase
          .from('automation_captions')
          .select('*')
          .eq('meal_type', mealType)
        return data || []
      }
    )
    
    if (fallbackOptions.length > 0) {
      selectedTemplate = fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)].template_text
    } else {
      selectedTemplate = `Enjoying this delicious ${mealType}! 🍽️`
    }
  } else {
    selectedTemplate = captionOptions[Math.floor(Math.random() * captionOptions.length)].template_text
  }

  // Replace placeholders with actual ingredients if recipe data is available
  if (recipe && recipe.ingredients) {
    const ingredients = recipe.ingredients.split(',').map((ing: string) => ing.trim())
    
    // Replace common placeholders
    selectedTemplate = selectedTemplate
      .replace(/\{ingredient1\}/g, ingredients[0] || 'fresh ingredients')
      .replace(/\{ingredient2\}/g, ingredients[1] || 'nutritious vegetables')
      .replace(/\{ingredient3\}/g, ingredients[2] || 'healthy proteins')
      .replace(/\{main_ingredient\}/g, ingredients[0] || 'fresh ingredients')
      .replace(/\{secondary_ingredient\}/g, ingredients[1] || 'vegetables')
  } else {
    // Fallback replacements for common meal types
    const fallbackIngredients = {
      breakfast: ['health', 'energy', 'nutrition'],
      lunch: ['health', 'ingredients', 'protein'],
      dinner: ['lean protein', 'nutrition', 'clean'],
      snack: ['health', 'energy', 'nutrition']
    }
    
    const ingredients = fallbackIngredients[mealType as keyof typeof fallbackIngredients] || ['fresh ingredients', 'nutritious foods', 'healthy options']
    
    selectedTemplate = selectedTemplate
      .replace(/\{ingredient1\}/g, ingredients[0])
      .replace(/\{ingredient2\}/g, ingredients[1])
      .replace(/\{ingredient3\}/g, ingredients[2])
      .replace(/\{main_ingredient\}/g, ingredients[0])
      .replace(/\{secondary_ingredient\}/g, ingredients[1])
  }

   // Always include recipe name in the caption if available
  if (recipe && recipe.name) {
    selectedTemplate = `${recipe.name} - ${selectedTemplate} #IamAYogi #HealthyEating #FoodLove`
  }

  return selectedTemplate
}

async function generateMealImage(user: AutomationUser, mealType: string): Promise<{ imageUrl: string, recipe: any } | null> {
  try {
    if (!rateLimiter.isAllowed(`image_generation_${user.id}`, 5)) {
      console.log(`⚠️ Rate limit exceeded for image generation: ${user.name}`)
      return null
    }

    const result = await retryWithBackoff(async () => {
      const { data, error } = await optimizedSupabase.supabase.functions.invoke('generate-meal-image', {
        body: { mealType, userId: user.user_id }
      })

      if (error) throw new Error(`generate-meal-image failed: ${error.message}`)
      if (!data?.imageUrl) throw new Error('No image URL returned')
      
      return data
    })

    return {
      imageUrl: result.imageUrl,
      recipe: result.recipe || { id: 'generated', name: `${mealType} dish`, category: 'generated' }
    }
  } catch (error) {
    console.error(`❌ Error generating image for ${user.name}:`, error)
    return null
  }
}

async function createPostsBatch(tasks: PostCreationTask[]): Promise<{ success: number, failed: number }> {
  const postData = await Promise.allSettled(
    tasks.map(async (task) => {
      if (!task.shouldPost) return null

      const imageResult = await generateMealImage(task.user, task.mealType)
      if (!imageResult) return null

      const caption = await generateCaption(task.mealType, task.user.persona_type, imageResult.recipe)

      return {
        author_id: task.user.user_id,
        image_url: imageResult.imageUrl,
        caption,
        category: task.mealType
      }
    })
  )

  const validPosts = postData
    .filter(result => result.status === 'fulfilled' && result.value)
    .map(result => (result as PromiseFulfilledResult<any>).value)

  if (validPosts.length === 0) {
    return { success: 0, failed: 0 }
  }

  try {
    // Batch insert posts with explicit service role
    console.log(`🔍 Inserting ${validPosts.length} posts to database...`)
    const { data: insertedPosts, error: insertError } = await optimizedSupabase.supabase
      .from('posts')
      .insert(validPosts)
      .select()

    if (insertError) {
      console.error('❌ Error inserting posts:', insertError)
      throw insertError
    }

    console.log(`✅ Successfully inserted ${insertedPosts?.length || 0} posts`)
    const successfulPosts = insertedPosts?.length || 0

    // Batch insert activity logs with the correct automation user IDs
    const activityLogs = validPosts.map((post, index) => {
      const task = tasks.filter(t => t.shouldPost)[index]
      return {
        automation_user_id: task.user.id,
        activity_type: 'post'
      }
    })

    await optimizedSupabase.batchInsert('automation_activity_log', activityLogs)

    // Refresh materialized view to ensure posts appear in community feed
    try {
      await optimizedSupabase.supabase.rpc('refresh_community_feed_view')
      console.log('✅ Community feed materialized view refreshed')
    } catch (refreshError) {
      console.warn('⚠️ Failed to refresh community feed view:', refreshError)
    }

    return { success: successfulPosts, failed: validPosts.length - successfulPosts }
  } catch (error) {
    console.error('Error in batch post creation:', error)
    return { success: 0, failed: validPosts.length }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 200 })
  }

  try {
    const requestBody = req.method === 'POST' ? await req.json().catch(() => ({})) : {}
    const isManualTrigger = requestBody?.manual_trigger === true
    
    console.log(`🚀 Optimized automation posting bot started ${isManualTrigger ? '(Manual)' : '(Scheduled)'}`)

    // Get automation users with caching
    const automationUsers = await optimizedSupabase.cachedQuery(
      'active_automation_users',
      async () => {
        const { data, error } = await optimizedSupabase.supabase
          .from('automation_users')
          .select('*')
          .eq('is_active', true)

        if (error) throw error
        return data || []
      }
    )

    if (automationUsers.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No automation users found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get last activities in parallel
    const lastActivities = await Promise.allSettled(
      automationUsers.map(async (user) => {
        const { data } = await optimizedSupabase.supabase
          .from('automation_activity_log')
          .select('created_at')
          .eq('automation_user_id', user.id)
          .eq('activity_type', 'post')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        return { userId: user.id, lastActivity: data?.created_at }
      })
    )

    // Process posting decisions
    const tasks: PostCreationTask[] = automationUsers.map((user, index) => {
      const lastActivity = lastActivities[index]
      const lastPostTime = lastActivity.status === 'fulfilled' ? lastActivity.value.lastActivity : undefined
      
      const decision = shouldPostNow(user.timezone, lastPostTime, isManualTrigger)
      
      return {
        user,
        mealType: decision.mealType || 'lunch',
        shouldPost: decision.shouldPost
      }
    })

    console.log(`📊 Processing ${tasks.filter(t => t.shouldPost).length} posts out of ${tasks.length} users`)

    // Create posts in batches
    const results = await createPostsBatch(tasks.filter(t => t.shouldPost))

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Optimized posting automation completed',
        stats: {
          total_users: automationUsers.length,
          posts_created: results.success,
          posts_failed: results.failed,
          cache_stats: optimizedSupabase.getCacheStats()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in optimized automation posting bot:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})