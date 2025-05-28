import { v4 as uuidv4 } from 'uuid';
import { LeaderboardEntry } from '../types';

const STORAGE_KEY = 'dice-golf-leaderboard';

/**
 * Fetch the current leaderboard from localStorage
 */
export const getLeaderboard = (): LeaderboardEntry[] => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error('Error loading leaderboard:', error);
  }
  return [];
};

/**
 * Save the leaderboard to localStorage
 */
export const saveLeaderboard = (entries: LeaderboardEntry[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving leaderboard:', error);
  }
};

/**
 * Add a new entry to the leaderboard
 */
export const addLeaderboardEntry = (entry: Omit<LeaderboardEntry, 'id' | 'date'>): LeaderboardEntry => {
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: uuidv4(),
    date: new Date().toISOString(),
  };
  
  const currentLeaderboard = getLeaderboard();
  const updatedLeaderboard = [...currentLeaderboard, newEntry];
  
  // Sort by score (ascending - lower is better in golf)
  updatedLeaderboard.sort((a, b) => {
    // First sort by score
    if (a.score !== b.score) {
      return a.score - b.score;
    }
    // If scores are equal, sort by date (newest first)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  // Limit to top 100 entries
  const limitedLeaderboard = updatedLeaderboard.slice(0, 100);
  
  saveLeaderboard(limitedLeaderboard);
  
  return newEntry;
};

/**
 * Check if a score qualifies for the leaderboard
 */
export const isLeaderboardQualified = (score: number, courseName: string): boolean => {
  const leaderboard = getLeaderboard();
  
  // Filter by the same course
  const courseEntries = leaderboard.filter(entry => entry.courseName === courseName);
  
  // If we have fewer than 10 entries for this course, any score qualifies
  if (courseEntries.length < 10) {
    return true;
  }
  
  // Otherwise, check if the score is better than the worst score on the leaderboard
  // or if the leaderboard has space
  const worstScoreOnLeaderboard = Math.max(...courseEntries.map(entry => entry.score));
  return score <= worstScoreOnLeaderboard || leaderboard.length < 100;
};

/**
 * Get user's location using the Geolocation API
 */
export const getUserLocation = async (): Promise<{ city?: string, state?: string, country?: string }> => {
  try {
    // First, check if Geolocation API is available
    if (!navigator.geolocation) {
      return {};
    }
    
    // Get coordinates
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0
      });
    });
    
    // Use reverse geocoding to get the city and state
    const { latitude, longitude } = position.coords;
    
    // Use a free reverse geocoding service
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      city: data.address?.city || data.address?.town || data.address?.village,
      state: data.address?.state,
      country: data.address?.country
    };
  } catch (error) {
    console.warn('Error getting location:', error);
    return {};
  }
}; 