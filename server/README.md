# BoilerFrame — Server

Server is an Express app that accepts a video and photos, uploads them to S3, creates a Rekognition collection, indexes faces, starts a face search on the uploaded video, polls for results, extracts frames using ffmpeg and stores frames in S3. Results are saved to MongoDB.

Requirements
- Node 18+
- MongoDB
- AWS credentials with permissions for S3 and Rekognition
- ffmpeg installed on the host machine (used by fluent-ffmpeg)

Environment
Copy `.env.example` to `.env` and fill in values.

Run
Install dependencies:

```bash
cd server
npm install
```

Start server:

```bash
npm run dev
```

Worker
-----
The worker processes Rekognition video results and performs the heavy work (download video, extract frames with ffmpeg, upload frames to S3, update MongoDB). Run the worker in a separate terminal or as a background service:

```bash
cd server
node worker/processJobs.js
```

The worker polls MongoDB for jobs with status `started`. You can control poll frequency with `WORKER_POLL_INTERVAL_MS` in your `.env` (default 5000 ms).

Notes
- This repo ships a simple worker that polls the DB for started jobs — it's a minimal step toward an async architecture. For production use you should replace polling with an event-driven workflow (Rekognition -> SNS -> SQS -> worker) which is more robust and scales better.

Docker / docker-compose (quick local dev)
---------------------------------------
You can run MongoDB, the server, and the worker using Docker Compose. This builds the server image (includes ffmpeg) and mounts the server code for live development.

Prerequisites
- Docker and Docker Compose installed
- Set the following environment variables in your shell or in a `.env` file at the repo root (used by docker-compose): `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_PREFIX`.

Quick start

```bash
# from repository root
docker-compose up --build
```

This starts three services:
- `mongo` on port 27017
- `server` on port 4000
- `worker` (processJobs background worker)

If you'd rather run containers but keep credentials tidy, use the helper script `server/aws-cli/patch-env.sh` after you've created AWS credentials with the CLI helper in `server/aws-cli`.

Notes
- The server image installs `ffmpeg` so frame extraction works inside the container.
- The server and worker mount `./server` into the container so code changes are reflected without rebuilding the image.
- For production, don't mount source over the image and use a production start command.

Notes
- This is a minimal demo implementation. For production, long-running Rekognition jobs should be processed asynchronously (SNS + Lambda or a worker) instead of blocking an HTTP request.
- Ensure your S3 bucket exists and the IAM user has access to Rekognition and S3.
