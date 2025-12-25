const generateAndUploadVideo = require('../../scripts/generate-video');

export default async function handler(req, res) {
  // Verify Vercel Cron secret
  const authHeader = req.headers.authorization;

  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('🕐 Cron job triggered at:', new Date().toISOString());

    const result = await generateAndUploadVideo();

    return res.status(200).json({
      success: true,
      message: 'Video generated and uploaded successfully',
      timestamp: new Date().toISOString(),
      ...result
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate video',
      timestamp: new Date().toISOString()
    });
  }
}
