import React from 'react';

function UrlList({ urls, loading, onEdit, onDelete }) {
  if (loading) {
    return <div className="loading">Loading URLs...</div>;
  }

  if (urls.length === 0) {
    return (
      <div className="url-list">
        <h2>Saved URLs</h2>
        <p className="no-urls">No URLs saved yet. Add your first URL above!</p>
      </div>
    );
  }

  return (
    <div className="url-list">
      <h2>Saved URLs ({urls.length})</h2>

      <div className="urls-grid">
        {urls.map((url) => (
          <div key={url._id} className="url-card">
            <div className="url-header">
              <h3>{url.title || 'Untitled'}</h3>
              <span className="url-date">
                {new Date(url.createdAt).toLocaleDateString()}
              </span>
            </div>

            <a 
              href={url.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="url-link"
            >
              {url.url}
            </a>

            {url.description && (
              <p className="url-description">{url.description}</p>
            )}

            <div className="url-actions">
              <button onClick={() => onEdit(url)} className="btn-edit">
                Edit
              </button>
              <button onClick={() => onDelete(url._id)} className="btn-delete">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UrlList;
