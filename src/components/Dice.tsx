import React, { useEffect, useState, useRef } from 'react';

interface DiceProps {
  isRolling: boolean;
  value?: number; // The final dice value (1-6)
  delay?: number; // Delay for animations (ms)
}

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

const Dice: React.FC<DiceProps> = ({ isRolling, value = 0, delay = 0 }) => {
  const [diceClass, setDiceClass] = useState('dice');
  const [diceContent, setDiceContent] = useState('?');
  const faceSwitchInterval = useRef<NodeJS.Timeout | null>(null);
  const faceIndex = useRef(0);
  
  // Setup random dice face switching during rolling
  useEffect(() => {
    if (isRolling) {
      // Shuffle dice faces for a random sequence
      const shuffledFaces = [...DICE_FACES].sort(() => Math.random() - 0.5);
      
      // Start the rolling animation with delay
      const rollingTimeout = setTimeout(() => {
        setDiceClass('dice dice-rolling');
        
        // Switch faces rapidly during roll
        faceSwitchInterval.current = setInterval(() => {
          faceIndex.current = (faceIndex.current + 1) % shuffledFaces.length;
          setDiceContent(shuffledFaces[faceIndex.current]);
        }, 100);
      }, delay);
      
      return () => {
        clearTimeout(rollingTimeout);
        if (faceSwitchInterval.current) {
          clearInterval(faceSwitchInterval.current);
        }
      };
    } else if (value > 0) {
      // Clean up the interval if it's still running
      if (faceSwitchInterval.current) {
        clearInterval(faceSwitchInterval.current);
        faceSwitchInterval.current = null;
      }
      
      // Show the result with animation
      setDiceClass('dice dice-result');
      setDiceContent(DICE_FACES[value - 1]);
    } else {
      // Reset to question mark when not rolling and no value
      setDiceClass('dice');
      setDiceContent('?');
      
      // Clean up any intervals
      if (faceSwitchInterval.current) {
        clearInterval(faceSwitchInterval.current);
        faceSwitchInterval.current = null;
      }
    }
  }, [isRolling, value, delay]);

  // Apply custom colors based on the value
  const getDiceColorStyle = () => {
    if (!value || value === 0) return {};
    
    // Different colors for different values
    const colors = {
      1: { background: 'linear-gradient(135deg, #ff7675, #d63031)', borderColor: '#c0392b' },
      2: { background: 'linear-gradient(135deg, #fdcb6e, #e17055)', borderColor: '#e67e22' },
      3: { background: 'linear-gradient(135deg, #55efc4, #00b894)', borderColor: '#009688' },
      4: { background: 'linear-gradient(135deg, #74b9ff, #0984e3)', borderColor: '#2980b9' },
      5: { background: 'linear-gradient(135deg, #a29bfe, #6c5ce7)', borderColor: '#8e44ad' },
      6: { background: 'linear-gradient(135deg, #ffeaa7, #fdcb6e)', borderColor: '#f1c40f', color: '#2d3436' }
    };
    
    return !isRolling ? colors[value as keyof typeof colors] : {};
  };

  return (
    <div className="dice-container">
      <div 
        className={diceClass} 
        style={getDiceColorStyle()}
        title={value ? `You rolled a ${value}` : 'Roll the dice'}
      >
        <span className="dice-face">{diceContent}</span>
        
        {/* Add shadow effect during roll */}
        {isRolling && (
          <div className="dice-shadow"></div>
        )}
        
        {/* Add a little highlight for the result */}
        {value > 0 && !isRolling && (
          <div className="dice-value-badge">{value}</div>
        )}
      </div>
    </div>
  );
};

export default Dice; 