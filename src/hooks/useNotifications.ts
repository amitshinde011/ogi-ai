
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  recipient_user_id: string;
  sender_user_id: string;
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
        .select('name, profile_photo_url, user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      setCurrentUser({
        id: user.id, // Use auth user id consistently
        user_id: user.id,
        name: profile?.name || user.email?.split('@')[0] || 'User',
        profile_photo_url: profile?.profile_photo_url || null,
      });
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

const fetchNotifications = async () => {
  if (!currentUser) return;

  try {
    setLoading(true);

    // 1) Fetch raw notifications for the authenticated user
    const { data: rows, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    // 2) Bulk-fetch sender profiles (user_profiles and automation_users)
    const senderIds = Array.from(new Set((rows || []).map(n => n.sender_user_id).filter(Boolean)));

    let profiles: any[] = [];
    let bots: any[] = [];

    if (senderIds.length > 0) {
      const [profilesRes, botsRes] = await Promise.all([
        supabase.from('user_profiles').select('user_id, name, profile_photo_url').in('user_id', senderIds),
        supabase.from('automation_users').select('user_id, name, profile_photo_url').in('user_id', senderIds)
      ]);
      profiles = profilesRes.data || [];
      bots = botsRes.data || [];
    }

    const profileMap = new Map<string, { name: string | null; profile_photo_url: string | null }>();
    profiles.forEach(p => profileMap.set(p.user_id, { name: p.name, profile_photo_url: p.profile_photo_url }));
    bots.forEach(b => {
      if (!profileMap.has(b.user_id)) {
        profileMap.set(b.user_id, { name: b.name, profile_photo_url: b.profile_photo_url });
      }
    });

    // 3) Attach sender info
    const transformedData: Notification[] = (rows || []).map((n: any) => {
      const senderInfo = profileMap.get(n.sender_user_id) || null;
      return {
        ...n,
        sender: {
          id: n.sender_user_id,
          name: senderInfo?.name || 'Someone',
          profile_photo_url: senderInfo?.profile_photo_url || null,
        }
      };
    });

    setNotifications(transformedData);

    // Count unread notifications
    const unread = (rows || []).filter(n => !n.is_read).length;
    setUnreadCount(unread);

    // 4) Real-time subscription for new notifications
    const channel = supabase
      .channel(`notifications-${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_user_id=eq.${currentUser.id}`
        },
        async (payload) => {
          const n = payload.new as any;

          // Try resolve sender from cache; fetch if missing
          let sender = profileMap.get(n.sender_user_id) || null;
          if (!sender) {
            const [{ data: p }, { data: b }] = await Promise.all([
              supabase.from('user_profiles').select('user_id, name, profile_photo_url').eq('user_id', n.sender_user_id).maybeSingle(),
              supabase.from('automation_users').select('user_id, name, profile_photo_url').eq('user_id', n.sender_user_id).maybeSingle()
            ]);
            sender = p || b || null;
            if (sender) profileMap.set(n.sender_user_id, sender);
          }

          const enriched: Notification = {
            ...n,
            sender: {
              id: n.sender_user_id,
              name: sender?.name || 'Someone',
              profile_photo_url: sender?.profile_photo_url || null,
            }
          };

          setNotifications(prev => [enriched, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  } catch (error) {
    console.error('Error fetching notifications:', error);
    toast({ title: 'Failed to load notifications', variant: 'destructive' });
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
        .eq('recipient_user_id', currentUser.id)
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
          recipient_user_id: recipientId,
          sender_user_id: currentUser.id,
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
