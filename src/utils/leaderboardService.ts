import { v4 as uuidv4 } from 'uuid';
import { LeaderboardEntry } from '../types';
import { supabase } from './supabaseClient';

const SUPABASE_TABLE = 'leaderboard';

// Define the database entry structure to match Supabase table
interface LeaderboardDbEntry {
  id: string;
  playername: string;
  coursename: string;
  score: number;
  date: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  holecount?: number;
  hole_count?: number;
}

/**
 * Fetch the current leaderboard from Supabase
 */
export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    console.log('Fetching leaderboard from Supabase...');
    console.log('Using table:', SUPABASE_TABLE);
    
    // Attempt to detect potential client issues
    if (!supabase || typeof supabase.from !== 'function') {
      console.error('🔴 Invalid Supabase client - not properly initialized');
      throw new Error('Supabase client not initialized correctly');
    }
    
    // Check the URL being used
    console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL || 'Not set in environment');
    
    // Add a timeout for the query to avoid hanging indefinitely
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Supabase query timed out after 10 seconds')), 10000);
    });
    
    // The actual query
    const queryPromise = supabase
      .from(SUPABASE_TABLE)
      .select('*')
      .order('score', { ascending: true })
      .order('date', { ascending: false })
      .limit(15);
    
    // Race the query against the timeout
    const { data, error } = await Promise.race([
      queryPromise,
      timeoutPromise
    ]) as any;
    
    if (error) {
      console.error('Error fetching from Supabase:', error);
      console.error('Error details:', error.code, error.message, error.details);
      throw error;
    }
    
    if (!data) {
      console.warn('No data returned from Supabase (data is null)');
      return [];
    }
    
    console.log(`Successfully retrieved ${data.length} leaderboard entries from Supabase`);
    
    if (data.length > 0) {
      console.log('First entry:', data[0]);
    }
    
    // Map database column names to our TypeScript interface names
    const mappedData = data.map((item: LeaderboardDbEntry) => ({
      id: item.id,
      player_name: item.playername,
      course_name: item.coursename,
      score: item.score,
      date: item.date,
      location: item.location,
      hole_count: item.holecount || item.hole_count || 18 // Try both names, fallback to 18
    }));
    
    // Return with proper type safety
    return mappedData as LeaderboardEntry[];
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    
    // Try to determine what went wrong
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        console.error('Network error - likely a CORS or connectivity issue');
      } else if (error.message.includes('timed out')) {
        console.error('Query timed out - Supabase might be slow or unreachable');
      }
    }
    
    // Re-throw to let the component handle it
    throw error;
  }
};

/**
 * Get local leaderboard - now just returns an empty array
 * Kept for backward compatibility with existing code
 */
export const getLocalLeaderboard = (): LeaderboardEntry[] => {
  console.log('Local storage is disabled - always using Supabase');
  return [];
};

/**
 * Add a new entry to the leaderboard
 */
export const addLeaderboardEntry = async (entry: Omit<LeaderboardEntry, 'id' | 'date'>): Promise<LeaderboardEntry> => {
  // Log the entry being added for debugging
  console.log('Adding leaderboard entry to Supabase:', entry);
  
  // Create a new entry with ID and date
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: uuidv4(),
    date: new Date().toISOString(),
  };
  
  // Create a modified entry that matches Supabase column names exactly
  const supabaseEntry = {
    id: newEntry.id,
    playername: newEntry.player_name,
    coursename: newEntry.course_name,
    score: newEntry.score,
    date: newEntry.date,
    location: newEntry.location,
    holecount: newEntry.hole_count
  };
  
  console.log('Prepared entry for Supabase:', supabaseEntry);
  
  try {
    // Add to Supabase
    console.log('Inserting into Supabase table:', SUPABASE_TABLE);
    const { data, error } = await supabase
      .from(SUPABASE_TABLE)
      .insert(supabaseEntry);
    
    if (error) {
      console.error('Error adding to Supabase:', error);
      console.log('Error details:', error.details, error.hint, error.message);
      throw error;
    } else {
      console.log('Successfully added entry to Supabase:', data);
    }
    
    return newEntry;
  } catch (error) {
    console.error('Exception when adding leaderboard entry:', error);
    throw error;
  }
};

/**
 * Add to local leaderboard - now does nothing
 * Kept for backward compatibility with existing code
 */
export const addToLocalLeaderboard = (newEntry: LeaderboardEntry): LeaderboardEntry => {
  console.log('Local storage is disabled - not adding entry locally:', newEntry);
  return newEntry;
};

/**
 * Check if a score qualifies for the leaderboard
 */
export const isLeaderboardQualified = async (score: number, courseName: string): Promise<boolean> => {
  try {
    // Check in Supabase
    const { data, error } = await supabase
      .from(SUPABASE_TABLE)
      .select('score')
      .eq('coursename', courseName)
      .order('score', { ascending: false }) // Get worst scores first
      .limit(15);
    
    if (error) {
      console.error('Error checking qualification:', error);
      return true; // Default to true if we can't check
    }
    
    // If we have fewer than 15 entries for this course, any score qualifies
    if (!data || data.length < 15) {
      return true;
    }
    
    // Make sure we have scores as numbers and handle type safety
    const scores = data.map(entry => typeof entry.score === 'number' ? entry.score : parseInt(String(entry.score), 10));
    
    // Otherwise, check if the score is better than the worst score on the leaderboard
    const worstScoreOnLeaderboard = Math.max(...scores);
    return score <= worstScoreOnLeaderboard;
  } catch (error) {
    console.error('Error checking leaderboard qualification:', error);
    return true; // Default to true if we can't check
  }
};

/**
 * No longer used - just returns true
 * Kept for backward compatibility with existing code
 */
export const isLocalLeaderboardQualified = (score: number, courseName: string): boolean => {
  console.log('Local storage is disabled - always returning true for qualification');
  return true;
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