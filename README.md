# BoilerFrame

## Description
BoilerFrame is a simple webapp that lets users upload a video and photos of a target person, then uses AWS Rekognition to find timestamps and frames where that person appears.

## Running
Note: For simple testing purposes this can be easily run on localhost. I haven't hosted this on the web.

Files and folders
- `server/` — Express server and worker
- `client/` — React frontend

`
// Start up the server
server $ npm install && npm run dev

// Start the worker program to handle search jobs
server $ node worker/processJobs.js

// Start up the client
client $ npm start
`

## Development 
I developed this as part of the Purdue Launchpad club. The main goal was to gain some experience with the MERN stack.
I aim to continue making such web applications as I learn more.
