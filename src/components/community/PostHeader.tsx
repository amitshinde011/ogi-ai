
import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { formatDistanceToNow } from 'date-fns';

interface PostHeaderProps {
  authorId: string;
  authorName?: string | null;
  profilePhotoUrl?: string | null;
  createdAt: string;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
  showPopover: boolean;
  setShowPopover: (show: boolean) => void;
}

export const PostHeader: React.FC<PostHeaderProps> = ({
  authorId,
  authorName,
  profilePhotoUrl,
  createdAt,
  isOwner,
  onEdit,
  onDelete,
  showPopover,
  setShowPopover
}) => {
  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const getAvatarUrl = (authorId: string, profileUrl?: string | null) => {
    return profileUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorId}`;
  };

  return (
    <div className="p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Avatar className="w-10 h-10">
          <AvatarImage 
            src={getAvatarUrl(authorId, profilePhotoUrl)}
            alt={authorName || 'User'}
          />
          <AvatarFallback>
            {(authorName || 'U').charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-sm">
            {authorName || 'Anonymous User'}
          </p>
          <p className="text-xs text-gray-500">{formatTime(createdAt)}</p>
        </div>
      </div>
      
      {isOwner && (
        <Popover open={showPopover} onOpenChange={setShowPopover}>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2"
            >
              <MoreHorizontal size={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="flex flex-col space-y-1">
              <Button
                variant="ghost"
                onClick={onEdit}
                className="flex items-center justify-start space-x-3 h-10 px-3"
              >
                <span>Edit</span>
              </Button>
              <Button
                variant="ghost"
                onClick={onDelete}
                className="flex items-center justify-start space-x-3 h-10 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <span>Delete</span>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
