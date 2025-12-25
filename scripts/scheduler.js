require('dotenv').config();
const cron = require('node-cron');
const generateAndUploadVideo = require('./generate-video');

console.log('🕐 YouTube Shorts Automation Scheduler Starting...');
console.log(`📅 Scheduled to run daily at 2 PM UTC`);

// Schedule for 2 PM UTC every day
// Cron format: minute hour day month weekday
const schedule = '0 14 * * *'; // 0 minutes, 14th hour (2 PM), every day

cron.schedule(schedule, async () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎬 Scheduled task triggered at ${new Date().toISOString()}`);
  console.log('='.repeat(60));

  try {
    await generateAndUploadVideo();
  } catch (error) {
    console.error('❌ Scheduled task failed:', error);
  }
}, {
  timezone: process.env.CRON_TIMEZONE || 'UTC'
});

console.log('✅ Scheduler is running. Press Ctrl+C to stop.');

// Keep the process alive
process.stdin.resume();
