/**
 * Main Editor Screen
 * Core lyric editing interface with full section management
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Header } from '../../components/Header';
import { SectionCard } from '../../components/SectionCard';
import { SectionModal } from '../../components/SectionModal';
import { AudioRecorder } from '../../components/AudioRecorder';
import { RecordButton } from '../../components/RecordButton';
import { TakesPlayer } from '../../components/TakesPlayer';
import { MasterBeatPlayer } from '../../components/MasterBeatPlayer';
import { SwipeableSection } from '../../components/SwipeableSection';
import { AIActionModal } from '../../components/AIActionModal';
import { COLORS, SPACING } from '../../theme';
import { PlusIcon, SyllableCountIcon, MusicNoteIcon } from '../../components/Icons';
import { useSongState } from '../../hooks/useSongState';
import { useAudioRecording } from '../../hooks/useAudioRecording';
import { MasterBeat, Lyric } from '../../types';

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
    deleteSection,
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
  const [activePlayerSectionId, setActivePlayerSectionId] = useState<string | null>(null);
  const [masterBeat, setMasterBeat] = useState<MasterBeat | null>(null);
  const [showMasterBeatPlayer, setShowMasterBeatPlayer] = useState(false);
  const [aiModalSectionId, setAiModalSectionId] = useState<string | null>(null);

  const handleRecordPress = async (sectionId: string) => {
    if (isRecording) return;
    await handleStartRecording(sectionId);
  };

  const handleRecordSave = async () => {
    const audioTake = await handleStopRecording(true);
    if (audioTake && recordingState.targetSectionId) {
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
    setActivePlayerSectionId(sectionId);
  };

  const handleDeleteTake = (takeId: string) => {
    if (!activePlayerSectionId) return;

    setSong((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === activePlayerSectionId
          ? { ...section, takes: section.takes.filter((t) => t.id !== takeId) }
          : section
      ),
    }));
  };

  const handleAIPress = (sectionId: string) => {
    setAiModalSectionId(sectionId);
  };

  const handleAIApply = (sectionId: string, newLyrics: string) => {
    const lines = newLyrics.split('\n');
    const lyrics: Lyric[] = lines.map((line) => ({
      id: `${Date.now()}_${Math.random()}`,
      text: line,
    }));

    updateSectionLyrics(sectionId, lyrics);
  };

  const handleMasterBeatPress = () => {
    setShowMasterBeatPlayer(true);
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
              onPress={handleMasterBeatPress}
              style={styles.headerButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MusicNoteIcon size={22} color={masterBeat ? COLORS.accent : COLORS.textSecondary} />
            </TouchableOpacity>
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

      <GestureHandlerRootView style={{ flex: 1 }}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {song.sections.map((section) => (
            <SwipeableSection
              key={section.id}
              onDelete={() => deleteSection(section.id)}
              enabled={!isUnstructured && song.sections.length > 1}
            >
              <SectionCard
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
            </SwipeableSection>
          ))}
        </ScrollView>
      </GestureHandlerRootView>

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

      {/* Takes Player */}
      {activePlayerSectionId && (() => {
        const section = song.sections.find((s) => s.id === activePlayerSectionId);
        return section && section.takes.length > 0 ? (
          <TakesPlayer
            section={section}
            onClose={() => setActivePlayerSectionId(null)}
            onDeleteTake={handleDeleteTake}
          />
        ) : null;
      })()}

      {/* Master Beat Player */}
      {showMasterBeatPlayer && (
        <MasterBeatPlayer
          beat={masterBeat}
          onBeatChange={setMasterBeat}
          onClose={() => setShowMasterBeatPlayer(false)}
        />
      )}

      {/* AI Action Modal */}
      {aiModalSectionId && (() => {
        const section = song.sections.find((s) => s.id === aiModalSectionId);
        if (!section) return null;

        const currentLyrics = section.lyrics.map((l) => l.text).join('\n');

        return (
          <AIActionModal
            visible={true}
            sectionTitle={section.title}
            currentLyrics={currentLyrics}
            onClose={() => setAiModalSectionId(null)}
            onApply={(newLyrics) => handleAIApply(aiModalSectionId, newLyrics)}
          />
        );
      })()}
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
