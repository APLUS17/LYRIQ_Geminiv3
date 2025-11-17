/**
 * TakesPlayer Component
 * Bottom sheet for playing audio takes
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Audio } from 'expo-av';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../theme';
import { Section, AudioTake } from '../types';
import { formatDuration } from '../utils';
import { Waveform } from './Waveform';
import {
  PlayIcon,
  PauseIcon,
  NextIcon,
  PreviousIcon,
  TrashIcon,
  ChevronDownIcon,
} from './Icons';

interface TakesPlayerProps {
  section: Section;
  onClose: () => void;
  onDeleteTake: (takeId: string) => void;
}

export const TakesPlayer: React.FC<TakesPlayerProps> = ({
  section,
  onClose,
  onDeleteTake,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const [currentTakeIndex, setCurrentTakeIndex] = useState(section.takes.length - 1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const currentTake = section.takes[currentTakeIndex];
  const snapPoints = React.useMemo(() => ['15%', '70%'], []);

  useEffect(() => {
    // Open bottom sheet on mount
    bottomSheetRef.current?.snapToIndex(0);

    return () => {
      // Cleanup sound on unmount
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (!currentTake) return;

    loadSound();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [currentTake]);

  const loadSound = async () => {
    try {
      // Unload previous sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: currentTake.url },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;

      const status = await sound.getStatusAsync();
      if (status.isLoaded && status.durationMillis) {
        setDuration(status.durationMillis / 1000);
      }
    } catch (error) {
      console.error('Error loading sound:', error);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setProgress(status.positionMillis / status.durationMillis);

      if (status.didJustFinish) {
        setIsPlaying(false);
        setProgress(0);
      }
    }
  };

  const handlePlayPause = async () => {
    if (!soundRef.current) return;

    try {
      const status = await soundRef.current.getStatusAsync();

      if (status.isLoaded) {
        if (isPlaying) {
          await soundRef.current.pauseAsync();
        } else {
          await soundRef.current.playAsync();
        }
        setIsPlaying(!isPlaying);
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const handlePrevious = () => {
    if (currentTakeIndex > 0) {
      setCurrentTakeIndex(currentTakeIndex - 1);
      setIsPlaying(false);
      setProgress(0);
    }
  };

  const handleNext = () => {
    if (currentTakeIndex < section.takes.length - 1) {
      setCurrentTakeIndex(currentTakeIndex + 1);
      setIsPlaying(false);
      setProgress(0);
    }
  };

  const handleDelete = () => {
    if (currentTake) {
      onDeleteTake(currentTake.id);

      // Adjust current index if needed
      if (currentTakeIndex >= section.takes.length - 1) {
        setCurrentTakeIndex(Math.max(0, section.takes.length - 2));
      }

      // Close if no takes left
      if (section.takes.length === 1) {
        onClose();
      }
    }
  };

  const handleWaveformPress = async (newProgress: number) => {
    if (!soundRef.current) return;

    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded && status.durationMillis) {
        await soundRef.current.setPositionAsync(newProgress * status.durationMillis);
        setProgress(newProgress);
      }
    } catch (error) {
      console.error('Error scrubbing:', error);
    }
  };

  if (!currentTake) {
    onClose();
    return null;
  }

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.contentContainer}>
        {/* Peek View Header */}
        <View style={styles.peekHeader}>
          <View style={styles.peekInfo}>
            <Text style={styles.peekTitle}>
              Take #{currentTakeIndex + 1} - {section.title}
            </Text>
            <Text style={styles.peekDuration}>
              {formatDuration(progress * duration)} / {formatDuration(duration)}
            </Text>
          </View>
          <View style={styles.peekControls}>
            <TouchableOpacity
              onPress={handlePrevious}
              disabled={currentTakeIndex === 0}
              style={[styles.controlButton, currentTakeIndex === 0 && styles.controlButtonDisabled]}
            >
              <PreviousIcon size={20} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
              {isPlaying ? (
                <PauseIcon size={24} color={COLORS.background} />
              ) : (
                <PlayIcon size={24} color={COLORS.background} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNext}
              disabled={currentTakeIndex >= section.takes.length - 1}
              style={[styles.controlButton, currentTakeIndex >= section.takes.length - 1 && styles.controlButtonDisabled]}
            >
              <NextIcon size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Expanded View Content */}
        <View style={styles.expandedContent}>
          <View style={styles.expandedHeader}>
            <View>
              <Text style={styles.expandedTitle}>
                Take #{currentTakeIndex + 1} of {section.takes.length}
              </Text>
              <Text style={styles.expandedSubtitle}>{section.title}</Text>
            </View>
            <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
              <TrashIcon size={20} color={COLORS.destructive} />
            </TouchableOpacity>
          </View>

          {/* Waveform */}
          <View style={styles.waveformContainer}>
            <Waveform
              audioUri={currentTake.url}
              progress={progress}
              onPress={handleWaveformPress}
            />
          </View>

          {/* Time Display */}
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatDuration(progress * duration)}</Text>
            <Text style={styles.timeText}>{formatDuration(duration)}</Text>
          </View>

          {/* Expanded Controls */}
          <View style={styles.expandedControls}>
            <TouchableOpacity
              onPress={handlePrevious}
              disabled={currentTakeIndex === 0}
              style={[styles.controlButton, currentTakeIndex === 0 && styles.controlButtonDisabled]}
            >
              <PreviousIcon size={28} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePlayPause} style={styles.playButtonLarge}>
              {isPlaying ? (
                <PauseIcon size={32} color={COLORS.background} />
              ) : (
                <PlayIcon size={32} color={COLORS.background} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNext}
              disabled={currentTakeIndex >= section.takes.length - 1}
              style={[styles.controlButton, currentTakeIndex >= section.takes.length - 1 && styles.controlButtonDisabled]}
            >
              <NextIcon size={28} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: COLORS.surface,
  },
  handleIndicator: {
    backgroundColor: COLORS.border,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: SPACING.base,
  },
  peekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  peekInfo: {
    flex: 1,
  },
  peekTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    marginBottom: 4,
  },
  peekDuration: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  peekControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  controlButton: {
    padding: SPACING.sm,
  },
  controlButtonDisabled: {
    opacity: 0.3,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedContent: {
    marginTop: SPACING.lg,
  },
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  expandedTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  expandedSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  deleteButton: {
    padding: SPACING.sm,
  },
  waveformContainer: {
    marginVertical: SPACING.lg,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  timeText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'monospace',
    color: COLORS.textSecondary,
  },
  expandedControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xl,
    marginTop: SPACING.base,
  },
});
