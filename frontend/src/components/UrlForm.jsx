import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UrlForm({ onSubmit, editingUrl, setEditingUrl }) {
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editingUrl) {
      setFormData({
        url: editingUrl.url,
        title: editingUrl.title || '',
        description: editingUrl.description || ''
      });
    }
  }, [editingUrl]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.url) {
      alert('Please enter a URL');
      return;
    }

    try {
      setSubmitting(true);

      if (editingUrl) {
        // Update existing URL
        await axios.put(`/api/urls/${editingUrl._id}`, formData);
        alert('URL updated successfully!');
      } else {
        // Create new URL
        await axios.post('/api/urls', formData);
        alert('URL saved successfully!');
      }

      resetForm();
      onSubmit();
    } catch (error) {
      console.error('Error saving URL:', error);
      alert('Failed to save URL: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      url: '',
      title: '',
      description: ''
    });
    setEditingUrl(null);
  };

  return (
    <div className="url-form-section">
      <h2>{editingUrl ? 'Edit URL' : 'Add New URL'}</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>URL *</label>
          <input
            type="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            placeholder="https://example.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter a title (optional)"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter a description (optional)"
            rows="3"
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Saving...' : editingUrl ? 'Update URL' : 'Save URL'}
          </button>
          
          {editingUrl && (
            <button type="button" onClick={resetForm} className="btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default UrlForm;
