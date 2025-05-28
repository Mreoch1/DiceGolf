import React from 'react';
import { Shot } from '../types';

interface ShotLogProps {
  shots: Shot[];
}

export const ShotLog: React.FC<ShotLogProps> = ({ shots }) => {
  if (shots.length === 0) {
    return (
      <div className="card mb-3">
        <div className="card-body">
          <h2 className="card-title h5 mb-3">Shot Log</h2>
          <p className="text-muted fst-italic">No shots taken yet. Select a golfer and take your first shot!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-3">
      <div className="card-body">
        <h2 className="card-title h5 mb-3">Shot Log</h2>
        <div className="d-flex flex-column gap-3">
          {shots.map((shot, index) => (
            <div 
              key={shot.id} 
              className="border-start ps-3 border-4"
              style={{ 
                borderColor: getBorderColorForResult(shot.result)
              }}
            >
              <div className="d-flex justify-content-between mb-1">
                <h3 className="h6 fw-bold mb-0">Shot {index + 1}: {getShotTypeLabel(shot.type)}</h3>
                <span className="badge" style={{ backgroundColor: getBgColorForResult(shot.result) }}>
                  {shot.result.toUpperCase()}
                </span>
              </div>
              <p className="mb-2">{shot.resultText}</p>
              
              {/* Special Ability Activation Indicator */}
              {shot.specialAbilityActivated && (
                <div className="alert alert-primary py-1 px-2 mb-2 small">
                  <span className="fw-bold">Special Ability:</span> {shot.specialAbilityActivated}
                </div>
              )}
              
              <div className="d-flex flex-wrap small text-muted mb-1">
                <div className="me-3">
                  <span className="fw-semibold">Roll:</span> {shot.diceRoll}
                </div>
                <div className="me-3">
                  <span className="fw-semibold">Golfer:</span> {formatModifier(shot.statModifier)}
                </div>
                <div className="me-3">
                  <span className="fw-semibold">Surface:</span> {formatModifier(shot.surfaceModifier)}
                </div>
                <div>
                  <span className="fw-semibold">Wind:</span> {formatModifier(shot.windModifier)}
                </div>
              </div>
              <div className="d-flex flex-wrap small text-muted">
                <div className="me-3">
                  <span className="fw-semibold">Total:</span> {shot.totalScore}
                </div>
                <div className="me-3">
                  <span className="fw-semibold">Lie:</span> {shot.lie}
                </div>
                {shot.distanceRemaining !== undefined && (
                  <div>
                    <span className="fw-semibold">Distance Remaining:</span> {shot.distanceRemaining} yards
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper functions
const formatModifier = (value: number): string => {
  if (value > 0) return `+${value}`;
  return value.toString();
};

const getShotTypeLabel = (type: string): string => {
  switch (type) {
    case 'drive': return 'Drive';
    case 'approach': return 'Approach';
    case 'chip': return 'Chip';
    case 'putt': return 'Putt';
    default: return type;
  }
};

const getBorderColorForResult = (result: string): string => {
  switch (result) {
    case 'excellent': return '#198754'; // green
    case 'good': return '#0d6efd'; // blue
    case 'average': return '#6c757d'; // gray
    case 'poor': return '#fd7e14'; // orange
    case 'terrible': return '#dc3545'; // red
    default: return '#6c757d';
  }
};

const getBgColorForResult = (result: string): string => {
  switch (result) {
    case 'excellent': return '#198754'; // green
    case 'good': return '#0d6efd'; // blue
    case 'average': return '#6c757d'; // gray
    case 'poor': return '#fd7e14'; // orange
    case 'terrible': return '#dc3545'; // red
    default: return '#6c757d';
  }
};

export default ShotLog; 