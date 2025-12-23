# Wispr - Voice-to-Text Desktop App

A beautiful, real-time voice transcription desktop application built with Tauri, React, and Deepgram AI. Wispr provides an intuitive interface for converting speech to text with professional-grade accuracy.

![Wispr App](https://img.shields.io/badge/Tauri-v2.0-blue) ![React](https://img.shields.io/badge/React-18.3-61dafb) ![Deepgram](https://img.shields.io/badge/Deepgram-Nova--2-green)

## ✨ Features

- **Real-Time Transcription** - Instant speech-to-text powered by Deepgram's Nova-2 model
- **Glassmorphic UI** - Modern, professional interface with smooth animations
- **Privacy-First** - Desktop app with secure microphone access
- **Low Latency** - WebSocket streaming for minimal delay
- **Copy to Clipboard** - One-click copy with visual feedback
- **Single-Click Recording** - Automatic permission handling and recording start
- **Cross-Platform** - Works on Windows, macOS, and Linux

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- [Deepgram API Key](https://deepgram.com/) (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/SubSpace.git
   cd wispr
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_DEEPGRAM_API_KEY=your_deepgram_api_key_here
   ```

4. **Run in development mode**
   ```bash
   npm run tauri dev
   ```

5. **Build for production**
   ```bash
   npm run tauri build
   ```

## 🎯 Usage

1. **Launch the app** - Open Wispr from your applications folder
2. **Enable microphone** - Click the button to grant microphone access (first time only)
3. **Start recording** - Click the purple gradient button to begin transcription
4. **Stop recording** - Click again to stop (button turns red while recording)
5. **Copy text** - Use the copy button to copy transcribed text to clipboard
6. **Clear** - Remove all transcribed text with the clear button

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 18.3 + Vite 7.3
- **Desktop Framework**: Tauri v2.0
- **Styling**: TailwindCSS 3.4
- **AI Transcription**: Deepgram Nova-2 Model
- **Audio Processing**: Web Audio API

### Project Structure

```
SubSpace/
├── src/
│   ├── components/
│   │   └── Deepgram.jsx          # Main UI component
│   ├── hooks/
│   │   ├── useAudioRecorder.js   # Audio recording logic
│   │   └── useDeepgram.js        # Deepgram integration
│   ├── services/
│   │   ├── audioService.js       # Microphone & audio capture
│   │   └── deepgramService.js    # WebSocket streaming
│   └── App.jsx
├── src-tauri/
│   ├── src/
│   │   └── lib.rs                # Rust backend
│   └── tauri.conf.json           # Tauri configuration
└── package.json
```

### Key Components

**Audio Pipeline:**
1. `audioService.js` - Captures microphone input using MediaRecorder API
2. `deepgramService.js` - Streams audio to Deepgram via WebSocket
3. `useDeepgram.js` - Manages transcription state and real-time updates
4. `Deepgram.jsx` - Renders UI and handles user interactions

**Features:**
- **Auto-format detection** - Supports WebM, Opus, and OGG audio formats
- **Error recovery** - Automatic reconnection (up to 3 attempts)
- **Permission management** - Clean microphone stream lifecycle
- **Visual feedback** - Pulsing animations, timers, and status indicators

## 🔧 Configuration

### Deepgram Settings

Edit `src/services/deepgramService.js` to customize:

```javascript
this.connection = this.deepgram.listen.live({
    model: 'nova-2',           // Model: nova-2, base, enhanced
    language: 'en',            // Language code
    punctuate: true,           // Auto punctuation
    interim_results: true,     // Show interim transcripts
});
```

### Audio Quality

Edit `src/services/audioService.js`:

```javascript
audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 16000,         // 16kHz for optimal quality
}
```

## 🎨 UI Customization

The app uses TailwindCSS with custom glassmorphic styling. Key design elements:

- **Background**: Animated gradient with pulsing orbs
- **Card**: Backdrop blur with subtle transparency
- **Buttons**: Gradient fills with shadow glows
- **Animations**: 300ms ease-out transitions

Customize colors in `src/components/Deepgram.jsx`.

## 🐛 Troubleshooting

### Microphone not working
- **Browser**: Check site permissions in browser settings
- **Desktop**: Grant microphone access in system settings
- **Windows**: Settings → Privacy → Microphone
- **macOS**: System Preferences → Security & Privacy → Microphone

### No transcription appearing
- Verify Deepgram API key in `.env` file
- Check internet connection (WebSocket requires active connection)
- Open browser console for error messages

### App won't build
- Ensure Rust is installed: `rustc --version`
- Update Tauri CLI: `npm install -g @tauri-apps/cli`
- Clear node_modules: `rm -rf node_modules && npm install`

## 📝 Development

### Lint code
```bash
npm run lint
```

### Format code
```bash
npm run format
```

## 📧 Support

For issues and questions:
- Open an [issue](https://github.com/yourusername/wispr/issues)
- Email: your.email@example.com

---
