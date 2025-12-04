import React, { useState } from 'react';
import axios from 'axios';

export default function UploadForm({ onStart, onComplete }) {
  const [video, setVideo] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!video || photos.length === 0) {
      setMessage('Please provide a video and at least one photo');
      return;
    }
    setLoading(true);
    setMessage(null);
    const fd = new FormData();
    fd.append('video', video);
    for (let i = 0; i < photos.length; i++) fd.append('photos', photos[i]);

    try {
      // Use relative path so CRA dev proxy (or same-origin) handles the request
      const resp = await axios.post('/api/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      // server returns jobId and rekognitionJobId
      const jobId = resp.data.jobId;
      if (!jobId) {
        setMessage('No job id returned from server');
        setLoading(false);
        return;
      }

      // Notify parent to navigate to job status page
      if (typeof onStart === 'function') onStart(jobId);
    } catch (err) {
      setMessage(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="panel form" onSubmit={submit}>
      <div className="panel-heading">
        <p className="eyebrow">Upload &amp; search</p>
        <h3>Find a person in video</h3>
      </div>

      <div className="field">
        <div className="field-top">
          <span>Video (MP4)</span>
          <span className="hint">Max a few hundred MB for faster testing</span>
        </div>
        <label className="dropzone">
          <div className="drop-icon">MP4</div>
          <div>
            <div className="drop-title">{video ? 'Replace video' : 'Drag & drop or browse'}</div>
            <div className="drop-sub">High-quality works best. MP4 recommended.</div>
          </div>
          <input className="file-input" type="file" accept="video/*" onChange={e => setVideo(e.target.files[0])} />
        </label>
        {video && (
          <div className="chip-row">
            <span className="chip">{video.name}</span>
          </div>
        )}
      </div>

      <div className="field">
        <div className="field-top">
          <span>Target photos (one or more)</span>
          <span className="hint">Close-up, well-lit faces work best</span>
        </div>
        <label className="dropzone">
          <div className="drop-icon">IMG</div>
          <div>
            <div className="drop-title">{photos.length ? 'Add more photos' : 'Drag & drop or browse'}</div>
            <div className="drop-sub">Select several angles to improve recall.</div>
          </div>
          <input className="file-input" type="file" accept="image/*" multiple onChange={e => setPhotos(Array.from(e.target.files))} />
        </label>
        {photos.length > 0 && (
          <div className="chip-row">
            {photos.map((p) => (
              <span key={p.name} className="chip subtle">{p.name}</span>
            ))}
          </div>
        )}
      </div>

      <div className="actions">
        <button type="submit" className="btn" disabled={loading}>
          <span>{loading ? 'Searching…' : 'Start search'}</span>
          {!loading && <span className="btn-glow" aria-hidden="true" />}
        </button>
        <div className="actions-meta">
          <span className="pill pill-ghost">Cloud-powered</span>
          <span className="pill pill-ghost">Secure uploads</span>
        </div>
      </div>

      {message && <div className="msg">{message}</div>}
    </form>
  );
}
