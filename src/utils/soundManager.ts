/**
 * Sound Manager for Dice Golf
 * 
 * This utility handles loading and playing sound effects throughout the game.
 * It supports preloading, volume control, and muting functionality.
 */

// Types for sound categories
export type SoundType = 
  | 'click'       // UI click
  | 'driver'      // Driver shot
  | 'iron'        // Iron/approach shot
  | 'chip'        // Chip shot
  | 'putt'        // Putt attempt
  | 'hole-in'     // Ball in the hole
  | 'water'       // Water hazard
  | 'dice-roll'   // Dice rolling
  | 'dice-land';  // Dice landing

// Configuration for all game sounds
const SOUNDS: Record<SoundType, string> = {
  'click': '/sounds/click.mp3',
  'driver': '/sounds/driver.mp3',
  'iron': '/sounds/iron.mp3',
  'chip': '/sounds/chip.mp3',
  'putt': '/sounds/putt.mp3',
  'hole-in': '/sounds/hole-in.mp3',
  'water': '/sounds/water.mp3',
  'dice-roll': '/sounds/dice-roll.mp3',
  'dice-land': '/sounds/dice-land.mp3'
};

// Class to manage all game sounds
class SoundManager {
  private sounds: Map<SoundType, HTMLAudioElement> = new Map();
  private muted: boolean = false;
  private volume: number = 0.7; // Default volume at 70%
  private initialized: boolean = false;
  
  /**
   * Initialize the sound manager by preloading all sounds
   */
  public initialize(): void {
    if (this.initialized) return;
    
    // Load all sound files
    Object.entries(SOUNDS).forEach(([type, path]) => {
      try {
        const audio = new Audio(path);
        audio.volume = this.volume;
        audio.preload = 'auto';
        
        // Cache the audio element
        this.sounds.set(type as SoundType, audio);
      } catch (error) {
        console.warn(`Failed to load sound: ${path}`, error);
      }
    });
    
    this.initialized = true;
    console.log('Sound system initialized');
  }
  
  /**
   * Play a specific sound
   * @param type The type of sound to play
   */
  public play(type: SoundType): void {
    if (!this.initialized) {
      this.initialize();
    }
    
    if (this.muted) return;
    
    const sound = this.sounds.get(type);
    if (!sound) {
      console.warn(`Sound not found: ${type}`);
      return;
    }
    
    // Reset the audio to the beginning if it's already playing
    sound.currentTime = 0;
    
    // Play the sound
    sound.play().catch(error => {
      // This often happens due to browser autoplay policies
      console.warn(`Error playing sound ${type}:`, error);
    });
  }
  
  /**
   * Play sound for a specific shot type
   * @param shotType The type of golf shot
   */
  public playShot(shotType: 'drive' | 'approach' | 'chip' | 'putt'): void {
    switch (shotType) {
      case 'drive':
        this.play('driver');
        break;
      case 'approach':
        this.play('iron');
        break;
      case 'chip':
        this.play('chip');
        break;
      case 'putt':
        this.play('putt');
        break;
    }
  }
  
  /**
   * Play sound for result (hole-in or water)
   * @param result The shot result to play sound for
   */
  public playResult(result: 'hole-in' | 'water'): void {
    this.play(result);
  }
  
  /**
   * Toggle mute state
   * @returns The new mute state
   */
  public toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }
  
  /**
   * Set the volume for all sounds
   * @param level Volume level between 0 and 1
   */
  public setVolume(level: number): void {
    // Ensure volume is between 0 and 1
    this.volume = Math.max(0, Math.min(1, level));
    
    // Update volume for all loaded sounds
    this.sounds.forEach(sound => {
      sound.volume = this.volume;
    });
  }
  
  /**
   * Get the current mute state
   */
  public isMuted(): boolean {
    return this.muted;
  }
  
  /**
   * Get the current volume level
   */
  public getVolume(): number {
    return this.volume;
  }
}

// Create a singleton instance
const soundManager = new SoundManager();

// Export the singleton
export default soundManager; 