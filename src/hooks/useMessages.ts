
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
    if (!currentUser?.user_id) return;

    try {
      setLoading(true);

      // Get all conversations for current user (v2)
      const { data: participantData, error: participantError } = await supabase
        .from('conversation_participants_v2')
        .select(`
          conversation_id,
          conversations_v2 (
            id,
            created_at
          )
        `)
        .eq('user_id', currentUser.user_id);

      if (participantError) throw participantError;

      const conversationsWithDetails = await Promise.all(
        (participantData || []).map(async (participant: any) => {
          const convId = participant.conversation_id;

          // Get other participant's auth user id
          const { data: otherParticipant } = await supabase
            .from('conversation_participants_v2')
            .select('user_id')
            .eq('conversation_id', convId)
            .neq('user_id', currentUser.user_id)
            .maybeSingle();

          // Fetch other user's profile by auth user id
          const { data: otherProfile } = await supabase
            .from('user_profiles')
            .select('id, name, profile_photo_url')
            .eq('user_id', otherParticipant?.user_id || '')
            .maybeSingle();

          // Get last message from v2
          const { data: lastMessageData } = await supabase
            .from('messages_v2')
            .select('*')
            .eq('conversation_id', convId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          const lastMessage = lastMessageData
            ? {
                id: lastMessageData.id,
                conversation_id: lastMessageData.conversation_id,
                sender_id: lastMessageData.sender_user_id,
                message_text: lastMessageData.message_text,
                created_at: lastMessageData.created_at,
                isFromCurrentUser: lastMessageData.sender_user_id === currentUser.user_id,
              }
            : undefined;

          return {
            id: participant.conversations_v2.id,
            created_at: participant.conversations_v2.created_at,
            otherUser: otherProfile || { id: '', name: null, profile_photo_url: null },
            lastMessage,
          } as Conversation;
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
    if (!currentUser?.user_id) return;

    try {
      setLoading(true);

      // Fetch messages (v2)
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages_v2')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      const messagesWithUser: Message[] = (messagesData || []).map((m: any) => ({
        id: m.id,
        conversation_id: m.conversation_id,
        sender_id: m.sender_user_id,
        message_text: m.message_text,
        created_at: m.created_at,
        isFromCurrentUser: m.sender_user_id === currentUser.user_id,
      }));

      setMessages(messagesWithUser);

      // Get other user in conversation (profile from auth user id)
      const { data: otherPart } = await supabase
        .from('conversation_participants_v2')
        .select('user_id')
        .eq('conversation_id', conversationId)
        .neq('user_id', currentUser.user_id)
        .maybeSingle();

      if (otherPart?.user_id) {
        const { data: otherProf } = await supabase
          .from('user_profiles')
          .select('id, name, profile_photo_url')
          .eq('user_id', otherPart.user_id)
          .maybeSingle();
        setOtherUser(otherProf);
      } else {
        setOtherUser(null);
      }

      // Set up real-time subscription for new messages
      const channel = supabase
        .channel(`messages-${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages_v2',
            filter: `conversation_id=eq.${conversationId}`
          },
          (payload) => {
            const m: any = payload.new;
            const newMessage: Message = {
              id: m.id,
              conversation_id: m.conversation_id,
              sender_id: m.sender_user_id,
              message_text: m.message_text,
              created_at: m.created_at,
              isFromCurrentUser: m.sender_user_id === currentUser.user_id,
            };
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
    if (!currentUser?.user_id) return false;

    try {
      const { error } = await supabase
        .from('messages_v2')
        .insert({
          conversation_id: conversationId,
          sender_user_id: currentUser.user_id,
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

  const createConversation = async (otherAuthUserId: string) => {
    if (!currentUser?.user_id) return null;

    try {
      // Create conversation (v2)
      const { data: conversation, error: convError } = await supabase
        .from('conversations_v2')
        .insert({})
        .select()
        .single();

      if (convError) throw convError;

      // Add participants (auth user ids)
      const { error: participantError } = await supabase
        .from('conversation_participants_v2')
        .insert([
          { conversation_id: conversation.id, user_id: currentUser.user_id },
          { conversation_id: conversation.id, user_id: otherAuthUserId }
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
