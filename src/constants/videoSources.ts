
import { VideoSources } from '@/types/videoPlayer';

// Single video URL - Cloudflare Stream handles adaptive bitrate automatically
const CLOUDFLARE_VIDEO_URL = "https://customer-cnlj15s4to2idzsi.cloudflarestream.com/8d8f8b1aca7d0f8224683acc56a26c4f/manifest/video.m3u8";

// Function to generate signed URLs (this will be called from a server function)
export const generateSignedVideoSources = async (): Promise<VideoSources> => {
  try {
    // Call your edge function with the correct path
    const response = await fetch('https://mxigbftmmkqnhmocyeeo.supabase.co/functions/v1/generate-signed-video-urls', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14aWdiZnRtbWtxbmhtb2N5ZWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5ODQ3NDIsImV4cCI6MjA2NDU2MDc0Mn0.hbYNmEvhL-tSN7ib7A0gFrNZocpVi5uKaTEhC_yAQSU'}`
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch signed URLs:', response.status, response.statusText);
      throw new Error('Failed to generate signed URLs');
    }

    const signedUrls = await response.json();
    console.log('Successfully fetched signed URLs:', signedUrls);
    return signedUrls;
  } catch (error) {
    console.error('Error generating signed URLs:', error);
    // Fallback to base URL if signing fails - all qualities use the same URL
    return {
      high: CLOUDFLARE_VIDEO_URL,
      medium: CLOUDFLARE_VIDEO_URL,
      low: CLOUDFLARE_VIDEO_URL
    };
  }
};

// Default export for backward compatibility - all qualities use the same URL
export const VIDEO_SOURCES: VideoSources = {
  high: CLOUDFLARE_VIDEO_URL,
  medium: CLOUDFLARE_VIDEO_URL,
  low: CLOUDFLARE_VIDEO_URL
};
