
import React, { useEffect } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, UserPlus, Mail } from 'lucide-react';

const Notifications = () => {
  const { notifications, loading, fetchNotifications, markAsRead } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'new_follower':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'new_message':
        return <Mail className="w-5 h-5 text-purple-500" />;
      default:
        return <Heart className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationText = (notification: any) => {
    switch (notification.type) {
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'new_follower':
        return 'started following you';
      case 'new_message':
        return 'sent you a message';
      default:
        return 'interacted with your content';
    }
  };

  return (
    <Layout>
      <Header title="Notifications" />
      
      <div className="p-4 max-w-md mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No notifications yet</p>
            <p className="text-sm text-gray-400">
              You'll see notifications here when people interact with your posts
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                  notification.is_read ? 'bg-white' : 'bg-sage/10'
                }`}
                onClick={() => {
                  markAsRead(notification.id);
                  if (notification.post_id) {
                    window.location.href = `/community/post/${notification.post_id}`;
                  }
                }}
              >
                <Avatar className="w-10 h-10 mr-3">
                  <AvatarImage 
                    src={notification.sender?.profile_photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${notification.sender_id}`} 
                    alt={notification.sender?.name || 'User'} 
                  />
                  <AvatarFallback>
                    {(notification.sender?.name || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    {getNotificationIcon(notification.type)}
                    <span className="font-medium text-sm">
                      {notification.sender?.name || 'Someone'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {getNotificationText(notification)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>

                {!notification.is_read && (
                  <div className="w-2 h-2 bg-sage rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
