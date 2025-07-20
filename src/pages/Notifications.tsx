
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { PageContainer } from '@/components/Layout/PageContainer';
import Header from '@/components/Header';
import { useNotifications } from '@/hooks/useNotifications';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Notifications = () => {
  const { notifications, loading, markAsRead, markAllPostNotificationsAsRead } = useNotifications();
  const navigate = useNavigate();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getNotificationText = (notification: any) => {
    const senderName = notification.sender?.name || 'Someone';
    switch (notification.type) {
      case 'like':
        return `${senderName} liked your post`;
      case 'comment':
        return `${senderName} commented on your post`;
      default:
        return 'You have a new notification';
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (notification.post_id) {
      // Mark all notifications for this post as read
      await markAllPostNotificationsAsRead(notification.post_id);
      
      // Navigate to the post detail page
      navigate(`/post/${notification.post_id}`);
    }
  };

  return (
    <Layout noContainer>
      <PageContainer>
        <Header title="Notifications" showBack />
        
        <div className="py-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">No notifications yet</p>
              <p className="text-sm text-muted-foreground">
                You'll receive notifications when others interact with your posts
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                    notification.is_read 
                      ? 'bg-background hover:bg-muted/50' 
                      : 'bg-primary/5 border-primary/20 hover:bg-primary/10'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={notification.sender?.profile_photo_url}
                        alt={notification.sender?.name || 'User'}
                      />
                      <AvatarFallback>
                        {notification.sender?.name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        {getNotificationIcon(notification.type)}
                        <span className={`text-sm ${!notification.is_read ? 'font-medium' : ''}`}>
                          {getNotificationText(notification)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageContainer>
    </Layout>
  );
};

export default Notifications;
