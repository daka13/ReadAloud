import AsyncStorage from '@react-native-async-storage/async-storage';
import { Book, AppSettings, BookProgress, STORAGE_KEYS, DEFAULT_SETTINGS } from '../types';

/**
 * Storage Service
 * Handles persistent storage using AsyncStorage
 */

export class StorageService {
  /**
   * Save a book to the library
   */
  async saveBook(book: Book): Promise<void> {
    try {
      const books = await this.getAllBooks();
      const existingIndex = books.findIndex((b) => b.id === book.id);

      if (existingIndex >= 0) {
        books[existingIndex] = book;
      } else {
        books.push(book);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
    } catch (error) {
      console.error('Error saving book:', error);
      throw new Error('Failed to save book');
    }
  }

  /**
   * Get all books from the library
   */
  async getAllBooks(): Promise<Book[]> {
    try {
      const booksJson = await AsyncStorage.getItem(STORAGE_KEYS.BOOKS);
      if (!booksJson) return [];

      const books = JSON.parse(booksJson);
      return Array.isArray(books) ? books : [];
    } catch (error) {
      console.error('Error getting books:', error);
      return [];
    }
  }

  /**
   * Get a specific book by ID
   */
  async getBook(bookId: string): Promise<Book | null> {
    try {
      const books = await this.getAllBooks();
      return books.find((b) => b.id === bookId) || null;
    } catch (error) {
      console.error('Error getting book:', error);
      return null;
    }
  }

  /**
   * Delete a book from the library
   */
  async deleteBook(bookId: string): Promise<void> {
    try {
      const books = await this.getAllBooks();
      const filteredBooks = books.filter((b) => b.id !== bookId);
      await AsyncStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(filteredBooks));

      // Also remove from current book if it's the active one
      const currentBook = await this.getCurrentBook();
      if (currentBook?.id === bookId) {
        await this.setCurrentBook(null);
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      throw new Error('Failed to delete book');
    }
  }

  /**
   * Set the current book being read
   */
  async setCurrentBook(book: Book | null): Promise<void> {
    try {
      if (book) {
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_BOOK, JSON.stringify(book));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_BOOK);
      }
    } catch (error) {
      console.error('Error setting current book:', error);
      throw new Error('Failed to set current book');
    }
  }

  /**
   * Get the current book being read
   */
  async getCurrentBook(): Promise<Book | null> {
    try {
      const bookJson = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_BOOK);
      if (!bookJson) return null;

      return JSON.parse(bookJson);
    } catch (error) {
      console.error('Error getting current book:', error);
      return null;
    }
  }

  /**
   * Update book progress
   */
  async updateBookProgress(bookId: string, progress: Partial<BookProgress>): Promise<void> {
    try {
      const book = await this.getBook(bookId);
      if (!book) throw new Error('Book not found');

      book.progress = {
        ...book.progress,
        ...progress,
      };
      book.lastRead = Date.now();

      await this.saveBook(book);

      // Update current book if it's the active one
      const currentBook = await this.getCurrentBook();
      if (currentBook?.id === bookId) {
        await this.setCurrentBook(book);
      }
    } catch (error) {
      console.error('Error updating book progress:', error);
      throw new Error('Failed to update book progress');
    }
  }

  /**
   * Get book progress
   */
  async getBookProgress(bookId: string): Promise<BookProgress | null> {
    try {
      const book = await this.getBook(bookId);
      return book?.progress || null;
    } catch (error) {
      console.error('Error getting book progress:', error);
      return null;
    }
  }

  /**
   * Save app settings
   */
  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw new Error('Failed to save settings');
    }
  }

  /**
   * Get app settings
   */
  async getSettings(): Promise<AppSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!settingsJson) return DEFAULT_SETTINGS;

      const settings = JSON.parse(settingsJson);
      // Merge with defaults to ensure all fields exist
      return {
        ...DEFAULT_SETTINGS,
        ...settings,
        tts: {
          ...DEFAULT_SETTINGS.tts,
          ...settings.tts,
        },
        apiKeys: {
          ...DEFAULT_SETTINGS.apiKeys,
          ...settings.apiKeys,
        },
      };
    } catch (error) {
      console.error('Error getting settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Update specific settings
   */
  async updateSettings(updates: Partial<AppSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const newSettings: AppSettings = {
        ...currentSettings,
        ...updates,
        tts: {
          ...currentSettings.tts,
          ...(updates.tts || {}),
        },
        apiKeys: {
          ...currentSettings.apiKeys,
          ...(updates.apiKeys || {}),
        },
      };
      await this.saveSettings(newSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw new Error('Failed to update settings');
    }
  }

  /**
   * Clear all data (useful for debugging)
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.BOOKS,
        STORAGE_KEYS.CURRENT_BOOK,
        STORAGE_KEYS.SETTINGS,
        STORAGE_KEYS.PROGRESS,
        STORAGE_KEYS.CACHE,
      ]);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw new Error('Failed to clear data');
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalBooks: number;
    totalSize: number;
    hasCurrentBook: boolean;
  }> {
    try {
      const books = await this.getAllBooks();
      const currentBook = await this.getCurrentBook();

      return {
        totalBooks: books.length,
        totalSize: 0, // Could calculate actual file sizes if needed
        hasCurrentBook: !!currentBook,
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        totalBooks: 0,
        totalSize: 0,
        hasCurrentBook: false,
      };
    }
  }

  /**
   * Export all data (for backup)
   */
  async exportData(): Promise<string> {
    try {
      const books = await this.getAllBooks();
      const settings = await this.getSettings();
      const currentBook = await this.getCurrentBook();

      const data = {
        books,
        settings,
        currentBook,
        exportDate: new Date().toISOString(),
      };

      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('Failed to export data');
    }
  }

  /**
   * Import data (from backup)
   */
  async importData(dataJson: string): Promise<void> {
    try {
      const data = JSON.parse(dataJson);

      if (data.books) {
        await AsyncStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(data.books));
      }

      if (data.settings) {
        await this.saveSettings(data.settings);
      }

      if (data.currentBook) {
        await this.setCurrentBook(data.currentBook);
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Failed to import data');
    }
  }
}

// Singleton instance
export const storageService = new StorageService();
