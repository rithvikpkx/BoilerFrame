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

  const steps = [
    { key: 'started', label: 'Queued & uploading' },
    { key: 'processing', label: 'Indexing & searching' },
    { key: 'succeeded', label: 'Frames extracted' }
  ];
  const activeIndex = (() => {
    if (status === 'succeeded') return 2;
    if (status === 'failed') return 1;
    if (status === 'processing' || status === 'IN_PROGRESS') return 1;
    if (status === 'started') return 0;
    return 0;
  })();

  return (
    <div className="panel">
      <div className="panel-heading">
        <div className="panel-actions">
          <button className="btn-ghost" onClick={onBack}>← Back</button>
          <span className="pill pill-ghost">Job ID {jobId}</span>
        </div>
        <h3>Job status</h3>
        <p className="muted">We’re syncing to S3, running Rekognition, and extracting frames. Keep this tab open — results stream in live.</p>
      </div>

      <div className="status-row">
        <div className="status-icon">
          {status !== 'succeeded' && status !== 'failed' ? (
            <div className="spinner" aria-hidden="true" />
          ) : (
            <div className={`status-dot ${status === 'succeeded' ? 'ok' : 'warn'}`} />
          )}
        </div>
        <div>
          <div className="status-title">{friendlyStatus(status)}</div>
          <div className="status-meta">Elapsed {elapsedSec}s • Attempts {attempts} • Poll {Math.max(1, (delayMs/1000).toFixed(0))}s</div>
          {error && <div className="msg">Error: {error}</div>}
        </div>
      </div>

      <div className="timeline">
        {steps.map((step, idx) => (
          <div key={step.key} className={`timeline-step ${idx <= activeIndex ? 'active' : ''}`}>
            <div className="timeline-marker" />
            <div>
              <div className="timeline-label">{step.label}</div>
              <div className="timeline-sub">
                {idx === 0 && 'Uploading assets & creating Rekognition collection'}
                {idx === 1 && 'Indexing faces and scanning video'}
                {idx === 2 && 'Storing frames & similarity scores'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {(status !== 'succeeded' && status !== 'failed') && (
        <div className="progress">
          <div className="progress-bar" />
        </div>
      )}

      {results.length > 0 && (
        <div className="panel-sub">
          <div className="panel-sub-header">
            <div>
              <p className="eyebrow small">Live matches</p>
              <div className="status-title">{results.length} frame{results.length === 1 ? '' : 's'} matched so far</div>
            </div>
            <span className="pill">{(elapsedMs/1000).toFixed(1)}s total</span>
          </div>
          <div className="results-grid dense">
            {results.map((r, idx) => (
              <div key={idx} className="result">
                <img src={r.s3FrameUrl} alt={`frame-${idx}`} />
                <div className="result-meta">
                  <span>{(r.timestampMs/1000).toFixed(1)}s</span>
                  <span className="pill small">Sim {r.similarity?.toFixed(1) ?? '—'}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
