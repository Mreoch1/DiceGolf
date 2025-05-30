import React, { useEffect, useState } from 'react';
import { Hole, ShotType, TerrainType } from '../types';
import Dice from './Dice';

// No preloaded sounds - we'll create them on demand

interface ShotControlsProps {
  onTakeShot: (shotType: ShotType) => void;
  currentLie: TerrainType;
  distanceRemaining: number;
  isGolferSelected: boolean;
  isRolling: boolean;
  diceValues: [number, number];
  currentHole: Hole;
}

export const ShotControls: React.FC<ShotControlsProps> = ({
  onTakeShot,
  currentLie,
  distanceRemaining,
  isGolferSelected,
  isRolling,
  diceValues,
  currentHole
}) => {
  // State to track available shot types
  const [availableShots, setAvailableShots] = useState<ShotType[]>([]);
  
  // Create a local state to track when a sound is playing
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  
  // Determine available shot types based on lie and distance
  useEffect(() => {
    console.log('ShotControls determining available shots for:', { 
      currentLie, 
      distanceRemaining,
      rawCurrentLie: currentLie // Log the raw value to detect any issues
    });
    
    let shots: ShotType[] = [];
    
    // Always prioritize currentLie for shot type determination
    switch (currentLie) {
      case 'tee':
        shots = ['drive'];
        break;
      case 'green':
        // Always offer putt when on the green
        shots = ['putt'];
        console.log('On green - setting putt as only available shot');
        break;
      case 'fairway':
        // For normal lies, determine shot type based on distance
        if (distanceRemaining > 50) {
          shots = ['approach'];
        } else if (distanceRemaining <= 50 && distanceRemaining > 20) {
          shots = ['approach', 'chip'];
        } else {
          shots = ['chip'];
        }
        break;
      case 'rough':
        if (distanceRemaining > 50) {
          shots = ['approach'];
        } else if (distanceRemaining <= 50 && distanceRemaining > 20) {
          shots = ['approach', 'chip'];
        } else {
          shots = ['chip'];
        }
        break;
      case 'bunker':
        if (distanceRemaining > 50) {
          shots = ['approach'];
        } else {
          shots = ['chip'];
        }
        break;
      case 'water':
        // Recovery shot from water
        shots = ['approach'];
        break;
      default:
        console.warn('Unknown lie type:', currentLie);
        shots = ['approach'];
    }
    
    console.log('Available shots set to:', shots, 'for lie:', currentLie);
    setAvailableShots(shots);
  }, [currentLie, distanceRemaining]);
  
  // Handle button click to take a shot
  const handleShotClick = (shotType: ShotType) => {
    // Only play the sound if no sound is currently playing
    if (!isPlayingSound) {
      setIsPlayingSound(true);
      
      console.log(`BUTTON PRESS (${new Date().toISOString()}): Playing sound for ${shotType}`);
      
      try {
        // Create new audio element
        const sound = new Audio(shotType === 'putt' ? '/sounds/putt.wav' : '/sounds/swing.wav');
        
        // Add event listener for when sound finishes
        sound.onended = () => {
          console.log(`Sound for ${shotType} finished playing`);
          setIsPlayingSound(false);
        };
        
        sound.volume = 0.5;
        sound.play().then(() => {
          console.log(`Started playing ${shotType} sound`);
        }).catch(error => {
          console.error(`Error playing ${shotType} sound:`, error);
          setIsPlayingSound(false);
        });
      } catch (error) {
        console.error(`Failed to create audio for ${shotType}:`, error);
        setIsPlayingSound(false);
      }
    } else {
      console.log('Not playing sound because another sound is already playing');
    }
    
    // Call the onTakeShot callback with the selected shot type
    onTakeShot(shotType);
  };
  
  // Format distance for display
  const formatDistance = (yards: number): string => {
    // For short distances on the green, show feet instead of yards
    if (currentLie === 'green' && yards < 10) {
      const feet = Math.round(yards * 3);
      return `${feet} ${feet === 1 ? 'foot' : 'feet'}`;
    }
    return `${yards} ${yards === 1 ? 'yard' : 'yards'}`;
  };

  // Force re-render when lie or distance changes
  useEffect(() => {
    console.log('ShotControls re-rendering with new data:', {currentLie, distanceRemaining});
  }, [currentLie, distanceRemaining]);

  // Check if this is a tap-in putt (1 yard or less)
  const isTapIn = currentLie === 'green' && distanceRemaining <= 1;
  
  // Check if we are on the green
  const isOnGreen = currentLie === 'green';

  // Enhanced dice rendering using our new Dice component
  const renderDice = () => {
    return (
      <div className="d-flex justify-content-center mb-4">
        <Dice 
          isRolling={isRolling} 
          value={diceValues[0]} 
          delay={0}
        />
        <div className="ml-2">
          <Dice 
            isRolling={isRolling} 
            value={diceValues[1]} 
            delay={150} // Slight delay for second dice to create realistic effect
          />
        </div>
      </div>
    );
  };
  
  // Render guidance for putting based on distance
  const renderPuttingGuidance = () => {
    if (currentLie !== 'green') return null;
    
    // For very short putts
    if (distanceRemaining <= 1) {
      return (
        <div className="alert alert-success mb-3 small">
          <p className="mb-0">Tap-in putt! This should be an easy one.</p>
          <p className="mb-0 small text-muted">({Math.round(distanceRemaining * 3)} feet to the hole)</p>
        </div>
      );
    }
    
    // For short putts
    if (distanceRemaining <= 5) {
      return (
        <div className="alert alert-success mb-3 small">
          <p className="mb-0">Short putt: {Math.round(distanceRemaining * 3)} feet to the hole.</p>
          <p className="mb-0 small text-muted">
            <strong>Good result:</strong> Goes in or very close
            <br />
            <strong>Average result:</strong> Gets very close
            <br />
            <strong>Poor result:</strong> Gets closer but may need another putt
          </p>
        </div>
      );
    }
    
    // For medium putts
    if (distanceRemaining <= 15) {
      return (
        <div className="alert alert-success mb-3 small">
          <p className="mb-0">Medium putt: {distanceRemaining} yards ({Math.round(distanceRemaining * 3)} feet) to the hole.</p>
          <p className="mb-0 small text-muted">
            <strong>Good result:</strong> Gets very close or goes in
            <br />
            <strong>Average result:</strong> Gets significantly closer
            <br />
            <strong>Poor result:</strong> Makes some progress
          </p>
        </div>
      );
    }
    
    // For long putts
    return (
      <div className="alert alert-success mb-3 small">
        <p className="mb-0">Long putt: {distanceRemaining} yards ({Math.round(distanceRemaining * 3)} feet) to the hole. This will be challenging!</p>
        <p className="mb-0 small text-muted">
          <strong>Good result:</strong> Gets close to the hole
          <br />
          <strong>Average result:</strong> Makes significant progress
          <br />
          <strong>Poor/terrible result:</strong> May race past the hole or leave a long second putt
        </p>
        <p className="mb-0 small text-muted mt-1">After 5 consecutive putts, the ball will automatically drop in the cup.</p>
      </div>
    );
  };

  return (
    <div className="card">
      <div className={`card-body ${currentLie === 'water' ? 'border border-info' : isOnGreen ? 'border border-success' : ''}`}>
        <h2 className="card-header h5 mb-3">
          {isOnGreen ? 'Putting' : 'Take Your Shot'}
          {isTapIn && <span className="badge bg-warning text-dark ms-2">Tap In</span>}
        </h2>
        
        {!isGolferSelected ? (
          <div className="alert alert-warning mb-3">
            <p className="fw-semibold mb-1">Select a golfer first!</p>
            <p className="small mb-0">You need to select a golfer card before taking a shot.</p>
          </div>
        ) : (
          <>
            <div className="mb-3">
              <div className="d-flex align-items-center mb-2">
                <span className="fw-semibold mr-2">Current Lie:</span>
                <span className={`badge ${currentLie === 'water' ? 'bg-info' : isOnGreen ? 'bg-success' : 'badge-secondary'} text-capitalize`}>
                  {currentLie}
                </span>
                {isOnGreen && availableShots.indexOf('putt') === -1 && (
                  <span className="badge bg-danger ms-2">Error: Should be putting!</span>
                )}
              </div>
              <div className="d-flex align-items-center">
                <span className="fw-semibold mr-2">Distance Remaining:</span>
                <span className="badge badge-secondary">
                  {formatDistance(distanceRemaining)}
                </span>
              </div>
            </div>
            
            {renderPuttingGuidance()}
            
            {renderDice()}
            
            <div className="row">
              {/* Always show putt when on green regardless of availableShots */}
              {isOnGreen ? (
                <div className="col-6 mb-2">
                  <button
                    onClick={() => handleShotClick('putt')}
                    disabled={isRolling}
                    className={`btn btn-block btn-success ${isRolling ? 'disabled' : ''}`}
                  >
                    {isTapIn ? '🏆 Tap In' : '🥅 Putt'}
                  </button>
                </div>
              ) : (
                availableShots.map(shotType => (
                  <div className="col-6 mb-2" key={shotType}>
                    <button
                      onClick={() => handleShotClick(shotType)}
                      disabled={isRolling}
                      className={`btn btn-block ${getShotButtonStyle(shotType, currentLie === 'water')} ${isRolling ? 'disabled' : ''}`}
                    >
                      {getShotTypeLabel(shotType)}
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Helper functions
const getShotButtonStyle = (shotType: ShotType, isWaterHazard: boolean = false): string => {
  // Special style for water hazard recovery
  if (isWaterHazard && shotType === 'approach') {
    return 'btn-info';
  }
  
  // Special style for putting
  if (shotType === 'putt') {
    return 'btn-success';
  }
  
  switch (shotType) {
    case 'drive':
      return 'btn-danger';
    case 'approach':
      return 'btn-primary';
    case 'chip':
      return 'btn-warning';
    default:
      return 'btn-secondary';
  }
};

const getShotTypeLabel = (shotType: ShotType): string => {
  switch (shotType) {
    case 'drive':
      return '🏌️ Drive';
    case 'approach':
      return '🎯 Approach';
    case 'chip':
      return '⛳ Chip';
    case 'putt':
      return '🥅 Putt';
    default:
      return shotType;
  }
};

export default ShotControls; 