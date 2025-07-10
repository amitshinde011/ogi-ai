import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VideoSources } from '@/types/videoPlayer';

export const useSignedVideoUrls = (videoIndex: number) => {
  const [videoSources, setVideoSources] = useState<VideoSources | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSignedUrls = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching signed URLs for video index:', videoIndex);
        
        const { data, error: funcError } = await supabase.functions.invoke('generate-signed-video-urls', {
          body: { videoIndex }
        });

        if (funcError) {
          throw new Error(`Failed to fetch signed URLs: ${funcError.message}`);
        }

        if (!data) {
          throw new Error('No data returned from signed URL function');
        }

        console.log('Received signed URLs:', data);
        setVideoSources(data);
      } catch (err) {
        console.error('Error fetching signed URLs:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchSignedUrls();
  }, [videoIndex]);

  return { videoSources, loading, error };
};