/**
 * Waveform Component
 * Audio waveform visualization using SVG
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { COLORS, WAVEFORM_CONFIG } from '../theme';
import { Audio } from 'expo-av';

interface WaveformProps {
  audioUri: string;
  progress?: number; // 0 to 1
  height?: number;
  onPress?: (progress: number) => void;
}

export const Waveform: React.FC<WaveformProps> = ({
  audioUri,
  progress = 0,
  height = WAVEFORM_CONFIG.height,
  onPress,
}) => {
  const [bars, setBars] = useState<number[]>([]);
  const screenWidth = Dimensions.get('window').width - 32; // Padding

  useEffect(() => {
    generateWaveform();
  }, [audioUri]);

  const generateWaveform = async () => {
    try {
      // For now, generate a simple pseudo-random waveform
      // In production, you'd analyze the actual audio data
      const barCount = Math.floor(screenWidth / (WAVEFORM_CONFIG.barWidth + WAVEFORM_CONFIG.barGap));
      const newBars: number[] = [];

      // Create pseudo-random waveform that looks realistic
      for (let i = 0; i < barCount; i++) {
        const randomHeight = Math.random() * 0.8 + 0.2; // 20-100%
        newBars.push(randomHeight);
      }

      setBars(newBars);
    } catch (error) {
      console.error('Error generating waveform:', error);
    }
  };

  const handlePress = (event: any) => {
    if (!onPress) return;

    const { locationX } = event.nativeEvent;
    const newProgress = Math.max(0, Math.min(1, locationX / screenWidth));
    onPress(newProgress);
  };

  const progressPixels = screenWidth * progress;

  return (
    <View style={[styles.container, { height }]}>
      <Svg width={screenWidth} height={height} onPress={handlePress}>
        {bars.map((barHeight, index) => {
          const x = index * (WAVEFORM_CONFIG.barWidth + WAVEFORM_CONFIG.barGap);
          const barActualHeight = height * barHeight;
          const y = (height - barActualHeight) / 2;

          // Determine color based on progress
          const isPlayed = x < progressPixels;
          const color = isPlayed
            ? WAVEFORM_CONFIG.progressColor
            : WAVEFORM_CONFIG.backgroundColor;

          return (
            <Rect
              key={index}
              x={x}
              y={y}
              width={WAVEFORM_CONFIG.barWidth}
              height={barActualHeight}
              fill={color}
              rx={1}
            />
          );
        })}

        {/* Playhead */}
        <Rect
          x={progressPixels - 1}
          y={0}
          width={2}
          height={height}
          fill={WAVEFORM_CONFIG.playheadColor}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
  },
});
