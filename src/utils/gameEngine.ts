import { v4 as uuidv4 } from 'uuid';
import { 
  GameState, 
  Shot, 
  ShotType, 
  TerrainType, 
  ShotResult,
  WindDirection,
  WindStrength,
  Wind,
  GolferCard
} from '../types';

// Constants for game mechanics
const DICE_MIN = 1;
const DICE_MAX = 6;

// Dice rolling utility
export const rollDice = (numDice: number = 2): number => {
  let total = 0;
  for (let i = 0; i < numDice; i++) {
    total += Math.floor(Math.random() * (DICE_MAX - DICE_MIN + 1)) + DICE_MIN;
  }
  return total;
};

// Apply special ability effects based on hole, lie, and shot type
export const applySpecialAbilities = (
  gameState: GameState,
  shotType: ShotType,
  currentLie: TerrainType,
  baseModifiers: { statMod: number; surfaceMod: number; windMod: number }
): { statMod: number; surfaceMod: number; windMod: number; abilityActivated?: string } => {
  const currentHoleState = gameState.holes[gameState.currentHoleIndex];
  const selectedGolfer = currentHoleState.selectedGolfer;
  const currentHole = currentHoleState.hole;
  
  // If no golfer selected or no special ability, return base modifiers unchanged
  if (!selectedGolfer || !selectedGolfer.specialAbility) {
    return { ...baseModifiers };
  }
  
  const ability = selectedGolfer.specialAbility;
  let modifiers = { ...baseModifiers };
  let abilityActivated: string | undefined = undefined;
  
  // Apply ability based on its type
  switch (ability.type) {
    // Par-specific abilities
    case 'par3':
      if (currentHole.par === 3) {
        // Apply to all stats for abilities like Bobby Jones' "Grand Slam"
        modifiers.statMod += ability.effectValue;
        abilityActivated = ability.name;
      }
      break;
      
    case 'par4':
      if (currentHole.par === 4) {
        // Apply to all stats for abilities like Byron Nelson's "Perfect Season"
        modifiers.statMod += ability.effectValue;
        abilityActivated = ability.name;
      }
      // Special case for Tiger Woods' "Sunday Red" - every 4th hole
      if (ability.name === 'Sunday Red' && (gameState.currentHoleIndex + 1) % 4 === 0) {
        modifiers.statMod += ability.effectValue;
        abilityActivated = ability.name;
      }
      // Special case for Sam Snead's "Longevity" - holes 13-18
      if (ability.name === 'Longevity' && currentHole.number >= 13 && currentHole.number <= 18) {
        modifiers.statMod += ability.effectValue;
        abilityActivated = ability.name;
      }
      // Special case for Jack Nicklaus' "Major Champion" - final hole
      if (ability.name === 'Major Champion' && gameState.currentHoleIndex === gameState.course.holes.length - 1) {
        modifiers.statMod += ability.effectValue;
        abilityActivated = ability.name;
      }
      break;
      
    case 'par5':
      if (currentHole.par === 5) {
        // Apply only to drives for Arnold Palmer's "Army Leader"
        if (shotType === 'drive') {
          modifiers.statMod += ability.effectValue;
          abilityActivated = ability.name;
        }
      }
      break;
    
    // Lie-specific abilities  
    case 'fairway':
      if (currentLie === 'fairway') {
        // Apply to accuracy for Ben Hogan's "Perfect Swing"
        if (ability.name === 'Perfect Swing' && shotType === 'approach') {
          modifiers.statMod += ability.effectValue;
          abilityActivated = ability.name;
        }
        // Apply to all shots for Ernie Els' "Smooth Swing"
        else if (ability.name === 'Smooth Swing') {
          modifiers.statMod += ability.effectValue;
          abilityActivated = ability.name;
        }
        // Apply to approach shots for Sergio Garcia's "Iron Accuracy"
        else if (ability.name === 'Iron Accuracy' && shotType === 'approach') {
          modifiers.statMod += ability.effectValue;
          abilityActivated = ability.name;
        }
      }
      break;
      
    case 'rough':
      if (currentLie === 'rough') {
        // For Tom Watson's "Links Master"
        if (ability.name === 'Links Master' && shotType === 'chip') {
          modifiers.statMod += ability.effectValue;
          abilityActivated = ability.name;
        }
        // For Seve's "Escape Artist"
        else if (ability.name === 'Escape Artist') {
          modifiers.statMod += ability.effectValue;
          abilityActivated = ability.name;
        }
      }
      break;
      
    case 'bunker':
      if (currentLie === 'bunker') {
        // For Phil's "Flop Shot Master"
        if (ability.name === 'Flop Shot Master' && shotType === 'chip') {
          modifiers.statMod += ability.effectValue;
          abilityActivated = ability.name;
        }
        // For Seve's "Escape Artist"
        else if (ability.name === 'Escape Artist') {
          modifiers.statMod += ability.effectValue;
          abilityActivated = ability.name;
        }
      }
      break;
      
    case 'green':
      if (currentLie === 'green') {
        // For Jordan Spieth's "Clutch Putter" - 20% chance to make any putt
        if (ability.name === 'Clutch Putter' && shotType === 'putt' && Math.random() < 0.2) {
          modifiers.statMod += 5; // Large bonus to virtually guarantee a made putt
          abilityActivated = ability.name;
        }
      }
      break;
      
    case 'water':
      if (currentLie === 'water') {
        // For Seve's "Escape Artist"
        if (ability.name === 'Escape Artist') {
          modifiers.statMod += ability.effectValue;
          abilityActivated = ability.name;
        }
      }
      break;
      
    // Wind-specific abilities  
    case 'wind':
      const wind = gameState.currentWind;
      if (wind.direction !== 'none' && wind.strength > 0) {
        // For Gary Player's "Global Champion" - ignore all wind
        if (ability.name === 'Global Champion') {
          modifiers.windMod = 0;
          abilityActivated = ability.name;
        }
        // For Lee Trevino's "Fade Master" - turn crosswind into advantage
        else if (ability.name === 'Fade Master' && wind.direction === 'crosswind') {
          modifiers.windMod = ability.effectValue; // Positive instead of negative
          abilityActivated = ability.name;
        }
        // For Dustin Johnson's "Athletic Power" - ignore negative wind on drives
        else if (ability.name === 'Athletic Power' && shotType === 'drive') {
          modifiers.windMod = modifiers.windMod < 0 ? 0 : modifiers.windMod;
          modifiers.statMod += ability.effectValue;
          abilityActivated = ability.name;
        }
      }
      break;
  }
  
  // Special cases that don't fit above categories
  
  // For Bryson's "Science of Power" - add to drives, subtract from putting
  if (selectedGolfer.specialAbility.name === 'Science of Power') {
    if (shotType === 'drive') {
      modifiers.statMod += ability.effectValue;
      abilityActivated = ability.name;
    } else if (shotType === 'putt') {
      modifiers.statMod -= ability.effectValue;
      abilityActivated = ability.name;
    }
  }
  
  // For Walter Hagen's "Psychology Master" - bonus after poor/terrible shot
  if (selectedGolfer.specialAbility.name === 'Psychology Master' && currentHoleState.shots.length > 0) {
    const lastShot = currentHoleState.shots[currentHoleState.shots.length - 1];
    if (lastShot.result === 'poor' || lastShot.result === 'terrible') {
      modifiers.statMod += ability.effectValue;
      abilityActivated = ability.name;
    }
  }
  
  // For Rory's "Power Drive" - bonus on first tee shot
  if (selectedGolfer.specialAbility.name === 'Power Drive' && 
      shotType === 'drive' && 
      currentLie === 'tee' && 
      currentHoleState.shots.length === 0) {
    modifiers.statMod += ability.effectValue;
    abilityActivated = ability.name;
  }
  
  return { ...modifiers, abilityActivated };
};

