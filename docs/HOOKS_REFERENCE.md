
# Community Hooks Reference

## Overview
This document provides detailed information about the custom React hooks used in the community features of the Yogi AI platform.

## Hook Categories

### Post Management Hooks

#### `useCommunityPosts`
**Location:** `src/hooks/useCommunityPosts.ts`

**Purpose:** Main hook for managing community posts data and operations.

**Returns:**
```typescript
{
  posts: Post[];           // Array of community posts
  loading: boolean;        // Loading state
  fetchPosts: () => void;  // Refetch posts function
  createPost: (user, post, image?) => Promise<boolean>;
  updatePost: (post) => Promise<boolean>;
  deletePost: (postId) => Promise<void>;
}
```

**Usage:**
```typescript
const {
  posts,
  loading,
  createPost,
  updatePost,
  deletePost
} = useCommunityPosts();
```

**Features:**
- Real-time post updates via Supabase subscriptions
- User profile integration with fallback handling
- Comment count synchronization
- Comprehensive error handling

#### `usePostOperations`
**Location:** `src/hooks/usePostOperations.ts`

**Purpose:** Provides CRUD operations for community posts.

**Parameters:**
- `fetchPosts: () => void` - Callback to refresh posts after operations

**Returns:**
```typescript
{
  createPost: (user, newPost, imageFile?) => Promise<boolean>;
  updatePost: (editingPost) => Promise<boolean>;
  deletePost: (postId) => Promise<void>;
}
```

**Features:**
- Input validation and sanitization
- Image upload to R2 storage
- User profile data integration
- Permission verification

### Like System Hooks

#### `usePostLikes`
**Location:** `src/hooks/usePostLikes.ts`

**Purpose:** Manages like functionality for posts with real-time updates.

**Parameters:**
```typescript
postId: string;              // Post identifier
initialLikesCount: number;   // Initial like count
currentUserId?: string;      // Current user ID (optional)
```

**Returns:**
```typescript
{
  isLiked: boolean;          // Current user's like status
  likesCount: number;        // Current like count
  handleLike: () => Promise<void>; // Toggle like function
}
```

**Usage:**
```typescript
const { isLiked, likesCount, handleLike } = usePostLikes(
  post.id,
  post.likes_count,
  currentUserId
);
```

**Features:**
- Real-time like count synchronization
- Optimistic UI updates
- Database verification with timeout
- Authentication requirement handling

**Real-time Subscription:**
- Listens to `community_post_likes` table changes
- Updates like count from database
- Checks user's like status on changes

### Comment System Hooks

#### `useComments`
**Location:** `src/hooks/useComments.ts`

**Purpose:** Manages comment data, organization, and real-time updates.

**Parameters:**
- `postId: string` - Post identifier

**Returns:**
```typescript
{
  comments: CommentType[];     // Organized comment tree
  loading: boolean;           // Loading state
  fetchComments: () => void;  // Refetch function
}
```

**Comment Structure:**
```typescript
interface CommentType {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  parent_comment_id?: string;
  user_name?: string;
  user_avatar?: string;
  replies?: CommentType[];    // Nested replies
}
```

**Features:**
- Threaded comment organization
- User profile integration with fallbacks
- Real-time comment updates
- Parent-child relationship handling

#### `usePostComments`
**Location:** `src/hooks/usePostComments.ts`

**Purpose:** Manages comment count synchronization for posts.

**Parameters:**
```typescript
postId: string;                 // Post identifier
initialCommentsCount: number;   // Initial comment count
```

**Returns:**
```typescript
{
  commentsCount: number;  // Current comment count
}
```

**Features:**
- Real-time comment count tracking
- Database count verification
- Automatic post table updates
- Console logging for debugging

**Real-time Process:**
1. Listens to comment table changes
2. Queries actual comment count
3. Updates local state
4. Syncs count to posts table

#### `useCommentActions`
**Location:** `src/hooks/useCommentActions.ts`

**Purpose:** Provides comment CRUD operations.

**Parameters:**
```typescript
postId: string;                    // Post identifier
onCommentAdded: () => void;        // Callback after adding
onCommentDeleted: () => void;      // Callback after deleting
```

**Returns:**
```typescript
{
  handleAddComment: (content: string, userId?: string) => Promise<void>;
  handleAddReply: (parentId: string, content: string, userId?: string) => Promise<void>;
  handleEditComment: (commentId: string, content: string) => Promise<void>;
  handleDeleteComment: (commentId: string) => Promise<void>;
}
```

**Features:**
- User profile data caching
- Authentication requirement checks
- Comprehensive error handling
- Success/failure notifications

## Hook Interactions

### Data Flow Between Hooks

```
useCommunityPosts
    ↓
usePostLikes ←→ Real-time Updates ←→ usePostComments
    ↓                                      ↓
PostCard Component ←→ CommentsSection ←→ useComments
                                          ↓
                                    useCommentActions
```

### Real-time Synchronization

All hooks implement real-time updates using Supabase subscriptions:

```typescript
// Common pattern for real-time subscriptions
useEffect(() => {
  const channel = supabase
    .channel('unique-channel-name')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'table_name',
      filter: `post_id=eq.${postId}`
    }, handleChange)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [postId]);
```

## Error Handling Patterns

### Authentication Errors
```typescript
if (!currentUserId) {
  toast({ title: "Please log in to perform this action", variant: "destructive" });
  return;
}
```

### Database Errors
```typescript
try {
  const { error } = await supabase.from('table').insert(data);
  if (error) throw error;
  
  toast({ title: "Operation successful!" });
} catch (error) {
  console.error('Operation failed:', error);
  toast({ title: "Operation failed", variant: "destructive" });
}
```

### Network Errors
```typescript
// Optimistic updates with verification
setOptimisticState(newValue);

try {
  await databaseOperation();
  // Verify with timeout
  setTimeout(verifyFromDatabase, 500);
} catch (error) {
  // Revert optimistic update
  setOptimisticState(originalValue);
}
```

## Performance Considerations

### Subscription Management
- Each hook properly cleans up subscriptions on unmount
- Targeted subscriptions using filters
- Unique channel names to prevent conflicts

### Data Fetching
- Efficient queries with specific column selection
- Caching user profile data in comments
- Fallback avatar generation using user IDs

### UI Updates
- Optimistic updates for immediate feedback
- Debounced database verification
- Loading states during operations

## Best Practices

### Hook Usage
1. Always handle loading states
2. Implement proper error handling
3. Clean up subscriptions on unmount
4. Use optimistic updates for better UX

### Real-time Updates
1. Use specific filters for subscriptions
2. Implement fallback data fetching
3. Handle subscription failures gracefully
4. Log events for debugging

### Error Management
1. Provide user-friendly error messages
2. Log detailed errors for debugging
3. Implement retry mechanisms where appropriate
4. Handle authentication edge cases

This reference provides comprehensive information about all community-related hooks, their usage patterns, and integration points.
