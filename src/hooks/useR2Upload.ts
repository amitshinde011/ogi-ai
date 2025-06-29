
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { convertToWebP, needsWebPConversion } from '@/utils/imageConversion';

interface UploadResult {
  imageUrl: string;
  fileName: string;
}

export const useR2Upload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadToR2 = async (file: File, uploadType: 'meal' | 'community'): Promise<UploadResult | null> => {
    setUploading(true);
    
    try {
      let fileToUpload = file;
      
      // Convert to WebP if needed
      if (needsWebPConversion(file)) {
        console.log('Converting image to WebP format...');
        try {
          fileToUpload = await convertToWebP(file, 0.85); // 85% quality for good balance
          console.log('Image converted to WebP successfully');
        } catch (conversionError) {
          console.warn('WebP conversion failed, uploading original:', conversionError);
          // Continue with original file if conversion fails
        }
      }

      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('uploadType', uploadType);

      const { data, error } = await supabase.functions.invoke('upload-to-r2', {
        body: formData,
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      return {
        imageUrl: data.imageUrl,
        fileName: data.fileName
      };

    } catch (error) {
      console.error('Upload error:', error);
      toast({ 
        title: "Upload failed", 
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive" 
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadToR2,
    uploading
  };
};