// Calculate modifiers for a shot
export const calculateModifiers = (
  gameState: GameState,
  shotType: ShotType,
  currentLie: TerrainType
): { statMod: number; surfaceMod: number; windMod: number } => {
  const currentHoleState = gameState.holes[gameState.currentHoleIndex];
  const selectedGolfer = currentHoleState.selectedGolfer;
  
  if (!selectedGolfer) {
    return { statMod: 0, surfaceMod: 0, windMod: 0 };
  }

  // Calculate the stat modifier based on shot type
  let statMod = 0;
  switch (shotType) {
    case 'drive':
      statMod = selectedGolfer.stats.drive;
      break;
    case 'approach':
      statMod = selectedGolfer.stats.accuracy;
      break;
    case 'chip':
      statMod = selectedGolfer.stats.shortGame;
      break;
    case 'putt':
      statMod = selectedGolfer.stats.putting;
      break;
  }

  // Calculate surface modifier based on lie
  let surfaceMod = 0;
  switch (currentLie) {
    case 'tee':
      surfaceMod = 2;
      break;
    case 'fairway':
      surfaceMod = 1;
      break;
    case 'rough':
      surfaceMod = -1;
      break;
    case 'bunker':
      surfaceMod = -2;
      break;
    case 'green':
      surfaceMod = 0;
      break;
    case 'water':
      surfaceMod = -3;
      break;
  }

  // Calculate wind modifier
  let windMod = 0;
  const wind = gameState.currentWind;
  
  // Only apply wind to certain shot types
  if (shotType === 'drive' || shotType === 'approach') {
    windMod = calculateWindEffect(wind, shotType);
  }

  // Get base modifiers
  const baseModifiers = { statMod, surfaceMod, windMod };
  
  // Apply special abilities
  return applySpecialAbilities(gameState, shotType, currentLie, baseModifiers);
};

