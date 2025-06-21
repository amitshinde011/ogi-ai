
import { VideoSources } from '@/types/videoPlayer';

// Video IDs from Cloudflare Stream
const VIDEO_IDS = [
  '8d8f8b1aca7d0f8224683acc56a26c4f',
  '584bf0778a5f896ddbce993ab259ef79', 
  '337f864ee97f2e104e2c1c496d90a27a'
];

// Generate proper Cloudflare Stream URLs for each video
const generateVideoSources = (videoId: string): VideoSources => ({
  // Using the correct Cloudflare Stream HLS manifest format
  high: `https://customer-5491c5fc7c145a8cd12ae3c66d6bb24b.cloudflarestream.com/${videoId}/manifest/video.m3u8`,
  medium: `https://customer-5491c5fc7c145a8cd12ae3c66d6bb24b.cloudflarestream.com/${videoId}/manifest/video.m3u8`,
  low: `https://customer-5491c5fc7c145a8cd12ae3c66d6bb24b.cloudflarestream.com/${videoId}/manifest/video.m3u8`
});

// Export video sources for all three videos
export const VIDEO_SOURCES_SEQUENCE = VIDEO_IDS.map(generateVideoSources);

// For backward compatibility
export const VIDEO_SOURCES = VIDEO_SOURCES_SEQUENCE[0];
