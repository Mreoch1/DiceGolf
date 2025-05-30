/**
 * Game utilities - sound-related functions have been removed
 * as sounds are now handled directly by button clicks
 */

// Keep the import since other files might be using it through this file
import simpleSoundManager from './simpleSoundManager';

/**
 * Play a sound effect for a shot - DEPRECATED 
 * @param shotType The type of golf shot
 */
export const playShot = (shotType: 'drive' | 'approach' | 'chip' | 'putt'): void => {
  // Remove the console warning as it's still logging to console
  // Just make this a no-op function
};

/**
 * Play a sound effect for UI interaction - DEPRECATED
 */
export const playClick = (): void => {
  // Sound handling removed - now handled in UI components
  console.warn('playClick is deprecated - sounds are now triggered directly by UI interactions');
};

/**
 * Play a sound effect for ball going into the hole - DEPRECATED
 */
export const playHoleIn = (): void => {
  // Sound handling removed - now handled in UI components
  console.warn('playHoleIn is deprecated - sounds are now triggered directly by UI interactions');
};

/**
 * Play a sound effect for dice rolling - DEPRECATED
 */
export const playDiceRoll = (): void => {
  // Sound handling removed - now handled in UI components
  console.warn('playDiceRoll is deprecated - sounds are now triggered directly by UI interactions');
};

/**
 * Initialize sound system
 */
export const initSounds = (): void => {
  simpleSoundManager.initialize();
}; 