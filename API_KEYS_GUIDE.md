# 🔑 API Keys Guide - Raneem Althaqafi Portfolio

## Required API Keys

### 1. OpenAI API Key
- **Variable**: `OPENAI_API_KEY`
- **Used for**: Chat AI, Speech-to-Text, Image Generation
- **How to get**: 
  1. Go to [OpenAI Platform](https://platform.openai.com/)
  2. Sign up/Log in
  3. Go to API Keys section
  4. Create a new secret key
  5. **Important**: Set up billing for GPT-4 access
- **Example**: `sk-...` (starts with 'sk-')

### 2. Eleven Labs API Key
- **Variable**: `ELEVENLABS_API_KEY`
- **Used for**: Arabic Text-to-Speech
- **How to get**:
  1. Go to [Eleven Labs](https://elevenlabs.io/)
  2. Sign up/Log in
  3. Go to Settings → API Keys
  4. Generate a new API key
- **Example**: `your-api-key-here`

### 3. Eleven Labs Voice ID
- **Variable**: `ELEVENLABS_VOICE_ID`
- **Used for**: Choosing specific voice for TTS
- **How to get**:
  1. Go to Eleven Labs Voice Library
  2. Browse available voices
  3. Choose an Arabic-capable voice
  4. Copy the Voice ID
- **Example**: `pNInz6obpgDQGcFmaJgB`

### 4. Gmail Configuration
- **Variables**: `SMTP_USER`, `SMTP_PASS`, `CONTACT_EMAIL`
- **Used for**: Contact form emails
- **How to set up**:
  1. Enable 2-factor authentication on Gmail
  2. Go to Google Account Settings
  3. Security → App Passwords
  4. Generate a 16-character app password
  5. Use this password, not your regular Gmail password

## Quick Setup Template

Create `.env.local` file with:

```env
# OpenAI
OPENAI_API_KEY=sk-your-openai-key-here

# Eleven Labs
ELEVENLABS_API_KEY=your-elevenlabs-key-here
ELEVENLABS_VOICE_ID=your-voice-id-here

# Gmail
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-16-char-app-password
CONTACT_EMAIL=raneem.althaqafi@example.com
```

## Cost Estimates

- **OpenAI**: ~$10-30/month for moderate usage
- **Eleven Labs**: ~$5-15/month for voice generation
- **Gmail**: Free

## Testing Your Setup

1. Run `npm run dev`
2. Test chat feature (OpenAI)
3. Test contact form (Gmail)
4. Test voice features (Eleven Labs)

## Security Notes

- Never commit `.env.local` to Git
- Use different keys for development/production
- Monitor API usage regularly
- Rotate keys periodically 