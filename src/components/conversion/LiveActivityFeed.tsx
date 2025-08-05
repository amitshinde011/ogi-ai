import React, { useState, useEffect } from 'react';
import { UserCheck, MapPin } from 'lucide-react';

interface ActivityItem {
  id: string;
  name: string;
  location: string;
  action: string;
  timeAgo: string;
}

const sampleActivities: ActivityItem[] = [
  { id: '1', name: 'Priya', location: 'Mumbai', action: 'started her 21-day transformation', timeAgo: '2 minutes ago' },
  { id: '2', name: 'Rahul', location: 'Delhi', action: 'completed day 15 of wellness journey', timeAgo: '5 minutes ago' },
  { id: '3', name: 'Anjali', location: 'Bangalore', action: 'joined the community', timeAgo: '8 minutes ago' },
  { id: '4', name: 'Vikram', location: 'Chennai', action: 'unlocked premium recipes', timeAgo: '12 minutes ago' },
  { id: '5', name: 'Sneha', location: 'Pune', action: 'shared her transformation photo', timeAgo: '15 minutes ago' },
  { id: '6', name: 'Arjun', location: 'Hyderabad', action: 'started meditation practice', timeAgo: '18 minutes ago' },
];

export const LiveActivityFeed: React.FC = () => {
  const [currentActivity, setCurrentActivity] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentActivity((prev) => (prev + 1) % sampleActivities.length);
        setIsVisible(true);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const activity = sampleActivities[currentActivity];

  return (
    <div className={`fixed bottom-6 left-6 z-50 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              <span className="font-semibold">{activity.name}</span> from{' '}
              <span className="inline-flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {activity.location}
              </span>
            </p>
            <p className="text-sm text-gray-600">{activity.action}</p>
            <p className="text-xs text-gray-400 mt-1">{activity.timeAgo}</p>
          </div>
        </div>
      </div>
    </div>
  );
};