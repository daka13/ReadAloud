// Book and File Types
export interface Book {
  id: string;
  title: string;
  author?: string;
  filePath: string;
  fileType: 'pdf' | 'epub';
  coverImage?: string;
  totalPages?: number;
  totalChapters?: number;
  dateAdded: number;
  lastRead?: number;
  progress: BookProgress;
}

export interface BookProgress {
  currentChapter: number;
  currentPage: number;
  currentPosition: number; // in milliseconds for audio
  totalDuration?: number; // in milliseconds
  percentComplete: number;
}

// Text Extraction Types
export interface TextChunk {
  id: string;
  bookId: string;
  chapterNumber: number;
  pageNumber: number;
  text: string;
  startPosition: number;
  endPosition: number;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  pageStart?: number;
  pageEnd?: number;
}

// TTS and Audio Types
export interface TTSVoice {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  provider: 'expo-speech' | 'elevenlabs' | 'cartesia' | 'edge-tts';
  isDefault?: boolean;
}

export interface AudioState {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
}

export interface TTSSettings {
  selectedVoice: string;
  playbackSpeed: number;
  volume: number;
  pitch?: number;
}

// API Keys for Premium Services
export interface APIKeys {
  elevenlabs?: string;
  cartesia?: string;
}

// App Settings
export interface AppSettings {
  tts: TTSSettings;
  apiKeys: APIKeys;
  cacheEnabled: boolean;
  autoSaveProgress: boolean;
  theme: 'light' | 'dark' | 'auto';
}

// Storage Keys
export const STORAGE_KEYS = {
  BOOKS: '@readaloud/books',
  CURRENT_BOOK: '@readaloud/current_book',
  SETTINGS: '@readaloud/settings',
  PROGRESS: '@readaloud/progress',
  CACHE: '@readaloud/cache',
} as const;

// Default Values
export const DEFAULT_SETTINGS: AppSettings = {
  tts: {
    selectedVoice: 'default',
    playbackSpeed: 1.0,
    volume: 1.0,
    pitch: 1.0,
  },
  apiKeys: {},
  cacheEnabled: true,
  autoSaveProgress: true,
  theme: 'auto',
};

export const DEFAULT_AUDIO_STATE: AudioState = {
  isPlaying: false,
  isPaused: false,
  isLoading: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1.0,
  volume: 1.0,
};

// Playback Speed Options
export const PLAYBACK_SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

// Available TTS Voices (Expo Speech)
export const EXPO_SPEECH_VOICES: TTSVoice[] = [
  {
    id: 'default',
    name: 'Default Voice',
    language: 'en-US',
    gender: 'neutral',
    provider: 'expo-speech',
    isDefault: true,
  },
  {
    id: 'en-us-male',
    name: 'English (US) - Male',
    language: 'en-US',
    gender: 'male',
    provider: 'expo-speech',
  },
  {
    id: 'en-us-female',
    name: 'English (US) - Female',
    language: 'en-US',
    gender: 'female',
    provider: 'expo-speech',
  },
  {
    id: 'en-gb-female',
    name: 'English (UK) - Female',
    language: 'en-GB',
    gender: 'female',
    provider: 'expo-speech',
  },
];
