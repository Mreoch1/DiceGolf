/**
 * Sound effects utility for the game
 */

// Cache for preloaded audio elements
const audioCache: Record<string, HTMLAudioElement> = {};

/**
 * Play a sound effect
 * @param soundName - The name of the sound file (without extension)
 * @param volume - Optional volume (0-1)
 */
export const playSound = (soundName: string, volume: number = 1.0): void => {
  try {
    let audio = audioCache[soundName];
    
    if (!audio) {
      audio = new Audio(`/sounds/${soundName}.mp3`);
      audioCache[soundName] = audio;
    }
    
    // Reset audio if it's already playing
    audio.currentTime = 0;
    audio.volume = Math.min(1, Math.max(0, volume));
    
    // Play the sound
    audio.play().catch(error => {
      console.warn(`Failed to play sound ${soundName}:`, error);
    });
  } catch (error) {
    console.error(`Error playing sound ${soundName}:`, error);
  }
};

/**
 * Preload sound effects to avoid delay when first playing
 * @param soundNames - Array of sound names to preload
 */
export const preloadSounds = (soundNames: string[]): void => {
  soundNames.forEach(soundName => {
    if (!audioCache[soundName]) {
      const audio = new Audio(`/sounds/${soundName}.mp3`);
      audio.preload = 'auto';
      audioCache[soundName] = audio;
    }
  });
}; 