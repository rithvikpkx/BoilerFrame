import React, { useState } from 'react';
import UploadForm from './components/UploadForm';
import Results from './components/Results';
import JobStatus from './components/JobStatus';

export default function App() {
  const [results, setResults] = useState(null);
  const [jobId, setJobId] = useState(null);

  return (
    <div className="app">
      <div className="ambient ambient-1" />
      <div className="ambient ambient-2" />
      <header className="header shell">
        <div className="brand">
          <div className="brand-mark">BF</div>
          <div>
            <div className="brand-name">BoilerFrame</div>
            <div className="brand-sub">Face-aware video search</div>
          </div>
        </div>
      </header>
      <main className="main shell">
        <section className="hero">
          <div>
            <p className="eyebrow">Precision frame finder</p>
            <h1>Pinpoint appearances across every frame.</h1>
            <p className="lede">Upload a video and a few reference shots. BoilerFrame pinpoints frames, similarity scores, and timestamps with AWS Rekognition.</p>
            <div className="hero-steps">
              <span className="pill">1. Upload video</span>
              <span className="pill">2. Add reference photos</span>
              <span className="pill">3. Review matching frames</span>
            </div>
          </div>
        </section>

        <section className="panel-wrap">
          {!jobId && !results && (
            <UploadForm
              onStart={(jid) => setJobId(jid)}
              onComplete={(r) => setResults(r)}
            />
          )}

          {jobId && !results && (
            <JobStatus
              jobId={jobId}
              onComplete={(r) => { setResults(r); setJobId(null); }}
              onBack={() => setJobId(null)}
            />
          )}

          {results && (
            <Results results={results} onBack={() => { setResults(null); setJobId(null); }} />
          )}
        </section>
      </main>
    </div>
  );
}
