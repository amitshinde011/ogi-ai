import React, { useState, useEffect } from 'react';
import { UserCheck, MapPin } from 'lucide-react';
import { useLocationDetection } from '@/hooks/useLocationDetection';

interface ActivityItem {
  id: string;
  name: string;
  location: string;
  action: string;
  timeAgo: string;
}

const getLocaleActivities = (isIndiaUser: boolean, userLocation: string): ActivityItem[] => {
  if (isIndiaUser) {
    return [
      { id: '1', name: 'Priya', location: 'Mumbai', action: 'started her 21-day transformation', timeAgo: '2 minutes ago' },
      { id: '2', name: 'Rahul', location: 'Delhi', action: 'completed day 15 of wellness journey', timeAgo: '5 minutes ago' },
      { id: '3', name: 'Anjali', location: 'Bangalore', action: 'joined the community', timeAgo: '8 minutes ago' },
      { id: '4', name: 'Vikram', location: 'Chennai', action: 'unlocked premium recipes', timeAgo: '12 minutes ago' },
      { id: '5', name: 'Sneha', location: 'Pune', action: 'shared her transformation photo', timeAgo: '15 minutes ago' },
      { id: '6', name: 'Arjun', location: 'Hyderabad', action: 'started meditation practice', timeAgo: '18 minutes ago' },
      { id: '7', name: 'Kavya', location: 'Kolkata', action: 'completed her first week', timeAgo: '22 minutes ago' },
      { id: '8', name: 'Aditya', location: 'Ahmedabad', action: 'reached daily step goal', timeAgo: '25 minutes ago' },
      { id: '9', name: 'Meera', location: 'Jaipur', action: 'logged healthy breakfast', timeAgo: '28 minutes ago' },
      { id: '10', name: 'Rohan', location: 'Lucknow', action: 'finished morning yoga session', timeAgo: '32 minutes ago' },
      { id: '11', name: 'Pooja', location: 'Indore', action: 'achieved hydration target', timeAgo: '35 minutes ago' },
      { id: '12', name: 'Karan', location: 'Bhopal', action: 'completed surya namaskar challenge', timeAgo: '38 minutes ago' },
      { id: '13', name: 'Divya', location: 'Coimbatore', action: 'started intermittent fasting', timeAgo: '42 minutes ago' },
      { id: '14', name: 'Amit', location: 'Nagpur', action: 'unlocked achievement badge', timeAgo: '45 minutes ago' },
      { id: '15', name: 'Shreya', location: 'Surat', action: 'joined meditation group', timeAgo: '48 minutes ago' },
      { id: '16', name: 'Nikhil', location: 'Thiruvananthapuram', action: 'completed day 10 milestone', timeAgo: '52 minutes ago' },
      { id: '17', name: 'Riya', location: 'Gurgaon', action: 'shared progress update', timeAgo: '55 minutes ago' },
      { id: '18', name: 'Sanjay', location: 'Noida', action: 'started evening walk routine', timeAgo: '58 minutes ago' },
      { id: '19', name: 'Nisha', location: 'Mysore', action: 'tried new healthy recipe', timeAgo: '1 hour ago' },
      { id: '20', name: 'Deepak', location: 'Chandigarh', action: 'completed wellness assessment', timeAgo: '1 hour ago' },
    ];
  }
  
  // Default international names and locations
  return [
    { id: '1', name: 'Sarah', location: 'New York', action: 'started her 21-day transformation', timeAgo: '2 minutes ago' },
    { id: '2', name: 'Mike', location: 'London', action: 'completed day 15 of wellness journey', timeAgo: '5 minutes ago' },
    { id: '3', name: 'Emma', location: 'Sydney', action: 'joined the community', timeAgo: '8 minutes ago' },
    { id: '4', name: 'David', location: 'Toronto', action: 'unlocked premium recipes', timeAgo: '12 minutes ago' },
    { id: '5', name: 'Lisa', location: 'Berlin', action: 'shared her transformation photo', timeAgo: '15 minutes ago' },
    { id: '6', name: 'Alex', location: 'Singapore', action: 'started meditation practice', timeAgo: '18 minutes ago' },
    { id: '7', name: 'Maria', location: 'Madrid', action: 'completed her first week', timeAgo: '22 minutes ago' },
    { id: '8', name: 'James', location: 'Los Angeles', action: 'reached daily step goal', timeAgo: '25 minutes ago' },
    { id: '9', name: 'Sophie', location: 'Paris', action: 'logged healthy breakfast', timeAgo: '28 minutes ago' },
    { id: '10', name: 'Lucas', location: 'São Paulo', action: 'finished morning yoga session', timeAgo: '32 minutes ago' },
    { id: '11', name: 'Anna', location: 'Stockholm', action: 'achieved hydration target', timeAgo: '35 minutes ago' },
    { id: '12', name: 'Ryan', location: 'Chicago', action: 'completed fitness challenge', timeAgo: '38 minutes ago' },
    { id: '13', name: 'Elena', location: 'Rome', action: 'started intermittent fasting', timeAgo: '42 minutes ago' },
    { id: '14', name: 'Oliver', location: 'Amsterdam', action: 'unlocked achievement badge', timeAgo: '45 minutes ago' },
    { id: '15', name: 'Zoe', location: 'Melbourne', action: 'joined meditation group', timeAgo: '48 minutes ago' },
    { id: '16', name: 'Noah', location: 'Vancouver', action: 'completed day 10 milestone', timeAgo: '52 minutes ago' },
    { id: '17', name: 'Chloe', location: 'Dublin', action: 'shared progress update', timeAgo: '55 minutes ago' },
    { id: '18', name: 'Ethan', location: 'Miami', action: 'started evening walk routine', timeAgo: '58 minutes ago' },
    { id: '19', name: 'Isabella', location: 'Barcelona', action: 'tried new healthy recipe', timeAgo: '1 hour ago' },
    { id: '20', name: 'Mason', location: 'Seattle', action: 'completed wellness assessment', timeAgo: '1 hour ago' },
  ];
};

export const LiveActivityFeed: React.FC = () => {
  const [currentActivity, setCurrentActivity] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const locationData = useLocationDetection();
  
  const activities = getLocaleActivities(locationData?.isIndiaUser || false, locationData?.userLocation || '');

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentActivity((prev) => (prev + 1) % activities.length);
        setIsVisible(true);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, [activities.length]);

  const activity = activities[currentActivity];

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