import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { Book } from '../types';
import { fileParserService } from '../services/fileParser';
import { storageService } from '../services/storageService';

interface FileUploaderProps {
  onBookAdded?: (book: Book) => void;
  style?: any;
}

export default function FileUploader({ onBookAdded, style }: FileUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePickDocument = async () => {
    try {
      setIsLoading(true);

      // Pick a document
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/epub+zip'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setIsLoading(false);
        return;
      }

      const file = result.assets[0];
      console.log('Selected file:', file);

      // Determine file type
      let fileType: 'pdf' | 'epub';
      if (file.mimeType === 'application/pdf' || file.name.endsWith('.pdf')) {
        fileType = 'pdf';
      } else if (
        file.mimeType === 'application/epub+zip' ||
        file.name.endsWith('.epub')
      ) {
        fileType = 'epub';
      } else {
        Alert.alert('Error', 'Unsupported file type. Please select a PDF or EPUB file.');
        setIsLoading(false);
        return;
      }

      // Copy file to permanent location
      const fileName = file.name;
      const documentDirectory = (FileSystem as any).documentDirectory || '';
      const permanentUri = `${documentDirectory}${fileName}`;

      await FileSystem.copyAsync({
        from: file.uri,
        to: permanentUri,
      });

      // Extract text from the file
      let chapters;
      try {
        chapters = await fileParserService.extractText(permanentUri, fileType);
      } catch (error) {
        console.error('Error extracting text:', error);
        Alert.alert(
          'Extraction Error',
          fileType === 'pdf'
            ? 'PDF text extraction is limited in this version. For best results, please use EPUB files.'
            : 'Failed to extract text from EPUB file. The file may be corrupted or encrypted.'
        );
        setIsLoading(false);
        return;
      }

      if (!chapters || chapters.length === 0) {
        Alert.alert('Error', 'No text content found in the file.');
        setIsLoading(false);
        return;
      }

      // Create book object
      const bookId = `book_${Date.now()}`;
      const book: Book = {
        id: bookId,
        title: fileName.replace(/\.(pdf|epub)$/i, ''),
        filePath: permanentUri,
        fileType,
        totalChapters: chapters.length,
        totalPages: chapters.length,
        dateAdded: Date.now(),
        progress: {
          currentChapter: 0,
          currentPage: 0,
          currentPosition: 0,
          percentComplete: 0,
        },
      };

      // Save book to storage
      await storageService.saveBook(book);

      Alert.alert('Success', `"${book.title}" has been added to your library!`);

      // Callback
      onBookAdded?.(book);
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to upload file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={handlePickDocument}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <>
            <Ionicons name="cloud-upload-outline" size={48} color="#fff" />
            <Text style={styles.buttonText}>Upload eBook</Text>
            <Text style={styles.subtitleText}>PDF or EPUB</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    minWidth: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
  },
  subtitleText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
    opacity: 0.8,
  },
});
