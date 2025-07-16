
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PostEditFormProps {
  caption: string;
  category: string;
  onCaptionChange: (caption: string) => void;
  onCategoryChange: (category: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const categories = [
  'general',
  'nutrition',
  'exercise',
  'meditation',
  'progress',
  'recipe',
  'motivation'
];

export const PostEditForm: React.FC<PostEditFormProps> = ({
  caption,
  category,
  onCaptionChange,
  onCategoryChange,
  onSave,
  onCancel,
  isSubmitting
}) => {
  return (
    <div className="space-y-3 mb-3">
      <Textarea
        value={caption}
        onChange={(e) => onCaptionChange(e.target.value)}
        placeholder="What's on your mind?"
        rows={3}
        className="resize-none"
        disabled={isSubmitting}
      />
      <div className="flex items-center space-x-2">
        <Select value={category} onValueChange={onCategoryChange} disabled={isSubmitting}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          onClick={onSave}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
