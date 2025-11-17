/**
 * AudioRecorder Component
 * Recording bar that appears at bottom during recording
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../theme';
import { TrashIcon, CheckIcon } from './Icons';
import { formatTime } from '../utils';

interface AudioRecorderProps {
  startTime: number;
  onSave: () => void;
  onCancel: () => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  startTime,
  onSave,
  onCancel,
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pulseAnim] = useState(new Animated.Value(1));
  const insets = useSafeAreaInsets();

  // Update elapsed time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  // Pulsing animation for recording indicator
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + SPACING.base }]}>
      <View style={styles.recordingBar}>
        <View style={styles.leftSection}>
          <Animated.View
            style={[
              styles.pulseIndicator,
              { transform: [{ scale: pulseAnim }] },
            ]}
          />
          <Text style={styles.timer}>{formatTime(elapsedTime)}</Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            onPress={onCancel}
            style={styles.controlButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <TrashIcon size={24} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSave}
            style={styles.controlButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <CheckIcon size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.base,
  },
  recordingBar: {
    backgroundColor: COLORS.recording,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  pulseIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.text,
  },
  timer: {
    fontFamily: 'monospace',
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  controls: {
    flexDirection: 'row',
    gap: SPACING.base,
  },
  controlButton: {
    padding: SPACING.sm,
  },
});
