
import { VideoSources } from '@/types/videoPlayer';

// Video IDs from Cloudflare Stream
const VIDEO_IDS = [
  '1229a47db5c27ea07a0648ee96f16d02',
  '584bf0778a5f896ddbce993ab259ef79', 
  '337f864ee97f2e104e2c1c496d90a27a',
  '48b834a7cdab0565972f9886ad4e811e',
  'bd08fce7148e40231cb7456067ce60a8', 
  '8bc4e9c8fe29682da551cc800fec904b',
  '64055d2b28e3dac4ad8be6ec3abda478'
];

// Surya Namaskar instructional video ID
const SURYA_NAMASKAR_VIDEO_ID = '96cd81b48a779f3daf9a8db0a0e4c02b';

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

// Surya Namaskar video sources
export const SURYA_NAMASKAR_VIDEO_SOURCES = generateVideoSources(SURYA_NAMASKAR_VIDEO_ID);
export const SURYA_NAMASKAR_MP4_SOURCES = generateMP4Sources(SURYA_NAMASKAR_VIDEO_ID);
export const SURYA_NAMASKAR_IFRAME_URL = generateIframeUrl(SURYA_NAMASKAR_VIDEO_ID);

// For backward compatibility
export const VIDEO_SOURCES = VIDEO_SOURCES_SEQUENCE[0];
