/**
 * Audio service for recording and playback
 * Uses expo-av for React Native
 */

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { AudioTake } from '../types';
import { generateId } from '../utils/formatters';

// Audio recording instance
let recording: Audio.Recording | null = null;

/**
 * Request audio recording permissions
 */
export async function requestAudioPermissions(): Promise<boolean> {
  try {
    const { granted } = await Audio.requestPermissionsAsync();
    return granted;
  } catch (error) {
    console.error('Error requesting audio permissions:', error);
    return false;
  }
}

/**
 * Start audio recording
 */
export async function startRecording(): Promise<boolean> {
  try {
    // Request permissions first
    const hasPermission = await requestAudioPermissions();
    if (!hasPermission) {
      console.error('Audio recording permission not granted');
      return false;
    }

    // Set audio mode for recording
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    // Create and start recording
    const { recording: newRecording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    recording = newRecording;
    return true;
  } catch (error) {
    console.error('Error starting recording:', error);
    return false;
  }
}

/**
 * Stop audio recording and return the audio take
 */
export async function stopRecording(): Promise<AudioTake | null> {
  try {
    if (!recording) {
      console.error('No active recording to stop');
      return null;
    }

    // Stop and unload the recording
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();

    if (!uri) {
      console.error('Failed to get recording URI');
      return null;
    }

    // Get recording status for duration
    const status = await recording.getStatusAsync();
    const duration = status.isLoaded ? status.durationMillis / 1000 : 0;

    // Read file as base64
    const base64Data = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Create audio take object
    const audioTake: AudioTake = {
      id: generateId(),
      url: uri,
      data: base64Data,
      mimeType: 'audio/mp4', // iOS default, Android may vary
      duration,
      timestamp: Date.now(),
    };

    // Reset recording instance
    recording = null;

    return audioTake;
  } catch (error) {
    console.error('Error stopping recording:', error);
    recording = null;
    return null;
  }
}

/**
 * Cancel current recording without saving
 */
export async function cancelRecording(): Promise<void> {
  try {
    if (recording) {
      await recording.stopAndUnloadAsync();
      recording = null;
    }
  } catch (error) {
    console.error('Error canceling recording:', error);
  }
}

/**
 * Get audio duration from a file URI
 */
export async function getAudioDuration(uri: string): Promise<number> {
  try {
    const { sound } = await Audio.Sound.createAsync({ uri });
    const status = await sound.getStatusAsync();
    await sound.unloadAsync();

    if (status.isLoaded) {
      return status.durationMillis ? status.durationMillis / 1000 : 0;
    }
    return 0;
  } catch (error) {
    console.error('Error getting audio duration:', error);
    return 0;
  }
}

/**
 * Create sound object for playback
 */
export async function createSound(uri: string): Promise<Audio.Sound | null> {
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: false }
    );
    return sound;
  } catch (error) {
    console.error('Error creating sound:', error);
    return null;
  }
}
