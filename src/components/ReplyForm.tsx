
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

  return (
    <div className="space-y-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a reply..."
        className="min-h-16"
      />
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" onClick={handleSubmit}>
          <Send size={14} className="mr-1" />
          Reply
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ReplyForm;
