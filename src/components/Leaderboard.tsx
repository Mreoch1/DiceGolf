import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types';
import { getLeaderboard } from '../utils/leaderboardService';

interface LeaderboardProps {
  selectedEntry?: LeaderboardEntry;
  courseFilter?: string;
}

// Helper function to format location data
const formatLocation = (location: any): string => {
  if (!location) return '-';
  const parts = [];
  if (location.city) parts.push(location.city);
  if (location.state) parts.push(location.state);
  if (location.country && (!location.city || !location.state)) parts.push(location.country);
  return parts.length > 0 ? parts.join(', ') : '-';
};

const Leaderboard: React.FC<LeaderboardProps> = ({
  selectedEntry,
  courseFilter
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | undefined>(courseFilter);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load leaderboard entries
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('🔄 Fetching leaderboard data...');
        const leaderboardData = await getLeaderboard();
        console.log('📊 Leaderboard data received:', leaderboardData);
        
        if (leaderboardData.length === 0) {
          console.log('⚠️ No leaderboard entries were found');
        }
        
        setEntries(leaderboardData);
      } catch (err) {
        console.error('❌ Error fetching leaderboard:', err);
        setError('Failed to load leaderboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, []);
  
  // Filter entries based on selected course
  const filteredEntries = activeFilter
    ? entries.filter(entry => entry.course_name === activeFilter)
    : entries;
    
  // Sort entries by score (ascending) and then by date (descending)
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    // First sort by score (lowest/best first)
    if (a.score !== b.score) {
      return a.score - b.score;
    }
    // If scores are tied, sort by date (newest first)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  // Get unique course names for filtering
  const courseNames = Array.from(new Set(entries.map(entry => entry.course_name)));
  
  // Format date in a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <div className="card shadow-sm">
      <div className="card-header bg-success bg-opacity-10 d-flex justify-content-between align-items-center">
        <h5 className="mb-0">🏆 Top 15 Leaderboard</h5>
        
        <div className="dropdown">
          <button 
            className="btn btn-sm btn-outline-success dropdown-toggle" 
            type="button" 
            data-bs-toggle="dropdown" 
            aria-expanded="false"
          >
            {activeFilter || 'All Courses'}
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <button 
                className="dropdown-item" 
                onClick={() => setActiveFilter(undefined)}
              >
                All Courses
              </button>
            </li>
            <li><hr className="dropdown-divider" /></li>
            {courseNames.map(course => (
              <li key={course}>
                <button 
                  className="dropdown-item" 
                  onClick={() => setActiveFilter(course)}
                >
                  {course}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {isLoading ? (
        <div className="card-body text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading leaderboard data...</p>
        </div>
      ) : error ? (
        <div className="card-body text-center py-5">
          <div className="alert alert-warning mb-0">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        </div>
      ) : sortedEntries.length === 0 ? (
        <div className="card-body text-center py-5">
          <p className="text-muted mb-0">No leaderboard entries yet. Be the first!</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-striped mb-0">
            <thead className="table-light">
              <tr>
                <th scope="col" className="text-center">#</th>
                <th scope="col">Player</th>
                <th scope="col">Course</th>
                <th scope="col" className="text-center">Score</th>
                <th scope="col">Location</th>
                <th scope="col">Date</th>
              </tr>
            </thead>
            <tbody>
              {sortedEntries.map((entry, index) => {
                const isSelected = selectedEntry?.id === entry.id;
                
                return (
                  <tr 
                    key={entry.id}
                    className={isSelected ? 'table-success' : ''}
                  >
                    <td className="text-center">{index + 1}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span>{entry.player_name}</span>
                        {isSelected && (
                          <span className="badge bg-success ms-2">You</span>
                        )}
                      </div>
                    </td>
                    <td>{entry.course_name}</td>
                    <td className="text-center">
                      <span className={`fw-bold ${entry.score <= 0 ? 'text-success' : 'text-dark'}`}>
                        {entry.score > 0 ? '+' : ''}{entry.score}
                      </span>
                    </td>
                    <td>
                      {entry.location ? formatLocation(entry.location) : '-'}
                    </td>
                    <td>{formatDate(entry.date)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leaderboard; 