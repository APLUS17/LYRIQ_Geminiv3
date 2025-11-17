/**
 * DraggableSection Component
 * Wrapper for SectionCard with drag-to-reorder gesture
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface DraggableSectionProps {
  children: React.ReactNode;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  enabled?: boolean;
}

type ContextType = {
  startY: number;
};

export const DraggableSection: React.FC<DraggableSectionProps> = ({
  children,
  onDragStart,
  onDragEnd,
  enabled = false, // Disabled by default for now
}) => {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    ContextType
  >({
    onStart: (_, context) => {
      context.startY = translateY.value;
      scale.value = withSpring(1.05);
      if (onDragStart) {
        runOnJS(onDragStart)();
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    onActive: (event, context) => {
      translateY.value = context.startY + event.translationY;
    },
    onEnd: () => {
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
      if (onDragEnd) {
        runOnJS(onDragEnd)();
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <PanGestureHandler onGestureEvent={gestureHandler} enabled={enabled}>
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </PanGestureHandler>
  );
};
