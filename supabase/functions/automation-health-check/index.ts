import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

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

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting automation health check...')

    // Check automation users
    const { data: automationUsers, error: usersError } = await supabase
      .from('automation_users')
      .select('*')
      .eq('is_active', true)

    if (usersError) {
      throw new Error(`Users check failed: ${usersError.message}`)
    }

    // Check recent activity (last 24 hours)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    const { data: recentActivity, error: activityError } = await supabase
      .from('automation_activity_log')
      .select('*')
      .gte('created_at', yesterday.toISOString())

    if (activityError) {
      throw new Error(`Activity check failed: ${activityError.message}`)
    }

    // Check content library
    const { data: mealContent, error: contentError } = await supabase
      .from('automation_meal_content')
      .select('id', { count: 'exact' })

    if (contentError) {
      throw new Error(`Content check failed: ${contentError.message}`)
    }

    // Check for posts created by automation users
    const automationUserIds = automationUsers.map(user => user.user_id).filter(Boolean)
    
    const { data: automationPosts, error: postsError } = await supabase
      .from('posts')
      .select('id, created_at')
      .in('author_id', automationUserIds)

    if (postsError) {
      console.warn('Posts check failed:', postsError.message)
    }

    // Check today's activity
    const today = new Date().toISOString().split('T')[0]
    const { data: todayActivity } = await supabase
      .from('automation_activity_log')
      .select('*', { count: 'exact' })
      .gte('created_at', today)

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
        status: 'healthy', // TODO: Implement error tracking
        message: 'Error tracking not implemented',
        details: { errorCount: 0 }
      }
    }

    // Determine overall health
    const hasError = Object.values(checks).some(check => check.status === 'error')
    const hasWarning = Object.values(checks).some(check => check.status === 'warning')
    const overall = hasError ? 'error' : hasWarning ? 'warning' : 'healthy'

    const healthReport: SystemHealth = {
      overall,
      checks,
      statistics: {
        activeUsers: automationUsers.length,
        totalPosts: automationPosts?.length || 0,
        todayActivity: todayActivity?.length || 0,
        errorCount: 0 // TODO: Implement error counting
      },
      timestamp: new Date().toISOString()
    }

    console.log('Health check completed:', healthReport.overall)

    return new Response(JSON.stringify(healthReport), {
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