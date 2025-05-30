import { useReducer } from 'react';
import { 
  GameState, 
  GameAction, 
  HoleState,
  Course, 
  GolferCard 
} from '../types';
import { 
  takeShot, 
  isHoleComplete, 
  completeHole, 
  nextHole, 
  updateWind, 
  selectGolfer 
} from '../utils/gameEngine';
// No import needed for sound playing

// Function to play hole-in sound
const playHoleInSound = () => {
  try {
    console.log(`HOLE-IN (${new Date().toISOString()}): Playing hole-in sound directly`);
    const holeInSound = new Audio('/sounds/hole-in.ogg');
    holeInSound.volume = 0.5;
    holeInSound.play().then(() => {
      console.log('Started playing hole-in sound');
    }).catch(error => {
      console.error('Error playing hole-in sound:', error);
    });
  } catch (error) {
    console.error('Failed to create hole-in audio:', error);
  }
};

// Initialize game state
const initializeGameState = (course: Course, golferCards: GolferCard[]): GameState => {
  // Create initial hole states
  const holes: HoleState[] = course.holes.map(hole => ({
    hole,
    shots: [],
    score: 0,
    completed: false,
    penalties: 0
  }));

  // Initial wind state
  const wind = {
    direction: 'none' as const,
    strength: 0 as const
  };

  return {
    course,
    golferCards,
    currentHoleIndex: 0,
    holes,
    currentWind: wind,
    totalScore: 0,
    gameCompleted: false
  };
};

// Game reducer
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'START_GAME':
      return initializeGameState(action.payload.course, action.payload.golferCards);
      
    case 'SELECT_GOLFER':
      return selectGolfer(state, action.payload.golferId);
      
    case 'TAKE_SHOT': {
      // Get current lie before the shot
      const currentHoleState = state.holes[state.currentHoleIndex];
      const currentLie = currentHoleState.shots.length > 0
        ? currentHoleState.shots[currentHoleState.shots.length - 1].lie
        : 'TEE';
      
      // Debug log for the lie
      console.log(`TAKE_SHOT (${new Date().toISOString()}): Current lie before shot: ${currentLie}, Shot type: ${action.payload.shotType}`);
      
      // Take the shot
      const { newGameState, shot } = takeShot(
        state, 
        action.payload.shotType, 
        action.payload.diceRoll
      );
      
      // Debug log for the new shot
      console.log(`TAKE_SHOT RESULT (${new Date().toISOString()}): New lie: ${shot.lie}, distance: ${shot.distanceRemaining}`);
      
      // Play hole-in sound when the ball goes in the hole (with a successful putt)
      if (action.payload.shotType === 'putt' && shot.distanceRemaining === 0) {
        // Small delay to let the putt sound finish
        setTimeout(() => {
          console.log(`HOLE-IN TRIGGER (${new Date().toISOString()}): Playing hole-in sound after successful putt`);
          playHoleInSound();
        }, 500);
      }
      
      // Check if the hole is complete after this shot
      if (isHoleComplete(newGameState)) {
        return completeHole(newGameState);
      }
      
      return newGameState;
    }
      
    case 'COMPLETE_HOLE':
      // Play hole-in sound when completing a hole
      console.log(`COMPLETE_HOLE (${new Date().toISOString()}): Playing hole-in sound on completing hole`);
      playHoleInSound();
      return completeHole(state);
      
    case 'NEXT_HOLE': {
      // First update the wind if needed
      const stateWithUpdatedWind = updateWind(state);
      // Then move to the next hole
      return nextHole(stateWithUpdatedWind);
    }
      
    case 'UPDATE_WIND':
      return updateWind(state);
      
    case 'COMPLETE_GAME':
      return {
        ...state,
        gameCompleted: true
      };
      
    default:
      return state;
  }
};

// Custom hook for game state management
export const useGameReducer = (initialCourse: Course, initialGolferCards: GolferCard[]) => {
  const initialState = initializeGameState(initialCourse, initialGolferCards);
  return useReducer(gameReducer, initialState);
}; 