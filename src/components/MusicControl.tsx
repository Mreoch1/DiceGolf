import React from 'react';
import { useMusicPlayer } from '../utils/MusicContext';
import './MusicControl.css';

interface MusicControlProps {
  className?: string;
}

const MusicControl: React.FC<MusicControlProps> = ({ className = '' }) => {
  const { isPlaying, isMuted, volume, togglePlay, toggleMute, setVolume } = useMusicPlayer();

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  return (
    <div className={`music-control d-flex align-items-center ${isPlaying ? 'is-playing' : ''} ${isMuted ? 'is-muted' : ''} ${className}`}>
      <button 
        onClick={togglePlay} 
        className="btn btn-sm btn-outline-secondary me-2"
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
        title={isPlaying ? 'Pause music' : 'Play music'}
      >
        <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
      </button>
      
      <button 
        onClick={toggleMute} 
        className="btn btn-sm btn-outline-secondary me-2"
        aria-label={isMuted ? 'Unmute music' : 'Mute music'}
        title={isMuted ? 'Unmute music' : 'Mute music'}
      >
        <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'}`}></i>
      </button>
      
      <div className="d-flex align-items-center music-volume-control">
        <label htmlFor="musicVolumeSlider" className="form-label mb-0 me-2 small text-white">
          Music
        </label>
        <input
          id="musicVolumeSlider"
          type="range"
          className="form-range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={handleVolumeChange}
          style={{ width: '80px' }}
        />
      </div>
    </div>
  );
};

export default MusicControl; 