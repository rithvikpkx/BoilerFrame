const AWS = require('aws-sdk');
require('dotenv').config();

const region = process.env.AWS_REGION || 'us-east-1';
AWS.config.update({ region });

const s3 = new AWS.S3();
const rekognition = new AWS.Rekognition();

module.exports = { AWS, s3, rekognition };
