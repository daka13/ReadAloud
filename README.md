# ReadAloud - eBook to Audiobook Converter

A React Native + Expo mobile app that converts PDF and EPUB ebooks into audiobooks using Text-to-Speech (TTS).

## Features

### Core Features (MVP)
- Upload and manage PDF/EPUB ebooks
- Extract text from ebooks (EPUB fully supported, PDF with limitations)
- Convert text to speech using built-in TTS (expo-speech)
- Audio player with playback controls
- Adjustable playback speed (0.5x - 2.0x)
- Progress tracking and bookmarks
- Chapter navigation
- Persistent storage of books and progress

### Premium Features (Optional)
- ElevenLabs API integration (requires API key)
- Cartesia API integration (requires API key)
- High-quality premium voices

## Tech Stack

- **Framework**: React Native + Expo
- **Language**: TypeScript
- **TTS**: expo-speech (free, built-in) + optional premium APIs
- **File Handling**: expo-document-picker, expo-file-system
- **PDF Parser**: react-native-pdf, pdfjs-dist
- **EPUB Parser**: epubjs
- **Audio**: expo-av
- **Storage**: AsyncStorage

## Installation

1. **Clone the repository**
   ```bash
   cd ReadAloud
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

## Running the App

### iOS (Expo Go)
1. Install the Expo Go app from the App Store
2. Scan the QR code from the terminal with your iPhone camera
3. The app will open in Expo Go

### Android (Expo Go)
1. Install the Expo Go app from Google Play Store
2. Scan the QR code from the terminal with the Expo Go app
3. The app will open in Expo Go

### Android APK Build
```bash
# Build for Android
npx eas build --platform android --profile preview

# Or for local build
npx expo run:android
```

## Usage

### 1. Upload an eBook
- Go to the **Library** tab
- Tap the "Upload eBook" button
- Select a PDF or EPUB file from your device
- The book will be added to your library

### 2. Read a Book
- Tap on a book in your library
- You'll be taken to the **Reader** tab
- The current chapter will be displayed with text and audio controls

### 3. Audio Playback
- Tap the Play button to start reading aloud
- Adjust playback speed using the speed button (0.5x to 2.0x)
- Navigate between chapters using Previous/Next buttons
- Your progress is automatically saved

### 4. Settings
- Go to the **Settings** tab
- Configure voice settings
- Adjust playback speed
- Add API keys for premium TTS services (optional)

## File Format Support

### EPUB (Recommended)
- Full text extraction support
- Chapter navigation
- Best compatibility

### PDF (Limited)
- Basic support (requires backend service for production)
- Text extraction may be incomplete
- For MVP, use EPUB files for best results

## Premium TTS Integration (Optional)

### ElevenLabs
1. Sign up at [ElevenLabs](https://elevenlabs.io)
2. Get your API key
3. Add it in Settings > Premium TTS Services
4. High-quality voices with natural intonation

### Cartesia
1. Sign up at [Cartesia](https://cartesia.ai)
2. Get your API key
3. Add it in Settings > Premium TTS Services
4. Fast, multilingual TTS

## Project Structure

```
ReadAloud/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Home/Library screen
│   │   ├── reader.tsx         # Reader/Player screen
│   │   └── settings.tsx       # Settings screen
│   └── _layout.tsx
├── components/
│   ├── FileUploader.tsx       # File picker component
│   ├── AudioPlayer.tsx        # Audio controls
│   └── ProgressBar.tsx        # Reading progress
├── services/
│   ├── ttsService.ts          # TTS logic
│   ├── fileParser.ts          # PDF/EPUB parsing
│   └── storageService.ts      # Save progress/books
├── utils/
│   ├── audioCache.ts          # Cache audio chunks
│   └── constants.ts           # Voice options, settings
└── types/
    └── index.ts               # TypeScript types
```

## Development

### Adding New Features
1. Update types in `types/index.ts`
2. Implement services in `services/`
3. Create UI components in `components/`
4. Update screens in `app/(tabs)/`

### Testing
```bash
# Run tests (when available)
npm test

# Type checking
npx tsc --noEmit
```

## Troubleshooting

### Text Extraction Issues
- **PDF**: Text extraction is limited in the current version. For best results, use EPUB files.
- **EPUB**: Ensure the EPUB file is not DRM-protected or encrypted.

### Audio Playback Issues
- Check device volume and mute settings
- Ensure the app has permission to play audio in background
- Try a different playback speed

### Storage Issues
- Go to Settings > Clear All Data to reset the app
- This will delete all books and progress

## Future Enhancements

- [ ] Background audio playback
- [ ] Sleep timer
- [ ] Bookmarks and highlights
- [ ] Export audio files
- [ ] Cloud sync
- [ ] More voice options
- [ ] Better PDF text extraction
- [ ] Text highlighting sync with audio

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.
