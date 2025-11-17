/**
 * LyricEditor Component
 * Multi-line text input for writing lyrics with syllable counting
 */

import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../theme';
import { Lyric } from '../types';
import { getSyllableCount } from '../services/syllableService';
import { generateId } from '../utils';

interface LyricEditorProps {
  lyrics: Lyric[];
  onChange: (lyrics: Lyric[]) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  showSyllableCount?: boolean;
  placeholder?: string;
  editable?: boolean;
}

export const LyricEditor: React.FC<LyricEditorProps> = ({
  lyrics,
  onChange,
  onFocus,
  onBlur,
  showSyllableCount = false,
  placeholder = 'Write your lyrics here...',
  editable = true,
}) => {
  const [text, setText] = useState('');
  const [syllableCounts, setSyllableCounts] = useState<(number | null)[]>([]);

  // Convert lyrics array to text on mount and when lyrics change externally
  useEffect(() => {
    const newText = lyrics.map((l) => l.text).join('\n');
    if (text !== newText) {
      setText(newText);
    }
  }, [lyrics]);

  // Calculate syllable counts when text changes
  useEffect(() => {
    if (showSyllableCount) {
      const lines = text.split('\n');
      const counts = lines.map((line) => getSyllableCount(line));
      setSyllableCounts(counts);
    } else {
      setSyllableCounts([]);
    }
  }, [text, showSyllableCount]);

  const handleTextChange = (newText: string) => {
    setText(newText);

    // Convert text to lyrics array
    const lines = newText.split('\n');
    const newLyrics: Lyric[] = lines.map((line) => ({
      id: generateId(),
      text: line,
    }));

    onChange(newLyrics);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, !editable && styles.inputDisabled]}
        value={text}
        onChangeText={handleTextChange}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textSecondary}
        multiline
        editable={editable}
        textAlignVertical="top"
        autoCorrect
        autoCapitalize="sentences"
      />

      {showSyllableCount && (
        <View style={styles.syllableColumn}>
          {syllableCounts.map((count, index) => (
            <Text key={index} style={styles.syllableText}>
              {count !== null ? count : ' '}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    minHeight: 100,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    lineHeight: FONT_SIZES.lg * 1.75, // Relaxed line height
    padding: 0,
    margin: 0,
  },
  inputDisabled: {
    opacity: 0.7,
  },
  syllableColumn: {
    width: 48,
    paddingLeft: SPACING.md,
    alignItems: 'flex-end',
  },
  syllableText: {
    fontFamily: 'monospace',
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    lineHeight: FONT_SIZES.lg * 1.75,
  },
});
