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
  GolferCard,
  Hole
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
  
  // Default modifiers
  let statMod = 0;
  let surfaceMod = 0;
  let windMod = 0;
  
  // Add stat modifier based on shot type
  if (selectedGolfer) {
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
        
        // Special bonus for putting: if putting stat is positive, add an extra +1
        // This makes good putters more consistently effective
        if (statMod > 0) {
          statMod += 1;
        }
        break;
    }
  }
  
  // Apply surface modifiers based on lie
  switch (currentLie) {
    case 'tee':
      surfaceMod = 2; // Bonus for teeing off
      break;
    case 'fairway':
      surfaceMod = 1; // Slight bonus for fairway lies
      break;
    case 'rough':
      surfaceMod = -1; // Penalty for rough
      break;
    case 'bunker':
      surfaceMod = -2; // Larger penalty for bunker
      break;
    case 'green':
      surfaceMod = 0; // Neutral on green
      break;
    case 'water':
      surfaceMod = -3; // Severe penalty for water hazard recovery
      break;
  }
  
  // Apply wind effect
  windMod = calculateWindEffect(gameState.currentWind, shotType);
  
  // Only apply wind to certain shot types
  if (shotType !== 'drive' && shotType !== 'approach') {
    windMod = 0; // No wind effect on putts or chips
  }
  
  // Apply any special abilities
  const modifiersWithAbility = applySpecialAbilities(
    gameState,
    shotType,
    currentLie,
    { statMod, surfaceMod, windMod }
  );
  
  return modifiersWithAbility;
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
  // Increase the chances of better results for putting
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
  distanceRemaining?: number,
  hole?: Hole
): { text: string; newLie: TerrainType; distanceRemaining?: number } => {
  let text = '';
  let newLie: TerrainType = 'fairway';
  let newDistanceRemaining = distanceRemaining;
  
  // Check for water hazard
  const hasWaterHazard = hole?.terrain.water && hole.terrain.water > 0;
  
  // Calculate player position from tee
  const holeLength = hole?.length || 500;
  const distanceFromTee = holeLength - (distanceRemaining || 0);
  const positionPercent = (distanceFromTee / holeLength) * 100;
  
  // Check if position matches water hazard zone
  const isInWaterHazardZone = hasWaterHazard && (() => {
    // Position water hazard in a strategic spot based on hole length
    const waterPosition = holeLength > 400 ? 55 : 40; // %
    const waterWidth = 15 + ((hole?.terrain.water || 0) / 10); // %
    
    // Check if player position falls within water hazard zone
    return positionPercent >= waterPosition && 
           positionPercent <= (waterPosition + waterWidth);
  })();
  
  // Random chance of landing in water or bunker based on hole terrain
  const waterChance = hasWaterHazard ? 
    (hole!.terrain.water / 100) * (isInWaterHazardZone ? 3 : 1) : 0;
  const bunkerChance = hole?.terrain.bunker ? hole.terrain.bunker / 100 : 0.1;
  
  // For poor and terrible shots, increase the chance of landing in hazards
  // For average or better shots, never land in hazards
  const badShotRandomizer = Math.random();
  
  // Water hazard only happens on poor or terrible shots
  const isWaterShot = (result === 'poor' || result === 'terrible') && 
                      (result === 'poor' ? badShotRandomizer < waterChance * 1.5 : 
                                         badShotRandomizer < waterChance * 3);
  
  // Bunker hazard only happens on poor or terrible shots
  const isBunkerShot = !isWaterShot && 
                      (result === 'poor' || result === 'terrible') && 
                      (result === 'poor' ? badShotRandomizer < bunkerChance * 1.5 : 
                                         badShotRandomizer < bunkerChance * 3);
  
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
        if (isWaterShot) {
          text = "Drive splashed into the water hazard! That's a penalty.";
          newLie = 'water';
          newDistanceRemaining = distanceRemaining ? Math.floor(distanceRemaining * 0.6) : 240;
        } else if (isBunkerShot) {
          text = 'Drive landed in a fairway bunker. Tough lie ahead.';
          newLie = 'bunker';
          newDistanceRemaining = distanceRemaining ? Math.floor(distanceRemaining * 0.6) : 240;
        } else {
          text = 'Sliced the drive into the deep rough.';
          newLie = 'rough';
          newDistanceRemaining = distanceRemaining ? Math.floor(distanceRemaining * 0.6) : 240;
        }
        break;
      case 'terrible':
        if (isWaterShot) {
          text = 'Terrible drive straight into the water! Taking a penalty drop.';
          newLie = 'water';
          newDistanceRemaining = distanceRemaining ? Math.floor(distanceRemaining * 0.7) : 260;
        } else if (isBunkerShot) {
          text = 'Drive ended up in a bunker. Tough lie ahead.';
          newLie = 'bunker';
          newDistanceRemaining = distanceRemaining ? Math.floor(distanceRemaining * 0.7) : 260;
        } else {
          text = 'Terrible drive, completely off target and in deep trouble.';
          newLie = 'rough';
          newDistanceRemaining = distanceRemaining ? Math.floor(distanceRemaining * 0.7) : 260;
        }
        break;
    }
  }
  // Approach results
  else if (shotType === 'approach') {
    switch (result) {
      case 'excellent':
        text = 'Perfect approach! Ball landed on the green near the pin.';
        newLie = 'green';
        newDistanceRemaining = Math.floor(Math.random() * 3) + 1; // 1-3 yards
        break;
      case 'good':
        text = 'Good approach, on the green with a moderate putt ahead.';
        newLie = 'green';
        newDistanceRemaining = Math.floor(Math.random() * 8) + 4; // 4-11 yards
        break;
      case 'average':
        if (Math.random() < 0.6) {
          text = 'Approach landed on the green but far from the hole.';
          newLie = 'green';
          newDistanceRemaining = Math.floor(Math.random() * 10) + 12; // 12-21 yards
        } else {
          text = 'Approach landed just off the green.';
          newLie = 'fairway';
          newDistanceRemaining = 20;
        }
        break;
      case 'poor':
        if (isWaterShot) {
          text = 'Approach shot found the water hazard. Taking a drop.';
          newLie = 'water';
          newDistanceRemaining = 40;
        } else if (isBunkerShot) {
          text = 'Approach shot landed in a bunker near the green.';
          newLie = 'bunker';
          newDistanceRemaining = 35;
        } else {
          text = 'Approach missed the green and landed in the rough.';
          newLie = 'rough';
          newDistanceRemaining = 40;
        }
        break;
      case 'terrible':
        if (isWaterShot) {
          text = 'Terrible approach straight into the water! Taking a penalty drop.';
          newLie = 'water';
          newDistanceRemaining = 45;
        } else if (isBunkerShot) {
          text = 'Approach shot landed in a deep bunker near the green.';
          newLie = 'bunker';
          newDistanceRemaining = 35;
        } else {
          text = 'Completely mishit the approach, ball is in deep rough.';
          newLie = 'rough';
          newDistanceRemaining = 40;
        }
        break;
    }
  }
  // Chip results
  else if (shotType === 'chip') {
    switch (result) {
      case 'excellent':
        if (Math.random() < 0.3) {
          text = 'Incredible chip! The ball rolls in for a chip-in!';
          newLie = 'green';
          newDistanceRemaining = 0;
        } else {
          text = 'Excellent chip, very close to the hole!';
          newLie = 'green';
          newDistanceRemaining = 1;
        }
        break;
      case 'good':
        text = 'Nice chip, on the green with a short putt ahead.';
        newLie = 'green';
        newDistanceRemaining = Math.floor(Math.random() * 2) + 2; // 2-3 yards
        break;
      case 'average':
        text = 'Decent chip, on the green but with some work left.';
        newLie = 'green';
        newDistanceRemaining = Math.floor(Math.random() * 3) + 4; // 4-6 yards
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
    // For debugging
    const originalDistance = distanceRemaining || 0;
    // Ensure we have a number for all calculations
    const distance = distanceRemaining || 0;
    
    // For tap-ins (1-2 yard putts), they should almost always go in
    if (distance <= 2) {
      // Even with poor results, a tap-in should have a high chance of success
      if (result === 'excellent' || result === 'good' || result === 'average' || (result === 'poor' && Math.random() < 0.7)) {
        text = 'The putt drops into the cup!';
        newLie = 'green';
        newDistanceRemaining = 0;
      } else {
        // Only poor or terrible results might miss a tap-in
        text = 'Somehow missed the short putt! The ball lips out.';
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
          // Good putts should either hole out or leave very short putts
          if (distance <= 10) {
            // Much higher chance of holing out medium-length putts
            if (Math.random() < 0.6) {
              text = 'Great putt! The ball drops in the cup!';
              newLie = 'green';
              newDistanceRemaining = 0;
            } else {
              text = 'Good putt, just a tap-in remaining.';
              newLie = 'green';
              newDistanceRemaining = 1;
            }
          } else {
            // Longer putts get much closer
            text = 'Good putt, leaving a short one.';
            newLie = 'green';
            newDistanceRemaining = Math.min(2, Math.floor(distance * 0.15));
          }
          break;
        case 'average':
          // Average putts should make significant progress
          if (distance <= 5) {
            // Higher chance of short putts going in with average result
            if (Math.random() < 0.4) {
              text = 'The ball rolls into the cup!';
              newLie = 'green';
              newDistanceRemaining = 0;
            } else {
              text = 'Good pace, ball stops just short of the hole.';
              newLie = 'green';
              newDistanceRemaining = 1;
            }
          } else if (distance <= 15) {
            // 6-15 yard putts should get very close
            text = 'Nice putt, leaving a short one.';
            newLie = 'green';
            newDistanceRemaining = Math.min(2, Math.floor(distance * 0.2));
          } else {
            // Longer putts reduce distance significantly
            text = 'Decent pace on the putt, left with a makeable second putt.';
            newLie = 'green';
            newDistanceRemaining = Math.min(3, Math.floor(distance * 0.25));
          }
          break;
        case 'poor':
          // Poor putts still make decent progress
          if (distance <= 5) {
            text = 'Putt misses the hole but stays close.';
            newLie = 'green';
            newDistanceRemaining = Math.min(2, distance);
          } else if (distance <= 10) {
            // Short to medium putts
            text = 'Misjudged the break, but still made good progress.';
            newLie = 'green';
            newDistanceRemaining = Math.min(3, Math.floor(distance * 0.3));
          } else {
            // Longer putts
            text = 'Poor putt, but still covered most of the distance.';
            newLie = 'green';
            newDistanceRemaining = Math.min(4, Math.floor(distance * 0.35));
          }
          break;
        case 'terrible':
          // Terrible putts still make some progress
          if (distance <= 5) {
            text = 'Terrible putt, but not far from the hole.';
            newLie = 'green';
            newDistanceRemaining = Math.min(3, distance);
          } else if (Math.random() < 0.3 && distance > 10) {
            // 30% chance of leaving a longer putt from the other side (if original putt was long)
            text = 'Poor pace! Putt races past the hole.';
            newLie = 'green';
            newDistanceRemaining = Math.min(distance - 3, 6); // New distance from other side
          } else {
            // Otherwise still makes some progress
            text = 'Misjudged the putt, but made some progress.';
            newLie = 'green';
            newDistanceRemaining = Math.min(4, Math.floor(distance * 0.5));
          }
          break;
      }
    }
    
    // Log putt distance calculation for debugging
    console.log('Putt distance calculation:', {
      originalDistance,
      newDistance: newDistanceRemaining,
      result,
      message: text
    });
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
  let waterShotCount = 0; // Track consecutive water shots
  
  if (currentHoleState.shots.length > 0) {
    const lastShot = currentHoleState.shots[currentHoleState.shots.length - 1];
    currentLie = lastShot.lie;
    distanceRemaining = lastShot.distanceRemaining || 0;
    
    // Count consecutive water shots
    for (let i = currentHoleState.shots.length - 1; i >= 0; i--) {
      if (currentHoleState.shots[i].lie === 'water') {
        waterShotCount++;
      } else {
        break;
      }
    }
  }
  
  // Count consecutive putts for auto-completion
  let consecutivePutts = 0;
  if (shotType === 'putt') {
    for (let i = currentHoleState.shots.length - 1; i >= 0; i--) {
      if (currentHoleState.shots[i].type === 'putt') {
        consecutivePutts++;
      } else {
        break;
      }
    }
  }
  
  // Use provided dice roll or roll new dice
  const diceTotal = diceRoll ? diceRoll[0] + diceRoll[1] : rollDice(2);
  
  // Calculate modifiers and check for special ability activation
  const modifiersWithAbility = calculateModifiers(gameState, shotType, currentLie);
  const { statMod, surfaceMod, windMod } = modifiersWithAbility;
  const specialAbilityActivated = (modifiersWithAbility as any).abilityActivated;
  
  // Calculate total score for this shot
  const shotScore = diceTotal + statMod + surfaceMod + windMod;
  
  // Determine result
  const result = determineResult(shotScore);
  
  // Auto-complete on 4th putt with a reasonable score (reduced from 5th)
  if (shotType === 'putt' && consecutivePutts >= 3) {
    console.log('Auto-completing on 4th consecutive putt');
    
    // Force this putt to go in
    const autoCompletionText = "The ball finally drops in the cup.";
    
    // Create shot object with auto-completion
    const shot: Shot = {
      id: uuidv4(),
      type: shotType,
      diceRoll: diceTotal,
      statModifier: statMod,
      surfaceModifier: surfaceMod,
      windModifier: windMod,
      totalScore: shotScore,
      result: 'average', // Mark as average result
      resultText: autoCompletionText,
      lie: 'green',
      distanceRemaining: 0, // Ball in hole
      specialAbilityActivated: specialAbilityActivated,
      penaltyStroke: false
    };
    
    // Update hole state
    const updatedHoleState = {
      ...currentHoleState,
      shots: [...currentHoleState.shots, shot],
      completed: true,
      score: currentHoleState.shots.length + 1 + currentHoleState.penalties
    };
    
    // Create a new game state with the updated hole state
    const newHoles = [...gameState.holes];
    newHoles[gameState.currentHoleIndex] = updatedHoleState;
    
    // Calculate total score from scratch
    let calculatedTotal = 0;
    let holesCount = 0;
    
    // For better debugging, calculate and log each hole separately
    newHoles.forEach((hole, index) => {
      if (hole.completed) {
        holesCount++;
        const holeScoreRelativeToPar = hole.score - hole.hole.par;
        calculatedTotal += holeScoreRelativeToPar;
        console.log(`Hole ${hole.hole.number}: par ${hole.hole.par}, score ${hole.score}, relative: ${holeScoreRelativeToPar}, running total: ${calculatedTotal}`);
      }
    });
    
    console.log(`Total score calculated in completeHole: ${calculatedTotal} (${holesCount} holes completed)`);
    
    // Return the updated game state and shot
    return {
      newGameState: {
        ...gameState,
        holes: newHoles,
        totalScore: calculatedTotal
      },
      shot
    };
  }
  
  // For water hazard recovery, force successful recovery after 1 attempt (was 2)
  const forceSuccessfulRecovery = currentLie === 'water' && waterShotCount >= 1;
  
  // Generate result text and calculate new distance/lie
  const { text, newLie, distanceRemaining: newDistanceRemaining } = generateResultText(
    shotType, 
    result, 
    currentLie, 
    distanceRemaining,
    currentHole
  );
  
  // Start with the generated text
  let finalText = text;
  
  // Set final values
  let finalLie = newLie;
  let finalPenalty = false;
  let adjustedDistanceRemaining = newDistanceRemaining;
  
  // Check for water hazard
  const hasWaterPenalty = newLie === 'water';
  
  // For water hazards, automatically place the ball on fairway with penalty
  if (newLie === 'water') {
    // Override result for water hazard
    finalLie = 'water'; // Will be temporarily set to water to track penalties
    finalPenalty = true;
    
    // Add water penalty text based on number of consecutive water shots
    if (waterShotCount === 0) {
      finalText = 'Ball went in the water hazard. Taking a penalty stroke.';
    } else {
      finalText = `Ball found the water again! Taking another penalty stroke.`;
    }
  }
  
  // Force recovery from water with a clean message
  if (forceSuccessfulRecovery) {
    // Override water detection and place the ball on the fairway
    finalLie = 'fairway';
    finalPenalty = false;
    finalText = `Taking a drop. Ball placed safely on the fairway.`;
    
    // Place the ball a safe distance away from water
    const holeLength = currentHole.length;
    const waterHazardPosition = holeLength > 400 ? 55 : 40; // %
    const waterHazardWidth = 15 + (currentHole.terrain.water / 10); // %
    
    // Calculate safe position beyond the water hazard
    const waterHazardEndYards = Math.floor(((waterHazardPosition + waterHazardWidth) / 100) * holeLength);
    adjustedDistanceRemaining = holeLength - waterHazardEndYards - 10; // 10 yards past water
    
    // Calculate and log the yards from tee for clarity
    const yardsFromTee = holeLength - adjustedDistanceRemaining;
    console.log(`Water recovery: placing ball at ${yardsFromTee} yards from tee, ${adjustedDistanceRemaining} yards from hole`);
  }
  
  // Add putt counter to result text after 2 putts
  if (shotType === 'putt' && consecutivePutts >= 2) {
    const puttsRemaining = 4 - consecutivePutts; // Changed from 5 to 4
    if (puttsRemaining > 0) {
      finalText += ` (${puttsRemaining} putt${puttsRemaining !== 1 ? 's' : ''} until auto-completion)`;
    }
  }
  
  // Ensure distance remaining is properly calculated
  // This ensures that the ball position doesn't unexpectedly reset
  if (adjustedDistanceRemaining === undefined || adjustedDistanceRemaining === null) {
    console.error('Distance remaining calculation error:', {
      shotType, result, currentLie, distanceRemaining, newDistanceRemaining
    });
    // Fallback to previous distance minus some yards if calculation failed
    adjustedDistanceRemaining = Math.max(0, distanceRemaining - 30);
  }
  
  // Create shot object
  const shot: Shot = {
    id: uuidv4(),
    type: shotType,
    diceRoll: diceTotal,
    statModifier: statMod,
    surfaceModifier: surfaceMod,
    windModifier: windMod,
    totalScore: shotScore,
    result,
    resultText: finalText,
    lie: finalLie,
    distanceRemaining: adjustedDistanceRemaining,
    specialAbilityActivated: specialAbilityActivated,
    penaltyStroke: finalPenalty,
    previousLie: finalPenalty ? currentLie : undefined
  };
  
  // Update hole state with the new shot
  const updatedHoleState = {
    ...currentHoleState,
    shots: [...currentHoleState.shots, shot],
    penalties: currentHoleState.penalties + (finalPenalty ? 1 : 0)
  };
  
  // Check if hole is completed
  const isHoleCompleted = adjustedDistanceRemaining === 0 || isHoleComplete({
    ...gameState,
    holes: [
      ...gameState.holes.slice(0, gameState.currentHoleIndex),
      updatedHoleState,
      ...gameState.holes.slice(gameState.currentHoleIndex + 1)
    ]
  });
  
  // Calculate score for the hole if complete
  if (isHoleCompleted) {
    updatedHoleState.completed = true;
    
    // Score includes shots taken plus any penalties
    updatedHoleState.score = updatedHoleState.shots.length + updatedHoleState.penalties;
    
    // Check for hole in one
    if (updatedHoleState.shots.length === 1 && updatedHoleState.penalties === 0) {
      shot.resultText = 'HOLE IN ONE! Amazing shot!';
    }
  }
  
  // Create a new game state with the updated hole state
  const newHoles = [...gameState.holes];
  newHoles[gameState.currentHoleIndex] = updatedHoleState;
  
  // Calculate total score from scratch
  let calculatedTotal = 0;
  let holesCount = 0;
  
  // For better debugging, calculate and log each hole separately
  newHoles.forEach((hole, index) => {
    if (hole.completed) {
      holesCount++;
      const holeScoreRelativeToPar = hole.score - hole.hole.par;
      calculatedTotal += holeScoreRelativeToPar;
      console.log(`Hole ${hole.hole.number}: par ${hole.hole.par}, score ${hole.score}, relative: ${holeScoreRelativeToPar}, running total: ${calculatedTotal}`);
    }
  });
  
  console.log(`Total score calculated in completeHole: ${calculatedTotal} (${holesCount} holes completed)`);
  
  return {
    newGameState: {
      ...gameState,
      holes: newHoles,
      totalScore: calculatedTotal
    },
    shot
  };
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
  
  // Check for putt loops - detect if we're cycling between the same distances
  if (consecutivePutts >= 3) {
    // Check last 3 putts for oscillating distances
    const recentPutts = currentHoleState.shots.slice(-3);
    const distances = recentPutts.map(shot => shot.distanceRemaining);
    
    // If we're oscillating between similar distances, force completion
    if (
      distances.length === 3 &&
      new Set(distances).size < 3 &&
      currentHoleState.shots.length > 5
    ) {
      console.log('Detected putt loop, forcing hole completion');
      return true;
    }
  }
  
  // Auto-complete on 4 consecutive putts (reduced from 5)
  if (consecutivePutts >= 4) {
    console.log('Auto-completing due to 4 consecutive putts');
    return true;
  }
  
  // Check if hole is complete due to:
  // - Ball in the hole (distance = 0)
  // - Too many consecutive putts
  return (
    currentHoleState.shots[currentHoleState.shots.length - 1]?.distanceRemaining === 0 ||
    (consecutivePutts >= 4) // Maximum 4 consecutive putts (reduced from 5)
  );
};

// Complete a hole and calculate score
export const completeHole = (gameState: GameState): GameState => {
  const currentHoleState = gameState.holes[gameState.currentHoleIndex];
  const par = currentHoleState.hole.par;
  
  // Get penalties for this hole
  const penalties = currentHoleState.penalties || 0;
  
  // Score includes shots taken plus any penalties
  const score = currentHoleState.shots.length + penalties;
  
  // Log the score calculation for debugging
  console.log('Complete hole score calculation:', {
    shots: currentHoleState.shots.length,
    penalties,
    totalScore: score,
    par
  });
  
  // Update hole state
  const updatedHoleState = {
    ...currentHoleState,
    score,
    completed: true
  };
  
  // Update game state
  const updatedHoles = [...gameState.holes];
  updatedHoles[gameState.currentHoleIndex] = updatedHoleState;
  
  // Calculate new total score from scratch
  let calculatedTotal = 0;
  let holesCount = 0;
  
  // For better debugging, calculate and log each hole separately
  updatedHoles.forEach((hole, index) => {
    if (hole.completed) {
      holesCount++;
      const holeScoreRelativeToPar = hole.score - hole.hole.par;
      calculatedTotal += holeScoreRelativeToPar;
      console.log(`Hole ${hole.hole.number}: par ${hole.hole.par}, score ${hole.score}, relative: ${holeScoreRelativeToPar}, running total: ${calculatedTotal}`);
    }
  });
  
  console.log(`Total score calculated in completeHole: ${calculatedTotal} (${holesCount} holes completed)`);
  
  return {
    ...gameState,
    holes: updatedHoles,
    totalScore: calculatedTotal
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