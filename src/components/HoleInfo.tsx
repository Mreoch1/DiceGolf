import React from 'react';
import { Hole, Wind } from '../types';

interface HoleInfoProps {
  hole: Hole;
  currentWind: Wind;
}

export const HoleInfo: React.FC<HoleInfoProps> = ({ hole, currentWind }) => {
  // Function to render wind direction and strength
  const renderWindInfo = () => {
    if (currentWind.direction === 'none' || currentWind.strength === 0) {
      return (
        <div className="d-flex align-items-center">
          <span className="me-2">Calm</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-secondary">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        </div>
      );
    }

    // Determine arrow direction based on wind direction
    let arrowDirection = '';
    switch (currentWind.direction) {
      case 'tailwind':
        arrowDirection = 'rotate(90deg)';
        break;
      case 'headwind':
        arrowDirection = 'rotate(-90deg)';
        break;
      case 'crosswind':
        arrowDirection = '';
        break;
    }

    // Render wind strength as multiple arrows
    const strengthIndicator = Array(currentWind.strength)
      .fill(0)
      .map((_, i) => (
        <svg 
          key={i}
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          className="text-primary"
          style={{ transform: arrowDirection }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      ));

    return (
      <div className="d-flex align-items-center">
        <span className="text-capitalize me-2">{currentWind.direction}</span>
        <div className="d-flex">{strengthIndicator}</div>
      </div>
    );
  };

  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h4 mb-0">Hole {hole.number}</h2>
          <div className="d-flex align-items-center">
            <span className="fw-semibold me-2">Par:</span>
            <span className="badge bg-success">{hole.par}</span>
          </div>
        </div>
        
        <div className="row mb-3">
          <div className="col-6">
            <span className="text-muted d-block">Length</span>
            <span className="fw-semibold">{hole.length} yards</span>
          </div>
          
          <div className="col-6">
            <span className="text-muted d-block">Green</span>
            <span className="fw-semibold text-capitalize">{hole.green.speed}, {hole.green.break} break</span>
          </div>
        </div>
        
        <div className="mb-3">
          <span className="text-muted d-block mb-1">Wind</span>
          {renderWindInfo()}
        </div>
        
        <div>
          <h3 className="text-muted h6 mb-2">Terrain Distribution</h3>
          <div className="progress mb-2" style={{ height: "20px" }}>
            {Object.entries(hole.terrain).map(([type, percentage]) => (
              <div 
                key={type}
                className={`progress-bar ${getTerrainColor(type as any)}`}
                style={{ width: `${percentage}%` }}
                title={`${type}: ${percentage}%`}
              ></div>
            ))}
          </div>
          <div className="d-flex flex-wrap small">
            {Object.entries(hole.terrain).map(([type, percentage]) => (
              <div key={type} className="me-2 mb-1 d-flex align-items-center">
                <div className={`d-inline-block rounded-circle me-1 ${getTerrainColor(type as any)}`} style={{width: "10px", height: "10px"}}></div>
                <span>{type}: {percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get terrain color
const getTerrainColor = (terrain: string): string => {
  switch (terrain) {
    case 'tee':
      return 'bg-secondary';
    case 'fairway':
      return 'bg-success';
    case 'rough':
      return 'bg-success bg-opacity-75';
    case 'bunker':
      return 'bg-warning';
    case 'green':
      return 'bg-info';
    case 'water':
      return 'bg-primary';
    default:
      return 'bg-secondary';
  }
};

export default HoleInfo; 