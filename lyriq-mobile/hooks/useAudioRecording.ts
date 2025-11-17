/**
 * useAudioRecording Hook
 * Manages audio recording state and operations
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { RecordingState, AudioTake } from '../types';
import { startRecording, stopRecording, cancelRecording } from '../services/audioService';

export function useAudioRecording() {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    status: 'idle',
    targetSectionId: null,
    startTime: null,
  });

  const handleStartRecording = useCallback(async (sectionId: string) => {
    const success = await startRecording();
    if (success) {
      setRecordingState({
        status: 'recording',
        targetSectionId: sectionId,
        startTime: Date.now(),
      });
    } else {
      Alert.alert(
        'Recording Error',
        'Failed to start recording. Please check microphone permissions.'
      );
    }
  }, []);

  const handleStopRecording = useCallback(
    async (save: boolean): Promise<AudioTake | null> => {
      if (recordingState.status !== 'recording') {
        return null;
      }

      if (save) {
        const audioTake = await stopRecording();
        setRecordingState({
          status: 'idle',
          targetSectionId: null,
          startTime: null,
        });
        return audioTake;
      } else {
        await cancelRecording();
        setRecordingState({
          status: 'idle',
          targetSectionId: null,
          startTime: null,
        });
        return null;
      }
    },
    [recordingState.status]
  );

  const isRecording = recordingState.status === 'recording';

  return {
    recordingState,
    isRecording,
    handleStartRecording,
    handleStopRecording,
  };
}
