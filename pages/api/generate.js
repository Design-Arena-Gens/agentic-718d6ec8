const generateAndUploadVideo = require('../../scripts/generate-video');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await generateAndUploadVideo();

    return res.status(200).json({
      success: true,
      message: 'Video generated and uploaded successfully',
      ...result
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate video'
    });
  }
}