// Calculate wind effect
export const calculateWindEffect = (wind: Wind, shotType: ShotType): number => {
  if (wind.direction === 'none' || wind.strength === 0) {
    return 0;
  }

  // Tailwind helps distance
  if (wind.direction === 'tailwind' && shotType === 'drive') {
    return wind.strength;
  }
  
  // Headwind hurts distance
  if (wind.direction === 'headwind' && shotType === 'drive') {
    return -wind.strength;
  }
  
  // Crosswind hurts accuracy
  if (wind.direction === 'crosswind' && (shotType === 'drive' || shotType === 'approach')) {
    return -wind.strength;
  }
  
  return 0;
};

// Determine shot result based on total score
export const determineResult = (totalScore: number): ShotResult => {
  if (totalScore >= 12) return 'excellent';
  if (totalScore >= 9) return 'good';
  if (totalScore >= 6) return 'average';
  if (totalScore >= 3) return 'poor';
  return 'terrible';
};

// Generate result text based on shot type and result
export const generateResultText = (
  shotType: ShotType, 
  result: ShotResult, 
  currentLie: TerrainType,
  distanceRemaining?: number
): { text: string; newLie: TerrainType; distanceRemaining?: number } => {
  let text = '';
  let newLie: TerrainType = 'fairway';
  let newDistanceRemaining = distanceRemaining;
  
  // Drive results
  if (shotType === 'drive') {
    switch (result) {
      case 'excellent':
        text = 'Booming drive straight down the fairway!';
        newLie = 'fairway';
        newDistanceRemaining = distanceRemaining ? Math.floor(distanceRemaining * 0.3) : 150;
        break;
      case 'good':
        text = 'Solid drive, slightly off center but in the fairway.';
        newLie = 'fairway';
        newDistanceRemaining = distanceRemaining ? Math.floor(distanceRemaining * 0.4) : 180;
        break;
      case 'average':
        text = 'Average drive, ended up in the rough.';
        newLie = 'rough';
        newDistanceRemaining = distanceRemaining ? Math.floor(distanceRemaining * 0.5) : 210;
        break;
      case 'poor':
        text = 'Sliced the drive into the deep rough.';
        newLie = 'rough';
        newDistanceRemaining = distanceRemaining ? Math.floor(distanceRemaining * 0.6) : 240;
        break;
      case 'terrible':
        text = 'Drive ended up in a bunker. Tough lie ahead.';
        newLie = 'bunker';
        newDistanceRemaining = distanceRemaining ? Math.floor(distanceRemaining * 0.7) : 260;
        break;
    }
  }
  // Approach results
  else if (shotType === 'approach') {
    switch (result) {
      case 'excellent':
        text = 'Perfect approach! Ball landed on the green near the pin.';
        newLie = 'green';
        newDistanceRemaining = 10;
        break;
      case 'good':
        text = 'Good approach, on the green but with a long putt ahead.';
        newLie = 'green';
        newDistanceRemaining = 25;
        break;
      case 'average':
        text = 'Approach landed just off the green.';
        newLie = 'fairway';
        newDistanceRemaining = 30;
        break;
      case 'poor':
        text = 'Approach missed the green and landed in the rough.';
        newLie = 'rough';
        newDistanceRemaining = 40;
        break;
      case 'terrible':
        text = 'Approach shot landed in a bunker near the green.';
        newLie = 'bunker';
        newDistanceRemaining = 35;
        break;
    }
  }
  // Chip results
  else if (shotType === 'chip') {
    switch (result) {
      case 'excellent':
        text = 'Excellent chip, very close to the hole!';
        newLie = 'green';
        newDistanceRemaining = 2;
        break;
      case 'good':
        text = 'Nice chip, on the green with a short putt ahead.';
        newLie = 'green';
        newDistanceRemaining = 6;
        break;
      case 'average':
        text = 'Decent chip, on the green but with some work left.';
        newLie = 'green';
        newDistanceRemaining = 12;
        break;
      case 'poor':
        text = 'Chunky chip, still on the fringe.';
        newLie = 'fairway';
        newDistanceRemaining = 15;
        break;
      case 'terrible':
        text = 'Duffed the chip, barely moved forward.';
        newLie = currentLie; // Stays on the same lie
        newDistanceRemaining = distanceRemaining ? Math.floor(distanceRemaining * 0.8) : 20;
        break;
    }
  }
  // Putt results
  else if (shotType === 'putt') {
    // For tap-ins (1 yard putts), they should almost always go in
    if (distanceRemaining === 1) {
      // Even with poor or terrible results, a tap-in should have a high chance of success
      if (result === 'excellent' || result === 'good' || result === 'average') {
        text = 'The tap-in putt drops into the cup!';
        newLie = 'green';
        newDistanceRemaining = 0;
      } else {
        // Only poor or terrible results might miss a tap-in
        text = 'Somehow missed the tap-in! The ball lips out.';
        newLie = 'green';
        newDistanceRemaining = 1;
      }
    } else {
      // Regular putting logic for longer putts
      switch (result) {
        case 'excellent':
          text = 'Perfect putt! Ball drops in the center of the cup!';
          newLie = 'green'; // Hole complete
          newDistanceRemaining = 0;
          break;
        case 'good':
          text = 'Good putt, just a tap-in remaining.';
          newLie = 'green';
          newDistanceRemaining = 1;
          break;
        case 'average':
          // Check if we're already at 3 yards to avoid infinite loop
          if (distanceRemaining === 3) {
            text = 'The ball rolls closer to the hole.';
            newLie = 'green';
            newDistanceRemaining = 2; // Reduce to 2 yards instead of staying at 3
          } else {
            text = 'Decent putt, left a short one.';
            newLie = 'green';
            newDistanceRemaining = 3;
          }
          break;
        case 'poor':
          text = 'Misread the break, left with a challenging putt.';
          newLie = 'green';
          newDistanceRemaining = 6;
          break;
        case 'terrible':
          text = 'Three-putted! Frustrating result on the green.';
          newLie = 'green';
          newDistanceRemaining = 4;
          break;
      }
    }
  }

  return { text, newLie, distanceRemaining: newDistanceRemaining };
};

