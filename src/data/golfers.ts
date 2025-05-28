import { GolferCard, SpecialAbility, StatModifier } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Helper function to create a new golfer with all required fields
const createGolfer = (
  name: string, 
  drive: StatModifier, 
  accuracy: StatModifier, 
  shortGame: StatModifier, 
  putting: StatModifier,
  specialAbility?: SpecialAbility
): GolferCard => ({
  id: uuidv4(),
  name,
  stats: {
    drive,
    accuracy,
    shortGame,
    putting
  },
  imageUrl: `/images/golfers/${name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
  isUsed: false,
  specialAbility
});

// List of legendary and current golfers with special abilities
export const allGolfers: GolferCard[] = [
  // Greatest of all time
  createGolfer('Jack Nicklaus', 2 as StatModifier, 3 as StatModifier, 2 as StatModifier, 2 as StatModifier, {
    name: 'Major Champion',
    description: 'Gets a +2 bonus on the final hole of the round',
    type: 'par4',
    effectValue: 2
  }),
  
  createGolfer('Tiger Woods', 3 as StatModifier, 1 as StatModifier, 2 as StatModifier, 3 as StatModifier, {
    name: 'Sunday Red',
    description: 'Every 4th hole, gain +1 to all stats',
    type: 'par4',
    effectValue: 1
  }),
  
  createGolfer('Arnold Palmer', 2 as StatModifier, 1 as StatModifier, 3 as StatModifier, 2 as StatModifier, {
    name: 'Army Leader',
    description: 'On par 5s, gain +2 to drive distance',
    type: 'par5',
    effectValue: 2
  }),
  
  createGolfer('Ben Hogan', 1 as StatModifier, 3 as StatModifier, 2 as StatModifier, 1 as StatModifier, {
    name: 'Perfect Swing',
    description: 'On fairway lies, gain +2 accuracy',
    type: 'fairway',
    effectValue: 2
  }),
  
  createGolfer('Sam Snead', 2 as StatModifier, 2 as StatModifier, 2 as StatModifier, 2 as StatModifier, {
    name: 'Longevity',
    description: 'Gain +1 to all stats on holes 13-18',
    type: 'par4',
    effectValue: 1
  }),
  
  // Modern Greats
  createGolfer('Phil Mickelson', 1 as StatModifier, 0 as StatModifier, 3 as StatModifier, 2 as StatModifier, {
    name: 'Flop Shot Master',
    description: 'From bunker lies, gain +3 to short game',
    type: 'bunker',
    effectValue: 3
  }),
  
  createGolfer('Rory McIlroy', 3 as StatModifier, 2 as StatModifier, 1 as StatModifier, 1 as StatModifier, {
    name: 'Power Drive',
    description: 'First tee shot of each round gains +2',
    type: 'par4',
    effectValue: 2
  }),
  
  createGolfer('Jordan Spieth', 1 as StatModifier, 2 as StatModifier, 2 as StatModifier, 3 as StatModifier, {
    name: 'Clutch Putter',
    description: 'On greens, 20% chance to auto-make any putt',
    type: 'green',
    effectValue: 1
  }),
  
  // More Legends
  createGolfer('Gary Player', 1 as StatModifier, 2 as StatModifier, 3 as StatModifier, 2 as StatModifier, {
    name: 'Global Champion',
    description: 'Ignore all wind effects completely',
    type: 'wind',
    effectValue: 0
  }),
  
  createGolfer('Tom Watson', 1 as StatModifier, 2 as StatModifier, 3 as StatModifier, 2 as StatModifier, {
    name: 'Links Master',
    description: 'From rough, gain +2 to short game',
    type: 'rough',
    effectValue: 2
  }),
  
  createGolfer('Seve Ballesteros', 1 as StatModifier, 0 as StatModifier, 3 as StatModifier, 3 as StatModifier, {
    name: 'Escape Artist',
    description: 'From trouble (rough/bunker/water), gain +2 to all stats',
    type: 'rough',
    effectValue: 2
  }),
  
  createGolfer('Byron Nelson', 2 as StatModifier, 3 as StatModifier, 1 as StatModifier, 2 as StatModifier, {
    name: 'Perfect Season',
    description: 'On par 4s, gain +1 to all stats',
    type: 'par4',
    effectValue: 1
  }),
  
  // Modern Players
  createGolfer('Dustin Johnson', 3 as StatModifier, 1 as StatModifier, 1 as StatModifier, 1 as StatModifier, {
    name: 'Athletic Power',
    description: 'On drives, gain +1 and ignore negative wind effects',
    type: 'wind',
    effectValue: 1
  }),
  
  createGolfer('Brooks Koepka', 2 as StatModifier, 2 as StatModifier, 1 as StatModifier, 2 as StatModifier, {
    name: 'Major Focus',
    description: 'On par 3s, gain +2 to accuracy',
    type: 'par3',
    effectValue: 2
  }),
  
  createGolfer('Bryson DeChambeau', 3 as StatModifier, 0 as StatModifier, 1 as StatModifier, 1 as StatModifier, {
    name: 'Science of Power',
    description: 'All drives gain +1, but -1 to putting',
    type: 'par4',
    effectValue: 1
  }),
  
  createGolfer('Sergio Garcia', 1 as StatModifier, 2 as StatModifier, 1 as StatModifier, 0 as StatModifier, {
    name: 'Iron Accuracy',
    description: 'On approach shots, gain +2 to accuracy',
    type: 'fairway',
    effectValue: 2
  }),
  
  // More Historical Greats
  createGolfer('Walter Hagen', 1 as StatModifier, 1 as StatModifier, 2 as StatModifier, 3 as StatModifier, {
    name: 'Psychology Master',
    description: 'After a poor or terrible result, next shot gains +2',
    type: 'par4',
    effectValue: 2
  }),
  
  createGolfer('Bobby Jones', 2 as StatModifier, 2 as StatModifier, 1 as StatModifier, 2 as StatModifier, {
    name: 'Grand Slam',
    description: 'On par 3s, gain +2 to all stats',
    type: 'par3',
    effectValue: 2
  }),
  
  createGolfer('Lee Trevino', 1 as StatModifier, 3 as StatModifier, 2 as StatModifier, 1 as StatModifier, {
    name: 'Fade Master',
    description: 'In crosswinds, gain +2 instead of penalty',
    type: 'wind',
    effectValue: 2
  }),
  
  createGolfer('Ernie Els', 2 as StatModifier, 2 as StatModifier, 1 as StatModifier, 2 as StatModifier, {
    name: 'Smooth Swing',
    description: 'On fairway lies, all shots gain +1',
    type: 'fairway',
    effectValue: 1
  }),
  
  // Additional Modern Players
  createGolfer('Justin Thomas', 2 as StatModifier, 2 as StatModifier, 2 as StatModifier, 1 as StatModifier),
  createGolfer('Jon Rahm', 2 as StatModifier, 2 as StatModifier, 1 as StatModifier, 2 as StatModifier),
  createGolfer('Collin Morikawa', 1 as StatModifier, 3 as StatModifier, 1 as StatModifier, 1 as StatModifier),
  createGolfer('Scottie Scheffler', 2 as StatModifier, 2 as StatModifier, 1 as StatModifier, 2 as StatModifier),
  
  // More Historical Players
  createGolfer('Nick Faldo', 1 as StatModifier, 3 as StatModifier, 1 as StatModifier, 1 as StatModifier),
  createGolfer('Greg Norman', 3 as StatModifier, 1 as StatModifier, 1 as StatModifier, 1 as StatModifier),
  createGolfer('Vijay Singh', 2 as StatModifier, 2 as StatModifier, 1 as StatModifier, 1 as StatModifier),
  createGolfer('Fred Couples', 2 as StatModifier, 1 as StatModifier, 2 as StatModifier, 1 as StatModifier)
];

// Function to get random golfers from the list
export const getRandomGolfers = (count: number = 4): GolferCard[] => {
  const shuffled = [...allGolfers].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// For backwards compatibility
export const sampleGolfers = getRandomGolfers(8); 