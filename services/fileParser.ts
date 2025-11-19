import * as FileSystem from 'expo-file-system/legacy';
import { Chapter } from '../types';

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

      console.log('PDF file read successfully, size:', fileContent.length);

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
          content: 'PDF text extraction requires a backend service or native module. For MVP, please use EPUB files for best results. This is a placeholder chapter that allows you to test the audio playback functionality.',
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
   * Extract text from an EPUB file using simple parsing
   * This is a simplified implementation for React Native compatibility
   */
  async extractEPUBText(fileUri: string): Promise<Chapter[]> {
    try {
      console.log('Starting EPUB extraction for:', fileUri);

      // For React Native, we'll use a simpler approach
      // Read the file and parse it manually
      const chapters: Chapter[] = [];

      console.log('Reading EPUB file...');

      // Simple fallback: Create a sample chapter for testing
      // In production, you would use a proper EPUB parser or backend service
      const sampleChapter: Chapter = {
        id: '1',
        title: 'Sample Chapter',
        content: `This is a sample chapter from your EPUB file.

The full EPUB parsing requires additional setup in React Native. For now, this sample text allows you to test the text-to-speech functionality.

To properly parse EPUB files in React Native, you would need to:
1. Unzip the EPUB file (which is a ZIP archive)
2. Parse the content.opf file to get the reading order
3. Extract text from individual XHTML files
4. Handle special characters and formatting

This can be implemented using libraries like react-native-zip-archive and xml2js, or by using a backend service.

For testing purposes, you can use this sample text to verify that the audio playback and navigation features are working correctly.`,
        pageStart: 1,
        pageEnd: 1,
      };

      chapters.push(sampleChapter);

      console.log('EPUB extraction completed, chapters:', chapters.length);

      if (chapters.length === 0) {
        throw new Error('No text content found in EPUB');
      }

      return chapters;
    } catch (error) {
      console.error('Error extracting EPUB text:', error);
      throw new Error(`Failed to extract text from EPUB: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract text from an EPUB file using advanced parsing
   * This attempts to properly parse EPUB structure
   */
  async extractEPUBTextAdvanced(fileUri: string): Promise<Chapter[]> {
    try {
      console.log('Starting advanced EPUB extraction for:', fileUri);

      // Import JSZip for unzipping EPUB files
      const JSZip = require('jszip');

      console.log('Reading EPUB file as base64...');
      const base64Data = await this.withTimeout(
        FileSystem.readAsStringAsync(fileUri, { encoding: 'base64' }),
        10000,
        'Reading EPUB file timed out'
      );

      console.log('EPUB file read, size:', base64Data.length);

      // Convert base64 to binary
      console.log('Unzipping EPUB...');
      const zip = await this.withTimeout(
        JSZip.loadAsync(base64Data, { base64: true }),
        10000,
        'Unzipping EPUB timed out'
      );

      console.log('EPUB unzipped successfully');

      const chapters: Chapter[] = [];
      let chapterIndex = 0;

      // Try to find content files (usually in OEBPS or similar folder)
      const contentFiles = Object.keys(zip.files).filter(
        (filename) =>
          (filename.endsWith('.html') || filename.endsWith('.xhtml')) &&
          !filename.includes('nav.') &&
          !filename.includes('toc.')
      );

      console.log('Found content files:', contentFiles.length);

      // Extract text from each content file
      for (const filename of contentFiles.slice(0, 10)) { // Limit to first 10 chapters
        try {
          console.log(`Processing chapter ${chapterIndex + 1}: ${filename}`);

          const fileContent = await this.withTimeout(
            zip.files[filename].async('text'),
            5000,
            `Reading chapter ${filename} timed out`
          );

          // Extract text from HTML/XHTML
          const text = this.extractTextFromHTML(fileContent);
          const cleanedText = this.cleanText(text);

          if (cleanedText.trim().length > 100) { // Only include substantial chapters
            chapters.push({
              id: String(chapterIndex + 1),
              title: `Chapter ${chapterIndex + 1}`,
              content: cleanedText,
              pageStart: chapterIndex + 1,
              pageEnd: chapterIndex + 1,
            });
            chapterIndex++;
            console.log(`Chapter ${chapterIndex} extracted, length: ${cleanedText.length}`);
          }
        } catch (error) {
          console.error(`Error processing chapter ${filename}:`, error);
          // Continue with next chapter
        }
      }

      console.log('EPUB extraction completed, chapters:', chapters.length);

      if (chapters.length === 0) {
        throw new Error('No text content found in EPUB');
      }

      return chapters;
    } catch (error) {
      console.error('Advanced EPUB extraction failed:', error);
      // Fallback to simple extraction
      console.log('Falling back to simple EPUB extraction');
      return this.extractEPUBText(fileUri);
    }
  }

  /**
   * Wrap a promise with a timeout
   */
  private withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    errorMessage: string
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
      ),
    ]);
  }

  /**
   * Extract text from HTML/XHTML content
   */
  private extractTextFromHTML(html: string): string {
    // Remove script and style tags
    let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

    // Remove HTML tags
    text = text.replace(/<[^>]+>/g, ' ');

    // Decode HTML entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    text = text.replace(/&mdash;/g, '—');
    text = text.replace(/&ndash;/g, '–');

    return text;
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
    console.log(`Starting text extraction for ${fileType} file: ${fileUri}`);

    try {
      if (fileType === 'epub') {
        // Try advanced extraction first, fallback to simple on failure
        try {
          return await this.extractEPUBTextAdvanced(fileUri);
        } catch (error) {
          console.log('Advanced extraction failed, using simple method');
          return await this.extractEPUBText(fileUri);
        }
      } else if (fileType === 'pdf') {
        return await this.extractPDFText(fileUri);
      } else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }
    } catch (error) {
      console.error('Text extraction failed:', error);
      throw error;
    }
  }
}

// Singleton instance
export const fileParserService = new FileParserService();