// Take a shot
export const takeShot = (
  gameState: GameState,
  shotType: ShotType,
  diceRoll?: [number, number]
): { newGameState: GameState; shot: Shot } => {
  const currentHoleState = gameState.holes[gameState.currentHoleIndex];
  const currentHole = currentHoleState.hole;
  
  // Determine current lie based on previous shots
  let currentLie: TerrainType = 'tee';
  let distanceRemaining = currentHole.length;
  
  if (currentHoleState.shots.length > 0) {
    const lastShot = currentHoleState.shots[currentHoleState.shots.length - 1];
    currentLie = lastShot.lie;
    distanceRemaining = lastShot.distanceRemaining || 0;
  }
  
  // Calculate modifiers and check for special ability activation
  const modifiersWithAbility = calculateModifiers(gameState, shotType, currentLie);
  const { statMod, surfaceMod, windMod } = modifiersWithAbility;
  const specialAbilityActivated = (modifiersWithAbility as any).abilityActivated;
  
  // Use provided dice roll or roll new dice
  const diceTotal = diceRoll ? diceRoll[0] + diceRoll[1] : rollDice(2);
  
  // Calculate total score for this shot
  const totalScore = diceTotal + statMod + surfaceMod + windMod;
  
  // Determine result
  const result = determineResult(totalScore);
  
  // Generate result text and new lie
  const { text, newLie, distanceRemaining: newDistanceRemaining } = 
    generateResultText(shotType, result, currentLie, distanceRemaining);
  
  // Create shot object
  const shot: Shot = {
    id: uuidv4(),
    type: shotType,
    diceRoll: diceTotal,
    statModifier: statMod,
    surfaceModifier: surfaceMod,
    windModifier: windMod,
    totalScore,
    result,
    resultText: text,
    lie: newLie,
    distanceRemaining: newDistanceRemaining,
    specialAbilityActivated  // Include the special ability name if one was activated
  };
  
  // Update game state
  const updatedHoleState = {
    ...currentHoleState,
    shots: [...currentHoleState.shots, shot]
  };
  
  const updatedHoles = [...gameState.holes];
  updatedHoles[gameState.currentHoleIndex] = updatedHoleState;
  
  const newGameState: GameState = {
    ...gameState,
    holes: updatedHoles
  };
  
  return { newGameState, shot };
};

