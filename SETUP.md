# YouTube Shorts Automation - Setup Guide

Complete setup instructions for deploying the YouTube Shorts automation system.

## Prerequisites

1. Node.js 18+ installed
2. FFmpeg installed
3. Vercel account
4. Google Cloud account
5. API accounts (OpenAI, ElevenLabs, Leonardo.ai, Pexels)

## Step-by-Step Setup

### 1. API Keys Setup

#### OpenAI API
1. Go to https://platform.openai.com/api-keys
2. Create new API key
3. Copy the key (starts with `sk-`)

#### ElevenLabs API
1. Sign up at https://elevenlabs.io/
2. Go to Profile > API Keys
3. Create new API key
4. Free tier: 10,000 characters/month

#### Leonardo.ai API
1. Sign up at https://leonardo.ai/
2. Go to API section
3. Generate API key
4. Free tier includes daily credits

#### Pexels API
1. Sign up at https://www.pexels.com/
2. Go to https://www.pexels.com/api/
3. Request API key (completely free, no limits)

### 2. Google Sheets Setup

#### Create Service Account
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable Google Sheets API
4. Go to "Credentials" > "Create Credentials" > "Service Account"
5. Create service account and download JSON key file
6. Copy the entire JSON content for `GOOGLE_SHEETS_CREDENTIALS`

#### Create Sheet
1. Create a new Google Sheet
2. Name it: `YouTube_Shorts_Ideas`
3. Set up columns:
   - Column A: Topic
   - Column B: Processed Timestamp
   - Column C: Audio URL
   - Column D: Image URLs
   - Column E: Video URL
4. Add topics in Column A (one per row)
5. Share the sheet with service account email (found in JSON)
6. Give "Editor" permissions
7. Copy the Spreadsheet ID from the URL

### 3. YouTube API Setup

#### Create OAuth Credentials
1. Go to https://console.cloud.google.com/apis/credentials
2. Enable YouTube Data API v3
3. Create OAuth 2.0 Client ID
4. Application type: Web application
5. Add redirect URI: `http://localhost:3000/oauth2callback`
6. Download client credentials

#### Get Refresh Token

Create a file `scripts/get-youtube-token.js`:

```javascript
const { google } = require('googleapis');
const readline = require('readline');

const oauth2Client = new google.auth.OAuth2(
  'YOUR_CLIENT_ID',
  'YOUR_CLIENT_SECRET',
  'http://localhost:3000/oauth2callback'
);

const scopes = ['https://www.googleapis.com/auth/youtube.upload'];
const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
});

console.log('Authorize this app by visiting:', url);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the code from that page here: ', async (code) => {
  rl.close();
  const { tokens } = await oauth2Client.getToken(code);
  console.log('Refresh Token:', tokens.refresh_token);
});
```

Run it:
```bash
node scripts/get-youtube-token.js
```

### 4. Local Environment Setup

Create `.env` file:

```env
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...
LEONARDO_API_KEY=...
PEXELS_API_KEY=...
YOUTUBE_CLIENT_ID=...
YOUTUBE_CLIENT_SECRET=...
YOUTUBE_REFRESH_TOKEN=...
GOOGLE_SHEETS_CREDENTIALS={"type":"service_account",...}
SPREADSHEET_ID=1a2b3c4d...
CRON_TIMEZONE=UTC
CRON_SECRET=generate_random_string_here
```

### 5. Install Dependencies

```bash
npm install
```

### 6. Test Locally

```bash
npm run generate-video
```

This will:
1. Fetch next topic from Google Sheet
2. Generate script
3. Create voiceover
4. Generate images
5. Fetch B-roll
6. Compose video
7. Upload to YouTube

### 7. Deploy to Vercel

#### Install Vercel CLI
```bash
npm i -g vercel
```

#### Login
```bash
vercel login
```

#### Add Environment Variables
```bash
vercel env add OPENAI_API_KEY
vercel env add ELEVENLABS_API_KEY
vercel env add LEONARDO_API_KEY
vercel env add PEXELS_API_KEY
vercel env add YOUTUBE_CLIENT_ID
vercel env add YOUTUBE_CLIENT_SECRET
vercel env add YOUTUBE_REFRESH_TOKEN
vercel env add GOOGLE_SHEETS_CREDENTIALS
vercel env add SPREADSHEET_ID
vercel env add CRON_SECRET
```

For each, select: `production`, `preview`, and `development`

#### Deploy
```bash
vercel --prod
```

### 8. Verify Cron Job

1. Go to Vercel dashboard
2. Select your project
3. Go to "Cron Jobs" tab
4. Verify `/api/cron` is scheduled for "0 14 * * *"
5. Check logs after 2 PM UTC

### 9. Test Manual Trigger

Visit: `https://your-app.vercel.app`

Click "Generate Video Now" button

## Troubleshooting

### FFmpeg Not Found
**Error**: `FFmpeg/avconv not found!`

**Solution**:
```bash
# Ubuntu/Debian
apt-get install ffmpeg

# macOS
brew install ffmpeg

# Vercel: FFmpeg is pre-installed
```

### ElevenLabs Character Limit
**Error**: `Character limit exceeded`

**Solution**: Upgrade to paid plan or reduce script length

### Leonardo.ai Credits Exhausted
**Error**: `Insufficient credits`

**Solution**: Wait for daily credit reset or upgrade

### YouTube Upload Failed
**Error**: `Invalid credentials`

**Solution**: Re-generate refresh token

### Google Sheets Permission Denied
**Error**: `Permission denied`

**Solution**:
1. Share sheet with service account email
2. Give "Editor" permissions
3. Verify credentials JSON is correct

### Vercel Function Timeout
**Error**: `Function execution timed out`

**Solution**: Already configured to 300 seconds in `vercel.json`

## Cost Estimates

- **OpenAI**: ~$0.01 per video (GPT-4)
- **ElevenLabs**: Free tier (10K chars/month) = ~15 videos
- **Leonardo.ai**: Free daily credits
- **Pexels**: Completely free
- **Vercel**: Free tier sufficient
- **YouTube**: Free

**Total monthly cost (30 videos)**: ~$0.30 + API overages

## Scaling Recommendations

### For High Volume (>30 videos/day)

1. **Upgrade APIs**:
   - ElevenLabs: Professional plan ($99/mo)
   - Leonardo.ai: Paid credits
   - OpenAI: Set spending limits

2. **Use Cloud Storage**:
   - Store videos in S3/R2
   - Reference URLs instead of temp files

3. **Implement Queue System**:
   - Use Vercel KV for job queue
   - Process videos sequentially

4. **Add Error Handling**:
   - Retry failed uploads
   - Email notifications on failures
   - Webhook integration

## Security Best Practices

1. **Never commit `.env` file**
2. **Rotate API keys regularly**
3. **Use Vercel environment secrets**
4. **Secure cron endpoint** with `CRON_SECRET`
5. **Limit Google Sheets access** to service account only
6. **Monitor API usage** for unauthorized access

## Support

For issues:
1. Check Vercel function logs
2. Review API quota/limits
3. Test locally with `npm run generate-video`
4. Check Google Sheets for processing status

## Next Steps

1. Add more topics to Google Sheet
2. Customize script prompts in `lib/script-generator.js`
3. Adjust video style in `lib/video-editor.js`
4. Monitor YouTube analytics
5. Scale up as needed
