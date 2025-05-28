import React, { useState } from 'react';
import './App.css';
import Game from './components/Game';
import Leaderboard from './components/Leaderboard';
import { augustaNationalFront9, pebbleBeachFront9, fullCourse } from './data/courses';
import { getRandomGolfers } from './data/golfers';
import { Course } from './types';

function App() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Start the game with the selected course and golfers
  const startGame = () => {
    if (selectedCourse) {
      setGameStarted(true);
      setShowLeaderboard(false);
    }
  };

  // Select a course
  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
  };

  // Get random golfers for the game
  const getInitialGolfers = () => {
    return getRandomGolfers(4); // Get 4 random golfers from our expanded roster
  };

  // Render the course selection screen
  const renderCourseSelection = () => {
    return (
      <div className="card mx-auto shadow" style={{ maxWidth: '40rem' }}>
        <div className="card-body">
          <h2 className="card-title h4 mb-4">Select a Course</h2>
          
          <div className="row g-4 mb-4">
            <div className="col-md-6">
              <div 
                className={`card h-100 ${
                  selectedCourse?.id === augustaNationalFront9.id 
                    ? 'border-success bg-success bg-opacity-10' 
                    : 'border-light-subtle'
                }`}
                onClick={() => handleCourseSelect(augustaNationalFront9)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-body">
                  <h5 className="card-title">{augustaNationalFront9.name}</h5>
                  <p className="card-text text-muted small">9 holes of challenging play with fast greens and tricky breaks.</p>
                  <div className="mt-2 text-muted small">9 Holes</div>
                </div>
              </div>
            </div>
            
            <div className="col-md-6">
              <div 
                className={`card h-100 ${
                  selectedCourse?.id === pebbleBeachFront9.id 
                    ? 'border-success bg-success bg-opacity-10' 
                    : 'border-light-subtle'
                }`}
                onClick={() => handleCourseSelect(pebbleBeachFront9)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-body">
                  <h5 className="card-title">{pebbleBeachFront9.name}</h5>
                  <p className="card-text text-muted small">Scenic coastal course with moderate green speeds and varied terrain.</p>
                  <div className="mt-2 text-muted small">9 Holes</div>
                </div>
              </div>
            </div>
            
            <div className="col-12">
              <div 
                className={`card ${
                  selectedCourse?.id === fullCourse.id 
                    ? 'border-success bg-success bg-opacity-10' 
                    : 'border-light-subtle'
                }`}
                onClick={() => handleCourseSelect(fullCourse)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-body">
                  <h5 className="card-title">{fullCourse.name}</h5>
                  <p className="card-text text-muted small">A full 18-hole championship course combining both courses for a complete experience.</p>
                  <div className="mt-2 text-muted small">18 Holes</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="d-grid gap-2">
            <button 
              onClick={startGame}
              disabled={!selectedCourse}
              className={`btn ${
                selectedCourse 
                  ? 'btn-success' 
                  : 'btn-secondary'
              }`}
            >
              {selectedCourse ? 'Start Game' : 'Select a Course to Continue'}
            </button>
            
            <button 
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="btn btn-outline-primary"
            >
              {showLeaderboard ? 'Hide Leaderboard' : 'View Leaderboard'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render the leaderboard
  const renderLeaderboard = () => {
    return (
      <div className="card mx-auto shadow" style={{ maxWidth: '55rem' }}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="card-title h4 mb-0">All-Time Leaderboard</h2>
            <button 
              onClick={() => setShowLeaderboard(false)} 
              className="btn btn-sm btn-outline-secondary"
            >
              Back to Course Selection
            </button>
          </div>
          
          <Leaderboard />
        </div>
      </div>
    );
  };

  return (
    <div className="min-vh-100 bg-light">
      <header className="bg-success text-white p-4 shadow-sm mb-4">
        <div className="container">
          <h1 className="display-5 fw-bold">🎲 Dice Golf</h1>
          <p className="text-white-50">A strategic dice-driven golf game</p>
        </div>
      </header>
      
      <main className="container py-4">
        {gameStarted ? (
          <Game 
            course={selectedCourse!} 
            golferCards={getInitialGolfers()}
          />
        ) : (
          showLeaderboard ? renderLeaderboard() : renderCourseSelection()
        )}
      </main>
      
      <footer className="bg-dark text-white py-3 mt-auto">
        <div className="container text-center small">
          <p className="mb-0">&copy; 2023 Dice Golf. A strategy dice golf game.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
