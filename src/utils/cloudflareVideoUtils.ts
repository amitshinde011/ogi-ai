
import { VideoSources } from '@/types/videoPlayer';

export interface CloudflareVideoConfig {
  accountId: string;
  videoIds: {
    high: string;
    medium: string;
    low: string;
  };
}

export const generateCloudflareSignedUrls = async (config: CloudflareVideoConfig): Promise<VideoSources> => {
  try {
    const response = await fetch('/api/generate-signed-video-urls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId: config.accountId,
        videoIds: config.videoIds,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate signed URLs: ${response.statusText}`);
    }

    const signedUrls = await response.json();
    return signedUrls;
  } catch (error) {
    console.error('Error generating Cloudflare signed URLs:', error);
    throw error;
  }
};

export const isSignedUrlExpired = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const token = urlObj.searchParams.get('token');
    
    if (!token) return false;
    
    // Basic check - in production you'd decode the JWT and check exp claim
    // For now, we'll assume URLs expire after 1 hour
    const urlCreationTime = localStorage.getItem(`url_created_${url}`);
    if (!urlCreationTime) return true;
    
    const hourInMs = 60 * 60 * 1000;
    return Date.now() - parseInt(urlCreationTime) > hourInMs;
  } catch {
    return true;
  }
};
