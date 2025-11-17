/**
 * MasterBeatPlayer Component
 * Bottom sheet for playing master beat/track
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../theme';
import { MasterBeat } from '../types';
import { formatDuration } from '../utils';
import { Waveform } from './Waveform';
import {
  PlayIcon,
  PauseIcon,
  TrashIcon,
  PlusIcon,
} from './Icons';

interface MasterBeatPlayerProps {
  beat: MasterBeat | null;
  onBeatChange: (beat: MasterBeat | null) => void;
  onClose: () => void;
}

export const MasterBeatPlayer: React.FC<MasterBeatPlayerProps> = ({
  beat,
  onBeatChange,
  onClose,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const snapPoints = React.useMemo(() => ['15%', '50%'], []);

  useEffect(() => {
    bottomSheetRef.current?.snapToIndex(0);

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (beat) {
      loadSound();
    }

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [beat]);

  const loadSound = async () => {
    if (!beat) return;

    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: beat.url },
        { shouldPlay: false, isLooping: true },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;

      const status = await sound.getStatusAsync();
      if (status.isLoaded && status.durationMillis) {
        setDuration(status.durationMillis / 1000);
      }
    } catch (error) {
      console.error('Error loading beat:', error);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setProgress(status.positionMillis / status.durationMillis);
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

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        const newBeat: MasterBeat = {
          url: file.uri,
          uri: file.uri,
          duration: 0, // Will be determined when loaded
          fileName: file.name,
        };
        onBeatChange(newBeat);
      }
    } catch (error) {
      console.error('Error picking audio file:', error);
      Alert.alert('Error', 'Failed to load audio file');
    }
  };

  const handleRemove = () => {
    Alert.alert(
      'Remove Master Beat',
      'Are you sure you want to remove the master beat?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            onBeatChange(null);
            onClose();
          },
        },
      ]
    );
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
        {!beat ? (
          /* No Beat - Upload View */
          <View style={styles.emptyState}>
            <TouchableOpacity onPress={handleUpload} style={styles.uploadButton}>
              <PlusIcon size={24} color={COLORS.text} />
              <Text style={styles.uploadText}>Upload Master Beat</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Peek View */}
            <View style={styles.peekHeader}>
              <View style={styles.peekInfo}>
                <Text style={styles.peekTitle} numberOfLines={1}>
                  {beat.fileName}
                </Text>
                <Text style={styles.peekDuration}>
                  {formatDuration(progress * duration)} / {formatDuration(duration)}
                </Text>
              </View>
              <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
                {isPlaying ? (
                  <PauseIcon size={24} color={COLORS.background} />
                ) : (
                  <PlayIcon size={24} color={COLORS.background} />
                )}
              </TouchableOpacity>
            </View>

            {/* Expanded View */}
            <View style={styles.expandedContent}>
              <View style={styles.expandedHeader}>
                <View style={styles.headerInfo}>
                  <Text style={styles.expandedTitle} numberOfLines={1}>
                    {beat.fileName}
                  </Text>
                  <Text style={styles.expandedSubtitle}>Master Beat</Text>
                </View>
                <TouchableOpacity onPress={handleRemove} style={styles.deleteButton}>
                  <TrashIcon size={20} color={COLORS.destructive} />
                </TouchableOpacity>
              </View>

              {/* Waveform */}
              <View style={styles.waveformContainer}>
                <Waveform
                  audioUri={beat.url}
                  progress={progress}
                  onPress={handleWaveformPress}
                />
              </View>

              {/* Time Display */}
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{formatDuration(progress * duration)}</Text>
                <Text style={styles.timeText}>{formatDuration(duration)}</Text>
              </View>

              {/* Controls */}
              <View style={styles.controls}>
                <TouchableOpacity onPress={handlePlayPause} style={styles.playButtonLarge}>
                  {isPlaying ? (
                    <PauseIcon size={32} color={COLORS.background} />
                  ) : (
                    <PlayIcon size={32} color={COLORS.background} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  uploadText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
  },
  peekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  peekInfo: {
    flex: 1,
    marginRight: SPACING.md,
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
  headerInfo: {
    flex: 1,
    marginRight: SPACING.md,
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
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.base,
  },
});
