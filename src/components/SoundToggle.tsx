import React, { useState, useEffect } from 'react';
import soundManager from '../utils/soundManager';

interface SoundToggleProps {
  className?: string;
}

const SoundToggle: React.FC<SoundToggleProps> = ({ className = '' }) => {
  const [muted, setMuted] = useState<boolean>(soundManager.isMuted());
  
  // Initialize sound system on component mount
  useEffect(() => {
    soundManager.initialize();
  }, []);
  
  const toggleSound = () => {
    // Play click sound if we're unmuting
    if (muted) {
      const newMuted = soundManager.toggleMute();
      soundManager.play('click');
      setMuted(newMuted);
    } else {
      // Toggle mute first, then play click if unmuted
      soundManager.play('click');
      const newMuted = soundManager.toggleMute();
      setMuted(newMuted);
    }
  };
  
  return (
    <button
      onClick={toggleSound}
      className={`btn btn-outline-light ${className}`}
      title={muted ? 'Unmute Sound' : 'Mute Sound'}
    >
      {muted ? (
        <span>🔇</span>
      ) : (
        <span>🔊</span>
      )}
    </button>
  );
};

export default SoundToggle; 