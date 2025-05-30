/**
 * Simple Sound Manager for Dice Golf
 * 
 * A lightweight version that uses local sound files.
 */

// Sound types
export type SoundType = 'click' | 'swing' | 'putt' | 'hole-in' | 'dice-roll';

// Local sound files from public/sounds folder with correct extensions
const SOUND_URLS: Record<SoundType, string> = {
  'click': '/sounds/swing.wav', // Using swing.wav as fallback for click since click.mp3 is missing
  'swing': '/sounds/swing.wav',
  'putt': '/sounds/putt.wav',
  'hole-in': '/sounds/hole-in.ogg',
  'dice-roll': '/sounds/dice-roll.wav'
};

// Class to manage all game sounds
class SimpleSoundManager {
  private muted: boolean = false;
  private initialized: boolean = false;
  private volume: number = 0.5; // Default volume
  
  /**
   * Initialize the sound manager
   */
  public initialize(): void {
    if (this.initialized) return;
    
    console.log('Initializing sound system with local sounds');
    
    // Try to play a silent sound to "unlock" audio on iOS/Safari
    this.unlockAudio();
    
    // Try to load volume from localStorage
    try {
      const savedVolume = localStorage.getItem('diceGolfVolume');
      if (savedVolume !== null) {
        this.volume = parseFloat(savedVolume);
        console.log(`Loaded saved volume: ${this.volume}`);
      }
    } catch (e) {
      console.warn('Could not load volume from localStorage', e);
    }
    
    this.initialized = true;
  }
  
  /**
   * Unlock audio on iOS/Safari by playing a silent sound
   */
  private unlockAudio(): void {
    try {
      // Create and play a silent sound
      const silentSound = new Audio("data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV");
      silentSound.play().catch(() => {
        console.log("Silent sound play failed, but that's expected");
      });
    } catch (e) {
      console.warn("Failed to unlock audio", e);
    }
  }
  
  /**
   * Play a sound effect
   * @param type The sound type to play
   */
  public play(type: SoundType): void {
    if (!this.initialized) {
      this.initialize();
    }
    
    if (this.muted) return;
    
    // Add a stack trace to help identify where the sound is being triggered from
    console.log(`Attempting to play sound: ${type}`);
    console.trace(`Sound trace for: ${type}`);
    
    // Don't block sounds, just log where they're coming from
    
    try {
      // Create a new audio element for each play
      const sound = new Audio(SOUND_URLS[type]);
      sound.volume = this.volume; // Use current volume setting
      
      // Play with error handling
      const playPromise = sound.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log(`Playing sound: ${type}`);
        }).catch(error => {
          console.warn(`Error playing sound ${type}:`, error);
        });
      }
    } catch (error) {
      console.warn(`Failed to play sound: ${type}`, error);
    }
  }
  
  /**
   * Play appropriate sound for a shot type and lie - DISABLED
   * @param shotType The type of golf shot
   * @param lie The current lie (e.g., "GREEN")
   */
  public playShot(shotType: 'drive' | 'approach' | 'chip' | 'putt', lie?: string): void {
    // Log parameters for debugging
    console.log(`playShot called with: shotType=${shotType}, lie=${lie}`);
    console.trace('playShot stack trace');
    console.warn('playShot is DISABLED - sounds should be played directly from ShotControls');
    
    // DISABLED - No sounds will be played from this method anymore
    // Sounds should only come from direct button presses in ShotControls
  }
  
  /**
   * Play hole-in sound when the ball goes in the cup
   */
  public playHoleIn(): void {
    console.log('playHoleIn called');
    console.trace('playHoleIn stack trace');
    this.play('hole-in');
  }
  
  /**
   * Play dice roll sound
   */
  public playDiceRoll(): void {
    console.log('playDiceRoll called');
    console.trace('playDiceRoll stack trace');
    this.play('dice-roll');
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
   * Get the current mute state
   */
  public isMuted(): boolean {
    return this.muted;
  }
  
  /**
   * Set the volume for all sounds
   * @param volume Volume value between 0 and 1
   */
  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    
    // Save volume to localStorage
    try {
      localStorage.setItem('diceGolfVolume', this.volume.toString());
    } catch (e) {
      console.warn('Could not save volume to localStorage', e);
    }
  }
  
  /**
   * Get the current volume
   */
  public getVolume(): number {
    return this.volume;
  }
}

// Create a singleton instance
const simpleSoundManager = new SimpleSoundManager();

// Export the singleton
export default simpleSoundManager; 