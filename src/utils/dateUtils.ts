
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  }

  return date.toLocaleDateString();
};

// Helper function to calculate program completion with inclusive end date
export const calculateProgramProgress = (startDate: string, endDate: string) => {
  const today = new Date().toISOString().split('T')[0];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const todayDate = new Date(today);
  
  // Calculate total days from start to end (inclusive)
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // If today is before the start date, we haven't started yet
  if (todayDate < start) {
    return {
      totalDays,
      daysCompleted: 0,
      progressPercentage: 0,
      isCompleted: false
    };
  }
  
  // If today is after the end date, program is completed
  if (todayDate > end) {
    return {
      totalDays,
      daysCompleted: totalDays,
      progressPercentage: 100,
      isCompleted: true
    };
  }
  
  // Calculate days completed (1-based counting)
  // If today is the start date, it's day 1
  const daysFromStart = Math.floor((todayDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const daysCompleted = daysFromStart + 1; // +1 because we count the start date as day 1
  
  // Progress percentage based on completed days
  const progressPercentage = Math.min(100, (daysCompleted / totalDays) * 100);
  
  return {
    totalDays,
    daysCompleted,
    progressPercentage,
    isCompleted: false
  };
};
