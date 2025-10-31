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
    <form className="card" onSubmit={submit}>
      <h2>Find a person in video</h2>
      <label className="field">Video (MP4)
        <input type="file" accept="video/*" onChange={e => setVideo(e.target.files[0])} />
      </label>
      <label className="field">Target photos (one or more)
        <input type="file" accept="image/*" multiple onChange={e => setPhotos(Array.from(e.target.files))} />
      </label>
      <div className="actions">
        <button type="submit" className="btn" disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
      </div>
      {message && <div className="msg">{message}</div>}
    </form>
  );
}
