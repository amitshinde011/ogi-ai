
# Complete API Documentation

## Overview
This document provides comprehensive API documentation for the Yogi AI platform, covering all endpoints, database operations, and integration patterns.

## Authentication

### Supabase Auth Integration
All API calls require authentication via Supabase Auth JWT tokens.

```typescript
// Get current session
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// Include in headers
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### Google OAuth Flow
```typescript
// Initiate Google OAuth
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
});

// Handle callback
useEffect(() => {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      // User successfully authenticated
      navigate('/home');
    }
  });
}, []);
```

## Edge Functions

### Process Payment Function
**Endpoint:** `/process-payment`
**Runtime:** Deno (Supabase Edge Functions)

#### Create Payment Session
Creates a payment session for program subscription.

**Request:**
```typescript
POST /functions/v1/process-payment
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "action": "create_payment_session",
  "programId": "uuid",
  "gateway": "braintree" | "razorpay",
  "amount": number,
  "currency": "USD" | "INR",
  "userId": "uuid",
  "couponCode"?: "string"
}
```

**Response (Braintree):**
```typescript
{
  "success": true,
  "orderId": "uuid",
  "sessionData": {
    "token": "string",
    "amount": number,
    "currency": "USD"
  },
  "gateway": "braintree"
}
```

**Response (Razorpay):**
```typescript
{
  "success": true,
  "orderId": "uuid",
  "sessionData": {
    "keyId": "rzp_xxx",
    "amount": number, // in paise
    "currency": "INR",
    "orderId": "order_xxx"
  },
  "gateway": "razorpay"
}
```

#### Verify Payment
Processes completed payment and activates subscription.

**Request:**
```typescript
POST /functions/v1/process-payment
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "action": "verify_payment",
  "orderId": "uuid",
  "transactionId": "string",
  "gateway": "braintree" | "razorpay"
}
```

**Response:**
```typescript
{
  "success": true,
  "message": "Payment verified and subscription activated",
  "subscriptionId": "uuid"
}
```

#### Error Responses
```typescript
// Authentication Error
{
  "error": "Authentication required",
  "code": "AUTH_REQUIRED"
}

// Invalid Program
{
  "error": "Program not found",
  "code": "PROGRAM_NOT_FOUND"
}

// Payment Gateway Error
{
  "error": "Payment gateway error",
  "code": "GATEWAY_ERROR",
  "details": "Specific error message"
}
```

## Database API

### Core Tables Operations

#### Programs
**Table:** `programs`

**Get All Programs:**
```typescript
const { data: programs, error } = await supabase
  .from('programs')
  .select('*')
  .order('duration_days');
```

**Get Program by ID:**
```typescript
const { data: program, error } = await supabase
  .from('programs')
  .select('*')
  .eq('id', programId)
  .single();
```

#### User Subscriptions
**Table:** `user_subscriptions`

**Get Active Subscription:**
```typescript
const { data: subscription, error } = await supabase
  .from('user_subscriptions')
  .select(`
    *,
    programs (
      id,
      name,
      duration_days,
      features,
      benefits
    )
  `)
  .eq('user_id', userId)
  .eq('status', 'active')
  .maybeSingle();
```

**Create Subscription:**
```typescript
const { data, error } = await supabase
  .from('user_subscriptions')
  .insert({
    user_id: userId,
    program_id: programId,
    start_date: new Date().toISOString().split('T')[0],
    end_date: endDate,
    status: 'active',
    payment_status: 'paid'
  })
  .select()
  .single();
```

#### User Profiles
**Table:** `user_profiles`

**Get User Profile:**
```typescript
const { data: profile, error } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('user_id', userId)
  .maybeSingle();
```

**Update Profile:**
```typescript
const { error } = await supabase
  .from('user_profiles')
  .upsert({
    user_id: userId,
    name: name,
    age: age,
    gender: gender,
    height: height,
    weight: weight,
    health_issues: healthIssues,
    physical_activity_basic: basicActivity,
    physical_activity_medium: mediumActivity,
    physical_activity_intense: intenseActivity,
    profile_photo_url: photoUrl
  });
```

#### Recipes
**Table:** `recipes`

**Get Program Recipes:**
```typescript
const { data: recipes, error } = await supabase
  .from('recipes')
  .select('*')
  .eq('package', programId)
  .order('created_at', { ascending: false });
```

**Get Recipe with Saved Status:**
```typescript
const { data: recipes, error } = await supabase
  .from('recipes')
  .select(`
    *,
    user_saved_recipes!left (
      id
    )
  `)
  .eq('package', programId)
  .eq('user_saved_recipes.user_id', userId);
```

#### Saved Recipes
**Table:** `user_saved_recipes`

**Save Recipe:**
```typescript
const { error } = await supabase
  .from('user_saved_recipes')
  .insert({
    user_id: userId,
    recipe_id: recipeId
  });
```

**Unsave Recipe:**
```typescript
const { error } = await supabase
  .from('user_saved_recipes')
  .delete()
  .eq('user_id', userId)
  .eq('recipe_id', recipeId);
```

### Community Features

#### Posts
**Table:** `community_posts`

**Get Posts with User Info:**
```typescript
const { data: posts, error } = await supabase
  .from('community_posts')
  .select(`
    *,
    profiles:user_id (
      full_name,
      avatar_url
    )
  `)
  .order('created_at', { ascending: false });
