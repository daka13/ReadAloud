import { TTSVoice } from '../types';

/**
 * App Constants
 */

export const APP_NAME = 'ReadAloud';
export const APP_VERSION = '1.0.0';

// File Types
export const SUPPORTED_FILE_TYPES = {
  PDF: 'application/pdf',
  EPUB: 'application/epub+zip',
} as const;

// Audio Settings
export const AUDIO_CONFIG = {
  MIN_PLAYBACK_SPEED: 0.5,
  MAX_PLAYBACK_SPEED: 2.0,
  DEFAULT_PLAYBACK_SPEED: 1.0,
  SPEED_STEP: 0.25,
  DEFAULT_VOLUME: 1.0,
  DEFAULT_PITCH: 1.0,
} as const;

// Text Processing
export const TEXT_CONFIG = {
  MAX_CHUNK_SIZE: 5000, // characters
  MAX_TTS_LENGTH: 4000, // characters per TTS call
  SENTENCE_REGEX: /[^.!?]+[.!?]+/g,
} as const;

// Cache Settings
export const CACHE_CONFIG = {
  MAX_CACHE_SIZE: 100 * 1024 * 1024, // 100 MB
  CACHE_EXPIRY_DAYS: 7,
} as const;

// TTS Providers
export const TTS_PROVIDERS = {
  EXPO_SPEECH: 'expo-speech',
  ELEVENLABS: 'elevenlabs',
  CARTESIA: 'cartesia',
} as const;

// Available Voices for Expo Speech
export const AVAILABLE_VOICES: TTSVoice[] = [
  {
    id: 'default',
    name: 'Default Voice',
    language: 'en-US',
    gender: 'neutral',
    provider: 'expo-speech',
    isDefault: true,
  },
  {
    id: 'en-US',
    name: 'English (US)',
    language: 'en-US',
    gender: 'neutral',
    provider: 'expo-speech',
  },
  {
    id: 'en-GB',
    name: 'English (UK)',
    language: 'en-GB',
    gender: 'neutral',
    provider: 'expo-speech',
  },
  {
    id: 'en-AU',
    name: 'English (Australia)',
    language: 'en-AU',
    gender: 'neutral',
    provider: 'expo-speech',
  },
  {
    id: 'en-IE',
    name: 'English (Ireland)',
    language: 'en-IE',
    gender: 'neutral',
    provider: 'expo-speech',
  },
];

// ElevenLabs Voice IDs (if user has API key)
export const ELEVENLABS_VOICES = [
  {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Sarah (Female)',
    language: 'en-US',
    gender: 'female' as const,
    provider: 'elevenlabs' as const,
  },
  {
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel (Female)',
    language: 'en-US',
    gender: 'female' as const,
    provider: 'elevenlabs' as const,
  },
  {
    id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam (Male)',
    language: 'en-US',
    gender: 'male' as const,
    provider: 'elevenlabs' as const,
  },
];

// Colors (if not using theme from constants)
export const COLORS = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  text: {
    primary: '#000000',
    secondary: '#3C3C43',
    tertiary: '#8E8E93',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F2F2F7',
    tertiary: '#E5E5EA',
  },
} as const;
