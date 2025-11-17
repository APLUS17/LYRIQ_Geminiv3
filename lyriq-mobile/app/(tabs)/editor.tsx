/**
 * Main Editor Screen
 * Core lyric editing interface with full section management
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Header } from '../../components/Header';
import { SectionCard } from '../../components/SectionCard';
import { SectionModal } from '../../components/SectionModal';
import { AudioRecorder } from '../../components/AudioRecorder';
import { RecordButton } from '../../components/RecordButton';
import { COLORS, SPACING } from '../../theme';
import { PlusIcon, SyllableCountIcon } from '../../components/Icons';
import { useSongState } from '../../hooks/useSongState';
import { useAudioRecording } from '../../hooks/useAudioRecording';

export default function EditorScreen() {
  const {
    song,
    setSong,
    activeSectionId,
    setActiveSectionId,
    isLoading,
    addSection,
    updateSectionTitle,
    updateSectionLyrics,
  } = useSongState();

  const {
    recordingState,
    isRecording,
    handleStartRecording,
    handleStopRecording,
  } = useAudioRecording();

  const [showSyllableCount, setShowSyllableCount] = useState(false);
  const [isUnstructured, setIsUnstructured] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRecordPress = async (sectionId: string) => {
    if (isRecording) return;
    await handleStartRecording(sectionId);
  };

  const handleRecordSave = async () => {
    const audioTake = await handleStopRecording(true);
    if (audioTake && recordingState.targetSectionId) {
      // Add take to the target section
      setSong((prev) => ({
        ...prev,
        sections: prev.sections.map((section) =>
          section.id === recordingState.targetSectionId
            ? { ...section, takes: [...section.takes, audioTake] }
            : section
        ),
      }));
    }
  };

  const handleRecordCancel = async () => {
    await handleStopRecording(false);
  };

  const handleTakesPress = (sectionId: string) => {
    console.log('Takes pressed for section:', sectionId);
    // TODO: Open takes player bottom sheet
  };

  const handleAIPress = (sectionId: string) => {
    console.log('AI pressed for section:', sectionId);
    // TODO: Open AI modal
  };

  const handleAddSection = (title: string) => {
    addSection(title);
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header title="Lyriq" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Lyriq"
        rightComponent={
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={() => setShowSyllableCount(!showSyllableCount)}
              style={styles.headerButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <SyllableCountIcon size={22} active={showSyllableCount} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsModalOpen(true)}
              style={styles.headerButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <PlusIcon size={22} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {song.sections.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            isActive={activeSectionId === section.id}
            onLyricsChange={updateSectionLyrics}
            onTitleChange={updateSectionTitle}
            onFocus={setActiveSectionId}
            onRecordPress={handleRecordPress}
            onTakesPress={handleTakesPress}
            onAIPress={handleAIPress}
            showSyllableCount={showSyllableCount}
            isUnstructured={isUnstructured}
          />
        ))}
      </ScrollView>

      <SectionModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddSection={handleAddSection}
      />

      {/* Recording UI */}
      {isRecording && recordingState.startTime && (
        <AudioRecorder
          startTime={recordingState.startTime}
          onSave={handleRecordSave}
          onCancel={handleRecordCancel}
        />
      )}

      {/* Floating Record Button */}
      {!isRecording && activeSectionId && (
        <RecordButton
          onPress={() => handleRecordPress(activeSectionId)}
          isRecording={isRecording}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.base,
    paddingBottom: SPACING.xxxl,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  headerButton: {
    padding: SPACING.xs,
  },
});
