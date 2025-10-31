require('dotenv').config();
const mongoose = require('mongoose');
const { s3, rekognition } = require('../awsClient');
const Job = require('../models/Job');
const fs = require('fs');
const path = require('path');
const uuid = require('uuid').v4;
const { extractFrame } = require('../utils/ffmpeg');

const POLL_INTERVAL = parseInt(process.env.WORKER_POLL_INTERVAL_MS || '5000', 10);

async function processJob(job) {
  console.log('Processing job', job._id.toString(), 'rekId=', job.rekognitionJobId);
  try {
    const data = await rekognition.getFaceSearch({ JobId: job.rekognitionJobId }).promise();
    if (data.JobStatus === 'IN_PROGRESS') return false; // nothing to do yet

    if (data.JobStatus === 'FAILED') {
      job.status = 'failed';
      await job.save();
      console.warn('Rekognition job failed for', job._id.toString());
      return true;
    }

    // SUCCEEDED
    const persons = data.Persons || [];
    const results = [];

    // download video locally
    const tmpDir = path.join(__dirname, '..', 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const tmpVideoPath = path.join(tmpDir, `${uuid()}-${path.basename(job.videoS3Key)}`);
    const videoWrite = fs.createWriteStream(tmpVideoPath);
    await new Promise((resolve, reject) => {
      s3.getObject({ Bucket: process.env.S3_BUCKET, Key: job.videoS3Key })
        .createReadStream()
        .on('error', reject)
        .pipe(videoWrite)
        .on('close', resolve);
    });

    for (const p of persons) {
      const timestampMs = p.Timestamp;
      const matches = p.FaceMatches || [];
      for (const m of matches) {
        const similarity = m.Similarity;
        const seconds = Math.max(0, Math.floor(timestampMs / 1000));
        const frameName = `frame-${uuid()}.jpg`;
        const localFrame = path.join(tmpDir, frameName);
        await extractFrame(tmpVideoPath, localFrame, seconds);
        const frameKey = `${process.env.S3_PREFIX || 'boilerframe'}/frames/${job.collectionId}/${frameName}`;
        const frameStream = fs.createReadStream(localFrame);
        await s3.upload({ Bucket: process.env.S3_BUCKET, Key: frameKey, Body: frameStream, ContentType: 'image/jpeg' }).promise();
        const frameUrl = s3.getSignedUrl('getObject', { Bucket: process.env.S3_BUCKET, Key: frameKey, Expires: 60 * 60 });
        results.push({ timestampMs, similarity, s3FrameKey: frameKey, s3FrameUrl: frameUrl });
        try { fs.unlinkSync(localFrame); } catch (e) {}
      }
    }

    try { fs.unlinkSync(tmpVideoPath); } catch (e) {}

    job.results = results;
    job.status = 'succeeded';
    await job.save();
    console.log('Job completed', job._id.toString(), 'matches=', results.length);
    return true;
  } catch (err) {
    console.error('Error processing job', job._id.toString(), err);
    // do not mark failed yet; allow retry
    return false;
  }
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Worker connected to MongoDB');

  while (true) {
    try {
      const jobs = await Job.find({ status: 'started' }).limit(5).exec();
      if (jobs.length === 0) {
        await new Promise(r => setTimeout(r, POLL_INTERVAL));
        continue;
      }

      for (const job of jobs) {
        await processJob(job);
      }
    } catch (err) {
      console.error('Worker loop error', err);
      await new Promise(r => setTimeout(r, POLL_INTERVAL));
    }
  }
}

run().catch(err => {
  console.error('Worker fatal error', err);
  process.exit(1);
});
