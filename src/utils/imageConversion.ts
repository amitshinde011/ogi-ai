
/**
 * Convert an image file to WebP format
 * @param file - The original image file
 * @param quality - WebP quality (0-1, default 0.8)
 * @returns Promise<File> - The converted WebP file
 */
export const convertToWebP = async (file: File, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Draw image to canvas
      ctx?.drawImage(img, 0, 0);

      // Convert to WebP blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create new File object with WebP extension
            const originalName = file.name.replace(/\.[^/.]+$/, '');
            const webpFile = new File([blob], `${originalName}.webp`, {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(webpFile);
          } else {
            reject(new Error('Failed to convert image to WebP'));
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for conversion'));
    };

    // Load the image
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Convert an HTMLImageElement to WebP blob
 * @param img - The image element
 * @param quality - WebP quality (0-1, default 0.8)
 * @returns Promise<Blob> - The converted WebP blob
 */
export const convertImageElementToWebP = async (img: HTMLImageElement, quality: number = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions to match image
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Draw image to canvas
    ctx?.drawImage(img, 0, 0);

    // Convert to WebP blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert image to WebP'));
        }
      },
      'image/webp',
      quality
    );
  });
};

/**
 * Check if an image needs WebP conversion
 * @param file - The image file to check
 * @returns boolean - True if conversion is needed
 */
export const needsWebPConversion = (file: File): boolean => {
  return file.type !== 'image/webp';
};
