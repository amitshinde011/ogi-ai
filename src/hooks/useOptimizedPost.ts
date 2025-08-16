import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OptimizedPost {
  id: number;
  author_id: string;
  image_url: string;
  caption: string;
  category: string;
  like_count: number;
  comment_count: number;
  created_at: string;
  author_name: string;
  author_avatar: string | null;
  user_has_liked: boolean;
}

export interface OptimizedComment {
  id: number;
  author_id: string;
  post_id: number;
  text: string;
  created_at: string;
  author_name: string;
  author_avatar: string | null;
}

export const useOptimizedPost = (postId: string | undefined, userId: string | undefined) => {
  const [post, setPost] = useState<OptimizedPost | null>(null);
  const [comments, setComments] = useState<OptimizedComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPostData = async () => {
    if (!postId) return;

    const numericPostId = parseInt(postId, 10);
    if (isNaN(numericPostId)) {
      setError('Invalid post ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch post row first
      const { data: postRow, error: postError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', numericPostId)
        .maybeSingle();

      if (postError || !postRow) {
        setError('Post not found');
        setLoading(false);
        return;
      }

      // Fetch comments, like status, and author info in parallel
      const [commentsResult, likeResult, profileResult, automationResult] = await Promise.all([
        supabase
          .from('comments')
          .select('*')
          .eq('post_id', numericPostId)
          .order('created_at', { ascending: false }),
        userId
          ? supabase
              .from('likes')
              .select('user_id')
              .eq('post_id', numericPostId)
              .eq('user_id', userId)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null } as any),
        supabase
          .from('user_profiles')
          .select('user_id, name, profile_photo_url')
          .eq('user_id', postRow.author_id)
          .maybeSingle(),
        supabase
          .from('automation_users')
          .select('user_id, name, profile_photo_url')
          .eq('user_id', postRow.author_id)
          .maybeSingle(),
      ]);

      // Build author info for post
      const authorName =
        (profileResult as any).data?.name ??
        (automationResult as any).data?.name ??
        'Anonymous User';
      const authorAvatar =
        (profileResult as any).data?.profile_photo_url ??
        (automationResult as any).data?.profile_photo_url ??
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${postRow.author_id}`;

      // Get comment author IDs for fetching comment authors
      const commentAuthorIds = commentsResult.data 
        ? [...new Set(commentsResult.data.map((c: any) => c.author_id))]
        : [];

      // Fetch comment authors in one query
      const { data: userAuthors } = commentAuthorIds.length > 0 
        ? await supabase
            .from('user_profiles')
            .select('user_id, name, profile_photo_url')
            .in('user_id', commentAuthorIds)
        : { data: [] } as any;

      // Create author map for quick lookup
      const authorMap = new Map<string, { name: string | null; profile_photo_url: string | null }>(
        (userAuthors || []).map((author: any) => [
          author.user_id as string,
          { name: author.name as string | null, profile_photo_url: author.profile_photo_url as string | null }
        ])
      );

      // Check for missing authors in automation_users
      const missingAuthorIds = commentAuthorIds.filter((id: string) => !authorMap.has(id));
      if (missingAuthorIds.length > 0) {
        const { data: automationAuthors } = await supabase
          .from('automation_users')
          .select('user_id, name, profile_photo_url')
          .in('user_id', missingAuthorIds);

        automationAuthors?.forEach((author: any) => {
          authorMap.set(author.user_id, {
            name: author.name,
            profile_photo_url: author.profile_photo_url
          });
        });
      }

      // Process post data (author info assembled from profiles/automation_users)
      const optimizedPost: OptimizedPost = {
        id: postRow.id,
        author_id: postRow.author_id,
        image_url: postRow.image_url,
        caption: postRow.caption,
        category: postRow.category,
        like_count: postRow.like_count,
        comment_count: postRow.comment_count,
        created_at: postRow.created_at,
        author_name: authorName,
        author_avatar: authorAvatar,
        user_has_liked: !!(likeResult as any).data
      };

      // Process comments data
      const optimizedComments: OptimizedComment[] = (commentsResult.data || []).map(comment => {
        const author = authorMap.get(comment.author_id);
        return {
          id: comment.id,
          author_id: comment.author_id,
          post_id: comment.post_id,
          text: comment.text,
          created_at: comment.created_at,
          author_name: author?.name || 'Unknown User',
          author_avatar: author?.profile_photo_url || null
        };
      });

      setPost(optimizedPost);
      setComments(optimizedComments);
    } catch (err) {
      console.error('Error fetching post data:', err);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (text: string): Promise<boolean> => {
    if (!post || !userId || !text.trim()) return false;

    try {
      const { data: newComment, error } = await supabase
        .from('comments')
        .insert({
          post_id: post.id,
          author_id: userId,
          text: text.trim()
        })
        .select('*')
        .single();

      if (error) throw error;

      // Get current user profile for the new comment
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('name, profile_photo_url')
        .eq('user_id', userId)
        .single();

      if (newComment) {
        const optimizedComment: OptimizedComment = {
          id: newComment.id,
          author_id: newComment.author_id,
          post_id: newComment.post_id,
          text: newComment.text,
          created_at: newComment.created_at,
          author_name: userProfile?.name || 'Unknown User',
          author_avatar: userProfile?.profile_photo_url || null
        };

        setComments(prev => [optimizedComment, ...prev]);
        setPost(prev => prev ? { ...prev, comment_count: prev.comment_count + 1 } : null);
      }

      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      return false;
    }
  };

  const toggleLike = async (): Promise<boolean> => {
    if (!post || !userId) return false;

    try {
      if (post.user_has_liked) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', userId);

        setPost(prev => prev ? {
          ...prev,
          user_has_liked: false,
          like_count: prev.like_count - 1
        } : null);
      } else {
        // Like
        await supabase
          .from('likes')
          .insert({
            post_id: post.id,
            user_id: userId
          });

        setPost(prev => prev ? {
          ...prev,
          user_has_liked: true,
          like_count: prev.like_count + 1
        } : null);
      }

      return true;
    } catch (error) {
      console.error('Error toggling like:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchPostData();
  }, [postId, userId]);

  return {
    post,
    comments,
    loading,
    error,
    addComment,
    toggleLike,
    refreshPost: fetchPostData
  };
};