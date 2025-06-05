
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ReplyFormProps {
  onSubmit: (content: string) => void;
  onCancel: () => void;
}

const ReplyForm = ({ onSubmit, onCancel }: ReplyFormProps) => {
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content.trim());
    setContent('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Write a reply... (Ctrl+Enter to submit)"
        className="min-h-12 text-sm resize-none"
      />
      <div className="flex gap-2">
        <Button 
          size="sm" 
          onClick={handleSubmit}
          disabled={!content.trim()}
          className="h-7 px-3 text-xs"
        >
          <Send size={12} className="mr-1" />
          Reply
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onCancel}
          className="h-7 px-3 text-xs"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ReplyForm;