```

**Create Post:**
```typescript
const { data, error } = await supabase
  .from('community_posts')
  .insert({
    user_id: userId,
    title: title,
    content: content,
    image_url: imageUrl,
    category: category
  })
  .select()
  .single();
```

#### Likes System
**Table:** `community_post_likes`

**Toggle Like:**
```typescript
// Check if already liked
const { data: existingLike } = await supabase
  .from('community_post_likes')
  .select('id')
  .eq('post_id', postId)
  .eq('user_id', userId)
  .maybeSingle();

if (existingLike) {
  // Unlike
  await supabase
    .from('community_post_likes')
    .delete()
    .eq('id', existingLike.id);
} else {
  // Like
  await supabase
    .from('community_post_likes')
    .insert({
      post_id: postId,
      user_id: userId
    });
}
```

#### Comments System
**Table:** `community_post_comments`

**Get Comments with Replies:**
```typescript
const { data: comments, error } = await supabase
  .from('community_post_comments')
  .select('*')
  .eq('post_id', postId)
  .order('created_at', { ascending: true });

// Organize into threads
const organizeComments = (comments) => {
  const commentMap = new Map();
  const rootComments = [];

  comments.forEach(comment => {
    comment.replies = [];
    commentMap.set(comment.id, comment);
  });

  comments.forEach(comment => {
    if (comment.parent_comment_id) {
      const parent = commentMap.get(comment.parent_comment_id);
      if (parent) {
        parent.replies.push(comment);
      }
    } else {
      rootComments.push(comment);
    }
  });

  return rootComments;
};
```

**Add Comment:**
```typescript
const { data, error } = await supabase
  .from('community_post_comments')
  .insert({
    post_id: postId,
    user_id: userId,
    content: content,
    parent_comment_id: parentId // Optional for replies
  })
  .select()
  .single();
```

### Progress Tracking

#### Journey Assessments
**Table:** `journey_assessments`

**Create Before Assessment:**
```typescript
const { data, error } = await supabase
  .from('journey_assessments')
  .insert({
    user_id: userId,
    subscription_id: subscriptionId,
    assessment_type: 'before',
    walk_10km_comfort: walkComfort,
    run_10km_comfort: runComfort,
    climb_mountain_comfort: climbComfort,
    current_health_conditions: healthConditions,
    full_body_photo_url: photoUrl,
    comments: comments
  })
  .select()
  .single();
```

#### Final Assessments
**Table:** `final_assessments`

**Create Final Assessment:**
```typescript
const { data, error } = await supabase
  .from('final_assessments')
  .insert({
    user_id: userId,
    subscription_id: subscriptionId,
    assessment_type: 'final',
    walk_10km_comfort: walkComfort,
    run_10km_comfort: runComfort,
    climb_mountain_comfort: climbComfort,
    current_health_conditions: healthConditions,
    full_body_photo_url: photoUrl,
    comments: comments
  })
  .select()
  .single();
```

## Real-time Subscriptions

### Community Posts Real-time
```typescript
useEffect(() => {
  const channel = supabase
    .channel('community-posts')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'community_posts'
    }, (payload) => {
      console.log('Post change:', payload);
      fetchPosts(); // Refresh posts
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

### Like Count Updates
```typescript
useEffect(() => {
  const channel = supabase
    .channel(`post-${postId}-likes`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'community_post_likes',
      filter: `post_id=eq.${postId}`
    }, (payload) => {
      // Update like count in real-time
      updateLikeCount();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [postId]);
```

## Error Handling Patterns

### Standard Error Response
```typescript
interface APIError {
  error: string;
  code: string;
  details?: string;
  timestamp: string;
}
```

### Common Error Codes
- `AUTH_REQUIRED` - Authentication token missing or invalid
- `FORBIDDEN` - User lacks permission for requested resource
- `NOT_FOUND` - Requested resource doesn't exist
- `VALIDATION_ERROR` - Request data validation failed
- `RATE_LIMITED` - Too many requests from user
- `INTERNAL_ERROR` - Server-side error occurred

### Error Handling Implementation
```typescript
const handleAPIError = (error: any) => {
  if (error.code === 'PGRST116') {
    // No rows found
    return null;
  }
  
  if (error.code === '23505') {
    // Unique constraint violation
    throw new Error('Duplicate entry');
  }
  
  if (error.code === '42501') {
    // Insufficient privileges (RLS)
    throw new Error('Access denied');
  }
  
  // Generic error
  throw new Error(error.message || 'An error occurred');
};
```

## Rate Limiting

### Supabase Limits
- **Free tier**: 500 requests per second
- **Pro tier**: 1000 requests per second
- **Team tier**: 5000 requests per second

### Best Practices
- Implement client-side caching with React Query
- Use pagination for large datasets
- Batch operations when possible
- Implement exponential backoff for retries

## Security Considerations

### Row Level Security (RLS)
All user data tables have RLS policies:

```sql
-- Example policy for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" 
  ON user_subscriptions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" 
  ON user_subscriptions 
  FOR UPDATE 
  USING (auth.uid() = user_id);
```

### Input Validation
- Validate all user inputs on client and server
- Sanitize HTML content to prevent XSS
- Use parameterized queries to prevent SQL injection
- Implement file type and size validation for uploads

This comprehensive API documentation covers all aspects of the Yogi AI platform's backend operations.
