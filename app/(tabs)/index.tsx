import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import FileUploader from '@/components/FileUploader';
import { Book } from '@/types';
import { storageService } from '@/services/storageService';

export default function HomeScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [])
  );

  const loadBooks = async () => {
    try {
      const allBooks = await storageService.getAllBooks();
      setBooks(allBooks.sort((a, b) => (b.lastRead || 0) - (a.lastRead || 0)));
    } catch (error) {
      console.error('Error loading books:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBooks();
    setRefreshing(false);
  };

  const handleBookAdded = async () => {
    await loadBooks();
  };

  const handleSelectBook = async (book: Book) => {
    try {
      await storageService.setCurrentBook(book);
      router.push('/reader');
    } catch (error) {
      console.error('Error selecting book:', error);
      Alert.alert('Error', 'Failed to open book. Please try again.');
    }
  };

  const handleDeleteBook = async (book: Book) => {
    Alert.alert(
      'Delete Book',
      `Are you sure you want to delete "${book.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.deleteBook(book.id);
              await loadBooks();
            } catch (error) {
              console.error('Error deleting book:', error);
              Alert.alert('Error', 'Failed to delete book.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>My Library</Text>
        <Text style={styles.subtitle}>
          {books.length} {books.length === 1 ? 'book' : 'books'}
        </Text>
      </View>

      {books.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FileUploader onBookAdded={handleBookAdded} />
          <Text style={styles.emptyText}>
            Upload your first eBook to get started!
          </Text>
          <Text style={styles.emptySubtext}>
            Supports PDF and EPUB formats
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.uploadSection}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                // This will trigger the file uploader
              }}
            >
              <FileUploader onBookAdded={handleBookAdded} />
            </TouchableOpacity>
          </View>

          <View style={styles.booksGrid}>
            {books.map((book) => (
              <TouchableOpacity
                key={book.id}
                style={styles.bookCard}
                onPress={() => handleSelectBook(book)}
                onLongPress={() => handleDeleteBook(book)}
              >
                <View style={styles.bookCover}>
                  <Ionicons
                    name={book.fileType === 'pdf' ? 'document-text' : 'book'}
                    size={48}
                    color="#007AFF"
                  />
                </View>

                <View style={styles.bookInfo}>
                  <Text style={styles.bookTitle} numberOfLines={2}>
                    {book.title}
                  </Text>

                  {book.author && (
                    <Text style={styles.bookAuthor} numberOfLines={1}>
                      {book.author}
                    </Text>
                  )}

                  <View style={styles.bookMeta}>
                    <Text style={styles.bookMetaText}>
                      {book.totalChapters || 0} chapters
                    </Text>
                    <Text style={styles.bookMetaText}>
                      {book.progress.percentComplete.toFixed(0)}% complete
                    </Text>
                  </View>

                  {book.lastRead && (
                    <Text style={styles.bookDate}>
                      Last read: {formatDate(book.lastRead)}
                    </Text>
                  )}

                  {book.progress.percentComplete > 0 && (
                    <View style={styles.progressBarContainer}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${book.progress.percentComplete}%` },
                        ]}
                      />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  uploadSection: {
    marginBottom: 20,
  },
  addButton: {
    alignItems: 'center',
  },
  booksGrid: {
    gap: 16,
  },
  bookCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookCover: {
    width: 80,
    height: 100,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  bookMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  bookMetaText: {
    fontSize: 12,
    color: '#999',
  },
  bookDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
});
