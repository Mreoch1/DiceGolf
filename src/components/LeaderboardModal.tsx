import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types';
import { addLeaderboardEntry, getUserLocation } from '../utils/leaderboardService';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseName: string;
  score: number;
  holeCount: number;
  onSubmitSuccess: (entry: LeaderboardEntry) => void;
}

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  courseName,
  score,
  holeCount,
  onSubmitSuccess
}) => {
  const [playerName, setPlayerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<{ city?: string; state?: string; country?: string }>({});
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showLocationError, setShowLocationError] = useState(false);
  const [shareLocation, setShareLocation] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Detect user's location on component mount
  useEffect(() => {
    if (isOpen && shareLocation) {
      fetchUserLocation();
    }
  }, [isOpen, shareLocation]);

  const fetchUserLocation = async () => {
    setIsGettingLocation(true);
    setShowLocationError(false);
    
    try {
      const userLocation = await getUserLocation();
      setLocation(userLocation);
    } catch (error) {
      console.error('Error fetching location:', error);
      setShowLocationError(true);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (playerName.trim() === '') return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Only include location if user opted in
      const locationData = shareLocation ? location : undefined;
      
      const entry = await addLeaderboardEntry({
        player_name: playerName.trim(),
        course_name: courseName,
        score,
        location: locationData,
        hole_count: holeCount
      });
      
      onSubmitSuccess(entry);
      onClose();
    } catch (error) {
      console.error('Error submitting score:', error);
      setSubmitError('Failed to submit score. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-success text-white">
            <h5 className="modal-title">🏆 You Made the Leaderboard!</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Close"></button>
          </div>
          
          <div className="modal-body">
            <div className="text-center mb-4">
              <h4>Your Final Score: {score > 0 ? '+' : ''}{score}</h4>
              <p className="text-muted">on {courseName}</p>
            </div>
            
            {submitError && (
              <div className="alert alert-danger mb-3">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {submitError}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="playerName" className="form-label">Your Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  autoFocus
                  maxLength={20}
                />
              </div>
              
              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="shareLocation"
                  checked={shareLocation}
                  onChange={(e) => setShareLocation(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="shareLocation">
                  Share my location on the leaderboard
                </label>
              </div>
              
              {shareLocation && (
                <div className="mb-3">
                  <label className="form-label d-flex justify-content-between">
                    <span>Location</span>
                    {isGettingLocation && <small className="text-muted">Detecting...</small>}
                  </label>
                  
                  {showLocationError ? (
                    <div className="alert alert-warning py-2 small">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      Couldn't detect your location. Your entry will be saved without location.
                    </div>
                  ) : (
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        value={formatLocation(location)}
                        readOnly
                        placeholder={isGettingLocation ? "Detecting location..." : "Location not detected"}
                      />
                      <button 
                        className="btn btn-outline-secondary" 
                        type="button"
                        onClick={fetchUserLocation}
                        disabled={isGettingLocation}
                      >
                        <i className="fas fa-sync-alt"></i>
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              <div className="d-grid mt-4">
                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={isSubmitting || playerName.trim() === ''}
                >
                  {isSubmitting ? 'Saving...' : 'Save to Leaderboard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to format location
const formatLocation = (location: { city?: string; state?: string; country?: string }) => {
  const parts = [];
  if (location.city) parts.push(location.city);
  if (location.state) parts.push(location.state);
  if (location.country && (!location.city || !location.state)) parts.push(location.country);
  
  return parts.join(', ');
};

export default LeaderboardModal; 