// Check if hole is complete
export const isHoleComplete = (gameState: GameState): boolean => {
  const currentHoleState = gameState.holes[gameState.currentHoleIndex];
  
  if (currentHoleState.shots.length === 0) {
    return false;
  }
  
  const lastShot = currentHoleState.shots[currentHoleState.shots.length - 1];
  
  // Count consecutive putts
  let consecutivePutts = 0;
  for (let i = currentHoleState.shots.length - 1; i >= 0; i--) {
    if (currentHoleState.shots[i].type === 'putt') {
      consecutivePutts++;
    } else {
      break;
    }
  }
  
  // First and most important check: if the ball is in the hole (distance remaining is 0)
  if (lastShot.distanceRemaining === 0) {
    return true;
  }
  
  // Secondary checks for other completion conditions:
  // - Maximum shots reached
  // - Too many consecutive putts
  return (
    (currentHoleState.shots.length >= currentHoleState.hole.par + 3) || // Maximum double bogey
    (consecutivePutts >= 8) // Maximum 8 consecutive putts
  );
};

// Complete a hole and calculate score
export const completeHole = (gameState: GameState): GameState => {
  const currentHoleState = gameState.holes[gameState.currentHoleIndex];
  const par = currentHoleState.hole.par;
  const score = currentHoleState.shots.length;
  
  // Update hole state
  const updatedHoleState = {
    ...currentHoleState,
    score,
    completed: true
  };
  
  // Update game state
  const updatedHoles = [...gameState.holes];
  updatedHoles[gameState.currentHoleIndex] = updatedHoleState;
  
  // Calculate new total score
  const totalScore = gameState.totalScore + (score - par);
  
  return {
    ...gameState,
    holes: updatedHoles,
    totalScore
  };
};

