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

const indianNames = [
  'Priya', 'Rahul', 'Anjali', 'Vikram', 'Sneha', 'Arjun', 'Kavya', 'Aditya', 
  'Meera', 'Rohan', 'Pooja', 'Karan', 'Divya', 'Amit', 'Shreya', 'Nikhil', 
  'Riya', 'Sanjay', 'Nisha', 'Deepak', 'Ishita', 'Varun', 'Swati', 'Manish'
];

const indianLocations = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad', 'Kolkata', 
  'Ahmedabad', 'Jaipur', 'Lucknow', 'Indore', 'Bhopal', 'Coimbatore', 'Nagpur', 
  'Surat', 'Thiruvananthapuram', 'Gurgaon', 'Noida', 'Mysore', 'Chandigarh'
];

const internationalNames = [
  'Sarah', 'Mike', 'Emma', 'David', 'Lisa', 'Alex', 'Maria', 'James', 'Sophie', 
  'Lucas', 'Anna', 'Ryan', 'Elena', 'Oliver', 'Zoe', 'Noah', 'Chloe', 'Ethan', 
  'Isabella', 'Mason', 'Grace', 'Liam', 'Sophia', 'William'
];

const internationalLocations = [
  'New York', 'London', 'Sydney', 'Toronto', 'Berlin', 'Singapore', 'Madrid', 
  'Los Angeles', 'Paris', 'São Paulo', 'Stockholm', 'Chicago', 'Rome', 'Amsterdam', 
  'Melbourne', 'Vancouver', 'Dublin', 'Miami', 'Barcelona', 'Seattle'
];

const activities = [
  'started her 21-day transformation',
  'completed day 15 of wellness journey',
  'joined the community',
  'unlocked premium recipes',
  'shared her transformation photo',
  'started meditation practice',
  'completed her first week',
  'reached daily step goal',
  'logged healthy breakfast',
  'finished morning yoga session',
  'achieved hydration target',
  'completed surya namaskar challenge',
  'started intermittent fasting',
  'unlocked achievement badge',
  'joined meditation group',
  'completed day 10 milestone',
  'shared progress update',
  'started evening walk routine',
  'tried new healthy recipe',
  'completed wellness assessment'
];

const timeAgoOptions = [
  '1 minute ago', '2 minutes ago', '3 minutes ago', '5 minutes ago', '8 minutes ago',
  '12 minutes ago', '15 minutes ago', '18 minutes ago', '22 minutes ago', '25 minutes ago',
  '28 minutes ago', '32 minutes ago', '35 minutes ago', '38 minutes ago', '42 minutes ago',
  '45 minutes ago', '48 minutes ago', '52 minutes ago', '55 minutes ago', '58 minutes ago',
  '1 hour ago', '1 hour 15 minutes ago', '1 hour 30 minutes ago', '2 hours ago'
];

const getRandomElement = <T,>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const generateRandomActivity = (isIndiaUser: boolean): ActivityItem => {
  const names = isIndiaUser ? indianNames : internationalNames;
  const locations = isIndiaUser ? indianLocations : internationalLocations;
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    name: getRandomElement(names),
    location: getRandomElement(locations),
    action: getRandomElement(activities),
    timeAgo: getRandomElement(timeAgoOptions)
  };
};

export const LiveActivityFeed: React.FC = () => {
  const [currentActivity, setCurrentActivity] = useState<ActivityItem | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const locationData = useLocationDetection();
  
  // Generate initial activity
  useEffect(() => {
    setCurrentActivity(generateRandomActivity(locationData?.isIndiaUser || false));
  }, [locationData?.isIndiaUser]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentActivity(generateRandomActivity(locationData?.isIndiaUser || false));
        setIsVisible(true);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, [locationData?.isIndiaUser]);

  if (!currentActivity) {
    return null;
  }

  return (
    <div className={`fixed bottom-6 left-6 z-50 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              <span className="font-semibold">{currentActivity.name}</span> from{' '}
              <span className="inline-flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {currentActivity.location}
              </span>
            </p>
            <p className="text-sm text-gray-600">{currentActivity.action}</p>
            <p className="text-xs text-gray-400 mt-1">{currentActivity.timeAgo}</p>
          </div>
        </div>
      </div>
    </div>
  );
};