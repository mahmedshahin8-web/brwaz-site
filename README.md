# Barwaz Studio

Barwaz Studio is a complete front-end and back-end application built with React, Vite, TailwindCSS, and an Express based server.

## Features
- Fully integrated Command Center Dashboard (`src/pages/home.tsx`).
- React Router DOM based navigation.
- Node.js backend using Express and Better-SQLite3.
- Advanced Cyber-Studio aesthetics with Arabic RTL support.
- API Proxies & Tools for content generation and AI integrations.

## Environment Variables
Create a `.env` file in the root based on `.env.example`:

```env
APP_URL="http://localhost:3000"
GEMINI_API_KEY="your-gemini-key"
YOUTUBE_API_KEY="your-youtube-key"
ELEVENLABS_API_KEY="your-elevenlabs-key"
# Add other keys...
```

## Running Locally

To run this project locally without sandbox constraints (like memory issues when zipping files with Web Workers):

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Start Development Server**:
   ```bash
   npm run dev
   ```
3. **Build for Production**:
   ```bash
   npm run build
   ```
4. **Start Production Server**:
   ```bash
   npm start
   ```

*The server runs on port 3000.*

## Security & Usage
- Do not store secret keys like `elevenLabsKey` in localStorage in a real production environment. The application proxy should handle secure logic via `/api/*`.
- Be mindful of rate-limits if using `ngrok` or external unauthenticated proxy services for data processing.
