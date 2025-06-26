
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import PostCard from '@/components/PostCard';

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
  user_profile_picture_url?: string;
}

interface PostListProps {
  posts: Post[];
  currentUserId?: string;
  onEdit: (post: Post) => void;
  onDelete: (postId: string) => void;
  onPostUpdate: () => void;
}

const PostList = ({ posts, currentUserId, onEdit, onDelete, onPostUpdate }: PostListProps) => {
  if (posts.length === 0) {
    return (
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-6 text-center">
          <p className="text-gray-700">No posts yet. Be the first to share your wellness journey!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          onEdit={onEdit}
          onDelete={onDelete}
          onPostUpdate={onPostUpdate}
        />
      ))}
    </>
  );
};

export default PostList;
