import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { audioCacheManager } from '@/utils/audioCacheManager';
import Loader from '@/components/ui/loader';

const MeditationAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shouldAutoPlayRef = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const loadAudio = async (shouldAutoPlay = false) => {
    if (audioUrl) return;
    
    setIsLoading(true);
    shouldAutoPlayRef.current = shouldAutoPlay;
    
    try {
      const cachedAudioUrl = await audioCacheManager.getCachedAudio();
      if (cachedAudioUrl) {
        console.log('Loading audio from IndexedDB cache');
        setAudioUrl(cachedAudioUrl);
        createAudioElement(cachedAudioUrl);
        setIsLoading(false);
        return;
      }

      console.log('Fetching audio from server');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`https://mxigbftmmkqnhmocyeeo.supabase.co/functions/v1/get-meditation-audio`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to access meditation audio');
        } else if (response.status === 403) {
          throw new Error('Active subscription required to access meditation audio');
        } else {
          throw new Error('Failed to load meditation audio');
        }
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      // Cache the audio blob for future use
      await audioCacheManager.setCachedAudio(audioBlob);

      createAudioElement(url);

    } catch (error) {
      console.error('Error loading meditation audio:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load meditation audio",
        variant: "destructive",
      });
      shouldAutoPlayRef.current = false;
    } finally {
      setIsLoading(false);
    }
  };

  const createAudioElement = (url: string) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('loadedmetadata', () => {});
        audioRef.current.removeEventListener('timeupdate', () => {});
        audioRef.current.removeEventListener('ended', () => {});
        audioRef.current.removeEventListener('error', () => {});
      }

      const audio = new Audio();
      audio.src = url;
      audio.preload = 'metadata';
      audioRef.current = audio;

      audio.addEventListener('loadedmetadata', async () => {
        setDuration(audio.duration);
        console.log('Audio metadata loaded, duration:', audio.duration);
        
        // Auto-play if requested
        if (shouldAutoPlayRef.current) {
          shouldAutoPlayRef.current = false;
          try {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              await playPromise;
              setIsPlaying(true);
            }
          } catch (error) {
            console.error('Error auto-playing audio:', error);
            toast({
              title: "Playback Error",
              description: "Failed to auto-play audio. Please try clicking play again.",
              variant: "destructive",
            });
          }
        }
      });

      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });

      audio.addEventListener('error', (e) => {
        console.error('Audio element error:', e);
        shouldAutoPlayRef.current = false;
        toast({
          title: "Audio Error",
          description: "Failed to load audio file",
          variant: "destructive",
        });
      });

      audio.volume = volume;
      
      // Load the audio metadata
      audio.load();
    } catch (error) {
      console.error('Error creating audio element:', error);
      shouldAutoPlayRef.current = false;
      toast({
        title: "Error",
        description: "Failed to create audio player",
        variant: "destructive",
      });
    }
  };

  const togglePlayPause = async () => {
    if (!audioRef.current) {
      await loadAudio(true); // Request auto-play when loading for the first time
      return;
    }

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      toast({
        title: "Playback Error",
        description: "Failed to play audio. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current && duration > 0) {
      const newTime = (value[0] / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Dhatu Meditation</h3>
      </div>

      <div className="mb-3">
        <Slider
          value={[duration ? (currentTime / duration) * 100 : 0]}
          onValueChange={handleSeek}
          className="w-full"
          disabled={!audioRef.current || duration === 0}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={togglePlayPause}
            disabled={isLoading}
            className="w-10 h-10 rounded-full"
          >
            {isLoading ? (
              <Loader size="sm" className="border-white border-t-transparent" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
        </div>

        <div className="flex items-center space-x-2 flex-1 max-w-24 ml-4">
          <Volume2 className="w-4 h-4 text-gray-600" />
          <Slider
            value={[volume * 100]}
            onValueChange={handleVolumeChange}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
};

export default MeditationAudioPlayer;
