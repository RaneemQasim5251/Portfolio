# Raneem Althaqafi - Sovereign AI Portfolio

A bilingual (Arabic-first) personal website showcasing Raneem Althaqafi's work in AI and software development through an interactive, AI-powered portfolio. The site demonstrates full-stack AI capabilities and aligns with HUMAIN's vision of sovereign AI development.

## Features

- 🌐 Bilingual Support (Arabic-first with English toggle)
- 🧠 Interactive Neural Network Animations
- 🤖 AI-powered Features:
  - GPT-4 Chatbot for Q&A
  - Poetry-to-Art Generation
  - Voice Interaction (TTS/STT)
  - Live AI Demos
- 💫 Smooth Animations & Transitions
- 🎨 Modern, Elegant Design with Glassmorphism
- 📱 Fully Responsive Layout

## Tech Stack

- **Framework**: Next.js
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **3D Graphics**: Three.js (React Three Fiber)
- **Internationalization**: next-i18next
- **AI Integration**:
  - OpenAI GPT-4 & Whisper
  - ElevenLabs TTS
  - Azure Cognitive Services
  - Stable Diffusion

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your API keys:
   ```env
   OPENAI_API_KEY=your_key
   ELEVENLABS_API_KEY=your_key
   AZURE_SPEECH_KEY=your_key
   AZURE_SPEECH_REGION=your_region
   SMTP_USER=your_email
   SMTP_PASS=your_password
   HF_API_TOKEN=your_token
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
raneem-portfolio/
├── components/         # React components
├── pages/             # Next.js pages
├── public/            # Static assets
│   └── locales/      # Translation files
├── styles/           # Global styles
└── utils/            # Helper functions
```

## Alignment with HUMAIN's Vision

This portfolio embodies HUMAIN's principles:

- **Full-Stack AI**: Demonstrates end-to-end AI capabilities from infrastructure to applications
- **Arabic-First**: Prioritizes Arabic language and cultural context
- **Sovereignty**: Showcases independent development and local innovation
- **Technical Excellence**: Implements cutting-edge features and modern best practices

## License

MIT 