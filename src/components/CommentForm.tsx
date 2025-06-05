
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CommentFormProps {
  onSubmit: (content: string) => void;
  placeholder?: string;
}

const CommentForm = ({ onSubmit, placeholder = "Add a comment..." }: CommentFormProps) => {
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content.trim());
    setContent('');
  };

  return (
    <div className="space-y-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="min-h-20"
      />
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!content.trim()}
          className="bg-sage hover:bg-sage/90 text-white"
        >
          <Send size={14} className="mr-1" />
          Comment
        </Button>
      </div>
    </div>
  );
};

export default CommentForm;
