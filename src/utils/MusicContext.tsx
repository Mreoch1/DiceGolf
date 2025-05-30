import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

// Local storage keys
const MUSIC_VOLUME_KEY = 'dice-golf-music-volume';
const MUSIC_MUTED_KEY = 'dice-golf-music-muted';

interface MusicContextType {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  togglePlay: () => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
}

const defaultContext: MusicContextType = {
  isPlaying: false,
  isMuted: false,
  volume: 0.3,
  togglePlay: () => {},
  toggleMute: () => {},
  setVolume: () => {},
};

const MusicContext = createContext<MusicContextType>(defaultContext);

export const useMusicPlayer = () => useContext(MusicContext);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved preferences
  const loadSavedVolume = (): number => {
    try {
      const savedVolume = localStorage.getItem(MUSIC_VOLUME_KEY);
      return savedVolume ? parseFloat(savedVolume) : 0.3;
    } catch (error) {
      console.error('Error loading saved volume:', error);
      return 0.3;
    }
  };
  
  const loadSavedMuted = (): boolean => {
    try {
      const savedMuted = localStorage.getItem(MUSIC_MUTED_KEY);
      return savedMuted ? savedMuted === 'true' : false;
    } catch (error) {
      console.error('Error loading saved muted state:', error);
      return false;
    }
  };

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(loadSavedMuted());
  const [volume, setVolume] = useState<number>(loadSavedVolume());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize the audio element
  useEffect(() => {
    const audio = new Audio('/sounds/Course-leaderboard music.wav');
    audio.loop = true;
    audio.volume = isMuted ? 0 : volume;
    audio.preload = 'auto';
    audioRef.current = audio;

    // Don't autoplay - wait for user interaction
    setIsPlaying(false);

    // Clean up when provider unmounts
    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  // Save volume preference
  useEffect(() => {
    try {
      localStorage.setItem(MUSIC_VOLUME_KEY, volume.toString());
    } catch (error) {
      console.error('Error saving volume preference:', error);
    }
  }, [volume]);

  // Save muted preference
  useEffect(() => {
    try {
      localStorage.setItem(MUSIC_MUTED_KEY, isMuted.toString());
    } catch (error) {
      console.error('Error saving muted preference:', error);
    }
  }, [isMuted]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Control playback based on isPlaying state
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Failed to play music:', error);
            setIsPlaying(false);
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleSetVolume = (newVolume: number) => {
    setVolume(newVolume);
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
  };

  const value = {
    isPlaying,
    isMuted,
    volume,
    togglePlay,
    toggleMute,
    setVolume: handleSetVolume,
  };

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
};

export default MusicContext; 