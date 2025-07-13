# 🚀 Setup Instructions - Raneem Althaqafi Portfolio

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git (for version control)

## 📋 Step-by-Step Setup

### 1. Install Dependencies

```bash
# Install all required dependencies
npm install

# Or if you prefer yarn
yarn install
```

### 2. Create Environment Variables

1. **Create `.env.local` file** in the project root directory
2. **Copy the template** from `ENV_SETUP_GUIDE.md`
3. **Replace placeholder values** with your actual API keys

**Quick template:**
```env
# Required API Keys
OPENAI_API_KEY=your_openai_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=your_chosen_voice_id_here
SMTP_USER=your_gmail_address@gmail.com
SMTP_PASS=your_gmail_app_password_here
CONTACT_EMAIL=raneem.althaqafi@example.com
```

### 3. Install Additional Dependencies

The project includes all necessary dependencies. If you encounter issues, install them manually:

```bash
# Core dependencies
npm install formidable@^3.5.1

# If you need additional packages
npm install @types/formidable
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
npm run build
npm start
```

## 🔧 Configuration Details

### API Keys Setup Priority

**Essential (Required for core functionality):**
1. `OPENAI_API_KEY` - Chat, image generation, speech recognition
2. `ELEVENLABS_API_KEY` & `ELEVENLABS_VOICE_ID` - Arabic text-to-speech
3. `SMTP_USER` & `SMTP_PASS` - Contact form emails
4. `CONTACT_EMAIL` - Where to receive messages

**Optional (Enhanced features):**
- `AZURE_SPEECH_KEY` - Alternative TTS service
- `GOOGLE_AI_API_KEY` - Future Gemini integration
- `HUGGINGFACE_API_TOKEN` - Alternative image generation

### Features Testing Checklist

After setup, test these features:

- [ ] **Landing Page**: Neuron animation loads
- [ ] **Chat Feature**: AI responds to questions
- [ ] **Poetry-to-Art**: Generates images from Arabic poetry
- [ ] **Voice Features**: Text-to-speech works
- [ ] **Contact Form**: Sends emails successfully
- [ ] **Language Toggle**: Arabic/English switching

## 🐛 Common Issues & Solutions

### Issue: `formidable` module not found
**Solution:**
```bash
npm install formidable@^3.5.1
```

### Issue: OpenAI API errors
**Solutions:**
- Verify API key is correct
- Check if you have GPT-4 access (requires paid plan)
- Ensure billing is set up in OpenAI dashboard

### Issue: Eleven Labs voice not working
**Solutions:**
- Get a valid voice ID from Eleven Labs voice library
- Check your Eleven Labs account has sufficient credits
- Verify API key permissions

### Issue: Gmail not sending emails
**Solutions:**
- Use Gmail App Password, not regular password
- Enable 2-factor authentication first
- Check Gmail security settings

### Issue: Build errors
**Solutions:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Or with yarn
rm -rf node_modules yarn.lock
yarn install
```

## 📁 Project Structure

```
raneem-portfolio/
├── components/          # React components
│   ├── Playground/      # AI demo components
│   ├── NeuronCanvas.tsx # 3D neural animation
│   └── ...
├── pages/               # Next.js pages
│   ├── api/             # API routes
│   │   ├── chat.ts      # OpenAI chat
│   │   ├── tts.ts       # Eleven Labs TTS
│   │   ├── stt.ts       # OpenAI Whisper
│   │   ├── generate-image.ts # DALL-E
│   │   └── contact.ts   # Email handling
│   └── index.tsx        # Main page
├── public/              # Static assets
│   └── locales/         # i18n translations
├── styles/              # CSS files
├── utils/               # Utility functions
└── .env.local          # Environment variables (create this)
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**:
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Add Environment Variables**:
   - Go to Vercel dashboard
   - Project Settings → Environment Variables
   - Add all variables from `.env.local`

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Alternative Deployment

The project can also be deployed to:
- Netlify
- AWS Amplify
- Railway
- Render

## 📞 Support

If you encounter issues:

1. **Check the Environment Variables**: Ensure all required API keys are set
2. **Review Console Logs**: Browser console and terminal for error messages
3. **Test API Endpoints**: Use tools like Postman to test `/api/*` routes
4. **Check API Quotas**: Verify you haven't exceeded API limits

## 🔒 Security Notes

- Never commit `.env.local` to version control
- Use different API keys for development/production
- Monitor API usage to prevent unexpected costs
- Rotate API keys regularly

## 💡 Next Steps

After successful setup:

1. Customize the content in the i18n files
2. Add Raneem's actual project details
3. Configure production domain
4. Set up monitoring and analytics
5. Optimize for performance

## 📋 Maintenance

Regular maintenance tasks:
- Update dependencies monthly
- Monitor API usage and costs
- Check for security updates
- Backup environment variables
- Review and rotate API keys quarterly 