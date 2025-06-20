
import { VideoSources } from '@/types/videoPlayer';

// Base URLs for Cloudflare Stream videos
const CLOUDFLARE_BASE_URLS = {
  high: "https://customer-xxxxxxxxxxxxxxxx.cloudflarestream.com/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/manifest/video.m3u8", // Replace with your actual Stream URL
  medium: "https://customer-xxxxxxxxxxxxxxxx.cloudflarestream.com/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/manifest/video.m3u8", // Replace with your actual Stream URL
  low: "https://customer-xxxxxxxxxxxxxxxx.cloudflarestream.com/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/manifest/video.m3u8" // Replace with your actual Stream URL
};

// Function to generate signed URLs (this will be called from a server function)
export const generateSignedVideoSources = async (): Promise<VideoSources> => {
  try {
    // Call your edge function or API endpoint that generates signed URLs
    const response = await fetch('/api/generate-signed-video-urls', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to generate signed URLs');
    }

    const signedUrls = await response.json();
    return signedUrls;
  } catch (error) {
    console.error('Error generating signed URLs:', error);
    // Fallback to base URLs if signing fails
    return CLOUDFLARE_BASE_URLS;
  }
};

// Default export for backward compatibility
export const VIDEO_SOURCES: VideoSources = CLOUDFLARE_BASE_URLS;
