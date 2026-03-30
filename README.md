# BoilerFrame

> Full-stack video search application built at Purdue Launchpad. Upload a video and reference photos of a target person, then identify where that person appears using AWS Rekognition.

## Why This Project Matters

BoilerFrame was built as an end-to-end engineering project focused on a practical computer vision workflow: helping a user locate a specific person inside a longer video with minimal manual review.

The project combined:
- a React frontend for upload and results
- an Express API for ingestion and job creation
- a background worker for asynchronous processing
- AWS Rekognition and S3 for face search and media storage
- MongoDB for job tracking and result persistence

Beyond the product itself, BoilerFrame was also an experiment in modern AI-assisted development. It was built to explore how tools like Codex and Cursor can accelerate implementation, while reinforcing that strong engineering fundamentals are still what make a system reliable, debuggable, and production-minded.

## Overview

Users upload:
- one video
- one or more reference photos of a target person

BoilerFrame then:
1. uploads media to S3
2. creates and populates an AWS Rekognition face collection
3. starts an asynchronous face search job on the uploaded video
4. polls for completion through a worker process
5. extracts matching frames with `ffmpeg`
6. returns timestamps, similarity scores, and frame previews

This architecture intentionally separates request handling from long-running media processing so the application remains responsive while heavier work runs in the background.

## Highlights

- Full-stack application with separate client, API server, and worker
- Asynchronous job processing workflow for long-running video analysis
- AWS Rekognition integration for face indexing and video face search
- MongoDB-backed job state tracking
- Frame extraction pipeline using `ffmpeg`
- Recruiter-friendly project scope: frontend, backend, cloud integration, async workflows, and debugging in one system

## Tech Stack

| Layer | Tools |
| --- | --- |
| Frontend | React, Axios, Create React App |
| Backend | Node.js, Express |
| Data | MongoDB, Mongoose |
| Cloud | AWS Rekognition, Amazon S3 |
| Media Processing | `ffmpeg`, `fluent-ffmpeg` |
| Tooling | Nodemon, dotenv |

## Architecture

```text
Client (React)
  -> Upload video + photos
API Server (Express)
  -> Stores media in S3
  -> Creates Rekognition collection
  -> Starts face search job
  -> Saves job metadata in MongoDB
Worker
  -> Polls Rekognition job status
  -> Downloads video from S3
  -> Extracts frames with ffmpeg
  -> Uploads result frames to S3
  -> Persists timestamps and matches in MongoDB
Client
  -> Polls job status endpoint
  -> Displays live status and final results
```

## What I Learned

BoilerFrame reinforced a few important engineering lessons:

- Shipping an end-to-end product requires more than getting code to compile. Reliability depends on clear system boundaries, operational visibility, and debugging discipline.
- AI coding tools can accelerate scaffolding, iteration, and implementation speed, but they do not replace architectural judgment.
- Robust software still depends on fundamentals: async workflow design, error handling, dependency management, and understanding how distributed pieces fail in practice.

The biggest takeaway was straightforward: AI can be a force multiplier, but strong software engineering judgment is still what turns a functional prototype into a solid system.

## Repository Structure

```text
client/   React frontend
server/   Express API, Mongo models, worker, AWS integration
```

## Local Setup

### Prerequisites

- Node.js 18+
- MongoDB running locally or remotely
- AWS credentials with access to Rekognition and S3
- An existing S3 bucket
- `ffmpeg` installed on your machine

### Environment Variables

Create `server/.env` using `server/.env.example` as a base.

Required server values:

```bash
PORT=4000
MONGODB_URI=mongodb://localhost:27017/boilerframe
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET=your-s3-bucket-name
S3_PREFIX=boilerframe
WORKER_POLL_INTERVAL_MS=5000
```

Optional client value:

```bash
REACT_APP_API_URL=http://localhost:4000
```

Use `REACT_APP_API_URL` only if your API server is not running on the default local port.

## Running the Project

Install dependencies:

```bash
cd server
npm install
```

```bash
cd client
npm install
```

Start the server:

```bash
cd server
npm run dev
```

Start the background worker in a separate terminal:

```bash
cd server
npm run worker
```

Start the client in another terminal:

```bash
cd client
npm start
```

Then open:

```text
http://localhost:3000
```

## Basic Usage

1. Start MongoDB, the server, the worker, and the client.
2. Open the client in the browser.
3. Upload one video and one or more clear reference photos.
4. Wait for the worker to complete the Rekognition job and frame extraction.
5. Review the returned timestamps, similarity scores, and matching frames.

## Notes for Reviewers

- The worker must be running for job status to move beyond `started`.
- Long processing times depend on video size, AWS response time, and frame extraction work.
- This project was built to demonstrate full-stack ownership, cloud integration, and async backend design, not just isolated UI or API work.

## Future Improvements

- Replace polling with an event-driven pipeline using SNS/SQS
- Add richer progress tracking and failure diagnostics in the UI
- Improve batching and deduplication of extracted frames
- Support multiple target identities in a single workflow
- Add deployment infrastructure and production-grade observability

## Impact

BoilerFrame strengthened my interest in full-stack engineering and in the broader role AI can play in software development. The project showed me how quickly modern tools can help builders move, but also how much quality still depends on engineering rigor, system thinking, and careful technical decisions.
