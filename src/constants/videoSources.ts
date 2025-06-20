
import { VideoSources } from '@/types/videoPlayer';

// Using a working test video URL - you'll need to replace this with your actual video URLs
const TEST_VIDEO_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

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
    console.log('Falling back to test video URL');
    
    // Use test video URL as fallback
    const fallbackUrls = {
      high: TEST_VIDEO_URL,
      medium: TEST_VIDEO_URL,
      low: TEST_VIDEO_URL
    };
    
    console.log('Using fallback test video URL:', fallbackUrls);
    return fallbackUrls;
  }
};

// Default export with test video URL
export const VIDEO_SOURCES: VideoSources = {
  high: TEST_VIDEO_URL,
  medium: TEST_VIDEO_URL,
  low: TEST_VIDEO_URL
};
