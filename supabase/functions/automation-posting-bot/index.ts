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
  const now = new Date()
  const localTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }))
  return localTime.getHours()
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
    // Generate a realistic mobile food photo based on meal content
    const imageData = await generateMobileFoodPhoto(mealContent, mealType)
    
    // Convert to WebP format for compression (same as real users)
    const webpBlob = await convertToWebP(imageData)
    
    // Upload to R2 using the same system as real users
    const uploadResult = await uploadToR2(automationUser.user_id, webpBlob, 'community')
    
    return uploadResult?.imageUrl || null
  } catch (error) {
    console.error(`Error generating image for ${automationUser.name}:`, error)
    return null
  }
}

async function generateMobileFoodPhoto(mealContent: MealContent, mealType: string): Promise<Blob> {
  // Create a canvas to generate authentic-looking mobile food photo
  const canvas = new OffscreenCanvas(800, 600) // Mobile photo dimensions
  const ctx = canvas.getContext('2d')
  
  if (!ctx) throw new Error('Could not get canvas context')
  
  // Generate background colors based on meal type and cuisine
  const bgColor = getMealBackgroundColor(mealContent.cuisine_type, mealType)
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, 800, 600)
  
  // Add some visual elements to simulate food
  await addFoodVisualElements(ctx, mealContent, mealType)
  
  // Add mobile photo characteristics (slight blur, natural lighting)
  await addMobilePhotoEffects(ctx)
  
  // Convert canvas to blob
  return await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 })
}

function getMealBackgroundColor(cuisine: string, mealType: string): string {
  const colorMap: Record<string, Record<string, string>> = {
    indian: {
      breakfast: '#FFF8E1', // Warm cream for breakfast
      lunch: '#F3E5F5',     // Light purple for colorful curries
      dinner: '#E8F5E8',    // Light green for vegetables
      snack: '#FFECB3'      // Light yellow for snacks
    },
    mediterranean: {
      breakfast: '#E3F2FD', // Light blue for fresh morning
      lunch: '#F1F8E9',     // Light green for olive oil dishes
      dinner: '#FFF3E0',    // Light orange for sunset meals
      snack: '#FCE4EC'      // Light pink for light snacks
    }
  }
  
  return colorMap[cuisine]?.[mealType] || '#F5F5F5' // Default light gray
}

async function addFoodVisualElements(ctx: OffscreenCanvasRenderingContext2D, mealContent: MealContent, mealType: string) {
  // Add circular food shapes to simulate ingredients
  const ingredients = mealContent.ingredients || []
  
  for (let i = 0; i < Math.min(ingredients.length, 5); i++) {
    const x = 150 + (i * 120)
    const y = 200 + (Math.sin(i) * 50)
    const radius = 30 + (Math.random() * 20)
    
    // Generate ingredient-based colors
    const color = getIngredientColor(ingredients[i])
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI)
    ctx.fill()
    
    // Add some texture/grain
    ctx.fillStyle = `rgba(0,0,0,0.1)`
    ctx.fillRect(x - radius/2, y - radius/2, radius, radius)
  }
}

function getIngredientColor(ingredient: string): string {
  const colorMap: Record<string, string> = {
    tomato: '#FF6B6B',
    avocado: '#4ECDC4',
    banana: '#FFE66D',
    oats: '#D4A574',
    quinoa: '#F4F3EE',
    spinach: '#6BCF7F',
    carrot: '#FF8E53',
    default: '#95E1D3'
  }
  
  const key = Object.keys(colorMap).find(k => ingredient.toLowerCase().includes(k))
  return colorMap[key || 'default']
}

async function addMobilePhotoEffects(ctx: OffscreenCanvasRenderingContext2D) {
  // Add slight vignette effect (darker edges)
  const gradient = ctx.createRadialGradient(400, 300, 0, 400, 300, 500)
  gradient.addColorStop(0, 'rgba(0,0,0,0)')
  gradient.addColorStop(1, 'rgba(0,0,0,0.15)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 800, 600)
  
  // Add some grain/noise for authentic mobile feel
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * 800
    const y = Math.random() * 600
    const opacity = Math.random() * 0.1
    ctx.fillStyle = `rgba(255,255,255,${opacity})`
    ctx.fillRect(x, y, 1, 1)
  }
}

async function convertToWebP(imageBlob: Blob): Promise<Blob> {
  // Use same WebP conversion logic as real users
  const canvas = new OffscreenCanvas(800, 600)
  const ctx = canvas.getContext('2d')
  
  if (!ctx) throw new Error('Could not get canvas context')
  
  // Create image from blob
  const imageBitmap = await createImageBitmap(imageBlob)
  ctx.drawImage(imageBitmap, 0, 0)
  
  // Convert to WebP with 85% quality (same as real users)
  return await canvas.convertToBlob({ type: 'image/webp', quality: 0.85 })
}

async function uploadToR2(userId: string, imageBlob: Blob, uploadType: string): Promise<{ imageUrl: string } | null> {
  try {
    // Create form data like real users do
    const formData = new FormData()
    const timestamp = Date.now()
    const fileName = `bot_meal_${timestamp}.webp`
    const file = new File([imageBlob], fileName, { type: 'image/webp' })
    
    formData.append('file', file)
    formData.append('uploadType', uploadType)
    
    // Call the same R2 upload function that real users use
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/upload-to-r2`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: formData
    })
    
    if (!response.ok) {
      console.error('R2 upload failed:', await response.text())
      return null
    }
    
    const result = await response.json()
    return result.success ? { imageUrl: result.imageUrl } : null
    
  } catch (error) {
    console.error('Error uploading to R2:', error)
    return null
  }
}

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