/**
 * Splits a long text into smaller chunks for embedding, trying to respect sentence boundaries.
 * A rough approximation is used for tokens (1 word ~ 1.3 tokens).
 * @param text The input text to chunk
 * @param maxWordsPerChunk Maximum words per chunk (e.g., 300 words is safely under the 512 token limit)
 * @returns Array of text chunks
 */
export function chunkText(text: string, maxWordsPerChunk: number = 300): string[] {
  if (!text || text.trim() === '') return [];

  // Split by paragraph or sentence boundaries
  // Regex looks for periods, exclamation marks, or question marks followed by space.
  const sentences = text.match(/[^.!?]+[.!?]+[ \n]*|[^.!?]+$/g) || [text];
  
  const chunks: string[] = [];
  let currentChunk = '';
  let currentWordCount = 0;

  for (const sentence of sentences) {
    const wordCount = sentence.trim().split(/\s+/).length;

    // If a single sentence is incredibly long (larger than maxWords), we must hard split it
    if (wordCount > maxWordsPerChunk) {
      // Push what we have so far
      if (currentChunk.trim() !== '') {
        chunks.push(currentChunk.trim());
        currentChunk = '';
        currentWordCount = 0;
      }
      
      // Hard split the massive sentence by words
      const words = sentence.trim().split(/\s+/);
      for (let i = 0; i < words.length; i += maxWordsPerChunk) {
        chunks.push(words.slice(i, i + maxWordsPerChunk).join(' '));
      }
      continue;
    }

    if (currentWordCount + wordCount <= maxWordsPerChunk) {
      currentChunk += sentence;
      currentWordCount += wordCount;
    } else {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
      currentWordCount = wordCount;
    }
  }

  if (currentChunk.trim() !== '') {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
