/**
 * Main Editor Screen
 * Core lyric editing interface
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { Header } from '../../components/Header';
import { COLORS, SPACING } from '../../theme';
import { Song, Section } from '../../types';
import { generateId } from '../../utils';

// Initial song state
const initialSong: Song = {
  sections: [
    {
      id: generateId(),
      title: 'Intro',
      lyrics: [],
      takes: [],
    },
  ],
};

export default function EditorScreen() {
  const [song, setSong] = useState<Song>(initialSong);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(
    initialSong.sections[0]?.id || null
  );

  return (
    <View style={styles.container}>
      <Header title="Lyriq" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.sectionsContainer}>
          {song.sections.map((section) => (
            <View key={section.id} style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.editorPlaceholder}>
                <Text style={styles.placeholderText}>
                  Tap to write lyrics...
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Welcome to Lyriq Mobile! 🎵
          </Text>
          <Text style={styles.emptyStateSubtext}>
            The conversion is in progress. Core features coming soon:
          </Text>
          <Text style={styles.featureList}>
            • Rich lyric editor with syllable counting{'\n'}
            • Audio recording with waveform visualization{'\n'}
            • Bottom sheet players for takes & master beat{'\n'}
            • Gesture-based interactions (swipe, drag){'\n'}
            • AI-powered rhyme suggestions{'\n'}
            • Dark theme throughout
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.base,
  },
  sectionsContainer: {
    gap: SPACING.base,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  editorPlaceholder: {
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  emptyState: {
    marginTop: SPACING.xl,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.base,
    textAlign: 'center',
  },
  featureList: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 24,
  },
});
