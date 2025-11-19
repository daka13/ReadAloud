import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import AudioPlayer from '@/components/AudioPlayer';
import { Book, Chapter } from '@/types';
import { storageService } from '@/services/storageService';
import { fileParserService } from '@/services/fileParser';

export default function ReaderScreen() {
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadCurrentBook();
    }, [])
  );

  const loadCurrentBook = async () => {
    try {
      setIsLoading(true);
      const book = await storageService.getCurrentBook();

      if (!book) {
        setCurrentBook(null);
        setChapters([]);
        setIsLoading(false);
        return;
      }

      setCurrentBook(book);

      // Extract chapters from the book
      const extractedChapters = await fileParserService.extractText(
        book.filePath,
        book.fileType
      );
      setChapters(extractedChapters);
      setCurrentChapterIndex(book.progress.currentChapter || 0);
    } catch (error) {
      console.error('Error loading book:', error);
      Alert.alert('Error', 'Failed to load book. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChapterComplete = async () => {
    if (!currentBook) return;

    const nextChapter = currentChapterIndex + 1;

    if (nextChapter < chapters.length) {
      // Move to next chapter
      setCurrentChapterIndex(nextChapter);

      // Update progress
      await storageService.updateBookProgress(currentBook.id, {
        currentChapter: nextChapter,
        currentPage: nextChapter,
        percentComplete: ((nextChapter + 1) / chapters.length) * 100,
      });
    } else {
      // Book complete
      Alert.alert('Congratulations!', 'You have finished this book!');
      await storageService.updateBookProgress(currentBook.id, {
        percentComplete: 100,
      });
    }
  };

  const handlePositionChange = async (position: number) => {
    if (!currentBook) return;

    await storageService.updateBookProgress(currentBook.id, {
      currentPosition: position,
    });
  };

  const handlePreviousChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
    }
  };

  const handleNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading book...</Text>
      </View>
    );
  }

  if (!currentBook || chapters.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="book-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>No book selected</Text>
        <Text style={styles.emptySubtext}>
          Go to Library and select a book to start reading
        </Text>
      </View>
    );
  }

  const currentChapter = chapters[currentChapterIndex];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.bookTitle}>{currentBook.title}</Text>
        {currentBook.author && (
          <Text style={styles.bookAuthor}>{currentBook.author}</Text>
        )}
      </View>

      <View style={styles.chapterInfo}>
        <Text style={styles.chapterTitle}>{currentChapter.title}</Text>
        <Text style={styles.chapterProgress}>
          Chapter {currentChapterIndex + 1} of {chapters.length}
        </Text>
      </View>

      <View style={styles.textContainer}>
        <ScrollView style={styles.textScrollView} nestedScrollEnabled>
          <Text style={styles.chapterText}>{currentChapter.content}</Text>
        </ScrollView>
      </View>

      <View style={styles.playerContainer}>
        <AudioPlayer
          text={currentChapter.content}
          onComplete={handleChapterComplete}
          onPositionChange={handlePositionChange}
          initialPosition={currentBook.progress.currentPosition}
        />
      </View>

      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentChapterIndex === 0 && styles.navButtonDisabled,
          ]}
          onPress={handlePreviousChapter}
          disabled={currentChapterIndex === 0}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={currentChapterIndex === 0 ? '#ccc' : '#007AFF'}
          />
          <Text
            style={[
              styles.navButtonText,
              currentChapterIndex === 0 && styles.navButtonTextDisabled,
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            currentChapterIndex === chapters.length - 1 && styles.navButtonDisabled,
          ]}
          onPress={handleNextChapter}
          disabled={currentChapterIndex === chapters.length - 1}
        >
          <Text
            style={[
              styles.navButtonText,
              currentChapterIndex === chapters.length - 1 && styles.navButtonTextDisabled,
            ]}
          >
            Next
          </Text>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={currentChapterIndex === chapters.length - 1 ? '#ccc' : '#007AFF'}
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 16,
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  bookAuthor: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  chapterInfo: {
    marginBottom: 16,
  },
  chapterTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  chapterProgress: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  textContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    maxHeight: 200,
  },
  textScrollView: {
    maxHeight: 180,
  },
  chapterText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  playerContainer: {
    marginBottom: 20,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginHorizontal: 4,
  },
  navButtonTextDisabled: {
    color: '#ccc',
  },
});
