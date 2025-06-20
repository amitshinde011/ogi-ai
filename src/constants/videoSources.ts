
import { VideoSources } from '@/types/videoPlayer';

// Function to generate signed URLs (this will be called from a server function)
export const generateSignedVideoSources = async (): Promise<VideoSources> => {
  console.log('generateSignedVideoSources called - starting fetch to edge function');
  
  try {
    // Call your edge function with the correct path
    const response = await fetch('https://mxigbftmmkqnhmocyeeo.supabase.co/functions/v1/generate-signed-video-urls', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14aWdiZnRtbWtxbmhtb2N5ZWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5ODQ3NDIsImV4cCI6MjA2NDU2MDc0Mn0.hbYNmEvhL-tSN7ib7A0gFrNZocpVi5uKaTEhC_yAQSU`
      },
    });

    console.log('Edge function response status:', response.status);

    if (!response.ok) {
      console.error('Failed to fetch signed URLs:', response.status, response.statusText);
      throw new Error('Failed to generate signed URLs');
    }

    const signedUrls = await response.json();
    console.log('Successfully fetched signed URLs:', signedUrls);
    return signedUrls;
  } catch (error) {
    console.error('Error generating signed URLs:', error);
    console.log('Edge function failed - this is expected in development');
    
    // Important: Do NOT fall back to unsigned URLs in production
    // This fallback is only for development/testing when the edge function might not be available
    throw error; // Re-throw the error instead of using fallback
  }
};

// Default export - this should not be used directly in production
export const VIDEO_SOURCES: VideoSources = {
  high: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  medium: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  low: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
};
