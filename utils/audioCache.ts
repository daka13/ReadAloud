import * as FileSystem from 'expo-file-system';
import { CACHE_CONFIG } from './constants';

/**
 * Audio Cache Utility
 * Manages caching of audio files for offline playback
 */

export class AudioCache {
  private cacheDir: string;

  constructor() {
    const cacheDirectory = (FileSystem as any).cacheDirectory || '';
    this.cacheDir = `${cacheDirectory}audio/`;
    this.ensureCacheDir();
  }

  /**
   * Ensure cache directory exists
   */
  private async ensureCacheDir(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.cacheDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.cacheDir, { intermediates: true });
      }
    } catch (error) {
      console.error('Error creating cache directory:', error);
    }
  }

  /**
   * Generate cache key from text
   */
  private generateCacheKey(text: string, voiceId: string): string {
    // Simple hash function
    const hash = this.simpleHash(text + voiceId);
    return `${hash}.mp3`;
  }

  /**
   * Simple hash function for strings
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Check if audio is cached
   */
  async isCached(text: string, voiceId: string): Promise<boolean> {
    try {
      const cacheKey = this.generateCacheKey(text, voiceId);
      const filePath = `${this.cacheDir}${cacheKey}`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      return fileInfo.exists;
    } catch (error) {
      console.error('Error checking cache:', error);
      return false;
    }
  }

  /**
   * Get cached audio file path
   */
  async getCachedAudio(text: string, voiceId: string): Promise<string | null> {
    try {
      const cacheKey = this.generateCacheKey(text, voiceId);
      const filePath = `${this.cacheDir}${cacheKey}`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);

      if (fileInfo.exists) {
        return filePath;
      }

      return null;
    } catch (error) {
      console.error('Error getting cached audio:', error);
      return null;
    }
  }

  /**
   * Cache audio data
   */
  async cacheAudio(
    text: string,
    voiceId: string,
    audioData: ArrayBuffer | string
  ): Promise<string> {
    try {
      const cacheKey = this.generateCacheKey(text, voiceId);
      const filePath = `${this.cacheDir}${cacheKey}`;

      // Convert ArrayBuffer to base64 if needed
      let base64Data: string;
      if (audioData instanceof ArrayBuffer) {
        const uint8Array = new Uint8Array(audioData);
        base64Data = this.arrayBufferToBase64(uint8Array);
      } else {
        base64Data = audioData;
      }

      // Write file
      await FileSystem.writeAsStringAsync(filePath, base64Data, {
        encoding: 'base64',
      });

      return filePath;
    } catch (error) {
      console.error('Error caching audio:', error);
      throw error;
    }
  }

  /**
   * Convert ArrayBuffer to base64
   */
  private arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    try {
      await FileSystem.deleteAsync(this.cacheDir, { idempotent: true });
      await this.ensureCacheDir();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Get cache size
   */
  async getCacheSize(): Promise<number> {
    try {
      const files = await FileSystem.readDirectoryAsync(this.cacheDir);
      let totalSize = 0;

      for (const file of files) {
        const filePath = `${this.cacheDir}${file}`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        if (fileInfo.exists && 'size' in fileInfo) {
          totalSize += fileInfo.size;
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Error getting cache size:', error);
      return 0;
    }
  }

  /**
   * Clean old cache files
   */
  async cleanOldCache(maxAgeDays: number = CACHE_CONFIG.CACHE_EXPIRY_DAYS): Promise<void> {
    try {
      const files = await FileSystem.readDirectoryAsync(this.cacheDir);
      const now = Date.now();
      const maxAge = maxAgeDays * 24 * 60 * 60 * 1000;

      for (const file of files) {
        const filePath = `${this.cacheDir}${file}`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);

        if (fileInfo.exists && 'modificationTime' in fileInfo) {
          const age = now - fileInfo.modificationTime * 1000;
          if (age > maxAge) {
            await FileSystem.deleteAsync(filePath, { idempotent: true });
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning old cache:', error);
    }
  }
}

// Singleton instance
export const audioCache = new AudioCache();
