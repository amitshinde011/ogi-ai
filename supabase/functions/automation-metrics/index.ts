import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

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

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Generating automation metrics...')

    // Get automation users
    const { data: automationUsers, error: usersError } = await supabase
      .from('automation_users')
      .select('user_id')
      .eq('is_active', true)

    if (usersError) {
      throw new Error(`Failed to get automation users: ${usersError.message}`)
    }

    const automationUserIds = automationUsers.map(user => user.user_id).filter(Boolean)

    if (automationUserIds.length === 0) {
      throw new Error('No active automation users found')
    }

    // Get posts by automation users
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, created_at, like_count, comment_count')
      .in('author_id', automationUserIds)

    if (postsError) {
      throw new Error(`Failed to get posts: ${postsError.message}`)
    }

    // Calculate performance metrics
    const totalPosts = posts.length
    const totalLikes = posts.reduce((sum, post) => sum + (post.like_count || 0), 0)
    const totalComments = posts.reduce((sum, post) => sum + (post.comment_count || 0), 0)

    // Calculate daily averages
    const oldestPost = posts.reduce((oldest, post) => 
      new Date(post.created_at) < new Date(oldest.created_at) ? post : oldest, 
      posts[0]
    )
    
    const daysSinceStart = oldestPost ? 
      Math.max(1, Math.ceil((Date.now() - new Date(oldestPost.created_at).getTime()) / (1000 * 60 * 60 * 24))) : 1

    const postsPerDay = totalPosts / daysSinceStart
    const likesPerPost = totalPosts > 0 ? totalLikes / totalPosts : 0
    const commentsPerPost = totalPosts > 0 ? totalComments / totalPosts : 0
    const engagementRate = totalPosts > 0 ? (totalLikes + totalComments) / totalPosts : 0

    // Generate 7-day trend data
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
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

    const metrics: MetricsResponse = {
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

    console.log('Metrics generated successfully')

    return new Response(JSON.stringify(metrics), {
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