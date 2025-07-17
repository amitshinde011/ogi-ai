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
  persona_type: string
}

interface CommunityPost {
  id: number
  author_id: string
  caption: string
  image_url: string
  created_at: string
}

interface CommentTemplate {
  id: string
  template_text: string
  comment_type: string
  context_tags: string[]
}

function analyzePostContent(post: CommunityPost): string[] {
  const content = (post.caption || '').toLowerCase()
  const tags = []

  // Analyze caption for food indicators
  if (content.includes('breakfast') || content.includes('morning')) tags.push('breakfast')
  if (content.includes('lunch') || content.includes('midday')) tags.push('lunch')
  if (content.includes('dinner') || content.includes('evening')) tags.push('dinner')
  if (content.includes('healthy') || content.includes('nutrition')) tags.push('healthy')
  if (content.includes('protein') || content.includes('quinoa') || content.includes('lentil')) tags.push('protein_rich')
  if (content.includes('vegetable') || content.includes('salad') || content.includes('green')) tags.push('vegetables')
  if (content.includes('spice') || content.includes('turmeric') || content.includes('ginger')) tags.push('spices')
  if (content.includes('color') || content.includes('rainbow') || content.includes('vibrant')) tags.push('colorful')
  if (content.includes('roast') || content.includes('grill') || content.includes('cook')) tags.push('cooked')

  return tags
}

function generateMealIdentificationComment(post: CommunityPost, template: CommentTemplate): string {
  let comment = template.template_text
  
  // Simple food identification based on common patterns
  const replacements: Record<string, string[]> = {
    identified_food: ['quinoa bowl', 'vegetable curry', 'grain salad', 'protein bowl', 'smoothie bowl'],
    nutrient_benefit: ['complete protein', 'fiber', 'antioxidants', 'vitamins', 'minerals'],
    spice_or_ingredient: ['turmeric', 'ginger', 'garlic', 'cumin', 'herbs'],
    health_property: ['anti-inflammatory', 'digestive', 'immune-boosting', 'antioxidant'],
    cooking_method: ['roasted', 'steamed', 'grilled', 'sautéed'],
    description: ['caramelized', 'tender', 'crispy', 'golden']
  }

  // Replace placeholders with random appropriate values
  Object.entries(replacements).forEach(([key, options]) => {
    if (comment.includes(`{${key}}`)) {
      const randomOption = options[Math.floor(Math.random() * options.length)]
      comment = comment.replace(`{${key}}`, randomOption)
    }
  })

  return comment
}

async function shouldEngageWithPost(automationUser: AutomationUser, post: CommunityPost): Promise<boolean> {
  // Don't engage with own posts
  if (post.author_id === automationUser.user_id) {
    return false
  }

  // Check if already engaged with this post
  const { data: existingLike } = await supabase
    .from('likes')
    .select('*')
    .eq('user_id', automationUser.user_id)
    .eq('post_id', post.id)
    .single()

  const { data: existingComment } = await supabase
    .from('comments')
    .select('*')
    .eq('author_id', automationUser.user_id)
    .eq('post_id', post.id)
    .single()

  // Don't engage if already liked or commented
  if (existingLike || existingComment) {
    return false
  }

  // Check daily engagement limits
  const today = new Date().toISOString().split('T')[0]
  const { data: todayActivity } = await supabase
    .from('automation_activity_log')
    .select('*')
    .eq('automation_user_id', automationUser.id)
    .gte('created_at', `${today}T00:00:00.000Z`)
    .lte('created_at', `${today}T23:59:59.999Z`)

  const todayLikes = todayActivity?.filter(a => a.activity_type === 'like').length || 0
  const todayComments = todayActivity?.filter(a => a.activity_type === 'comment').length || 0

  // Daily limits: 30 likes, 20 comments
  if (todayLikes >= 30 && todayComments >= 20) {
    return false
  }

  return true
}

async function likePost(automationUser: AutomationUser, post: CommunityPost): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('likes')
      .insert({
        user_id: automationUser.user_id,
        post_id: post.id
      })

    if (error) {
      console.error(`Error liking post ${post.id} by ${automationUser.name}:`, error)
      return false
    }

    // Log activity
    await supabase
      .from('automation_activity_log')
      .insert({
        automation_user_id: automationUser.id,
        activity_type: 'like',
        target_post_id: post.id
      })

    console.log(`👍 ${automationUser.name} liked post ${post.id}`)
    return true

  } catch (error) {
    console.error(`Error in likePost:`, error)
    return false
  }
}

