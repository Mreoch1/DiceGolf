import { Course, Hole, Par } from '../types';
import { v4 as uuidv4 } from 'uuid';

const createHole = (
  number: number, 
  par: Par, 
  length: number, 
  greenSpeed: 'slow' | 'normal' | 'fast', 
  greenBreak: 'easy' | 'hard'
): Hole => {
  return {
    id: uuidv4(),
    number,
    par,
    length,
    terrain: {
      tee: 1,
      fairway: par === 3 ? 40 : 60,
      rough: par === 3 ? 20 : 30,
      bunker: 10,
      green: 9,
      water: par === 3 ? 0 : 10
    },
    green: {
      speed: greenSpeed,
      break: greenBreak
    }
  };
};

// Sample 9-hole course
export const augustaNationalFront9: Course = {
  id: uuidv4(),
  name: 'Augusta National (Front 9)',
  holes: [
    createHole(1, 4, 445, 'fast', 'hard'),
    createHole(2, 5, 575, 'fast', 'hard'),
    createHole(3, 4, 350, 'fast', 'hard'),
    createHole(4, 3, 240, 'fast', 'hard'),
    createHole(5, 4, 455, 'fast', 'hard'),
    createHole(6, 3, 180, 'fast', 'hard'),
    createHole(7, 4, 450, 'fast', 'hard'),
    createHole(8, 5, 570, 'fast', 'hard'),
    createHole(9, 4, 460, 'fast', 'hard')
  ]
};

// Sample 9-hole course
export const pebbleBeachFront9: Course = {
  id: uuidv4(),
  name: 'Pebble Beach (Front 9)',
  holes: [
    createHole(1, 4, 380, 'normal', 'easy'),
    createHole(2, 5, 502, 'normal', 'easy'),
    createHole(3, 4, 390, 'normal', 'hard'),
    createHole(4, 4, 331, 'normal', 'easy'),
    createHole(5, 3, 195, 'normal', 'hard'),
    createHole(6, 5, 513, 'normal', 'easy'),
    createHole(7, 3, 106, 'normal', 'easy'),
    createHole(8, 4, 428, 'normal', 'hard'),
    createHole(9, 4, 481, 'normal', 'hard')
  ]
};

// Sample 18-hole course (combining both)
export const fullCourse: Course = {
  id: uuidv4(),
  name: 'Championship Course',
  holes: [...augustaNationalFront9.holes, ...pebbleBeachFront9.holes]
}; 