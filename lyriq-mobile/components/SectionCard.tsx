/**
 * SectionCard Component
 * Card containing section title and lyric editor
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../theme';
import { Section } from '../types';
import { LyricEditor } from './LyricEditor';
import { MicrophoneIcon, MusicNoteIcon, GeminiIcon } from './Icons';

interface SectionCardProps {
  section: Section;
  isActive: boolean;
  onLyricsChange: (sectionId: string, lyrics: typeof section.lyrics) => void;
  onTitleChange: (sectionId: string, title: string) => void;
  onFocus: (sectionId: string) => void;
  onRecordPress: (sectionId: string) => void;
  onTakesPress: (sectionId: string) => void;
  onAIPress?: (sectionId: string) => void;
  showSyllableCount?: boolean;
  isUnstructured?: boolean;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  section,
  isActive,
  onLyricsChange,
  onTitleChange,
  onFocus,
  onRecordPress,
  onTakesPress,
  onAIPress,
  showSyllableCount = false,
  isUnstructured = false,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(section.title);
  const titleInputRef = useRef<TextInput>(null);

  const handleTitlePress = () => {
    setIsEditingTitle(true);
    setTimeout(() => titleInputRef.current?.focus(), 100);
  };

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleValue.trim()) {
      onTitleChange(section.id, titleValue.trim());
    } else {
      setTitleValue(section.title);
    }
  };

  return (
    <View
      style={[
        styles.container,
        isUnstructured && styles.containerUnstructured,
        isActive && styles.containerActive,
      ]}
    >
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {isEditingTitle ? (
            <TextInput
              ref={titleInputRef}
              style={styles.titleInput}
              value={titleValue}
              onChangeText={setTitleValue}
              onBlur={handleTitleSubmit}
              onSubmitEditing={handleTitleSubmit}
              autoCapitalize="words"
              returnKeyType="done"
            />
          ) : (
            <TouchableOpacity onPress={handleTitlePress} onLongPress={handleTitlePress}>
              <Text style={styles.title}>{section.title}</Text>
            </TouchableOpacity>
          )}

          {isActive && onAIPress && (
            <TouchableOpacity
              onPress={() => onAIPress(section.id)}
              style={styles.aiButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <GeminiIcon size={15} color={COLORS.accent} />
            </TouchableOpacity>
          )}
        </View>

        {!isUnstructured && (
          <View style={styles.controls}>
            {section.takes.length > 0 && (
              <TouchableOpacity
                onPress={() => onTakesPress(section.id)}
                style={styles.takesButton}
              >
                <MusicNoteIcon size={14} color={COLORS.textSecondary} />
                <Text style={styles.takesCount}>{section.takes.length}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => onRecordPress(section.id)}
              style={styles.recordButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MicrophoneIcon size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Lyric Editor */}
      <LyricEditor
        lyrics={section.lyrics}
        onChange={(lyrics) => onLyricsChange(section.id, lyrics)}
        onFocus={() => onFocus(section.id)}
        showSyllableCount={showSyllableCount}
        placeholder="Start writing..."
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.base,
  },
  containerUnstructured: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    marginBottom: SPACING.lg,
  },
  containerActive: {
    borderColor: COLORS.accent,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  titleInput: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
    padding: SPACING.xs,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: COLORS.accent,
    minWidth: 120,
  },
  aiButton: {
    padding: SPACING.xs,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  takesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  takesCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  recordButton: {
    padding: SPACING.xs,
  },
});
