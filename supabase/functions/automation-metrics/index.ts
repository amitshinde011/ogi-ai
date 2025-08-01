import { corsHeaders } from '../_shared/cors.ts'
import { optimizedSupabase } from '../_shared/optimized-client.ts'
import { retryWithBackoff } from '../_shared/rate-limiter.ts'

interface MetricsResponse {
  performance: {
    postsPerDay: number;
    likesPerPost: number;
    commentsPerPost: number;
    engagementRate: number;
  };
  activity: {
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    activeUsers: number;
  };
  trends: {
    last7Days: Array<{
      date: string;
      posts: number;
      likes: number;
      comments: number;
    }>;
  };
  timestamp: string;
}

async function generateMetrics(): Promise<MetricsResponse> {
  // Get automation users and posts in parallel
  const [usersResult, postsResult] = await Promise.allSettled([
    optimizedSupabase.cachedQuery('automation_users_metrics', async () => {
      const { data, error } = await optimizedSupabase.supabase
        .from('automation_users')
        .select('user_id')
        .eq('is_active', true)
      
      if (error) throw new Error(`Failed to get automation users: ${error.message}`)
      return data || []
    }),
    
    optimizedSupabase.cachedQuery('automation_posts_metrics', async () => {
      const { data, error } = await optimizedSupabase.supabase
        .from('posts')
        .select(`
          id, 
          created_at, 
          like_count, 
          comment_count,
          automation_users!inner(user_id)
        `)
      
      if (error) throw new Error(`Failed to get posts: ${error.message}`)
      return data || []
    })
  ])

  const automationUsers = usersResult.status === 'fulfilled' ? usersResult.value : []
  const posts = postsResult.status === 'fulfilled' ? postsResult.value : []

  if (automationUsers.length === 0) {
    throw new Error('No active automation users found')
  }

  // Calculate performance metrics efficiently
  const totalPosts = posts.length
  const totalLikes = posts.reduce((sum, post) => sum + (post.like_count || 0), 0)
  const totalComments = posts.reduce((sum, post) => sum + (post.comment_count || 0), 0)

  // Calculate daily averages
  const oldestPost = posts.length > 0 ? posts.reduce((oldest, post) => 
    new Date(post.created_at) < new Date(oldest.created_at) ? post : oldest
  ) : null
  
  const daysSinceStart = oldestPost ? 
    Math.max(1, Math.ceil((Date.now() - new Date(oldestPost.created_at).getTime()) / (1000 * 60 * 60 * 24))) : 1

  const postsPerDay = totalPosts / daysSinceStart
  const likesPerPost = totalPosts > 0 ? totalLikes / totalPosts : 0
  const commentsPerPost = totalPosts > 0 ? totalComments / totalPosts : 0
  const engagementRate = totalPosts > 0 ? (totalLikes + totalComments) / totalPosts : 0

  // Generate 7-day trend data more efficiently
  const last7Days = []
  const today = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    const dayPosts = posts.filter(post => 
      post.created_at.startsWith(dateStr)
    )
    
    const dayLikes = dayPosts.reduce((sum, post) => sum + (post.like_count || 0), 0)
    const dayComments = dayPosts.reduce((sum, post) => sum + (post.comment_count || 0), 0)
    
    last7Days.push({
      date: dateStr,
      posts: dayPosts.length,
      likes: dayLikes,
      comments: dayComments
    })
  }

  return {
    performance: {
      postsPerDay: Math.round(postsPerDay * 100) / 100,
      likesPerPost: Math.round(likesPerPost * 100) / 100,
      commentsPerPost: Math.round(commentsPerPost * 100) / 100,
      engagementRate: Math.round(engagementRate * 100) / 100
    },
    activity: {
      totalPosts,
      totalLikes,
      totalComments,
      activeUsers: automationUsers.length
    },
    trends: {
      last7Days
    },
    timestamp: new Date().toISOString()
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 Generating optimized automation metrics...')

    const metrics = await retryWithBackoff(generateMetrics, 2, 1000)

    console.log('✅ Metrics generated successfully')

    return new Response(JSON.stringify({
      ...metrics,
      cache_stats: optimizedSupabase.getCacheStats()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error generating metrics:', error)
    
    return new Response(JSON.stringify({ 
      error: 'Failed to generate metrics',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})