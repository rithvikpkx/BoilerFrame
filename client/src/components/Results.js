import React from 'react';

export default function Results({ results, onBack }) {
  return (
    <div className="panel">
      <div className="panel-heading">
        <div className="panel-actions">
          <button className="btn-ghost" onClick={onBack}>← Back</button>
          <span className="pill">Matches {results.length}</span>
        </div>
        <h3>Results</h3>
        <p className="muted">Frames where your target appears. Hover to preview meta; similarity helps you triage.</p>
      </div>

      {results.length === 0 && <p className="muted">No matches found.</p>}

      <div className="results-grid dense">
        {results.map((r, idx) => (
          <div key={idx} className="result card-hover">
            <div className="result-img">
              <img src={r.s3FrameUrl} alt={`frame-${idx}`} />
              <div className="result-overlay">
                <span>{(r.timestampMs/1000).toFixed(1)}s</span>
                <span className="pill small">Sim {r.similarity?.toFixed(1) ?? '—'}%</span>
              </div>
            </div>
            <div className="result-meta">
              <span className="muted">Frame #{idx + 1}</span>
              <span className="pill tiny">Timestamp {(r.timestampMs/1000).toFixed(1)}s</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
