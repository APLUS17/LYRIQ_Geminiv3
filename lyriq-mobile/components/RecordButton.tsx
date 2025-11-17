/**
 * RecordButton Component
 * Floating red record button
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS } from '../theme';
import { MicrophoneIcon } from './Icons';

interface RecordButtonProps {
  onPress: () => void;
  isRecording?: boolean;
}

export const RecordButton: React.FC<RecordButtonProps> = ({
  onPress,
  isRecording = false,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          bottom: insets.bottom + SPACING.base,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isRecording}
    >
      <MicrophoneIcon size={28} color={COLORS.text} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: SPACING.base,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.recording,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
