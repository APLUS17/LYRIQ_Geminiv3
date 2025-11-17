/**
 * SwipeableSection Component
 * Wrapper for SectionCard with swipe-to-delete gesture
 */

import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, RADIUS } from '../theme';
import { TrashIcon } from './Icons';

interface SwipeableSectionProps {
  children: React.ReactNode;
  onDelete: () => void;
  enabled?: boolean;
}

export const SwipeableSection: React.FC<SwipeableSectionProps> = ({
  children,
  onDelete,
  enabled = true,
}) => {
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.deleteAction,
          {
            transform: [{ translateX: trans }],
          },
        ]}
      >
        <TrashIcon size={24} color={COLORS.text} />
        <Text style={styles.deleteText}>Delete</Text>
      </Animated.View>
    );
  };

  const handleSwipeableOpen = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onDelete();
  };

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      onSwipeableOpen={handleSwipeableOpen}
      rightThreshold={40}
      overshootRight={false}
      friction={2}
      onSwipeableWillOpen={handleDelete}
    >
      {children}
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  deleteAction: {
    backgroundColor: COLORS.destructive,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: RADIUS.md,
    marginLeft: SPACING.sm,
  },
  deleteText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
