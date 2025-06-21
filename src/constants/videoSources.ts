
import { VideoSources } from '@/types/videoPlayer';

// Video IDs from Cloudflare Stream
const VIDEO_IDS = [
  '8d8f8b1aca7d0f8224683acc56a26c4f',
  '584bf0778a5f896ddbce993ab259ef79', 
  '337f864ee97f2e104e2c1c496d90a27a'
];

// Cloudflare Stream customer subdomain
const CLOUDFLARE_SUBDOMAIN = 'customer-cnlj15s4to2idzsi';

// Generate proper Cloudflare Stream URLs for each video
const generateVideoSources = (videoId: string): VideoSources => ({
  // Using HLS URLs as primary source (better quality control)
  high: `https://${CLOUDFLARE_SUBDOMAIN}.cloudflarestream.com/${videoId}/manifest/video.m3u8`,
  medium: `https://${CLOUDFLARE_SUBDOMAIN}.cloudflarestream.com/${videoId}/manifest/video.m3u8`,
  low: `https://${CLOUDFLARE_SUBDOMAIN}.cloudflarestream.com/${videoId}/manifest/video.m3u8`
});

// Generate MP4 fallback URLs
const generateMP4Sources = (videoId: string): VideoSources => ({
  high: `https://${CLOUDFLARE_SUBDOMAIN}.cloudflarestream.com/${videoId}/downloads/default.mp4`,
  medium: `https://${CLOUDFLARE_SUBDOMAIN}.cloudflarestream.com/${videoId}/downloads/default.mp4`,
  low: `https://${CLOUDFLARE_SUBDOMAIN}.cloudflarestream.com/${videoId}/downloads/default.mp4`
});

// Generate iframe URLs
const generateIframeUrl = (videoId: string): string => 
  `https://${CLOUDFLARE_SUBDOMAIN}.cloudflarestream.com/${videoId}/iframe`;

// Export video sources for all three videos
export const VIDEO_SOURCES_SEQUENCE = VIDEO_IDS.map(generateVideoSources);
export const MP4_SOURCES_SEQUENCE = VIDEO_IDS.map(generateMP4Sources);
export const IFRAME_URLS = VIDEO_IDS.map(generateIframeUrl);

// For backward compatibility
export const VIDEO_SOURCES = VIDEO_SOURCES_SEQUENCE[0];
