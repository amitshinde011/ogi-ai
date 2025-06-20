
import { VideoSources } from '@/types/videoPlayer';

// Single video URL - Cloudflare Stream handles adaptive bitrate automatically
const CLOUDFLARE_VIDEO_URL = "https://customer-cnlj15s4to2idzsi.cloudflarestream.com/8d8f8b1aca7d0f8224683acc56a26c4f/manifest/video.m3u8"; // Replace with your actual Stream URL

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
