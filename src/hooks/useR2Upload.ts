
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
      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Authentication required", variant: "destructive" });
        return null;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadType', uploadType);

      const response = await fetch('/functions/v1/upload-to-r2', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      return {
        imageUrl: result.imageUrl,
        fileName: result.fileName
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
