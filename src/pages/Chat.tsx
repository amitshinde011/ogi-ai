
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import Loader from '@/components/ui/loader';
import Header from '@/components/Header';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { formatDistanceToNow } from 'date-fns';

const Chat = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    otherUser,
    loading,
    fetchMessages,
    sendMessage
  } = useMessages();

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId) return;

    const success = await sendMessage(conversationId, newMessage);
    if (success) {
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <Layout>
        <Header title="Chat" showBack />
        <div className="flex items-center justify-center py-8">
          <Loader size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header 
        title={otherUser?.name || 'Chat'} 
        showBack 
        rightElement={
          otherUser && (
            <Avatar className="w-8 h-8">
              <AvatarImage 
                src={otherUser.profile_photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.id}`} 
                alt={otherUser.name || 'User'} 
              />
              <AvatarFallback>
                {(otherUser.name || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )
        }
      />
      
      <div className="flex flex-col h-[calc(100vh-140px)] max-w-md mx-auto">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={`flex ${message.isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs px-4 py-2 rounded-lg ${
                message.isFromCurrentUser 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <p className="text-sm">{message.message_text}</p>
                <p className={`text-xs mt-1 ${
                  message.isFromCurrentUser ? 'text-primary-foreground/80' : 'text-gray-500'
                }`}>
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Chat;
