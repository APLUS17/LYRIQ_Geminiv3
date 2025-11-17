/**
 * RhymePopup Component
 * Popup showing AI-generated rhyming words
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../theme';

interface RhymePopupProps {
  word: string;
  rhymes: string[];
  isLoading: boolean;
  position: { top: number; left: number };
  onSelectRhyme: (rhyme: string) => void;
  onClose: () => void;
}

export const RhymePopup: React.FC<RhymePopupProps> = ({
  word,
  rhymes,
  isLoading,
  position,
  onSelectRhyme,
  onClose,
}) => {
  return (
    <>
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Popup */}
      <View
        style={[
          styles.popup,
          {
            top: position.top + 30,
            left: Math.max(SPACING.base, Math.min(position.left, 300)),
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>Rhymes for "{word}"</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.accent} />
            <Text style={styles.loadingText}>Finding rhymes...</Text>
          </View>
        ) : rhymes.length > 0 ? (
          <ScrollView
            style={styles.rhymeList}
            showsVerticalScrollIndicator={false}
          >
            {rhymes.map((rhyme, index) => (
              <TouchableOpacity
                key={index}
                style={styles.rhymeItem}
                onPress={() => {
                  onSelectRhyme(rhyme);
                  onClose();
                }}
              >
                <Text style={styles.rhymeText}>{rhyme}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No rhymes found</Text>
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  popup: {
    position: 'absolute',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 200,
    maxWidth: 300,
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  loadingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  rhymeList: {
    maxHeight: 200,
  },
  rhymeItem: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rhymeText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.text,
  },
  emptyContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});
