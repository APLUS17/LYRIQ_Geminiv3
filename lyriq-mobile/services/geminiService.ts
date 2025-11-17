/**
 * Gemini AI service for lyric suggestions and rhymes
 * Port of web version for React Native
 */

import { GoogleGenAI, Type } from '@google/genai';

// Note: API key should be stored securely (use env vars or secure storage)
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Fetch rhyming words for a given word with context
 */
export async function fetchRhymes(word: string, context: string): Promise<string[]> {
  try {
    const prompt = `Given the lyric line "${context}", provide a list of up to 10 contextual rhyming words for "${word}". The rhymes should fit the mood and meaning of the line. Only return single words.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rhymes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['rhymes'],
        },
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    const filteredRhymes = (result.rhymes || []).filter(
      (r: unknown) => typeof r === 'string' && !r.includes(' ')
    );

    return filteredRhymes.length > 0 ? filteredRhymes : ['No rhymes found'];
  } catch (error) {
    console.error('Error fetching rhymes:', error);
    return ['Error fetching rhymes'];
  }
}

/**
 * Generate lyric suggestions for a section
 */
export async function suggestLyrics(
  currentLyrics: string,
  sectionTitle: string
): Promise<string> {
  try {
    const prompt = `You are a creative songwriting assistant. Given the section "${sectionTitle}" with current lyrics:\n\n"${currentLyrics}"\n\nSuggest improvements or completions for these lyrics. Keep the same theme and style. Return only the improved lyrics, no explanations.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error('Error suggesting lyrics:', error);
    return 'Error generating suggestions';
  }
}

/**
 * Rewrite lyrics in a different style
 */
export async function rewriteLyrics(
  currentLyrics: string,
  style: string
): Promise<string> {
  try {
    const prompt = `Rewrite the following lyrics in a ${style} style:\n\n"${currentLyrics}"\n\nReturn only the rewritten lyrics, no explanations.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error('Error rewriting lyrics:', error);
    return 'Error rewriting lyrics';
  }
}
