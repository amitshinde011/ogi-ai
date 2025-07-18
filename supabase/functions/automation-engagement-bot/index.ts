import { corsHeaders } from '../_shared/cors.ts'
import { optimizedSupabase } from '../_shared/optimized-client.ts'
import { rateLimiter, retryWithBackoff } from '../_shared/rate-limiter.ts'

interface AutomationUser {
  id: string
  user_id: string
  name: string
  persona_type: string
}

interface EngagementTask {
  user: AutomationUser
  post: any
  action: 'like' | 'comment'
  priority: number
}

function analyzePostContent(post: any): string[] {
  const content = (post.caption || '').toLowerCase()
  const tags = []

  if (content.includes('breakfast') || content.includes('morning')) tags.push('breakfast')
  if (content.includes('lunch') || content.includes('midday')) tags.push('lunch')
  if (content.includes('dinner') || content.includes('evening')) tags.push('dinner')
  if (content.includes('healthy') || content.includes('nutrition')) tags.push('healthy')
  if (content.includes('protein') || content.includes('quinoa')) tags.push('protein_rich')
  if (content.includes('vegetable') || content.includes('salad')) tags.push('vegetables')
  if (content.includes('spice') || content.includes('turmeric')) tags.push('spices')
  if (content.includes('color') || content.includes('rainbow')) tags.push('colorful')

  return tags
}

async function getEngagementLimits(userId: string): Promise<{ likes: number, comments: number }> {
  const today = new Date().toISOString().split('T')[0]
  const { data } = await optimizedSupabase.supabase
    .from('automation_activity_log')
    .select('activity_type')
    .eq('automation_user_id', userId)
    .gte('created_at', `${today}T00:00:00.000Z`)
    .lte('created_at', `${today}T23:59:59.999Z`)

  const todayLikes = data?.filter(a => a.activity_type === 'like').length || 0
  const todayComments = data?.filter(a => a.activity_type === 'comment').length || 0

  return { likes: todayLikes, comments: todayComments }
}

async function checkExistingEngagements(userIds: string[], postIds: number[]): Promise<Map<string, Set<number>>> {
  const engagementMap = new Map<string, Set<number>>()
  
  // Get existing likes and comments in parallel
  const [likesResult, commentsResult] = await Promise.allSettled([
    optimizedSupabase.supabase
      .from('likes')
      .select('user_id, post_id')
      .in('user_id', userIds)
      .in('post_id', postIds),
    
    optimizedSupabase.supabase
      .from('comments')
      .select('author_id, post_id')
      .in('author_id', userIds)
      .in('post_id', postIds)
  ])

  // Process likes
  if (likesResult.status === 'fulfilled' && likesResult.value.data) {
    for (const like of likesResult.value.data) {
      const key = `${like.user_id}_like`
      if (!engagementMap.has(key)) engagementMap.set(key, new Set())
      engagementMap.get(key)!.add(like.post_id)
    }
  }

  // Process comments
  if (commentsResult.status === 'fulfilled' && commentsResult.value.data) {
    for (const comment of commentsResult.value.data) {
      const key = `${comment.author_id}_comment`
      if (!engagementMap.has(key)) engagementMap.set(key, new Set())
      engagementMap.get(key)!.add(comment.post_id)
    }
  }

  return engagementMap
}

async function planEngagements(users: AutomationUser[], posts: any[]): Promise<EngagementTask[]> {
  const tasks: EngagementTask[] = []
  const userIds = users.map(u => u.user_id)
  const postIds = posts.map(p => p.id)

  // Get engagement limits and existing engagements in parallel
  const [limitsResults, existingEngagements] = await Promise.allSettled([
    Promise.allSettled(users.map(user => getEngagementLimits(user.id))),
    checkExistingEngagements(userIds, postIds)
  ])

  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    const limits = limitsResults.status === 'fulfilled' && limitsResults.value[i].status === 'fulfilled' 
      ? limitsResults.value[i].value as { likes: number, comments: number }
      : { likes: 0, comments: 0 }

    // Skip if user has reached daily limits
    if (limits.likes >= 30 && limits.comments >= 20) continue

    // Shuffle posts for this user
    const shuffledPosts = [...posts].sort(() => Math.random() - 0.5)
    let userEngagements = 0

    for (const post of shuffledPosts.slice(0, 15)) {
      if (userEngagements >= 5) break // Max 5 engagements per user per run
      if (post.author_id === user.user_id) continue // Don't engage with own posts

      const existingMap = existingEngagements.status === 'fulfilled' ? existingEngagements.value : new Map()
      const hasLiked = existingMap.get(`${user.user_id}_like`)?.has(post.id)
      const hasCommented = existingMap.get(`${user.user_id}_comment`)?.has(post.id)

      if (hasLiked || hasCommented) continue

      // Calculate engagement priority based on post content
      const postTags = analyzePostContent(post)
      const priority = postTags.length * Math.random() * 100

      // Decide action based on limits and randomness
      let action: 'like' | 'comment' = 'like'
      if (limits.comments < 20 && Math.random() < 0.3) {
        action = 'comment'
      }

      if ((action === 'like' && limits.likes < 30) || (action === 'comment' && limits.comments < 20)) {
        tasks.push({
          user,
          post,
          action,
          priority
        })
        userEngagements++
      }
    }
  }

  // Sort by priority (highest first)
  return tasks.sort((a, b) => b.priority - a.priority)
}

