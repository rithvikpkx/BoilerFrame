const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

function extractFrame(inputPath, outputPath, timeSeconds) {
  return new Promise((resolve, reject) => {
    // Ensure output dir exists
    const dir = require('path').dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    ffmpeg(inputPath)
      .screenshots({
        timestamps: [timeSeconds],
        filename: require('path').basename(outputPath),
        folder: dir,
        size: '640x?'
      })
      .on('end', () => resolve(outputPath))
      .on('error', reject);
  });
}

module.exports = { extractFrame };
