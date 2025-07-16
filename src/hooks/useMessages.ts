
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_text: string;
  created_at: string;
  isFromCurrentUser: boolean;
}

interface Conversation {
  id: string;
  created_at: string;
  otherUser: {
    id: string;
    name: string | null;
    profile_photo_url: string | null;
  };
  lastMessage?: Message;
}

export const useMessages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { user } = useAuth();

  // Fetch current user
  const fetchCurrentUser = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setCurrentUser({
        id: profile?.id,
        user_id: user.id,
        name: profile?.name || user.email?.split('@')[0] || 'User',
        profile_photo_url: profile?.profile_photo_url
      });
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchConversations = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      // Get all conversations for current user
      const { data: participantData, error: participantError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversations (
            id,
            created_at
          )
        `)
        .eq('user_id', currentUser.id);

      if (participantError) throw participantError;

      const conversationsWithDetails = await Promise.all(
        (participantData || []).map(async (participant) => {
          // Get other participant
          const { data: otherParticipant } = await supabase
            .from('conversation_participants')
            .select(`
              user_id,
              user_profiles (
                id,
                name,
                profile_photo_url
              )
            `)
            .eq('conversation_id', participant.conversation_id)
            .neq('user_id', currentUser.id)
            .single();

          // Get last message
          const { data: lastMessageData } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', participant.conversation_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Create proper lastMessage object with isFromCurrentUser property
          const lastMessage = lastMessageData ? {
            ...lastMessageData,
            isFromCurrentUser: lastMessageData.sender_id === currentUser.id
          } : undefined;

          return {
            id: participant.conversations.id,
            created_at: participant.conversations.created_at,
            otherUser: otherParticipant?.user_profiles || { id: '', name: null, profile_photo_url: null },
            lastMessage
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({ title: "Failed to load conversations", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    if (!currentUser) return;

    try {
      setLoading(true);

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      const messagesWithUser = (messagesData || []).map(message => ({
        ...message,
        isFromCurrentUser: message.sender_id === currentUser.id
      }));

      setMessages(messagesWithUser);

      // Get other user in conversation
      const { data: otherParticipant } = await supabase
        .from('conversation_participants')
        .select(`
          user_id,
          user_profiles (
            id,
            name,
            profile_photo_url
          )
        `)
        .eq('conversation_id', conversationId)
        .neq('user_id', currentUser.id)
        .single();

      setOtherUser(otherParticipant?.user_profiles);

      // Set up real-time subscription for new messages
      const channel = supabase
        .channel(`messages-${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          (payload) => {
            const newMessage = {
              ...payload.new,
              isFromCurrentUser: payload.new.sender_id === currentUser.id
            } as Message;
            setMessages(prev => [...prev, newMessage]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };

    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({ title: "Failed to load messages", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (conversationId: string, messageText: string) => {
    if (!currentUser) return false;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUser.id,
          message_text: messageText.trim()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: "Failed to send message", variant: "destructive" });
      return false;
    }
  };

  const createConversation = async (otherUserId: string) => {
    if (!currentUser) return null;

    try {
      // Create conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single();

      if (convError) throw convError;

      // Add participants
      const { error: participantError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: conversation.id, user_id: currentUser.id },
          { conversation_id: conversation.id, user_id: otherUserId }
        ]);

      if (participantError) throw participantError;

      return conversation.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({ title: "Failed to create conversation", variant: "destructive" });
      return null;
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return {
    conversations,
    messages,
    otherUser,
    loading,
    fetchConversations,
    fetchMessages,
    sendMessage,
    createConversation
  };
};
