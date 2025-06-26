
/**
 * Utility functions for handling Cloudflare Images
 */

// Replace this with your actual Cloudflare account hash
const CLOUDFLARE_ACCOUNT_HASH = 'A_9Wtx2a2fSW25WEMOQdcw';

/**
 * Generates a Cloudflare Images URL from an image ID
 * @param cloudflareImageId - The Cloudflare image ID (preferred)
 * @param fallbackImageUrl - The fallback image URL (legacy image_url field)
 * @param variant - The image variant (default: 'public')
 * @returns The full Cloudflare Images URL or fallback URL
 */
export const getCloudflareImageUrl = (
  cloudflareImageId?: string | null,
  fallbackImageUrl?: string | null,
  variant: string = 'public'
): string => {
  // Fallback image for when no image is provided
  const defaultFallbackUrl = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600';
  
  // Priority 1: Use Cloudflare image ID if available
  if (cloudflareImageId) {
    return `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_HASH}/${cloudflareImageId}/${variant}`;
  }
  
  // Priority 2: Use fallback image URL if it's a full URL
  if (fallbackImageUrl && fallbackImageUrl.startsWith('http')) {
    return fallbackImageUrl;
  }
  
  // Priority 3: Try to construct Cloudflare URL from fallback if it looks like an ID
  if (fallbackImageUrl && !fallbackImageUrl.includes('/') && !fallbackImageUrl.includes('.')) {
    return `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_HASH}/${fallbackImageUrl}/${variant}`;
  }
  
  // Priority 4: Use default fallback
  return defaultFallbackUrl;
};

/**
 * Generates a Cloudflare Images URL with specific dimensions
 * @param cloudflareImageId - The Cloudflare image ID
 * @param fallbackImageUrl - The fallback image URL
 * @param width - Desired width
 * @param height - Desired height
 * @returns The full Cloudflare Images URL with custom dimensions
 */
export const getCloudflareImageUrlWithDimensions = (
  cloudflareImageId?: string | null,
  fallbackImageUrl?: string | null,
  width: number,
  height: number
): string => {
  if (cloudflareImageId) {
    // For custom dimensions, you would need to create variants in Cloudflare
    // This is a placeholder for the pattern
    return `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_HASH}/${cloudflareImageId}/w=${width},h=${height}`;
  }
  
  // Fall back to the regular function
  return getCloudflareImageUrl(cloudflareImageId, fallbackImageUrl);
};
