
/**
 * Utility functions for handling Cloudflare Images
 */

// Replace this with your actual Cloudflare account hash
const CLOUDFLARE_ACCOUNT_HASH = 'your-account-hash';

/**
 * Generates a Cloudflare Images URL from an image ID
 * @param imageId - The image ID or existing URL
 * @param variant - The image variant (default: 'public')
 * @returns The full Cloudflare Images URL or fallback URL
 */
export const getCloudflareImageUrl = (
  imageId: string | null | undefined,
  variant: string = 'public'
): string => {
  // Fallback image for when no image is provided
  const fallbackUrl = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600';
  
  if (!imageId) {
    return fallbackUrl;
  }
  
  // If it's already a full URL, return as is
  if (imageId.startsWith('http')) {
    return imageId;
  }
  
  // Construct Cloudflare Images URL
  return `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_HASH}/${imageId}/${variant}`;
};

/**
 * Generates a Cloudflare Images URL with specific dimensions
 * @param imageId - The image ID or existing URL
 * @param width - Desired width
 * @param height - Desired height
 * @returns The full Cloudflare Images URL with custom dimensions
 */
export const getCloudflareImageUrlWithDimensions = (
  imageId: string | null | undefined,
  width: number,
  height: number
): string => {
  if (!imageId || imageId.startsWith('http')) {
    return getCloudflareImageUrl(imageId);
  }
  
  // For custom dimensions, you would need to create variants in Cloudflare
  // This is a placeholder for the pattern
  return `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_HASH}/${imageId}/w=${width},h=${height}`;
};
