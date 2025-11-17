/**
 * More/Settings Screen
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Header } from '../../components/Header';
import { COLORS, SPACING } from '../../theme';

export default function MoreScreen() {
  return (
    <View style={styles.container}>
      <Header title="Settings" />
      <View style={styles.content}>
        <Text style={styles.placeholderText}>
          Settings and options will appear here
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.base,
  },
  placeholderText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
});