async function executeLikes(likeTasks: EngagementTask[]): Promise<number> {
  const likeData = likeTasks.map(task => ({
    user_id: task.user.user_id,
    post_id: task.post.id
  }))

  const activityLogs = likeTasks.map(task => ({
    automation_user_id: task.user.id,
    activity_type: 'like',
    target_post_id: task.post.id
  }))

  try {
    const [likesResult, logsResult] = await Promise.allSettled([
      optimizedSupabase.batchInsert('likes', likeData, 20),
      optimizedSupabase.batchInsert('automation_activity_log', activityLogs, 20)
    ])

    const successfulLikes = likesResult.status === 'fulfilled' 
      ? likesResult.value.filter(r => r.status === 'fulfilled').length
      : 0

    console.log(`👍 Created ${successfulLikes} likes`)
    return successfulLikes
  } catch (error) {
    console.error('Error executing likes:', error)
    return 0
  }
}

async function executeComments(commentTasks: EngagementTask[]): Promise<number> {
  // Get comment templates for each user type
  const commentTemplates = await optimizedSupabase.cachedQuery(
    'comment_templates',
    async () => {
      const { data } = await optimizedSupabase.supabase
        .from('automation_comments')
        .select('*')
      return data || []
    }
  )

  const commentData = commentTasks.map(task => {
    const userTemplates = commentTemplates.filter(
      t => t.persona_type === task.user.persona_type
    )
    
    const template = userTemplates.length > 0 
      ? userTemplates[Math.floor(Math.random() * userTemplates.length)]
      : { template_text: 'Looking delicious! 😋' }

    return {
      author_id: task.user.user_id,
      post_id: task.post.id,
      text: template.template_text
    }
  })

  const activityLogs = commentTasks.map(task => ({
    automation_user_id: task.user.id,
    activity_type: 'comment',
    target_post_id: task.post.id
  }))

  try {
    const [commentsResult, logsResult] = await Promise.allSettled([
      optimizedSupabase.batchInsert('comments', commentData, 15),
      optimizedSupabase.batchInsert('automation_activity_log', activityLogs, 15)
    ])

    const successfulComments = commentsResult.status === 'fulfilled' 
      ? commentsResult.value.filter(r => r.status === 'fulfilled').length
      : 0

    console.log(`💬 Created ${successfulComments} comments`)
    return successfulComments
  } catch (error) {
    console.error('Error executing comments:', error)
    return 0
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 Optimized automation engagement bot started')

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

    // Get recent posts (last 6 hours)
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    const { data: recentPosts, error: postsError } = await optimizedSupabase.supabase
      .from('posts')
      .select('*')
      .gte('created_at', sixHoursAgo)
      .order('created_at', { ascending: false })
      .limit(100)

    if (postsError) throw postsError

    if (!recentPosts || recentPosts.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No recent posts found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`📊 Planning engagements for ${automationUsers.length} users on ${recentPosts.length} posts`)

    // Plan all engagements efficiently
    const engagementTasks = await planEngagements(automationUsers, recentPosts)
    
    // Separate likes and comments
    const likeTasks = engagementTasks.filter(task => task.action === 'like')
    const commentTasks = engagementTasks.filter(task => task.action === 'comment')

    console.log(`🎯 Executing ${likeTasks.length} likes and ${commentTasks.length} comments`)

    // Execute likes and comments in parallel
    const [likesCreated, commentsCreated] = await Promise.allSettled([
      executeLikes(likeTasks),
      executeComments(commentTasks)
    ])

    const finalLikes = likesCreated.status === 'fulfilled' ? likesCreated.value : 0
    const finalComments = commentsCreated.status === 'fulfilled' ? commentsCreated.value : 0

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Optimized engagement automation completed',
        stats: {
          users_processed: automationUsers.length,
          posts_available: recentPosts.length,
          likes_created: finalLikes,
          comments_created: finalComments,
          total_engagements: finalLikes + finalComments,
          cache_stats: optimizedSupabase.getCacheStats()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in optimized automation engagement bot:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})