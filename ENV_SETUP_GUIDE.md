# Environment Variables Setup Guide
## Raneem Althaqafi Portfolio Website

This guide explains how to set up all the required API keys and environment variables for the AI-powered portfolio website.

## 📋 Quick Setup Instructions

1. **Create `.env.local` file** in your project root directory
2. **Copy the template below** into your `.env.local` file
3. **Replace all placeholder values** with your actual API keys
4. **Never commit** `.env.local` to version control

## 🔑 Required Environment Variables

### OpenAI Configuration (REQUIRED)
```env
OPENAI_API_KEY=your_openai_api_key_here
```
- **Used for**: Chat AI, Speech-to-Text (Whisper), Image Generation (DALL-E)
- **Get your key**: [OpenAI API Keys](https://platform.openai.com/api-keys)
- **Cost**: Pay-per-use (GPT-4 chat, Whisper STT, DALL-E image generation)

### Eleven Labs Configuration (REQUIRED)
```env
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=your_chosen_voice_id_here
```
- **Used for**: Text-to-Speech (Arabic narration)
- **Get your key**: [Eleven Labs API Keys](https://elevenlabs.io/app/settings/api-keys)
- **Voice ID**: Browse the Eleven Labs voice library for Arabic voices
- **Cost**: Pay-per-character generated

### Email Configuration (REQUIRED)
```env
SMTP_USER=your_gmail_address@gmail.com
SMTP_PASS=your_gmail_app_password_here
CONTACT_EMAIL=raneem.althaqafi@example.com
```
- **Used for**: Contact form submissions
- **Gmail Setup**: Use App Password (not regular password)
- **Instructions**: [Gmail App Passwords](https://support.google.com/accounts/answer/185833)

## 🔑 Optional Environment Variables

### Azure Cognitive Services (OPTIONAL)
```env
AZURE_SPEECH_KEY=your_azure_speech_key_here
AZURE_SPEECH_REGION=your_azure_region_here
```
- **Used for**: Alternative TTS service
- **Get your key**: [Azure Portal](https://portal.azure.com/)

### Google Gemini (FUTURE INTEGRATION)
```env
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```
- **Used for**: Future integration with Google's Gemini AI
- **Get your key**: [Google AI Studio](https://makersuite.google.com/app/apikey)

### Hugging Face (ALTERNATIVE IMAGE GENERATION)
```env
HUGGINGFACE_API_TOKEN=your_huggingface_token_here
```
- **Used for**: Alternative to DALL-E for image generation
- **Get your token**: [Hugging Face Tokens](https://huggingface.co/settings/tokens)

## 📝 Complete .env.local Template

Create a file named `.env.local` in your project root with this content:

```env
# ===========================================
# RANEEM ALTHAQAFI PORTFOLIO - ENVIRONMENT VARIABLES
# ===========================================

# OpenAI Configuration (REQUIRED)
OPENAI_API_KEY=your_openai_api_key_here

# If using project-specific API key (starts with sk-proj-), add project ID
OPENAI_PROJECT_ID=your_project_id_here

# Eleven Labs Configuration (REQUIRED)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=your_chosen_voice_id_here

# Email Configuration (REQUIRED)
SMTP_USER=your_gmail_address@gmail.com
SMTP_PASS=your_gmail_app_password_here
CONTACT_EMAIL=raneem.althaqafi@example.com

# Azure Cognitive Services (OPTIONAL)
AZURE_SPEECH_KEY=your_azure_speech_key_here
AZURE_SPEECH_REGION=your_azure_region_here

# Google Gemini (FUTURE)
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Hugging Face (OPTIONAL)
HUGGINGFACE_API_TOKEN=your_huggingface_token_here

# Development Configuration
NODE_ENV=development
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Security Configuration
JWT_SECRET=your_jwt_secret_here
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

## 🚀 Deployment Setup (Vercel)

For production deployment on Vercel:

1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable individually:
   - `OPENAI_API_KEY`
   - `ELEVENLABS_API_KEY`
   - `ELEVENLABS_VOICE_ID`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `CONTACT_EMAIL`
   - (and any optional ones you're using)

## 🔧 API Key Setup Details

### 1. OpenAI API Key
- Sign up at [OpenAI](https://platform.openai.com/)
- Go to API Keys section
- Create a new secret key
- **Important**: You'll need billing set up for GPT-4 access

### 2. Eleven Labs API Key
- Sign up at [Eleven Labs](https://elevenlabs.io/)
- Go to Settings → API Keys
- Generate a new API key
- **Voice ID**: Browse the voice library and copy the ID of your chosen Arabic voice

### 3. Gmail App Password
- Go to your Google Account settings
- Enable 2-factor authentication
- Go to Security → App Passwords
- Generate a 16-character app password
- Use this password, not your regular Gmail password

## 🎯 Environment Variable Usage in Code

Here's how each variable is used in the application:

| Variable | Used In | Purpose |
|----------|---------|---------|
| `OPENAI_API_KEY` | `/api/chat`, `/api/stt`, `/api/generate-image` | AI chat, speech recognition, image generation |
| `ELEVENLABS_API_KEY` | `/api/tts` | Text-to-speech for Arabic narration |
| `ELEVENLABS_VOICE_ID` | `/api/tts` | Specific voice for speech synthesis |
| `SMTP_USER` | `/api/contact` | Email sender account |
| `SMTP_PASS` | `/api/contact` | Email authentication |
| `CONTACT_EMAIL` | `/api/contact` | Where to send contact form submissions |

## 🔒 Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Add `.env.local` to `.gitignore`**
3. **Use different API keys** for development and production
4. **Monitor API usage** to prevent unexpected costs
5. **Rotate API keys** regularly for security

## 🐛 Troubleshooting

### Common Issues:
- **401 Unauthorized**: Check if API key is correct and has sufficient permissions
- **429 Rate Limited**: You've exceeded API rate limits
- **500 Internal Server Error**: Check if all required environment variables are set
- **Email not sending**: Verify Gmail app password and SMTP settings

### Testing Your Setup:
1. Run `npm run dev`
2. Try the chat feature (tests OpenAI)
3. Try the contact form (tests email)
4. Try the poetry-to-art generator (tests OpenAI + image generation)
5. Try the voice features (tests Eleven Labs)

## 💰 Cost Estimation

**Required Services:**
- **OpenAI**: ~$0.03 per 1k tokens (GPT-4), ~$0.006 per minute (Whisper), ~$0.040 per image (DALL-E)
- **Eleven Labs**: ~$0.30 per 1k characters
- **Gmail**: Free

**Monthly estimate for moderate usage**: $10-50 depending on traffic

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all API keys are correctly set
3. Check the browser console for error messages
4. Review the server logs for API errors 