// Update wind (changes every 3 holes)
export const updateWind = (gameState: GameState): GameState => {
  // Only update wind every 3 holes
  if (gameState.currentHoleIndex % 3 !== 0) {
    return gameState;
  }
  
  // Generate new wind
  const directions: WindDirection[] = ['tailwind', 'headwind', 'crosswind', 'none'];
  const strengths: WindStrength[] = [0, 1, 2];
  
  const newWind: Wind = {
    direction: directions[Math.floor(Math.random() * directions.length)],
    strength: strengths[Math.floor(Math.random() * strengths.length)]
  };
  
  // If "none" direction, force strength to 0
  if (newWind.direction === 'none') {
    newWind.strength = 0;
  }
  
  return {
    ...gameState,
    currentWind: newWind
  };
};

// Select a golfer for the current hole
export const selectGolfer = (gameState: GameState, golferId: string): GameState => {
  // Find the selected golfer card
  const selectedGolfer = gameState.golferCards.find(card => card.id === golferId);
  const currentHoleState = gameState.holes[gameState.currentHoleIndex];
  
  if (!selectedGolfer) {
    return gameState; // No change if golfer not found
  }
  
  if (selectedGolfer.isUsed && !currentHoleState.selectedGolfer) {
    return gameState; // No change if golfer is already used and we're making a fresh selection
  }
  
  // Check if we're changing golfer before first shot
  const isChangingBeforeFirstShot = 
    currentHoleState.selectedGolfer && 
    currentHoleState.shots.length === 0 && 
    currentHoleState.selectedGolfer.id !== golferId;
  
  // If changing golfer before first shot, unmark the previously selected golfer as used
  let updatedGolferCards = [...gameState.golferCards];
  
  if (isChangingBeforeFirstShot) {
    // Unmark the previously selected golfer
    updatedGolferCards = updatedGolferCards.map(card => 
      card.id === currentHoleState.selectedGolfer?.id ? { ...card, isUsed: false } : card
    );
  }
  
  // Update the current hole state with the selected golfer
  const updatedHoleState = {
    ...currentHoleState,
    selectedGolfer
  };
  
  // Update the holes array
  const updatedHoles = [...gameState.holes];
  updatedHoles[gameState.currentHoleIndex] = updatedHoleState;
  
  // Mark the newly selected golfer card as used
  updatedGolferCards = updatedGolferCards.map(card => 
    card.id === golferId ? { ...card, isUsed: true } : card
  );
  
  // Return updated game state
  return {
    ...gameState,
    holes: updatedHoles,
    golferCards: updatedGolferCards
  };
};

// Generate new random golfer cards
export const generateFreshGolferCards = (existingCards: GolferCard[]): GolferCard[] => {
  // Instead of just resetting used cards, we'll get a completely new set of random golfers
  // Import the getRandomGolfers function directly
  const { getRandomGolfers } = require('../data/golfers');
  
  // Get a new set of random golfers (same count as the existing cards)
  return getRandomGolfers(existingCards.length);
};

// Move to the next hole
export const nextHole = (gameState: GameState): GameState => {
  // Check if there are more holes
  if (gameState.currentHoleIndex >= gameState.course.holes.length - 1) {
    return {
      ...gameState,
      gameCompleted: true
    };
  }
  
  // Check if all golfer cards are used
  const allGolfersUsed = gameState.golferCards.every(card => card.isUsed);
  
  // Generate fresh golfer cards if all are used
  const updatedGolferCards = allGolfersUsed 
    ? generateFreshGolferCards(gameState.golferCards)
    : gameState.golferCards;
  
  // Move to the next hole
  return {
    ...gameState,
    currentHoleIndex: gameState.currentHoleIndex + 1,
    golferCards: updatedGolferCards
  };
}; 