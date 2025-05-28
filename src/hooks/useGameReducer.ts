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

// Initialize game state
const initializeGameState = (course: Course, golferCards: GolferCard[]): GameState => {
  // Create initial hole states
  const holes: HoleState[] = course.holes.map(hole => ({
    hole,
    shots: [],
    score: 0,
    completed: false
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
      const { newGameState } = takeShot(
        state, 
        action.payload.shotType, 
        action.payload.diceRoll
      );
      
      // Check if the hole is complete after this shot
      if (isHoleComplete(newGameState)) {
        return completeHole(newGameState);
      }
      
      return newGameState;
    }
      
    case 'COMPLETE_HOLE':
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