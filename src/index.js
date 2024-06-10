const fs = require('fs');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

async function downloadYouTubeAsMp3(url, outputPath) {
  try {
    const info = await ytdl.getInfo(url);
    const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
    const outputFilePath = path.join(outputPath, `${info.videoDetails.title}.mp3`);

    await new Promise((resolve, reject) => {
      ffmpeg(ytdl(url, { format: audioFormat }))
        .audioBitrate(128)
        .save(outputFilePath)
        .on('end', () => resolve())
        .on('error', (error) => reject(error));
    });

    console.log(`Downloaded and converted: ${outputFilePath}`);
    return outputFilePath;
  } catch (error) {
    console.error(`An error occurred with URL ${url}: ${error.message}`);
    return null;
  }
}

async function downloadFromFile(filePath, outputPath) {
  const urls = fs
    .readFileSync(filePath, 'utf-8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));

  for (const url of urls) {
    await downloadYouTubeAsMp3(url, outputPath);
  }
}

if (require.main === module) {
  const filePath = 'urls.txt'; // Replace with the path to your text file containing URLs
  const outputPath = 'mp3'; // Replace with your desired output path

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath);
  }

  downloadFromFile(filePath, outputPath).then(() => {
    console.log('All downloads completed.');
  }).catch((error) => {
    console.error('Error during downloads:', error);
  });
}
