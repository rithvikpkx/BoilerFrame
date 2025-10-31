const express = require('express');
const multer = require('multer');
const { s3, rekognition } = require('../awsClient');
const uuid = require('uuid').v4;
const path = require('path');
const fs = require('fs');
const Job = require('../models/Job');

const router = express.Router();

const upload = multer({ dest: path.join(__dirname, '..', 'tmp') });

// Helper: upload buffer/file to S3
function uploadToS3(Key, Body, ContentType) {
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key,
    Body,
    ContentType
  };
  return s3.upload(params).promise();
}

// POST /api/upload
// This route now only uploads images/video, indexes faces, starts Rekognition job and returns job id immediately.
router.post('/', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'photos', maxCount: 8 }]), async (req, res) => {
  try {
    if (!req.files || !req.files.video || !req.files.photos) {
      return res.status(400).json({ error: 'video and at least one photo required' });
    }

    const videoFile = req.files.video[0];
    const photos = req.files.photos;
    const collectionId = `boilerframe-${uuid()}`;

    // Create Rekognition collection
    await rekognition.createCollection({ CollectionId: collectionId }).promise();

    // Upload photos and index faces
    for (const p of photos) {
      const fileStream = fs.createReadStream(p.path);
      const key = `${process.env.S3_PREFIX || 'boilerframe'}/images/${collectionId}/${p.originalname}`;
      await uploadToS3(key, fileStream, p.mimetype);

      // Index face from S3
      await rekognition.indexFaces({
        CollectionId: collectionId,
        Image: { S3Object: { Bucket: process.env.S3_BUCKET, Name: key } },
        ExternalImageId: p.originalname
      }).promise();
    }

    // Upload video
    const videoKey = `${process.env.S3_PREFIX || 'boilerframe'}/videos/${collectionId}/${videoFile.originalname}`;
    const videoStream = fs.createReadStream(videoFile.path);
    await uploadToS3(videoKey, videoStream, videoFile.mimetype);

    // Start face search job with Rekognition
    const startResp = await rekognition.startFaceSearch({
      Video: { S3Object: { Bucket: process.env.S3_BUCKET, Name: videoKey } },
      CollectionId: collectionId
    }).promise();

    const rekJobId = startResp.JobId;

    // Save job document immediately with status 'started'
    const jobDoc = new Job({
      collectionId,
      videoS3Key: videoKey,
      rekognitionJobId: rekJobId,
      photos: photos.map(p => p.originalname),
      status: 'started'
    });
    await jobDoc.save();

    // Cleanup tmp uploaded files
    for (const p of photos) {
      try { fs.unlinkSync(p.path); } catch (e) {}
    }
    try { fs.unlinkSync(videoFile.path); } catch (e) {}

    // Return quickly to client with the job id
    return res.json({ jobId: jobDoc._id.toString(), rekognitionJobId: rekJobId, message: 'Job started' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'internal' });
  }
});

module.exports = router;
