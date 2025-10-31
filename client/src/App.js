import React, { useState } from 'react';
import UploadForm from './components/UploadForm';
import Results from './components/Results';
import JobStatus from './components/JobStatus';

export default function App() {
  const [results, setResults] = useState(null);
  const [jobId, setJobId] = useState(null);

  return (
    <div className="app">
      <header className="header">BoilerFrame</header>
      <main className="main">
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
      </main>
    </div>
  );
}
