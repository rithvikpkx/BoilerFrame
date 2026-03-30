# BoilerFrame

Detect a target person in uploaded videos using reference photos and AWS Rekognition.

## Overview
BoilerFrame is a full-stack web application that allows users to upload a video and photos of a target individual. The app processes the video and uses AWS Rekognition to identify the timestamps and frames where that person appears.

## Demo
[Add screenshots or GIF here]

## Features
- Upload videos and reference images
- Process media asynchronously
- Detect appearances of a target person
- Return timestamps and extracted frames
- Full-stack architecture with separate frontend and backend

## Tech Stack
- Frontend: React
- Backend: Node.js / Express
- AI/Cloud: AWS Rekognition
- Other: Docker, worker jobs, etc.

## How It Works
1. User uploads a video and reference images
2. Backend stores and queues the job
3. Worker processes frames / segments
4. AWS Rekognition compares faces
5. App returns matched frames and timestamps

## Repository Structure
client/ - frontend  
server/ - API and worker logic  
test-data/ - sample files  

## Local Setup
### 1. Clone the repo
### 2. Install dependencies
### 3. Configure environment variables
### 4. Start backend
### 5. Start worker
### 6. Start frontend

## Environment Variables
List them clearly here.

## Challenges / Lessons Learned
Talk about building end-to-end, async workflows, AI tool usage, and technical tradeoffs.

## Future Improvements
- Better UI/UX
- Cloud deployment
- Faster video processing
- Multi-person search
- Improved result visualization