async function commentOnPost(automationUser: AutomationUser, post: CommunityPost): Promise<boolean> {
  try {
    // Analyze post content
    const postTags = analyzePostContent(post)
    
    // Find suitable comment template
    const { data: commentTemplates } = await supabase
      .from('automation_comments')
      .select('*')
      .eq('persona_type', automationUser.persona_type)
      .limit(20)

    if (!commentTemplates || commentTemplates.length === 0) {
      console.log(`No comment templates found for ${automationUser.name}`)
      return false
    }

    // Prefer meal identification comments for posts with food context
    let suitableTemplates = commentTemplates.filter(template => 
      template.comment_type === 'meal_identification' &&
      template.context_tags.some((tag: string) => postTags.includes(tag))
    )

    // Fallback to any suitable template
    if (suitableTemplates.length === 0) {
      suitableTemplates = commentTemplates.filter(template =>
        template.context_tags.some((tag: string) => postTags.includes(tag))
      )
    }

    // Final fallback to any template
    if (suitableTemplates.length === 0) {
      suitableTemplates = commentTemplates.slice(0, 5)
    }

    const selectedTemplate = suitableTemplates[Math.floor(Math.random() * suitableTemplates.length)]
    const commentText = generateMealIdentificationComment(post, selectedTemplate)

    // Create comment
    const { error } = await supabase
      .from('comments')
      .insert({
        author_id: automationUser.user_id,
        post_id: post.id,
        text: commentText
      })

    if (error) {
      console.error(`Error commenting on post ${post.id} by ${automationUser.name}:`, error)
      return false
    }

    // Log activity
    await supabase
      .from('automation_activity_log')
      .insert({
        automation_user_id: automationUser.id,
        activity_type: 'comment',
        target_post_id: post.id
      })

    console.log(`💬 ${automationUser.name} commented on post ${post.id}: "${commentText}"`)
    return true

  } catch (error) {
    console.error(`Error in commentOnPost:`, error)
    return false
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🤖 Running automation engagement bot...')

    // Get active automation users
    const { data: automationUsers, error: usersError } = await supabase
      .from('automation_users')
      .select('*')
      .eq('is_active', true)

    if (usersError) throw usersError

    if (!automationUsers || automationUsers.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No automation users found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get recent posts (last 6 hours)
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    const { data: recentPosts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .gte('created_at', sixHoursAgo)
      .order('created_at', { ascending: false })
      .limit(50)

    if (postsError) throw postsError

    if (!recentPosts || recentPosts.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No recent posts found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${recentPosts.length} recent posts to potentially engage with`)

    let likesCreated = 0
    let commentsCreated = 0
    const results = []

    for (const user of automationUsers) {
      // Randomly select posts to engage with
      const shuffledPosts = recentPosts.sort(() => Math.random() - 0.5)
      let userEngagements = 0

      for (const post of shuffledPosts.slice(0, 10)) { // Limit to 10 posts per user per run
        if (userEngagements >= 3) break // Max 3 engagements per user per run

        const shouldEngage = await shouldEngageWithPost(user, post)
        if (!shouldEngage) continue

        // Decide between like and comment (70% like, 30% comment)
        const shouldComment = Math.random() < 0.3

        if (shouldComment) {
          const success = await commentOnPost(user, post)
          if (success) {
            commentsCreated++
            userEngagements++
            results.push({ user: user.name, action: 'comment', post_id: post.id })
          }
        } else {
          const success = await likePost(user, post)
          if (success) {
            likesCreated++
            userEngagements++
            results.push({ user: user.name, action: 'like', post_id: post.id })
          }
        }

        // Add small delay between engagements
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Engagement automation completed',
        stats: {
          users_processed: automationUsers.length,
          posts_available: recentPosts.length,
          likes_created: likesCreated,
          comments_created: commentsCreated,
          total_engagements: likesCreated + commentsCreated,
          results: results.slice(0, 20) // Show first 20 results
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in automation engagement bot:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})