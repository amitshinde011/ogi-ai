
import { VideoSources } from '@/types/videoPlayer';

// Video IDs from Cloudflare Stream
const VIDEO_IDS = [
  '8d8f8b1aca7d0f8224683acc56a26c4f',
  '584bf0778a5f896ddbce993ab259ef79', 
  '337f864ee97f2e104e2c1c496d90a27a'
];

// Using yogiai.in domain for all video requests
const DOMAIN = 'yogiai.in';

// Generate proper video URLs through your domain
const generateVideoSources = (videoId: string): VideoSources => ({
  // Using HLS URLs through your domain
  high: `https://${DOMAIN}/api/video/${videoId}/manifest/video.m3u8`,
  medium: `https://${DOMAIN}/api/video/${videoId}/manifest/video.m3u8`,
  low: `https://${DOMAIN}/api/video/${videoId}/manifest/video.m3u8`
});

// Generate MP4 fallback URLs through your domain
const generateMP4Sources = (videoId: string): VideoSources => ({
  high: `https://${DOMAIN}/api/video/${videoId}/downloads/default.mp4`,
  medium: `https://${DOMAIN}/api/video/${videoId}/downloads/default.mp4`,
  low: `https://${DOMAIN}/api/video/${videoId}/downloads/default.mp4`
});

// Generate iframe URLs through your domain
const generateIframeUrl = (videoId: string): string => 
  `https://${DOMAIN}/api/video/${videoId}/iframe`;

// Export video sources for all three videos
export const VIDEO_SOURCES_SEQUENCE = VIDEO_IDS.map(generateVideoSources);
export const MP4_SOURCES_SEQUENCE = VIDEO_IDS.map(generateMP4Sources);
export const IFRAME_URLS = VIDEO_IDS.map(generateIframeUrl);

// For backward compatibility
export const VIDEO_SOURCES = VIDEO_SOURCES_SEQUENCE[0];
