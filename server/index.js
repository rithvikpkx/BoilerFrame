require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const uploadRouter = require('./routes/upload');
const jobsRouter = require('./routes/jobs');

const app = express();
// Allow CORS from dev server (localhost:3000) as a fallback
app.use(cors());
app.use(express.json());

app.use('/api/upload', uploadRouter);
app.use('/api/jobs', jobsRouter);

// Serve client in production (optional)
const clientBuild = path.join(__dirname, '..', 'client', 'build');
app.use(express.static(clientBuild));
app.get('/', (req, res) => {
  res.sendFile(path.join(clientBuild, 'index.html'));
});

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  })
  .catch(err => {
    console.error('Mongo connection error', err.message);
    app.listen(PORT, () => console.log(`Server listening on ${PORT} (no DB)`));
  });
