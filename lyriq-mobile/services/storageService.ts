/**
 * Storage service for persisting song data
 * Uses AsyncStorage for local persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song } from '../types';

const STORAGE_KEY = '@lyriq:song';
const SETTINGS_KEY = '@lyriq:settings';

/**
 * Save song to local storage
 */
export async function saveSong(song: Song): Promise<boolean> {
  try {
    const jsonValue = JSON.stringify(song);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    return true;
  } catch (error) {
    console.error('Error saving song:', error);
    return false;
  }
}

/**
 * Load song from local storage
 */
export async function loadSong(): Promise<Song | null> {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error loading song:', error);
    return null;
  }
}

/**
 * Clear song data (reset)
 */
export async function clearSong(): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing song:', error);
    return false;
  }
}

/**
 * Save app settings
 */
export async function saveSettings(settings: Record<string, any>): Promise<boolean> {
  try {
    const jsonValue = JSON.stringify(settings);
    await AsyncStorage.setItem(SETTINGS_KEY, jsonValue);
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

/**
 * Load app settings
 */
export async function loadSettings(): Promise<Record<string, any> | null> {
  try {
    const jsonValue = await AsyncStorage.getItem(SETTINGS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error loading settings:', error);
    return null;
  }
}
