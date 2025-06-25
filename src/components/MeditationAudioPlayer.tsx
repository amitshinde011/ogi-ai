
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';

const MeditationAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const CACHE_KEY = 'dhatu-meditation-audio';
  const CACHE_TIMESTAMP_KEY = 'dhatu-meditation-audio-timestamp';

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const getCachedAudio = (): string | null => {
    try {
      const cachedAudio = localStorage.getItem(CACHE_KEY);
      const cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      
      if (cachedAudio && cacheTimestamp) {
        const today = new Date().toDateString();
        const cachedDate = new Date(parseInt(cacheTimestamp)).toDateString();
        
        // If cached today, return the cached audio
        if (today === cachedDate) {
          return cachedAudio;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error accessing cache:', error);
      return null;
    }
  };

  const setCachedAudio = (audioData: string) => {
    try {
      localStorage.setItem(CACHE_KEY, audioData);
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error caching audio:', error);
    }
  };

  const loadAudio = async () => {
    if (audioUrl) return; // Already loaded
    
    setIsLoading(true);
    try {
      // First, try to get from cache
      const cachedAudio = getCachedAudio();
      if (cachedAudio) {
        console.log('Loading audio from cache');
        setAudioUrl(cachedAudio);
        createAudioElement(cachedAudio);
        setIsLoading(false);
        return;
      }

      // If not cached, fetch from server
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
        throw new Error('Failed to load meditation audio');
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      // Cache the audio for future use
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        setCachedAudio(base64data);
      };
      reader.readAsDataURL(audioBlob);

      createAudioElement(url);

    } catch (error) {
      console.error('Error loading meditation audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createAudioElement = (url: string) => {
    // Create audio element
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    audio.volume = volume;
  };

  const togglePlayPause = async () => {
    if (!audioRef.current) {
      await loadAudio();
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
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

      {/* Progress Bar */}
      <div className="mb-3">
        <Slider
          value={[duration ? (currentTime / duration) * 100 : 0]}
          onValueChange={handleSeek}
          className="w-full"
          disabled={!audioRef.current}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={togglePlayPause}
            disabled={isLoading}
            className="w-10 h-10 rounded-full"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
