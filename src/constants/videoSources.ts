
import { VideoSources } from '@/types/videoPlayer';

// Updated Cloudflare Stream URL with correct format
const CLOUDFLARE_VIDEO_URL = "https://customer-cnlj15s4to2idzsi.cloudflarestream.com/8d8f8b1aca7d0f8224683acc56a26c4f/manifest/video.m3u8";

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
    console.log('Edge function response headers:', response.headers);

    if (!response.ok) {
      console.error('Failed to fetch signed URLs:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      throw new Error('Failed to generate signed URLs');
    }

    const signedUrls = await response.json();
    console.log('Successfully fetched signed URLs:', signedUrls);
    return signedUrls;
  } catch (error) {
    console.error('Error generating signed URLs:', error);
    console.log('Falling back to direct MP4 URLs');
    
    // Fallback to direct MP4 URLs if signing fails
    const fallbackUrls = {
      high: `https://customer-cnlj15s4to2idzsi.cloudflarestream.com/8d8f8b1aca7d0f8224683acc56a26c4f/downloads/default.mp4`,
      medium: `https://customer-cnlj15s4to2idzsi.cloudflarestream.com/8d8f8b1aca7d0f8224683acc56a26c4f/downloads/default.mp4`,
      low: `https://customer-cnlj15s4to2idzsi.cloudflarestream.com/8d8f8b1aca7d0f8224683acc56a26c4f/downloads/default.mp4`
    };
    
    console.log('Using fallback URLs:', fallbackUrls);
    return fallbackUrls;
  }
};

// Default export with MP4 fallback URLs
export const VIDEO_SOURCES: VideoSources = {
  high: `https://customer-cnlj15s4to2idzsi.cloudflarestream.com/8d8f8b1aca7d0f8224683acc56a26c4f/downloads/default.mp4`,
  medium: `https://customer-cnlj15s4to2idzsi.cloudflarestream.com/8d8f8b1aca7d0f8224683acc56a26c4f/downloads/default.mp4`,
  low: `https://customer-cnlj15s4to2idzsi.cloudflarestream.com/8d8f8b1aca7d0f8224683acc56a26c4f/downloads/default.mp4`
};
