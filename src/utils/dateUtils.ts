
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
  const daysFromStart = Math.ceil((todayDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const daysCompleted = Math.max(1, daysFromStart + 1);
  const progressPercentage = Math.min(100, ((daysCompleted - 1) / totalDays) * 100);
  
  return {
    totalDays,
    daysCompleted: Math.min(daysCompleted, totalDays),
    progressPercentage,
    isCompleted: todayDate > end
  };
};
