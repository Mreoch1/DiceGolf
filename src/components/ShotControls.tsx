import React, { useEffect } from 'react';
import { ShotType, TerrainType } from '../types';
import Dice from './Dice';
import { preloadSounds } from '../utils/soundEffects';

interface ShotControlsProps {
  onTakeShot: (shotType: ShotType) => void;
  currentLie: TerrainType;
  distanceRemaining: number;
  isGolferSelected: boolean;
  isRolling: boolean;
  diceValues?: [number, number]; // Add dice values for showing results
}

export const ShotControls: React.FC<ShotControlsProps> = ({
  onTakeShot,
  currentLie,
  distanceRemaining,
  isGolferSelected,
  isRolling,
  diceValues = [0, 0]
}) => {
  // Preload sound effects when component mounts
  useEffect(() => {
    preloadSounds(['dice-roll', 'dice-land']);
  }, []);

  // Determine available shot types based on current lie and distance
  const getAvailableShots = (): ShotType[] => {
    // If on the tee, only drive is available
    if (currentLie === 'tee') {
      return ['drive'];
    }
    
    // If on the green, only putt is available
    if (currentLie === 'green') {
      // If very close to the hole (1 yard or less), show tap-in option
      // We'll still use 'putt' as the shot type but display it differently
      return ['putt'];
    }
    
    // If close to the green but not on it, chip is available
    if (distanceRemaining < 50 && currentLie !== 'water') {
      return ['chip'];
    }
    
    // For most fairway/rough shots, approach is appropriate
    if (distanceRemaining < 250 && currentLie !== 'water') {
      return ['approach'];
    }
    
    // For long distances not on tee, drive can be used (like a fairway wood)
    if (distanceRemaining >= 250 && currentLie !== 'water') {
      return ['drive', 'approach'];
    }
    
    // Default for water hazards - only approach shot to get out
    if (currentLie === 'water') {
      return ['approach'];
    }
    
    // Fallback
    return ['approach'];
  };

  const availableShots = getAvailableShots();
  
  // Check if this is a tap-in putt (1 yard or less)
  const isTapIn = currentLie === 'green' && distanceRemaining <= 1;

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

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="card-header h5 mb-3">Take Your Shot</h2>
        
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
                <span className="badge badge-secondary text-capitalize">
                  {currentLie}
                </span>
              </div>
              <div className="d-flex align-items-center">
                <span className="fw-semibold mr-2">Distance Remaining:</span>
                <span className="badge badge-secondary">
                  {distanceRemaining} yards
                </span>
              </div>
            </div>
            
            {renderDice()}
            
            <div className="row">
              {availableShots.map(shotType => (
                <div className="col-6 mb-2" key={shotType}>
                  <button
                    onClick={() => onTakeShot(shotType)}
                    disabled={isRolling}
                    className={`btn btn-block ${getShotButtonStyle(shotType)} ${isRolling ? 'disabled' : ''}`}
                  >
                    {isTapIn && shotType === 'putt' ? '🏆 Tap In' : getShotTypeLabel(shotType)}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Helper functions
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
  }
};

const getShotButtonStyle = (shotType: ShotType): string => {
  switch (shotType) {
    case 'drive':
      return 'btn-primary';
    case 'approach':
      return 'btn-success';
    case 'chip':
      return 'btn-warning';
    case 'putt':
      return 'btn-info';
  }
};

export default ShotControls; 