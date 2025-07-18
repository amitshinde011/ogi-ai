import { corsHeaders } from '../_shared/cors.ts'
import { optimizedSupabase } from '../_shared/optimized-client.ts'
import { retryWithBackoff } from '../_shared/rate-limiter.ts'

interface AutomationPost {
  id: number
  author_id: string
  image_url: string
  created_at: string
  bot_name: string
}

interface CleanupTask {
  post: any
  imageUrl: string
  deleteImage: boolean
}

async function deleteImagesFromSupabase(imageUrls: string[]): Promise<{ success: number, failed: number }> {
  const bucketFiles = new Map<string, string[]>()
  
  // Group files by bucket
  for (const imageUrl of imageUrls) {
    try {
      const urlParts = imageUrl.split('/storage/v1/object/public/')
      if (urlParts.length !== 2) continue
      
      const [bucketAndPath] = urlParts[1].split('/', 2)
      const filePath = urlParts[1].substring(bucketAndPath.length + 1)
      
      if (!bucketFiles.has(bucketAndPath)) {
        bucketFiles.set(bucketAndPath, [])
      }
      bucketFiles.get(bucketAndPath)!.push(filePath)
    } catch (error) {
      console.error(`Failed to parse image URL: ${imageUrl}`, error)
    }
  }

  let successCount = 0
  let failedCount = 0

  // Delete files by bucket in parallel
  const deletePromises = Array.from(bucketFiles.entries()).map(async ([bucketName, filePaths]) => {
    try {
      const { data, error } = await optimizedSupabase.supabase.storage
        .from(bucketName)
        .remove(filePaths)

      if (error) {
        console.error(`Failed to delete files from bucket ${bucketName}:`, error)
        failedCount += filePaths.length
      } else {
        console.log(`✅ Deleted ${filePaths.length} files from bucket ${bucketName}`)
        successCount += filePaths.length
      }
    } catch (error) {
      console.error(`Error deleting from bucket ${bucketName}:`, error)
      failedCount += filePaths.length
    }
  })

  await Promise.allSettled(deletePromises)
  
  return { success: successCount, failed: failedCount }
}

async function deleteAssociatedData(postIds: number[]): Promise<{ comments: number, likes: number }> {
  const chunkSize = 50
  const chunks = []
  
  for (let i = 0; i < postIds.length; i += chunkSize) {
    chunks.push(postIds.slice(i, i + chunkSize))
  }

  let deletedComments = 0
  let deletedLikes = 0

  // Delete comments and likes in parallel chunks
  const deletePromises = chunks.map(async (chunk) => {
    const [commentsResult, likesResult] = await Promise.allSettled([
      optimizedSupabase.supabase
        .from('comments')
        .delete()
        .in('post_id', chunk),
      
      optimizedSupabase.supabase
        .from('likes')
        .delete()
        .in('post_id', chunk)
    ])

    if (commentsResult.status === 'fulfilled' && !commentsResult.value.error) {
      deletedComments += chunk.length
    }
    
    if (likesResult.status === 'fulfilled' && !likesResult.value.error) {
      deletedLikes += chunk.length
    }
  })

  await Promise.allSettled(deletePromises)
  
  return { comments: deletedComments, likes: deletedLikes }
}

async function cleanupAutomationPosts(): Promise<any> {
  try {
    console.log('🧹 Starting optimized automation posts cleanup...')
    
    // Get old posts in a single optimized query
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    
    const { data: oldPosts, error: fetchError } = await optimizedSupabase.supabase
      .from('posts')
      .select(`
        id, 
        author_id, 
        image_url, 
        created_at,
        automation_users!inner(name, user_id)
      `)
      .lt('created_at', fiveDaysAgo)

    if (fetchError) {
      console.error('❌ Error fetching old automation posts:', fetchError)
      return { success: false, error: fetchError.message }
    }

    if (!oldPosts || oldPosts.length === 0) {
      console.log('✅ No automation posts to clean up')
      return { success: true, message: 'No posts to clean up', deleted: 0 }
    }

    console.log(`📊 Found ${oldPosts.length} automation posts to delete`)

    // Prepare cleanup tasks
    const cleanupTasks: CleanupTask[] = oldPosts.map(post => ({
      post,
      imageUrl: post.image_url,
      deleteImage: post.image_url && post.image_url.includes('supabase.co/storage/v1/object/public/')
    }))

    const postIds = oldPosts.map(p => p.id)
    const imageUrls = cleanupTasks
      .filter(task => task.deleteImage)
      .map(task => task.imageUrl)

    console.log(`🗑️ Deleting ${imageUrls.length} images and ${postIds.length} posts with associated data`)

    // Execute cleanup operations in parallel
    const [imageResults, dataResults] = await Promise.allSettled([
      imageUrls.length > 0 ? deleteImagesFromSupabase(imageUrls) : Promise.resolve({ success: 0, failed: 0 }),
      deleteAssociatedData(postIds)
    ])

    // Delete posts in batches
    const deleteFilters = postIds.map(id => ({ id }))
    const postDeleteResults = await optimizedSupabase.batchDelete('posts', deleteFilters, 50)
    
    const deletedPosts = postDeleteResults.filter(r => r.status === 'fulfilled').length

    const imageStats = imageResults.status === 'fulfilled' ? imageResults.value : { success: 0, failed: 0 }
    const dataStats = dataResults.status === 'fulfilled' ? dataResults.value : { comments: 0, likes: 0 }

    console.log('🏁 Cleanup completed successfully')

    return {
      success: true,
      message: 'Cleanup completed successfully',
      deleted: {
        posts: deletedPosts,
        images: imageStats.success,
        comments: dataStats.comments,
        likes: dataStats.likes
      },
      failed: {
        images: imageStats.failed
      }
    }

  } catch (error) {
    console.error('❌ Error in cleanup process:', error)
    return { 
      success: false, 
      error: error.message 
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 Optimized automation cleanup started')

    const result = await retryWithBackoff(cleanupAutomationPosts, 2, 2000)

    return new Response(
      JSON.stringify({
        ...result,
        cache_stats: optimizedSupabase.getCacheStats()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: result.success ? 200 : 500
      }
    )

  } catch (error) {
    console.error('Error in optimized automation cleanup:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})