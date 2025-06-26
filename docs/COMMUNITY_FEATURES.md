
# Community Features Documentation

## Overview
The Yogi AI platform includes a comprehensive community system that allows users to create posts, interact through likes and comments, and build connections within the wellness community.

## Core Features

### 1. Post Management
Users can create, edit, and delete community posts with the following capabilities:
- Rich text content with titles
- Image attachments via R2 storage
- Real-time updates across all users
- User profile integration

### 2. Like System
Interactive like functionality with:
- Real-time like count updates
- Immediate UI feedback
- Optimistic updates with database verification
- User-specific like status tracking

### 3. Comment System
Threaded commenting system featuring:
- Nested replies support
- Real-time comment updates
- User profile integration
- Comment count synchronization

## Technical Architecture

### Database Schema

#### Community Posts (`community_posts`)
```sql
- id (uuid, primary key)
- user_id (uuid, references auth.users)
- title (text, not null)
- content (text, not null)
- image_url (text, optional)
- likes_count (integer, default 0)
- comments_count (integer, default 0)
- user_name (text, cached user info)
- user_profile_picture_url (text, cached avatar)
- created_at (timestamp)
- updated_at (timestamp)
```

#### Post Likes (`community_post_likes`)
```sql
- id (uuid, primary key)
- post_id (uuid, references community_posts)
- user_id (uuid, references auth.users)
- created_at (timestamp)
```

#### Post Comments (`community_post_comments`)
```sql
- id (uuid, primary key)
- post_id (uuid, references community_posts)
- user_id (uuid, references auth.users)
- parent_comment_id (uuid, optional for replies)
- content (text, not null)
- user_name (text, cached user info)
- user_avatar (text, cached avatar)
- created_at (timestamp)
- updated_at (timestamp)
```

### Real-time Updates

The system uses Supabase real-time subscriptions for instant updates:

#### Like Count Updates
```typescript
// Real-time subscription for likes
const channel = supabase
  .channel(`post-${postId}-likes`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'community_post_likes',
    filter: `post_id=eq.${postId}`
  }, handleLikeChange)
  .subscribe();
```

#### Comment Count Updates
```typescript
// Real-time subscription for comments
const channel = supabase
  .channel(`post-${postId}-comments`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'community_post_comments',
    filter: `post_id=eq.${postId}`
  }, handleCommentChange)
  .subscribe();
```

## Component Architecture

### Core Components

#### `PostCard`
Main post display component featuring:
- Post header with user information
- Content display with image support
- Like and comment actions
- Collapsible comments section

#### `PostHeader`
User information and post metadata:
- User avatar with fallback
- Display name and timestamp
- Edit/delete buttons for post owners

#### `PostActions`
Interactive elements:
- Like button with count
- Comment toggle with count
- Real-time count updates

#### `CommentsSection`
Complete commenting interface:
- Comment form for new comments
- Threaded comment display
- Reply functionality

#### `Comment`
Individual comment component:
- User information display
- Content with edit/delete options
- Reply form toggle

### Custom Hooks

#### `usePostLikes`
Manages like functionality:
```typescript
const { isLiked, likesCount, handleLike } = usePostLikes(
  postId, 
  initialLikesCount, 
  currentUserId
);
```

Features:
- Real-time like status tracking
- Optimistic UI updates
- Database synchronization
- Error handling

#### `usePostComments`
Manages comment count synchronization:
```typescript
const { commentsCount } = usePostComments(postId, initialCommentsCount);
```

Features:
- Real-time comment count updates
- Database count verification
- Automatic post table updates

#### `useComments`
Handles comment data and real-time updates:
```typescript
const { comments, loading, fetchComments } = useComments(postId);
```

Features:
- Threaded comment organization
- User profile integration
- Real-time comment updates

#### `useCommentActions`
Provides comment CRUD operations:
```typescript
const {
  handleAddComment,
  handleAddReply,
  handleEditComment,
  handleDeleteComment
} = useCommentActions(postId, onCommentAdded, onCommentDeleted);
```

#### `useCommunityPosts`
Main posts management hook:
```typescript
const {
  posts,
  loading,
  fetchPosts,
  createPost,
  updatePost,
  deletePost
} = useCommunityPosts();
```

## Data Flow

### Like Process
1. User clicks like button
2. `handleLike` function triggers
3. Optimistic UI update (immediate feedback)
4. Database operation (insert/delete like record)
5. Real-time subscription triggers
6. Database count verification
7. Final UI update with verified count

### Comment Process
1. User submits comment
2. `handleAddComment` function processes
3. User profile data fetched
4. Comment inserted with cached user info
5. Real-time subscription triggers
6. Comments refetched and re-organized
7. Comment count updated in posts table

### Post Update Process
1. Post data changes (create/edit/delete)
2. Database operation completed
3. Real-time subscription triggers
4. `fetchPosts` called to refresh data
5. UI updates with fresh data

## Error Handling

### Like Errors
- Authentication required for liking
- Network failure fallbacks
- Count verification after operations
- User feedback via toast notifications

### Comment Errors
- Authentication required for commenting
- Content validation
- Profile data fallbacks
- Graceful error messages

### Post Errors
- Input validation and sanitization
- Image upload error handling
- Permission verification
- User ownership checks

## Performance Optimizations

### Caching Strategy
- User profile data cached in comments
- Profile photos cached in posts
- Fallback avatars for missing data

### Real-time Efficiency
- Targeted subscriptions per post
- Cleanup on component unmount
- Debounced database operations

### UI Optimizations
- Optimistic updates for instant feedback
- Loading states during operations
- Skeleton loaders for better UX

## Security Considerations

### Row Level Security (RLS)
- Users can only modify their own content
- Public read access for community features
- Authenticated write operations

### Input Validation
- Content sanitization for XSS prevention
- Length limits on comments and posts
- Image upload validation

### Authentication
- JWT token verification
- User ownership checks
- Session management

## Usage Examples

### Creating a Post
```typescript
const success = await createPost(
  currentUser,
  { title: "My Wellness Journey", content: "Today I..." },
  imageFile
);
```

### Adding a Comment
```typescript
await handleAddComment("Great post! Thanks for sharing.", currentUserId);
```

### Liking a Post
```typescript
await handleLike(); // Toggles like status
```

## Troubleshooting

### Common Issues

#### Counts Not Updating
- Check real-time subscription setup
- Verify database triggers are working
- Ensure proper cleanup on unmount

#### User Information Missing
- Verify user profile data exists
- Check fallback avatar generation
- Confirm cached data is current

#### Authentication Issues
- Validate JWT token presence
- Check user session status
- Verify RLS policies

### Debug Tools
- Console logs for real-time events
- Network tab for API requests
- Supabase dashboard for data verification

## Future Enhancements

### Planned Features
- Comment reactions (like/dislike)
- Post categories and filtering
- User mentions in comments
- Rich text editor for posts
- Image optimization and resizing

### Performance Improvements
- Pagination for large comment threads
- Virtual scrolling for posts
- Image lazy loading
- Comment bundling for bulk operations

This documentation provides a comprehensive overview of the community features implementation, covering both technical details and usage patterns.
