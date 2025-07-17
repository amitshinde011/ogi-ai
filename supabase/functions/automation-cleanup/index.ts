import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9'
import { hmac } from 'https://deno.land/x/hmac@v2.0.1/mod.ts'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface AutomationPost {
  id: number
  author_id: string
  image_url: string
  created_at: string
  bot_name: string
}

// AWS Signature V4 helper functions (same as upload-to-r2)
async function sha256(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

function hmacSha256(key: Uint8Array, data: string): Uint8Array {
  return hmac('sha256', key, data) as Uint8Array
}

async function deleteImageFromR2(imageUrl: string): Promise<boolean> {
  try {
    // Extract the key from the image URL
    // URL format: https://assets.yogiai.in/community/user_id/timestamp.webp
    const urlParts = imageUrl.replace('https://assets.yogiai.in/', '').split('/')
    if (urlParts.length < 3) {
      console.error('Invalid image URL format:', imageUrl)
      return false
    }
    
    const key = urlParts.join('/') // community/user_id/timestamp.webp
    
    // AWS V4 signature for DELETE request
    const accountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID')!
    const accessKeyId = Deno.env.get('CLOUDFLARE_COMMUNITY_POST_ACCESS_KEY_ID')!
    const secretAccessKey = Deno.env.get('CLOUDFLARE_COMMUNITY_POST_SECRET_ACCESS_KEY')!
    const bucketName = 'wellness-images'

    const host = `${accountId}.r2.cloudflarestorage.com`
    const region = 'auto'
    const service = 's3'
    const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')
    const dateStamp = amzDate.substring(0, 8)
    
    const canonicalURI = `/${bucketName}/${key}`
    const hashedPayload = await sha256(new ArrayBuffer(0)) // Empty payload for DELETE
    
    const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${hashedPayload}\nx-amz-date:${amzDate}\n`
    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date'
    
    const canonicalRequest = `DELETE\n${canonicalURI}\n\n${canonicalHeaders}\n${signedHeaders}\n${hashedPayload}`
    const hashedCanonicalRequest = await sha256(new TextEncoder().encode(canonicalRequest))
    
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`
    const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${hashedCanonicalRequest}`

    const kDate = hmacSha256(new TextEncoder().encode('AWS4' + secretAccessKey), dateStamp)
    const kRegion = hmacSha256(kDate, region)
    const kService = hmacSha256(kRegion, service)
    const kSigning = hmacSha256(kService, 'aws4_request')
    const signature = hmac('sha256', kSigning, stringToSign, 'utf8', 'hex')

    const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`
    
    // Delete the file from R2
    const deleteUrl = `https://${host}${canonicalURI}`
    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': authorizationHeader,
        'x-amz-date': amzDate,
        'x-amz-content-sha256': hashedPayload,
      },
    })

    if (response.ok || response.status === 404) {
      // 404 is OK - file already deleted
      console.log(`✅ Successfully deleted image: ${key}`)
      return true
    } else {
      const errorText = await response.text()
      console.error(`❌ Failed to delete image ${key}:`, errorText)
      return false
    }

  } catch (error) {
    console.error(`❌ Error deleting image ${imageUrl}:`, error)
    return false
  }
}

async function cleanupAutomationPosts() {
  try {
    console.log('🧹 Starting automation posts cleanup...')
    
    // Get automation posts older than 5 days
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    
    // First get all automation user IDs
    const { data: automationUsers, error: usersError } = await supabase
      .from('automation_users')
      .select('user_id, name')
      .eq('is_active', true)
    
    if (usersError) {
      console.error('❌ Error fetching automation users:', usersError)
      return { success: false, error: usersError.message }
    }

    if (!automationUsers || automationUsers.length === 0) {
      console.log('✅ No automation users found')
      return { success: true, message: 'No automation users found', deleted: 0 }
    }

    const automationUserIds = automationUsers.map(u => u.user_id)
    
    // Get old posts from automation users
    const { data: oldPosts, error: fetchError } = await supabase
      .from('posts')
      .select('id, author_id, image_url, created_at')
      .in('author_id', automationUserIds)
      .lt('created_at', fiveDaysAgo)
    
    if (fetchError) {
      console.error('❌ Error fetching old automation posts:', fetchError)
      return { success: false, error: fetchError.message }
    }

    if (!oldPosts || oldPosts.length === 0) {
      console.log('✅ No automation posts to clean up')
      return { success: true, message: 'No posts to clean up', deleted: 0 }
    }

    console.log(`Found ${oldPosts.length} automation posts to delete`)

    let deletedPosts = 0
    let deletedImages = 0
    const errors = []

    for (const post of oldPosts) {
      try {
        // Get the automation user name for logging
        const automationUser = automationUsers.find(u => u.user_id === post.author_id)
        const botName = automationUser?.name || 'Unknown Bot'

        // Delete image from R2 storage if it's a Cloudflare image
        if (post.image_url && post.image_url.includes('assets.yogiai.in')) {
          const imageDeleted = await deleteImageFromR2(post.image_url)
          if (imageDeleted) {
            deletedImages++
          }
        }

        // Delete associated comments first (foreign key constraint)
        const { error: commentsError } = await supabase
          .from('comments')
          .delete()
          .eq('post_id', post.id)

        if (commentsError) {
          console.error(`❌ Error deleting comments for post ${post.id}:`, commentsError)
          errors.push(`Comments deletion failed for post ${post.id}: ${commentsError.message}`)
        }

        // Delete associated likes
        const { error: likesError } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', post.id)

        if (likesError) {
          console.error(`❌ Error deleting likes for post ${post.id}:`, likesError)
          errors.push(`Likes deletion failed for post ${post.id}: ${likesError.message}`)
        }

        // Delete associated reports
        const { error: reportsError } = await supabase
          .from('post_reports')
          .delete()
          .eq('post_id', post.id)

        if (reportsError) {
          console.error(`❌ Error deleting reports for post ${post.id}:`, reportsError)
          // Don't treat this as critical error, continue
        }

        // Finally delete the post
        const { error: postError } = await supabase
          .from('posts')
          .delete()
          .eq('id', post.id)

        if (postError) {
          console.error(`❌ Error deleting post ${post.id}:`, postError)
          errors.push(`Post deletion failed for post ${post.id}: ${postError.message}`)
        } else {
          deletedPosts++
          console.log(`✅ Deleted automation post ${post.id} from ${botName}`)
        }

        // Log the cleanup activity
        const automationUserRecord = automationUsers.find(u => u.user_id === post.author_id)
        if (automationUserRecord) {
          await supabase
            .from('automation_activity_log')
            .insert({
              automation_user_id: automationUserRecord.user_id,
              activity_type: 'cleanup',
              target_post_id: post.id
            })
        }

      } catch (error) {
        console.error(`❌ Error processing post ${post.id}:`, error)
        errors.push(`Processing failed for post ${post.id}: ${error.message}`)
      }
    }

    const result = {
      success: true,
      message: `Cleanup completed`,
      stats: {
        posts_found: oldPosts.length,
        posts_deleted: deletedPosts,
        images_deleted: deletedImages,
        errors: errors.length
      },
      errors: errors.slice(0, 10) // Limit error details
    }

    console.log('🧹 Cleanup completed:', result.stats)
    return result

  } catch (error) {
    console.error('❌ Fatal error in cleanup process:', error)
    return { success: false, error: error.message }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🤖 Running automation cleanup...')
    
    const result = await cleanupAutomationPosts()
    
    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: result.success ? 200 : 500
      }
    )

  } catch (error) {
    console.error('❌ Error in automation cleanup:', error)
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