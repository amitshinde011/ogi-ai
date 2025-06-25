# API Reference

## Supabase Edge Functions

### Process Payment Function

**Endpoint:** `/functions/v1/process-payment`

**Authentication:** Required (Bearer token)

#### Create Payment Session

Creates a new payment session for program subscription.

**Request:**
```typescript
POST /process-payment
Content-Type: application/json
Authorization: Bearer <supabase-token>

{
  "action": "create_payment_session",
  "programId": "uuid",
  "gateway": "braintree" | "razorpay",
  "amount": number,
  "currency": "USD" | "INR",
  "userId": "uuid"
}
```

**Response:**
```typescript
{
  "orderId": "uuid",
  "sessionData": {
    // Braintree response
    "token": "string",
    "amount": number,
    "currency": "USD"
    
    // OR Razorpay response
    "keyId": "string",
    "amount": number, // in paise
    "currency": "INR",
    "orderId": "string"
  },
  "gateway": "braintree" | "razorpay"
}
```

**Error Responses:**
- `400` - Invalid request data or free subscription
- `401` - Authentication required
- `500` - Server error

#### Verify Payment

Verifies and processes completed payment.

**Request:**
```typescript
POST /process-payment
Content-Type: application/json
Authorization: Bearer <supabase-token>

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
  "message": "Payment verified successfully"
}
```

## Database API

### Authentication

All database operations require authentication via Supabase Auth. Include the JWT token in the Authorization header.

### Tables

#### Programs
**Table:** `programs`

**Select:**
```typescript
const { data, error } = await supabase
  .from('programs')
  .select('*')
  .order('duration_days');
```

**Columns:**
- `id` (uuid, primary key)
- `name` (text)
- `duration_days` (integer)
- `price` (numeric)
- `price_inr` (numeric)
- `features` (text[])
- `benefits` (text[])
- `description` (text)

#### User Subscriptions
**Table:** `user_subscriptions`

**Select User's Active Subscription:**
```typescript
const { data, error } = await supabase
  .from('user_subscriptions')
  .select('*, programs(*)')
  .eq('user_id', userId)
  .eq('status', 'active')
  .single();
```

**Create Subscription:**
```typescript
const { error } = await supabase
  .from('user_subscriptions')
  .insert({
    user_id: userId,
    program_id: programId,
    start_date: startDate,
    end_date: endDate,
    status: 'active',
    payment_status: 'paid'
  });
```

#### Recipes
**Table:** `recipes`

**Get Program Recipes:**
```typescript
const { data, error } = await supabase
  .from('recipes')
  .select('*')
  .eq('package', programId)
  .order('created_at', { ascending: false });
```

**Columns:**
- `id` (uuid, primary key)
- `name` (text)
- `package` (text) - Program ID
- `category` (text)
- `details` (text)
- `image_url` (text)
- `cook_time` (text)
- `servings` (integer)
- `difficulty` (text)
- `rating` (numeric)
- `ingredients` (text)
- `instructions` (text)
- `nutrition` (jsonb)
- `tips` (text)

#### Community Posts
**Table:** `community_posts`

**Get Posts with User Info:**
```typescript
const { data, error } = await supabase
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
const { error } = await supabase
  .from('community_posts')
  .insert({
    user_id: userId,
    title: title,
    content: content,
    image_url: imageUrl,
    category: category
  });
```

#### User Onboarding
**Table:** `user_onboarding`

**Get Onboarding State:**
```typescript
const { data, error } = await supabase
  .from('user_onboarding')
  .select('*')
  .eq('user_id', userId)
  .single();
```

**Update Progress:**
```typescript
const { error } = await supabase
  .from('user_onboarding')
  .update({
    profile_completed: true,
    subscription_selected: true,
    // ... other fields
  })
  .eq('user_id', userId);
```

## Row Level Security Policies

All tables implement RLS policies that restrict access to user's own data:

```sql
-- Example policy for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" 
  ON user_subscriptions 
  FOR SELECT 
  USING (auth.uid() = user_id);
```

## Error Handling

### Common Error Codes
- `PGRST116` - No rows found (expected for single row queries)
- `23505` - Unique constraint violation
- `42501` - Insufficient privileges (RLS violation)

### Error Response Format
```typescript
{
  code: "string",
  details: "string",
  hint: "string",
  message: "string"
}
```

## Rate Limiting

Supabase applies rate limiting based on your plan:
- **Free tier:** 500 requests per second
- **Pro tier:** 1000 requests per second

## Authentication Headers

Include the Supabase JWT token in all requests:

```typescript
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// Include in headers
Authorization: `Bearer ${token}`
```

## Real-time Subscriptions

Subscribe to table changes:

```typescript
const subscription = supabase
  .channel('custom-channel')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'community_posts'
  }, (payload) => {
    console.log('Change received!', payload);
  })
  .subscribe();
```
