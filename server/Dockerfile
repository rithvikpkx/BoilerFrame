FROM node:18-slim

# Install ffmpeg and other lightweight deps
RUN apt-get update && apt-get install -y ffmpeg ca-certificates curl && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copy package.json first to install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of server sources
COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]
