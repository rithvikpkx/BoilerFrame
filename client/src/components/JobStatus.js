import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

export default function JobStatus({ jobId, onComplete, onBack }) {
  const [status, setStatus] = useState('started');
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [delayMs, setDelayMs] = useState(2000);
  const [elapsedMs, setElapsedMs] = useState(0);
  const mounted = useRef(true);
  const startTime = useRef(Date.now());

  useEffect(() => {
    mounted.current = true;
    startTime.current = Date.now();
    setElapsedMs(0);
    const elapsedTimer = setInterval(() => {
      if (!mounted.current) return;
      setElapsedMs(Date.now() - startTime.current);
    }, 500);

    async function poll() {
      try {
        setAttempts(a => a + 1);
        const resp = await axios.get(`/api/jobs/${jobId}`);
        if (!mounted.current) return;
        const data = resp.data;
        setStatus(data.status);
        setResults(data.results || []);
        setError(null);
        // reset delay on successful response
        setDelayMs(2000);

        if (data.status === 'succeeded') {
          if (onComplete) onComplete(data.results || []);
          return;
        }
        if (data.status === 'failed') {
          setError('Processing failed');
          if (onComplete) onComplete(data.results || []);
          return;
        }
        // still in progress -> schedule next poll
        if (!mounted.current) return;
        setTimeout(() => { if (mounted.current) poll(); }, delayMs);
      } catch (err) {
        if (!mounted.current) return;
        setAttempts(a => a + 1);
        const msg = err.response?.data?.error || err.message || 'Network error';
        setError(msg);
        // exponential backoff on errors
        setDelayMs(prev => Math.min(prev * 2, 30000));
        setTimeout(() => { if (mounted.current) poll(); }, Math.min(delayMs, 30000));
      }
    }

    poll();
    return () => { mounted.current = false; clearInterval(elapsedTimer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const elapsedSec = (elapsedMs / 1000).toFixed(1);
  const friendlyStatus = (s) => {
    if (!s) return 'unknown';
    if (s === 'started' || s === 'IN_PROGRESS' || s === 'processing') return 'Processing';
    if (s === 'succeeded') return 'Complete';
    if (s === 'failed') return 'Failed';
    return s;
  };

  return (
    <div className="card">
      <h2>Job status</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="link" onClick={onBack}>← Back</button>
        <div style={{ fontSize: 12, color: '#6b7280' }}>Elapsed: {elapsedSec}s • Attempts: {attempts}</div>
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Job ID:</strong> {jobId}
      </div>

      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ minWidth: 20 }}>
          {status !== 'succeeded' && status !== 'failed' ? (
            <div className="spinner" aria-hidden="true" />
          ) : null}
        </div>
        <div>
          <div style={{ fontWeight: 600 }}>{friendlyStatus(status)}</div>
          {error && <div className="msg" style={{ marginTop: 6 }}>Error: {error}</div>}
        </div>
      </div>

      {(status !== 'succeeded' && status !== 'failed') && (
        <div style={{ marginTop: 12 }}>
          <div className="progress-indeterminate" />
          <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>Polling every {(delayMs/1000).toFixed(0)}s</div>
        </div>
      )}

      {results.length > 0 && (
        <div className="results-grid" style={{ marginTop: 12 }}>
          {results.map((r, idx) => (
            <div key={idx} className="result">
              <img src={r.s3FrameUrl} alt={`frame-${idx}`} />
              <div>Time: {(r.timestampMs/1000).toFixed(1)}s</div>
              <div>Similarity: {r.similarity?.toFixed(1) ?? '—'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
