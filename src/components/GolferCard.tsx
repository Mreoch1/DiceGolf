import React from 'react';
import { GolferCard as GolferCardType } from '../types';

interface GolferCardProps {
  golferCard: GolferCardType;
  onSelect: (id: string) => void;
  isSelected: boolean;
  disabled: boolean;
}

const StatBar: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  // Convert value (-3 to 3) to a percentage (0 to 100)
  const percentage = ((value + 3) / 6) * 100;
  
  return (
    <div className="mb-2">
      <div className="d-flex justify-content-between mb-1">
        <span>{label}</span>
        <span>{value > 0 ? `+${value}` : value}</span>
      </div>
      <div className="stat-bar">
        <div 
          className={`stat-bar-fill ${value >= 0 ? 'positive' : 'negative'}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const SpecialAbilityBadge: React.FC<{ abilityName: string, description: string }> = ({ abilityName, description }) => {
  return (
    <div className="mt-3 p-2 bg-light border-start border-4 border-primary rounded">
      <div className="d-flex align-items-center mb-1">
        <span className="badge bg-primary me-2">Special</span>
        <span className="fw-bold text-primary">{abilityName}</span>
      </div>
      <p className="mb-0 small text-muted">{description}</p>
    </div>
  );
};

export const GolferCard: React.FC<GolferCardProps> = ({ 
  golferCard, 
  onSelect, 
  isSelected,
  disabled
}) => {
  const handleClick = () => {
    if (!disabled && !golferCard.isUsed) {
      onSelect(golferCard.id);
    }
  };

  let cardClasses = "card golfer-card";
  
  if (isSelected) {
    cardClasses += " selected";
  }
  
  if (disabled || golferCard.isUsed) {
    cardClasses += " disabled";
  }

  return (
    <div 
      className={cardClasses}
      onClick={handleClick}
    >
      {/* Overlay for used golfers */}
      {golferCard.isUsed && !isSelected && (
        <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center" style={{
          top: 0,
          left: 0,
          backgroundColor: 'rgba(0,0,0,0.3)',
          zIndex: 1,
          borderRadius: 'inherit'
        }}>
          <span className="text-white fw-bold">USED</span>
        </div>
      )}
      
      {/* Indicator for selected golfers */}
      {isSelected && (
        <div className="position-absolute" style={{
          top: 10,
          right: 10,
          zIndex: 2
        }}>
          <span className="badge bg-success rounded-pill px-2 py-1">
            <i className="fas fa-check"></i> Selected
          </span>
        </div>
      )}
      
      <div className="card-body">
        <h3 className="card-title h5 mb-3">{golferCard.name}</h3>
        
        <div>
          <StatBar label="Drive" value={golferCard.stats.drive} />
          <StatBar label="Accuracy" value={golferCard.stats.accuracy} />
          <StatBar label="Short Game" value={golferCard.stats.shortGame} />
          <StatBar label="Putting" value={golferCard.stats.putting} />
        </div>
        
        {golferCard.specialAbility && (
          <SpecialAbilityBadge 
            abilityName={golferCard.specialAbility.name} 
            description={golferCard.specialAbility.description}
          />
        )}

        {/* Choose button */}
        {!golferCard.isUsed && !isSelected && !disabled && (
          <button 
            className="btn btn-sm btn-outline-primary w-100 mt-3"
            onClick={handleClick}
          >
            Choose Golfer
          </button>
        )}
      </div>
    </div>
  );
};

export default GolferCard; 