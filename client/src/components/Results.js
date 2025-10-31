import React from 'react';

export default function Results({ results, onBack }) {
  return (
    <div className="card">
      <h2>Results</h2>
      <button className="link" onClick={onBack}>← Back</button>
      {results.length === 0 && <p>No matches found.</p>}
      <div className="results-grid">
        {results.map((r, idx) => (
          <div key={idx} className="result">
            <img src={r.s3FrameUrl} alt={`frame-${idx}`} />
            <div>Time: {(r.timestampMs/1000).toFixed(1)}s</div>
            <div>Similarity: {r.similarity?.toFixed(1) ?? '—'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
