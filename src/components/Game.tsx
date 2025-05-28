import React, { useState, useEffect } from 'react';
import GolferCard from './GolferCard';
import HoleInfo from './HoleInfo';
import ShotLog from './ShotLog';
import Scorecard from './Scorecard';
import ShotControls from './ShotControls';
import LeaderboardModal from './LeaderboardModal';
import Leaderboard from './Leaderboard';
import { useGameReducer } from '../hooks/useGameReducer';
import { Course, GolferCard as GolferCardType, ShotType, TerrainType, LeaderboardEntry } from '../types';
import { playSound } from '../utils/soundEffects';
import { isLeaderboardQualified } from '../utils/leaderboardService';

interface GameProps {
  course: Course;
  golferCards: GolferCardType[];
}

const Game: React.FC<GameProps> = ({ course, golferCards }) => {
  const [gameState, dispatch] = useGameReducer(course, golferCards);
  const [isRolling, setIsRolling] = useState(false);
  const [diceValues, setDiceValues] = useState<[number, number]>([0, 0]);
  const [showNextHoleButton, setShowNextHoleButton] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showGolferRefreshMessage, setShowGolferRefreshMessage] = useState(false);
  const [showGolferChangeMessage, setShowGolferChangeMessage] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [leaderboardEntry, setLeaderboardEntry] = useState<LeaderboardEntry | undefined>(undefined);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  // Get current hole state
  const currentHoleState = gameState.holes[gameState.currentHoleIndex];
  const currentHole = currentHoleState.hole;
  
  // Determine current lie and distance remaining
  const getCurrentLieAndDistance = (): { lie: TerrainType; distance: number } => {
    if (currentHoleState.shots.length === 0) {
      return { lie: 'tee', distance: currentHole.length };
    }
    
    const lastShot = currentHoleState.shots[currentHoleState.shots.length - 1];
    return { 
      lie: lastShot.lie, 
      distance: lastShot.distanceRemaining || 0 
    };
  };
  
  const { lie: currentLie, distance: distanceRemaining } = getCurrentLieAndDistance();
  
  // Check if a golfer is selected for the current hole
  const isGolferSelected = !!currentHoleState.selectedGolfer;
  
  // Handle golfer selection
  const handleSelectGolfer = (golferId: string) => {
    // If we already have a golfer selected but haven't taken a shot yet,
    // we're changing golfers, so show a message
    if (isGolferSelected && currentHoleState.shots.length === 0 && 
        currentHoleState.selectedGolfer?.id !== golferId) {
      setShowGolferChangeMessage(true);
      
      // Hide the message after 3 seconds
      setTimeout(() => {
        setShowGolferChangeMessage(false);
      }, 3000);
      
      // Play a sound for golfer change
      playSound('dice-land', 0.5);
    }
    
    dispatch({ type: 'SELECT_GOLFER', payload: { golferId } });
  };
  
  // Handle taking a shot
  const handleTakeShot = (shotType: ShotType) => {
    // Show rolling animation
    setIsRolling(true);
    setDiceValues([0, 0]); // Reset dice values
    
    // Simulate dice roll with delay
    setTimeout(() => {
      // Generate random dice values (1-6)
      const diceRoll: [number, number] = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ];
      
      // Set the dice values for display
      setDiceValues(diceRoll);
      
      // Take the shot with the actual values
      dispatch({ type: 'TAKE_SHOT', payload: { shotType, diceRoll } });
      
      // Keep showing the dice results for a moment
      setTimeout(() => {
        setIsRolling(false);
        
        // We need to check the UPDATED state after the dispatch
        setTimeout(() => {
          // Check if the hole is completed after this shot
          const updatedState = gameState.holes[gameState.currentHoleIndex];
          if (updatedState.completed || 
              (updatedState.shots.length > 0 && 
               updatedState.shots[updatedState.shots.length - 1].distanceRemaining === 0)) {
            setShowNextHoleButton(true);
          }
        }, 100);
      }, 500); // Show dice results for half a second
    }, 1500); // Roll duration
  };
  
  // Handle moving to the next hole
  const handleNextHole = () => {
    // Check if all golfers are used before moving to the next hole
    const allGolfersUsed = gameState.golferCards.every(card => card.isUsed);
    
    // Dispatch the next hole action
    dispatch({ type: 'NEXT_HOLE' });
    setShowNextHoleButton(false);
    
    // If all golfers were used, show the refresh message
    if (allGolfersUsed) {
      setShowGolferRefreshMessage(true);
      // Hide the message after 5 seconds
      setTimeout(() => {
        setShowGolferRefreshMessage(false);
      }, 5000);
    }
  };
  
  // Check if the game is completed
  useEffect(() => {
    if (gameState.gameCompleted) {
      setGameCompleted(true);
      
      // Check if the score qualifies for the leaderboard
      const qualifies = isLeaderboardQualified(
        gameState.totalScore, 
        course.name
      );
      
      if (qualifies) {
        // Show the leaderboard modal after a short delay
        setTimeout(() => {
          setShowLeaderboardModal(true);
          playSound('dice-land', 0.6); // Play a sound for the modal
        }, 1000);
      }
    }
  }, [gameState.gameCompleted, gameState.totalScore, course.name]);

  // Check if hole is completed on state changes
  useEffect(() => {
    if (currentHoleState.shots.length > 0) {
      const lastShot = currentHoleState.shots[currentHoleState.shots.length - 1];
      if (lastShot.distanceRemaining === 0 || currentHoleState.completed) {
        setShowNextHoleButton(true);
      }
    }
  }, [currentHoleState]);

  // Handle leaderboard entry submission
  const handleLeaderboardSubmit = (entry: LeaderboardEntry) => {
    setLeaderboardEntry(entry);
    setShowLeaderboard(true);
    
    // Play celebration sound
    playSound('dice-roll', 0.7);
  };

  return (
    <div className="container">
      <header className="mb-4 text-center">
        <h1 className="h3 fw-bold text-secondary">🎲 Dice Golf</h1>
        <p className="text-muted">
          Playing {course.name}
          <button 
            className="btn btn-sm btn-outline-success ms-3"
            onClick={() => setShowLeaderboardModal(true)}
          >
            <small>🏆 View Leaderboard</small>
          </button>
        </p>
      </header>
      
      {showGolferRefreshMessage && (
        <div className="alert alert-success mb-4 text-center">
          <strong>New golfers available!</strong> You've used all your golfer cards. A fresh set has been provided for the next holes.
        </div>
      )}
      
      {showGolferChangeMessage && (
        <div className="alert alert-info mb-4 text-center animate__animated animate__fadeIn">
          <strong>Golfer changed!</strong> You can change your golfer freely before teeing off.
        </div>
      )}
      
      {gameCompleted ? (
        <div className="card mx-auto shadow-sm" style={{ maxWidth: showLeaderboard ? '60rem' : '32rem' }}>
          <div className="card-body">
            <div className="text-center mb-4">
              <h2 className="h4 fw-bold mb-3">🏆 Game Completed!</h2>
              <p className="h5 mb-4">Your final score: <span className="fw-bold">{gameState.totalScore < 0 ? '' : '+'}{gameState.totalScore}</span></p>
            </div>
            
            {showLeaderboard ? (
              <div className="row">
                <div className="col-md-5">
                  <Scorecard 
                    holes={gameState.holes} 
                    currentHoleIndex={gameState.currentHoleIndex}
                    totalScore={gameState.totalScore}
                  />
                  
                  <div className="d-grid gap-2 mt-4">
                    <button 
                      onClick={() => window.location.reload()}
                      className="btn btn-primary"
                    >
                      Play Again
                    </button>
                  </div>
                </div>
                
                <div className="col-md-7">
                  <Leaderboard 
                    selectedEntry={leaderboardEntry}
                    courseFilter={course.name}
                  />
                </div>
              </div>
            ) : (
              <>
                <Scorecard 
                  holes={gameState.holes} 
                  currentHoleIndex={gameState.currentHoleIndex}
                  totalScore={gameState.totalScore}
                />
                
                <div className="d-flex gap-2 mt-4 justify-content-center">
                  <button 
                    onClick={() => window.location.reload()}
                    className="btn btn-primary px-4 py-2"
                  >
                    Play Again
                  </button>
                  
                  <button 
                    onClick={() => setShowLeaderboardModal(true)}
                    className="btn btn-outline-success px-4 py-2"
                  >
                    Check Leaderboard
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="row">
          {/* Left sidebar - Golfer cards */}
          <div className="col-lg-3">
            <h2 className="h5 fw-bold mb-3">Golfer Cards</h2>
            <div className="d-flex flex-column gap-3">
              {gameState.golferCards.map(card => (
                <GolferCard 
                  key={card.id}
                  golferCard={card}
                  onSelect={handleSelectGolfer}
                  isSelected={currentHoleState.selectedGolfer?.id === card.id}
                  disabled={showNextHoleButton || currentHoleState.shots.length > 0}
                />
              ))}
            </div>
          </div>
          
          {/* Main area - Hole info and shot controls */}
          <div className="col-lg-6">
            <div className="d-flex flex-column mb-4">
              <HoleInfo 
                hole={currentHole}
                currentWind={gameState.currentWind}
              />
              
              <ShotLog shots={currentHoleState.shots} />
              
              {showNextHoleButton ? (
                <div className="card text-center">
                  <div className="card-body">
                    <h3 className="h5 fw-bold mb-2">Hole Complete!</h3>
                    <p className="mb-3">
                      You completed hole {currentHole.number} with a score of {currentHoleState.score}.
                      {currentHoleState.score === currentHole.par ? (
                        <span className="fw-semibold text-success"> Nice par!</span>
                      ) : currentHoleState.score < currentHole.par ? (
                        <span className="fw-semibold text-danger"> Excellent! Under par!</span>
                      ) : (
                        <span className="fw-semibold text-primary"> {currentHoleState.score - currentHole.par} over par.</span>
                      )}
                    </p>
                    <button 
                      onClick={handleNextHole}
                      className="btn btn-success px-4 py-2"
                    >
                      Continue to Next Hole
                    </button>
                  </div>
                </div>
              ) : (
                <ShotControls 
                  onTakeShot={handleTakeShot}
                  currentLie={currentLie}
                  distanceRemaining={distanceRemaining}
                  isGolferSelected={isGolferSelected}
                  isRolling={isRolling}
                  diceValues={diceValues}
                />
              )}
            </div>
          </div>
          
          {/* Right sidebar - Scorecard */}
          <div className="col-lg-3">
            <Scorecard 
              holes={gameState.holes} 
              currentHoleIndex={gameState.currentHoleIndex}
              totalScore={gameState.totalScore}
            />
          </div>
        </div>
      )}
      
      {/* Leaderboard Modal */}
      <LeaderboardModal 
        isOpen={showLeaderboardModal}
        onClose={() => setShowLeaderboardModal(false)}
        courseName={course.name}
        score={gameState.totalScore}
        holeCount={course.holes.length}
        onSubmitSuccess={handleLeaderboardSubmit}
      />
    </div>
  );
};

export default Game; 