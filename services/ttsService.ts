import * as Speech from 'expo-speech';
import { TTSVoice, APIKeys } from '../types';

/**
 * Text-to-Speech Service
 * Handles converting text to speech using various providers
 * Primary: expo-speech (free, built-in)
 * Optional: ElevenLabs, Cartesia (requires API keys)
 */

export class TTSService {
  private apiKeys: APIKeys = {};
  private currentSpeech: Promise<void> | null = null;

  constructor() {
    this.initializeVoices();
  }

  /**
   * Initialize available voices
   */
  private async initializeVoices() {
    try {
      const availableVoices = await Speech.getAvailableVoicesAsync();
      console.log('Available voices:', availableVoices);
    } catch (error) {
      console.error('Error initializing voices:', error);
    }
  }

  /**
   * Set API keys for premium services
   */
  setAPIKeys(keys: APIKeys) {
    this.apiKeys = keys;
  }

  /**
   * Convert text to speech using Expo Speech (default, free)
   */
  async speakWithExpoSpeech(
    text: string,
    options: {
      voice?: string;
      language?: string;
      pitch?: number;
      rate?: number;
      volume?: number;
      onDone?: () => void;
      onStopped?: () => void;
      onError?: (error: Error) => void;
    } = {}
  ): Promise<void> {
    try {
      const {
        language = 'en-US',
        pitch = 1.0,
        rate = 1.0,
        volume = 1.0,
        onDone,
        onStopped,
        onError,
      } = options;

      // Stop any ongoing speech
      await this.stop();

      // Speak the text
      this.currentSpeech = new Promise((resolve, reject) => {
        Speech.speak(text, {
          language,
          pitch,
          rate,
          volume,
          onDone: () => {
            onDone?.();
            resolve();
          },
          onStopped: () => {
            onStopped?.();
            resolve();
          },
          onError: (error) => {
            const err = new Error(error.toString());
            onError?.(err);
            reject(err);
          },
        });
      });

      await this.currentSpeech;
    } catch (error) {
      console.error('Error in expo-speech:', error);
      throw error;
    } finally {
      this.currentSpeech = null;
    }
  }

  /**
   * Convert text to speech using ElevenLabs API
   * Requires API key
   */
  async speakWithElevenLabs(
    text: string,
    voiceId: string = 'EXAVITQu4vr4xnSDxMaL' // Default voice
  ): Promise<ArrayBuffer> {
    if (!this.apiKeys.elevenlabs) {
      throw new Error('ElevenLabs API key not set');
    }

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKeys.elevenlabs,
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`);
      }

      const audioData = await response.arrayBuffer();
      return audioData;
    } catch (error) {
      console.error('Error with ElevenLabs:', error);
      throw error;
    }
  }

  /**
   * Convert text to speech using Cartesia API
   * Requires API key
   */
  async speakWithCartesia(
    text: string,
    voiceId: string = 'a0e99841-438c-4a64-b679-ae501e7d6091' // Default voice
  ): Promise<ArrayBuffer> {
    if (!this.apiKeys.cartesia) {
      throw new Error('Cartesia API key not set');
    }

    try {
      const response = await fetch('https://api.cartesia.ai/tts/bytes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKeys.cartesia,
        },
        body: JSON.stringify({
          model_id: 'sonic-english',
          transcript: text,
          voice: {
            mode: 'id',
            id: voiceId,
          },
          output_format: {
            container: 'mp3',
            encoding: 'mp3',
            sample_rate: 44100,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Cartesia API error: ${response.statusText}`);
      }

      const audioData = await response.arrayBuffer();
      return audioData;
    } catch (error) {
      console.error('Error with Cartesia:', error);
      throw error;
    }
  }

  /**
   * Main method to convert text to speech
   * Automatically selects the best available provider
   */
  async speak(
    text: string,
    options: {
      voice?: string;
      language?: string;
      pitch?: number;
      rate?: number;
      volume?: number;
      provider?: 'expo-speech' | 'elevenlabs' | 'cartesia';
      onDone?: () => void;
      onStopped?: () => void;
      onError?: (error: Error) => void;
    } = {}
  ): Promise<void | ArrayBuffer> {
    const { provider = 'expo-speech' } = options;

    // Use expo-speech by default (free, no API key needed)
    if (provider === 'expo-speech') {
      return this.speakWithExpoSpeech(text, options);
    }

    // Use premium services if API keys are available
    if (provider === 'elevenlabs' && this.apiKeys.elevenlabs) {
      return this.speakWithElevenLabs(text, options.voice);
    }

    if (provider === 'cartesia' && this.apiKeys.cartesia) {
      return this.speakWithCartesia(text, options.voice);
    }

    // Fallback to expo-speech
    return this.speakWithExpoSpeech(text, options);
  }

  /**
   * Pause the current speech
   */
  async pause(): Promise<void> {
    try {
      await Speech.pause();
    } catch (error) {
      console.error('Error pausing speech:', error);
    }
  }

  /**
   * Resume the paused speech
   */
  async resume(): Promise<void> {
    try {
      await Speech.resume();
    } catch (error) {
      console.error('Error resuming speech:', error);
    }
  }

  /**
   * Stop the current speech
   */
  async stop(): Promise<void> {
    try {
      await Speech.stop();
      this.currentSpeech = null;
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  }

  /**
   * Check if speech is currently playing
   */
  async isSpeaking(): Promise<boolean> {
    try {
      return await Speech.isSpeakingAsync();
    } catch (error) {
      console.error('Error checking speaking status:', error);
      return false;
    }
  }

  /**
   * Get max speech length for current provider
   */
  getMaxSpeechLength(provider: 'expo-speech' | 'elevenlabs' | 'cartesia' = 'expo-speech'): number {
    switch (provider) {
      case 'expo-speech':
        return 4000; // Characters
      case 'elevenlabs':
        return 5000; // Characters
      case 'cartesia':
        return 10000; // Characters
      default:
        return 4000;
    }
  }

  /**
   * Split long text into chunks suitable for TTS
   */
  splitTextForTTS(text: string, maxLength: number = 4000): string[] {
    const chunks: string[] = [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

    let currentChunk = '';

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > maxLength) {
        if (currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }
}

// Singleton instance
export const ttsService = new TTSService();
