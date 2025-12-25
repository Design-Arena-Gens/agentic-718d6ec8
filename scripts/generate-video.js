require('dotenv').config();
const path = require('path');
const fs = require('fs');

const SheetsManager = require('../lib/sheets');
const ScriptGenerator = require('../lib/script-generator');
const AudioGenerator = require('../lib/audio-generator');
const ImageGenerator = require('../lib/image-generator');
const BRollFetcher = require('../lib/broll-fetcher');
const VideoEditor = require('../lib/video-editor');
const YouTubeUploader = require('../lib/youtube-uploader');

async function generateAndUploadVideo() {
  console.log('🚀 Starting YouTube Shorts automation...');

  const sheetsManager = new SheetsManager();
  const scriptGenerator = new ScriptGenerator();
  const audioGenerator = new AudioGenerator();
  const imageGenerator = new ImageGenerator();
  const brollFetcher = new BRollFetcher();
  const videoEditor = new VideoEditor();
  const youtubeUploader = new YouTubeUploader();

  try {
    // Step 1: Initialize services
    console.log('📊 Initializing Google Sheets...');
    await sheetsManager.initialize();

    console.log('🎬 Initializing YouTube uploader...');
    await youtubeUploader.initialize();

    // Step 2: Get next topic
    console.log('📝 Fetching next video topic...');
    const topicData = await sheetsManager.getNextTopic();

    if (!topicData) {
      console.log('❌ No topics available to process.');
      return;
    }

    const { topic, rowIndex } = topicData;
    console.log(`✅ Topic found: "${topic}" (Row ${rowIndex})`);

    // Mark as processing
    await sheetsManager.markTopicProcessed(rowIndex, new Date().toISOString());

    // Step 3: Generate script
    console.log('✍️ Generating script with ChatGPT...');
    const script = await scriptGenerator.generateScript(topic);
    console.log(`✅ Script generated (${script.length} characters)`);

    // Step 4: Extract keywords for B-roll
    const keywords = scriptGenerator.parseScriptForKeywords(script);
    console.log(`🔑 Extracted keywords: ${keywords.join(', ')}`);

    // Create temp directory
    const tempDir = path.join(process.cwd(), 'temp', Date.now().toString());
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Step 5: Generate voiceover (parallel with images)
    console.log('🎙️ Generating voiceover with ElevenLabs...');
    const audioPath = path.join(tempDir, 'voiceover.mp3');
    const audioPromise = audioGenerator.generateVoiceover(script, audioPath);

    // Step 6: Generate AI images (parallel with audio)
    console.log('🎨 Generating AI images with Leonardo.ai...');
    const imageDir = path.join(tempDir, 'images');
    const imagePromise = imageGenerator.generateImages(script, imageDir);

    // Step 7: Fetch B-roll videos (parallel)
    console.log('🎥 Fetching B-roll videos from Pexels...');
    const brollDir = path.join(tempDir, 'broll');
    const brollPromise = brollFetcher.fetchVideos(keywords, brollDir);

    // Wait for all parallel operations
    const [audioFile, imagePaths, brollPaths] = await Promise.all([
      audioPromise,
      imagePromise,
      brollPromise
    ]);

    console.log(`✅ Audio generated: ${audioFile}`);
    console.log(`✅ Images generated: ${imagePaths.length} images`);
    console.log(`✅ B-roll fetched: ${brollPaths.length} videos`);

    // Save URLs to sheet
    await sheetsManager.saveAudioUrl(rowIndex, audioFile);
    await sheetsManager.saveImageUrls(rowIndex, imagePaths);

    // Step 8: Compose final video
    console.log('🎬 Composing final video...');
    const outputVideoPath = path.join(tempDir, 'final_video.mp4');
    await videoEditor.composeFullVideo(
      imagePaths,
      audioFile,
      brollPaths,
      script,
      outputVideoPath
    );

    console.log(`✅ Final video created: ${outputVideoPath}`);

    // Step 9: Upload to YouTube
    console.log('📤 Uploading to YouTube...');
    const title = youtubeUploader.generateTitle(topic);
    const description = youtubeUploader.generateDescription(script, topic);
    const tags = youtubeUploader.generateTags(topic, keywords);

    const uploadResult = await youtubeUploader.uploadVideo(
      outputVideoPath,
      title,
      description,
      tags
    );

    console.log(`✅ Video uploaded successfully!`);
    console.log(`🎉 Video URL: ${uploadResult.url}`);

    // Save video URL to sheet
    await sheetsManager.saveVideoUrl(rowIndex, uploadResult.url);

    // Cleanup temp directory
    console.log('🧹 Cleaning up temporary files...');
    fs.rmSync(tempDir, { recursive: true, force: true });

    console.log('✨ Automation completed successfully!');

  } catch (error) {
    console.error('❌ Error during automation:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  generateAndUploadVideo()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = generateAndUploadVideo;
