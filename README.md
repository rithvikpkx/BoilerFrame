# BoilerFrame

BoilerFrame is a minimal MERN demo app that lets users upload a video and photos of a target person, then uses AWS Rekognition to find timestamps and frames where that person appears.

This repository contains two folders: `server` and `client`.

Quick dev flow
- Prepare AWS credentials and an S3 bucket (see `server/aws-cli` helper for CLI artifacts and `server/README.md` for details).
- Install Docker and Docker Compose (optional but recommended for a consistent local environment).
- Use the helper script below to start the development environment.

Files and folders
- `server/` — Express server, worker, Dockerfile, and AWS helper scripts.
- `client/` — React frontend.
- `docker-compose.yml` — starts MongoDB, server and worker for local dev.

See `server/README.md` for the worker and AWS specifics and `client/README.md` for client instructions.

Start locally (one-liner)
1. Ensure you have Docker and Docker Compose installed.
2. Copy `.env.example` at repo root to `.env` and fill the AWS variables, or export them in your shell.

```bash
# from repo root
chmod +x start-dev.sh
./start-dev.sh
```

Note: I cannot run these commands from here. The `start-dev.sh` script (added to the repo) will check basic preconditions and start Docker Compose. Review the script before running.

