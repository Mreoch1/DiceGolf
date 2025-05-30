import React, { useState, useEffect, useCallback } from 'react';
import GolferCard from './GolferCard';
import HoleInfo from './HoleInfo';
import ShotLog from './ShotLog';
import Scorecard from './Scorecard';
import ShotControls from './ShotControls';
import LeaderboardModal from './LeaderboardModal';
import Leaderboard from './Leaderboard';
import HoleOverview from './HoleOverview';
import VolumeControl from './VolumeControl';
import { useGameReducer } from '../hooks/useGameReducer';
import { Course, GolferCard as GolferCardType, ShotType, TerrainType, LeaderboardEntry } from '../types';
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
  const [golferChangeMessageText, setGolferChangeMessageText] = useState('');
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [leaderboardEntry, setLeaderboardEntry] = useState<LeaderboardEntry | undefined>(undefined);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  // New state for viewing-only leaderboard
  const [showViewOnlyLeaderboard, setShowViewOnlyLeaderboard] = useState(false);
  // Local state for currentLie to ensure immediate updates
  const [localCurrentLie, setLocalCurrentLie] = useState<TerrainType>('tee');
  const [localDistanceRemaining, setLocalDistanceRemaining] = useState<number>(0);
  
  // Get current hole state
  const currentHoleState = gameState.holes[gameState.currentHoleIndex];
  const currentHole = currentHoleState.hole;
  
  // Force-sync the local state with the current hole state when shots change
  useEffect(() => {
    if (currentHoleState.shots.length > 0) {
      const lastShot = currentHoleState.shots[currentHoleState.shots.length - 1];
      
      // Update local state with the latest shot data
      if (lastShot.lie !== localCurrentLie || lastShot.distanceRemaining !== localDistanceRemaining) {
        console.log('Force-syncing state from last shot:', {
          oldLie: localCurrentLie,
          newLie: lastShot.lie,
          oldDistance: localDistanceRemaining,
          newDistance: lastShot.distanceRemaining
        });
        
        setLocalCurrentLie(lastShot.lie);
        setLocalDistanceRemaining(lastShot.distanceRemaining || 0);
      }
    }
  }, [currentHoleState.shots, localCurrentLie, localDistanceRemaining]);
  
  // Determine current lie and distance remaining with useCallback
  const getCurrentLieAndDistance = useCallback((): { lie: TerrainType; distance: number } => {
    if (currentHoleState.shots.length === 0) {
      return { lie: 'tee', distance: currentHole.length };
    }
    
    const lastShot = currentHoleState.shots[currentHoleState.shots.length - 1];
    const result = { 
      lie: lastShot.lie, 
      distance: lastShot.distanceRemaining || 0 
    };
    
    console.log('getCurrentLieAndDistance returning:', result);
    return result;
  }, [currentHoleState.shots, currentHole.length]);
  
  // Get the current lie and distance
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { lie: currentLie } = getCurrentLieAndDistance();
  
  // Initialize local state
  useEffect(() => {
    setLocalDistanceRemaining(currentHole.length);
  }, [currentHole]);
  
  // Update local state when the game state changes
  useEffect(() => {
    // For immediate UI updates, directly read the latest shot data
    if (currentHoleState.shots.length > 0) {
      const lastShot = currentHoleState.shots[currentHoleState.shots.length - 1];
      
      // Always use the most recent shot data for UI
      setLocalCurrentLie(lastShot.lie);
      setLocalDistanceRemaining(lastShot.distanceRemaining || 0);
      
      // Log for debugging
      console.log('Updated state from shots data:', {
        lie: lastShot.lie, 
        distance: lastShot.distanceRemaining,
        shotType: lastShot.type,
        result: lastShot.result,
        shotNumber: currentHoleState.shots.length
      });
    } else {
      // Reset to tee position for a new hole
      setLocalCurrentLie('tee');
      setLocalDistanceRemaining(currentHole.length);
      console.log('Reset to tee position:', currentHole.length);
    }
  }, [currentHoleState.shots, currentHole]);
  
  // Check if a golfer is selected for the current hole
  const isGolferSelected = !!currentHoleState.selectedGolfer;
  
  // Handle selecting a golfer
  const handleSelectGolfer = (golferId: string) => {
    // Check if we've already selected a golfer for this hole
    if (currentHoleState.selectedGolfer && currentHoleState.shots.length === 0) {
      const newGolferName = gameState.golferCards.find(card => card.id === golferId)?.name || 'new golfer';
      setGolferChangeMessageText(`Switched to ${newGolferName}`);
      setShowGolferChangeMessage(true);
      
      // Hide the message after 3 seconds
      setTimeout(() => {
        setShowGolferChangeMessage(false);
      }, 3000);
    }
    
    dispatch({ type: 'SELECT_GOLFER', payload: { golferId } });
  };
  
  // Handle taking a shot
  const handleTakeShot = (shotType: ShotType) => {
    // Special handling for water recovery - use shorter animation
    const isWaterShot = currentLie === 'water';
    const rollDuration = isWaterShot ? 800 : 1500;
    
    // Play ONLY dice roll sound - nothing else
    try {
      console.log(`GAME (${new Date().toISOString()}): Playing ONLY dice roll sound`);
      const diceSound = new Audio('/sounds/dice-roll.wav');
      diceSound.volume = 0.5;
      diceSound.play();
    } catch (error) {
      console.error('Failed to play dice roll sound:', error);
    }
    
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
      
      // NO CLICK SOUND or any other sound here
      
      // Track the current shot count to detect a new shot was added
      const currentShotCount = currentHoleState.shots.length;
      
      // Take the shot with the actual values
      dispatch({ type: 'TAKE_SHOT', payload: { shotType, diceRoll } });
      
      // We need to wait for the state to update after dispatch
      setTimeout(() => {
        // Manually get the updated state since React might not have updated gameState yet
        const holeIndex = gameState.currentHoleIndex;
        const updatedHoleState = gameState.holes[holeIndex];
        
        // Check if a new shot was added
        const hasNewShot = updatedHoleState.shots.length > currentShotCount;
        
        // Check if we have shots
        if (hasNewShot && updatedHoleState.shots.length > 0) {
          // Get the latest shot
          const lastShot = updatedHoleState.shots[updatedHoleState.shots.length - 1];
          
          // Force log of shot data to debug
          console.log('Latest shot data:', {
            lie: lastShot.lie,
            distance: lastShot.distanceRemaining,
            type: lastShot.type,
            result: lastShot.result
          });
          
          // Directly update local state with the latest shot data
          setLocalCurrentLie(lastShot.lie);
          setLocalDistanceRemaining(lastShot.distanceRemaining || 0);
          console.log('Updated position after shot:', lastShot.distanceRemaining, 'New lie:', lastShot.lie);
          
          // Add additional log to debug water hazard recovery
          if (currentLie === 'water' && lastShot.lie !== 'water') {
            console.log('Water recovery successful! New lie:', lastShot.lie);
          }
        }
        
        // Check if the hole is completed
        if (updatedHoleState.completed || 
            (updatedHoleState.shots.length > 0 && 
             updatedHoleState.shots[updatedHoleState.shots.length - 1].distanceRemaining === 0)) {
          setShowNextHoleButton(true);
        }
        
        // Keep showing the dice results for a moment
        setTimeout(() => {
          setIsRolling(false);
          
          // Do another state refresh to ensure we have the correct state
          if (gameState.holes[gameState.currentHoleIndex].shots.length > 0) {
            const finalShot = gameState.holes[gameState.currentHoleIndex].shots[
              gameState.holes[gameState.currentHoleIndex].shots.length - 1
            ];
            setLocalCurrentLie(finalShot.lie);
            setLocalDistanceRemaining(finalShot.distanceRemaining || 0);
            
            // Add additional debugging information
            console.log('Final state refresh:', {
              lie: finalShot.lie,
              distance: finalShot.distanceRemaining,
              shotType: finalShot.type
            });
          }
        }, isWaterShot ? 300 : 500);
      }, 250); // Increased timeout to ensure state is updated
    }, rollDuration); // Roll duration
  };
  
  // Unique key for HoleOverview to force re-render when shots change
  const shotCount = currentHoleState.shots.length;
  const lastShotId = shotCount > 0 ? currentHoleState.shots[shotCount - 1].id : 'no-shots';
  const holeOverviewKey = `hole-overview-${currentHole.id}-${shotCount}-${lastShotId}-${localDistanceRemaining}`;
  
  // Check if the game is completed
  useEffect(() => {
    if (gameState.gameCompleted) {
      setGameCompleted(true);
      
      // Check if the score qualifies for the leaderboard
      const checkLeaderboardQualification = async () => {
        try {
          const qualifies = await isLeaderboardQualified(
            gameState.totalScore, 
            course.name
          );
          
          if (qualifies) {
            // Show the leaderboard modal after a short delay
            setTimeout(() => {
              setShowLeaderboardModal(true);
            }, 1000);
          }
        } catch (error) {
          console.error("Error checking leaderboard qualification:", error);
          // If there's an error, still show the modal to be safe
          setTimeout(() => {
            setShowLeaderboardModal(true);
          }, 1000);
        }
      };
      
      checkLeaderboardQualification();
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

  // Handle leaderboard entry submission
  const handleLeaderboardSubmit = (entry: LeaderboardEntry) => {
    setLeaderboardEntry(entry);
    setShowLeaderboard(true);
  };

  return (
    <div className="game-container container-fluid p-0">
      {/* Game Header */}
      <div className="game-header bg-dark text-white p-3 d-flex justify-content-between align-items-center">
        <div>
          <h1 className="h4 mb-0">{course.name}</h1>
          <div className="small text-secondary">
            {course.holes.length} Holes
          </div>
        </div>
        
        {/* Add Volume Control here */}
        <div className="d-flex align-items-center">
          <VolumeControl className="me-3" />
          
          <button
            className="btn btn-outline-light btn-sm ms-2"
            onClick={() => setShowViewOnlyLeaderboard(true)}
          >
            Leaderboard
          </button>
        </div>
      </div>
      
      {showGolferRefreshMessage && (
        <div className="alert alert-success mb-4 text-center">
          <strong>New golfers available!</strong> You've used all your golfer cards. A fresh set has been provided for the next holes.
        </div>
      )}
      
      {showGolferChangeMessage && (
        <div className="alert alert-info mb-4 text-center">
          <strong>{golferChangeMessageText}</strong>
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
              
              <HoleOverview
                key={holeOverviewKey}
                hole={currentHole}
                shots={currentHoleState.shots}
                distanceRemaining={localDistanceRemaining}
              />
              
              <ShotLog shots={currentHoleState.shots} />
              
              {showNextHoleButton ? (
                <div className="card text-center">
                  <div className="card-body">
                    <h3 className="h5 fw-bold mb-2">Hole Complete!</h3>
                    <p className="mb-3">
                      You completed hole {currentHole.number} with a score of {currentHoleState.score}.
                      {currentHoleState.penalties > 0 && (
                        <span className="text-info"> (including {currentHoleState.penalties} penalty {currentHoleState.penalties === 1 ? 'stroke' : 'strokes'})</span>
                      )}
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
                  currentLie={localCurrentLie}
                  distanceRemaining={localDistanceRemaining}
                  isGolferSelected={isGolferSelected}
                  isRolling={isRolling}
                  diceValues={diceValues}
                  currentHole={currentHole}
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
      
      {/* Leaderboard Modal - only for completed games */}
      <LeaderboardModal 
        isOpen={showLeaderboardModal && gameCompleted}
        onClose={() => setShowLeaderboardModal(false)}
        courseName={course.name}
        score={gameState.totalScore}
        holeCount={course.holes.length}
        onSubmitSuccess={handleLeaderboardSubmit}
      />
      
      {/* View-only Leaderboard Modal */}
      {showViewOnlyLeaderboard && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">🏆 Leaderboard</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowViewOnlyLeaderboard(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3 text-center">
                  <p className="text-muted mb-0">
                    Finish your game to submit your score!
                  </p>
                  <p className="small text-info">
                    <i className="fas fa-info-circle me-1"></i>
                    Current score: {gameState.totalScore < 0 ? '' : '+'}{gameState.totalScore} after {gameState.currentHoleIndex + 1} of {course.holes.length} holes
                  </p>
                </div>
                <Leaderboard courseFilter={course.name} />
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowViewOnlyLeaderboard(false)}
                >
                  Continue Playing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game; 