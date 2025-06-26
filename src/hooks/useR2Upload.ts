
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UploadResult {
  imageUrl: string;
  fileName: string;
}

export const useR2Upload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadToR2 = async (file: File, uploadType: 'meal' | 'community'): Promise<UploadResult | null> => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
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
