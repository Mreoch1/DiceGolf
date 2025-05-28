import React from 'react';
import { HoleState } from '../types';

interface ScorecardProps {
  holes: HoleState[];
  currentHoleIndex: number;
  totalScore: number;
}

export const Scorecard: React.FC<ScorecardProps> = ({
  holes,
  currentHoleIndex,
  totalScore
}) => {
  // Helper function to get score relative to par
  const getScoreRelativeToPar = (score: number, par: number): string => {
    const diff = score - par;
    if (diff === 0) return 'E';
    if (diff > 0) return `+${diff}`;
    return diff.toString();
  };

  // Helper function to get score class based on performance
  const getScoreClass = (score: number, par: number): string => {
    if (!score) return '';
    
    const diff = score - par;
    if (diff < 0) return 'badge-danger'; // Birdie or better
    if (diff === 0) return 'badge-success'; // Par
    if (diff === 1) return 'badge-primary'; // Bogey
    return 'badge-warning'; // Double bogey or worse
  };

  // Helper function to get score name
  const getScoreName = (score: number, par: number): string => {
    if (!score) return '';
    
    const diff = score - par;
    if (diff <= -3) return 'Albatross!';
    if (diff === -2) return 'Eagle!';
    if (diff === -1) return 'Birdie!';
    if (diff === 0) return 'Par';
    if (diff === 1) return 'Bogey';
    if (diff === 2) return 'Double Bogey';
    return 'Triple+';
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h2 className="h5 mb-0">Scorecard</h2>
        <div className="d-flex align-items-center">
          <span className="text-muted mr-2">Total:</span>
          <span 
            className={`badge ${
              totalScore < 0 
                ? 'badge-danger' 
                : totalScore === 0 
                  ? 'badge-success' 
                  : 'badge-primary'
            }`}
          >
            {getScoreRelativeToPar(totalScore, 0)}
          </span>
        </div>
      </div>

      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-sm mb-0">
            <thead>
              <tr>
                <th className="text-left">Hole</th>
                <th className="text-left">Par</th>
                <th className="text-left">Score</th>
                <th className="text-left">+/-</th>
              </tr>
            </thead>
            <tbody>
              {holes.map((holeState, index) => (
                <tr 
                  key={holeState.hole.id}
                  className={index === currentHoleIndex ? 'bg-light' : ''}
                >
                  <td className="p-2">
                    {holeState.hole.number}
                    {index === currentHoleIndex && (
                      <span className="ml-2 d-inline-block" style={{width: '8px', height: '8px', backgroundColor: '#007bff', borderRadius: '50%'}}></span>
                    )}
                  </td>
                  <td className="p-2">
                    {holeState.hole.par}
                  </td>
                  <td className="p-2">
                    {holeState.completed ? (
                      <span className="fw-bold">{holeState.score}</span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td className="p-2">
                    {holeState.completed ? (
                      <span 
                        className={`badge ${getScoreClass(holeState.score, holeState.hole.par)}`}
                        title={getScoreName(holeState.score, holeState.hole.par)}
                      >
                        {getScoreRelativeToPar(holeState.score, holeState.hole.par)}
                      </span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="card-footer text-muted small">
        <div className="d-flex flex-wrap gap-2">
          <span className="d-flex align-items-center">
            <span className="badge badge-danger mr-1">&nbsp;</span>
            Birdie or better
          </span>
          <span className="d-flex align-items-center">
            <span className="badge badge-success mr-1">&nbsp;</span>
            Par
          </span>
          <span className="d-flex align-items-center">
            <span className="badge badge-primary mr-1">&nbsp;</span>
            Bogey
          </span>
          <span className="d-flex align-items-center">
            <span className="badge badge-warning mr-1">&nbsp;</span>
            Double+
          </span>
        </div>
      </div>
    </div>
  );
};

export default Scorecard; 