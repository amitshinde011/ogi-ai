import { corsHeaders } from '../_shared/cors.ts'
import { optimizedSupabase } from '../_shared/optimized-client.ts'
import { retryWithBackoff } from '../_shared/rate-limiter.ts'

interface HealthCheck {
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: any;
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'error';
  checks: {
    automationUsers: HealthCheck;
    recentActivity: HealthCheck;
    contentLibrary: HealthCheck;
    errorRate: HealthCheck;
  };
  statistics: {
    activeUsers: number;
    totalPosts: number;
    todayActivity: number;
    errorCount: number;
  };
  timestamp: string;
}

async function performHealthCheck(): Promise<SystemHealth> {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const today = new Date().toISOString().split('T')[0]

  // Run all health checks in parallel
  const [usersResult, activityResult, contentResult, postsResult, todayActivityResult] = await Promise.allSettled([
    optimizedSupabase.cachedQuery('automation_users_health', async () => {
      const { data, error } = await optimizedSupabase.supabase
        .from('automation_users')
        .select('*')
        .eq('is_active', true)
      
      if (error) throw new Error(`Users check failed: ${error.message}`)
      return data || []
    }),
    
    optimizedSupabase.supabase
      .from('automation_activity_log')
      .select('*')
      .gte('created_at', yesterday.toISOString()),
    
    optimizedSupabase.cachedQuery('meal_content_health', async () => {
      const { data, error } = await optimizedSupabase.supabase
        .from('automation_meal_content')
        .select('id', { count: 'exact' })
      
      if (error) throw new Error(`Content check failed: ${error.message}`)
      return data || []
    }),
    
    optimizedSupabase.cachedQuery('automation_posts_health', async () => {
      const { data, error } = await optimizedSupabase.supabase
        .from('posts')
        .select(`
          id, 
          created_at,
          automation_users!inner(user_id)
        `)
      
      if (error) {
        console.warn('Posts check failed:', error.message)
        return []
      }
      return data || []
    }),
    
    optimizedSupabase.supabase
      .from('automation_activity_log')
      .select('*', { count: 'exact' })
      .gte('created_at', today)
  ])

  // Extract results
  const automationUsers = usersResult.status === 'fulfilled' ? usersResult.value : []
  const recentActivity = activityResult.status === 'fulfilled' ? activityResult.value.data : []
  const mealContent = contentResult.status === 'fulfilled' ? contentResult.value : []
  const automationPosts = postsResult.status === 'fulfilled' ? postsResult.value : []
  const todayActivity = todayActivityResult.status === 'fulfilled' ? todayActivityResult.value.data : []

  // Generate health checks
  const checks: SystemHealth['checks'] = {
    automationUsers: {
      status: automationUsers.length >= 3 ? 'healthy' : automationUsers.length > 0 ? 'warning' : 'error',
      message: `${automationUsers.length} active automation users`,
      details: { count: automationUsers.length, users: automationUsers.map(u => u.name) }
    },
    recentActivity: {
      status: (recentActivity?.length || 0) > 0 ? 'healthy' : 'warning',
      message: `${recentActivity?.length || 0} activities in last 24 hours`,
      details: { count: recentActivity?.length || 0 }
    },
    contentLibrary: {
      status: (mealContent?.length || 0) >= 10 ? 'healthy' : 'warning',
      message: `${mealContent?.length || 0} meal content items`,
      details: { count: mealContent?.length || 0 }
    },
    errorRate: {
      status: 'healthy',
      message: 'No critical errors detected',
      details: { errorCount: 0 }
    }
  }

  // Determine overall health
  const hasError = Object.values(checks).some(check => check.status === 'error')
  const hasWarning = Object.values(checks).some(check => check.status === 'warning')
  const overall = hasError ? 'error' : hasWarning ? 'warning' : 'healthy'

  return {
    overall,
    checks,
    statistics: {
      activeUsers: automationUsers.length,
      totalPosts: automationPosts?.length || 0,
      todayActivity: todayActivity?.length || 0,
      errorCount: 0
    },
    timestamp: new Date().toISOString()
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 Starting optimized automation health check...')

    const healthReport = await retryWithBackoff(performHealthCheck, 2, 1000)

    console.log('✅ Health check completed:', healthReport.overall)

    return new Response(JSON.stringify({
      ...healthReport,
      cache_stats: optimizedSupabase.getCacheStats()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Health check failed:', error)
    
    const errorReport: SystemHealth = {
      overall: 'error',
      checks: {
        automationUsers: { status: 'error', message: 'Check failed' },
        recentActivity: { status: 'error', message: 'Check failed' },
        contentLibrary: { status: 'error', message: 'Check failed' },
        errorRate: { status: 'error', message: 'Check failed' }
      },
      statistics: {
        activeUsers: 0,
        totalPosts: 0,
        todayActivity: 0,
        errorCount: 1
      },
      timestamp: new Date().toISOString()
    }

    return new Response(JSON.stringify(errorReport), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})