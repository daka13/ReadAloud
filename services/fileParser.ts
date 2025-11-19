import * as FileSystem from 'expo-file-system/legacy';
import ePub from 'epubjs';
import { Chapter, TextChunk } from '../types';

/**
 * File Parser Service
 * Handles text extraction from PDF and EPUB files
 */

export class FileParserService {
  /**
   * Extract text from a PDF file
   * Note: For React Native, we'll use a simplified approach
   * In production, consider using a backend service for more robust PDF parsing
   */
  async extractPDFText(fileUri: string): Promise<Chapter[]> {
    try {
      console.log('Extracting text from PDF:', fileUri);

      // Read the PDF file as base64
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: 'base64',
      });

      // For MVP, we'll use a placeholder approach
      // In production, you would:
      // 1. Use a backend service with pdf-parse
      // 2. Use react-native-pdf with text extraction capabilities
      // 3. Use a cloud service (Google Cloud Vision, AWS Textract)

      // For now, return a placeholder chapter structure
      const chapters: Chapter[] = [
        {
          id: '1',
          title: 'Chapter 1',
          content: 'PDF text extraction requires a backend service or native module. For MVP, please use EPUB files for best results.',
          pageStart: 1,
          pageEnd: 1,
        },
      ];

      return chapters;
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  /**
   * Extract text from an EPUB file
   */
  async extractEPUBText(fileUri: string): Promise<Chapter[]> {
    try {
      console.log('Extracting text from EPUB:', fileUri);

      // Read the EPUB file
      const book = ePub(fileUri);
      await book.ready;

      const chapters: Chapter[] = [];

      // Get the spine (reading order)
      const spine = await book.loaded.spine;

      // Extract text from each section
      let chapterIndex = 0;
      const spineItems = (spine as any).items || [];
      for (const item of spineItems) {
        try {
          // Load the section
          const section = book.spine.get(item.href);
          if (!section) continue;

          // Get the text content
          await section.load(book.load.bind(book));
          const contents = await section.find('body');

          // Extract text from the section
          let text = '';
          if (contents && contents.length > 0) {
            text = this.extractTextFromElement(contents[0]);
          }

          // Clean up the text
          text = this.cleanText(text);

          if (text.trim().length > 0) {
            chapters.push({
              id: String(chapterIndex + 1),
              title: item.title || `Chapter ${chapterIndex + 1}`,
              content: text,
              pageStart: chapterIndex + 1,
              pageEnd: chapterIndex + 1,
            });
            chapterIndex++;
          }

          await section.unload();
        } catch (error) {
          console.error(`Error extracting chapter ${chapterIndex}:`, error);
          // Continue with next chapter
        }
      }

      book.destroy();

      if (chapters.length === 0) {
        throw new Error('No text content found in EPUB');
      }

      return chapters;
    } catch (error) {
      console.error('Error extracting EPUB text:', error);
      throw new Error('Failed to extract text from EPUB');
    }
  }

  /**
   * Extract text from a DOM element
   */
  private extractTextFromElement(element: any): string {
    if (!element) return '';

    if (typeof element.textContent === 'string') {
      return element.textContent;
    }

    if (typeof element.innerText === 'string') {
      return element.innerText;
    }

    return '';
  }

  /**
   * Clean extracted text
   * Removes extra whitespace, fixes formatting issues
   */
  private cleanText(text: string): string {
    return text
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Remove leading/trailing whitespace
      .trim()
      // Fix common formatting issues
      .replace(/\n\s*\n/g, '\n\n')
      // Remove non-printable characters
      .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  }

  /**
   * Split text into manageable chunks for TTS
   * Splits on sentence boundaries to avoid cutting mid-sentence
   */
  splitIntoChunks(text: string, maxChunkSize: number = 5000): string[] {
    const chunks: string[] = [];

    // Split by paragraphs first
    const paragraphs = text.split('\n\n');
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      // If adding this paragraph would exceed max size
      if (currentChunk.length + paragraph.length > maxChunkSize) {
        if (currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }

        // If paragraph itself is too long, split by sentences
        if (paragraph.length > maxChunkSize) {
          const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
          for (const sentence of sentences) {
            if (currentChunk.length + sentence.length > maxChunkSize) {
              if (currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
              }
              currentChunk = sentence;
            } else {
              currentChunk += (currentChunk ? ' ' : '') + sentence;
            }
          }
        } else {
          currentChunk = paragraph;
        }
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  /**
   * Main method to extract text from any supported file type
   */
  async extractText(fileUri: string, fileType: 'pdf' | 'epub'): Promise<Chapter[]> {
    if (fileType === 'epub') {
      return this.extractEPUBText(fileUri);
    } else if (fileType === 'pdf') {
      return this.extractPDFText(fileUri);
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  }
}

// Singleton instance
export const fileParserService = new FileParserService();
