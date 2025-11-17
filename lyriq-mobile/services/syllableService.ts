/**
 * Syllable counting service for lyrics
 * Adapted from web version for React Native (no DOM dependencies)
 */

/**
 * Heuristic-based syllable counter for English words
 * Not 100% accurate but works for most common words
 */
function countSyllables(word: string): number {
  word = word.toLowerCase().trim();
  if (word.length === 0) return 0;
  if (word.length <= 3) return 1;

  // Remove common silent endings
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');

  // Count vowel groups
  const vowelGroups = word.match(/[aeiouy]{1,2}/g);

  if (!vowelGroups) return 1;

  // Special case for words ending in 'le' if the preceding consonant is not 'l'
  if (
    word.length > 2 &&
    word.endsWith('le') &&
    !'aeiouy'.includes(word.charAt(word.length - 3)) &&
    word.charAt(word.length - 3) !== 'l'
  ) {
    return vowelGroups.length + 1;
  }

  return vowelGroups.length > 0 ? vowelGroups.length : 1;
}

/**
 * Get syllable count for a line of text
 */
export function getSyllableCount(text: string): number | null {
  const line = text.trim();
  if (!line || line === '') {
    return null;
  }

  return line
    .split(/[\s-]+/)
    .filter((word) => word.length > 0)
    .reduce((total, word) => total + countSyllables(word.replace(/[^a-z']/gi, '')), 0);
}

/**
 * Get syllable counts for multiple lines
 */
export function getSyllableCountsForLines(lines: string[]): (number | null)[] {
  return lines.map((line) => getSyllableCount(line));
}
