const mongoose = require('mongoose');

const FaceMatchSchema = new mongoose.Schema({
  timestampMs: Number,
  similarity: Number,
  s3FrameKey: String,
  s3FrameUrl: String
});

const JobSchema = new mongoose.Schema({
  collectionId: String,
  videoS3Key: String,
  rekognitionJobId: String,
  photos: [String],
  results: [FaceMatchSchema],
  status: { type: String, default: 'processing' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', JobSchema);
