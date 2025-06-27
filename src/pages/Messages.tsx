
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useMessages } from '@/hooks/useMessages';
import { formatDistanceToNow } from 'date-fns';

const Messages = () => {
  const { conversations, loading, fetchConversations } = useMessages();

  useEffect(() => {
    fetchConversations();
  }, []);

  return (
    <Layout>
      <Header title="Messages" />
      
      <div className="p-4 max-w-md mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No conversations yet</p>
            <p className="text-sm text-gray-400">
              Start following people and send them messages!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <div 
                key={conversation.id}
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => window.location.href = `/messages/${conversation.id}`}
              >
                <Avatar className="w-12 h-12 mr-3">
                  <AvatarImage 
                    src={conversation.otherUser.profile_photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.otherUser.id}`} 
                    alt={conversation.otherUser.name || 'User'} 
                  />
                  <AvatarFallback>
                    {(conversation.otherUser.name || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">{conversation.otherUser.name || 'Anonymous'}</h3>
                    {conversation.lastMessage && (
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(conversation.lastMessage.created_at), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  {conversation.lastMessage && (
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage.message_text}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Messages;
