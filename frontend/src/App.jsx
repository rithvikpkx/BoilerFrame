import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UrlForm from './components/UrlForm';
import UrlList from './components/UrlList';

function App() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUrl, setEditingUrl] = useState(null);

  // Fetch all URLs
  const fetchUrls = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/urls');
      setUrls(response.data);
    } catch (error) {
      console.error('Error fetching URLs:', error);
      alert('Failed to load URLs');
    } finally {
      setLoading(false);
    }
  };

  // Load URLs on mount
  useEffect(() => {
    fetchUrls();
  }, []);

  // Handle form submission (create or update)
  const handleSubmit = () => {
    fetchUrls();
    setEditingUrl(null);
  };

  // Handle edit
  const handleEdit = (url) => {
    setEditingUrl(url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this URL?')) {
      return;
    }

    try {
      await axios.delete(`/api/urls/${id}`);
      alert('URL deleted successfully');
      fetchUrls();
    } catch (error) {
      console.error('Error deleting URL:', error);
      alert('Failed to delete URL');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>BoilerFrame</h1>
      </header>

      <main className="app-main">
        <UrlForm 
          onSubmit={handleSubmit} 
          editingUrl={editingUrl}
          setEditingUrl={setEditingUrl}
        />
        <UrlList 
          urls={urls} 
          loading={loading} 
          onEdit={handleEdit}
          onDelete={handleDelete} 
        />
      </main>
    </div>
  );
}

export default App;
