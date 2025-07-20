
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  recipient_id: string;
  sender_id: string;
  type: string;
  post_id: number | null;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    name: string | null;
    profile_photo_url: string | null;
  };
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
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

  const fetchNotifications = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          sender:user_profiles!notifications_sender_id_fkey (
            id,
            name,
            profile_photo_url
          )
        `)
        .eq('recipient_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      
      // Count unread notifications
      const unread = (data || []).filter(n => !n.is_read).length;
      setUnreadCount(unread);

      // Set up real-time subscription for new notifications
      const channel = supabase
        .channel(`notifications-${currentUser.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${currentUser.id}`
          },
          async (payload) => {
            // Fetch the complete notification with sender info
            const { data: newNotification } = await supabase
              .from('notifications')
              .select(`
                *,
                sender:user_profiles!notifications_sender_id_fkey (
                  id,
                  name,
                  profile_photo_url
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (newNotification) {
              setNotifications(prev => [newNotification, ...prev]);
              setUnreadCount(prev => prev + 1);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };

    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({ title: "Failed to load notifications", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));

    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllPostNotificationsAsRead = async (postId: number) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', currentUser.id)
        .eq('post_id', postId)
        .eq('is_read', false);

      if (error) throw error;

      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.post_id === postId ? { ...n, is_read: true } : n
        )
      );

      // Recalculate unread count
      setNotifications(prev => {
        const unread = prev.filter(n => !n.is_read).length;
        setUnreadCount(unread);
        return prev;
      });

    } catch (error) {
      console.error('Error marking post notifications as read:', error);
    }
  };

  const createNotification = async (
    recipientId: string,
    type: string,
    postId?: number
  ) => {
    if (!currentUser || currentUser.id === recipientId) return;

    try {
      await supabase
        .from('notifications')
        .insert({
          recipient_id: recipientId,
          sender_id: currentUser.id,
          type,
          post_id: postId
        });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser]);

  return {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllPostNotificationsAsRead,
    createNotification
  };
};
