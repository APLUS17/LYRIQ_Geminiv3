/**
 * AIActionModal Component
 * Modal for AI actions (suggest, rewrite, etc.)
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../theme';
import { Button } from './Button';
import { CloseIcon, GeminiIcon } from './Icons';
import { suggestLyrics, rewriteLyrics } from '../services/geminiService';

interface AIActionModalProps {
  visible: boolean;
  sectionTitle: string;
  currentLyrics: string;
  onClose: () => void;
  onApply: (newLyrics: string) => void;
}

export const AIActionModal: React.FC<AIActionModalProps> = ({
  visible,
  sectionTitle,
  currentLyrics,
  onClose,
  onApply,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const handleAction = async (action: 'suggest' | 'rewrite', style?: string) => {
    setIsLoading(true);
    setSelectedAction(action);
    setResult(null);

    try {
      let response: string;
      if (action === 'suggest') {
        response = await suggestLyrics(currentLyrics, sectionTitle);
      } else {
        response = await rewriteLyrics(currentLyrics, style || 'modern');
      }
      setResult(response);
    } catch (error) {
      console.error('AI action error:', error);
      setResult('Error generating AI response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (result) {
      onApply(result);
      handleReset();
      onClose();
    }
  };

  const handleReset = () => {
    setResult(null);
    setSelectedAction(null);
    setIsLoading(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const styles_list = [
    'Poetic',
    'Modern',
    'Classic',
    'Hip-Hop',
    'Country',
    'Rock',
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.titleRow}>
                  <GeminiIcon size={24} color={COLORS.accent} />
                  <Text style={styles.title}>AI Assistant</Text>
                </View>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <CloseIcon size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.subtitle}>"{sectionTitle}"</Text>

              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
              >
                {!result && !isLoading && (
                  <>
                    {/* Suggest Button */}
                    <Button
                      title="Suggest Improvements"
                      onPress={() => handleAction('suggest')}
                      variant="primary"
                      style={styles.actionButton}
                    />

                    {/* Rewrite Styles */}
                    <Text style={styles.sectionLabel}>Rewrite in Style:</Text>
                    <View style={styles.styleGrid}>
                      {styles_list.map((style) => (
                        <TouchableOpacity
                          key={style}
                          style={styles.styleButton}
                          onPress={() => handleAction('rewrite', style)}
                        >
                          <Text style={styles.styleButtonText}>{style}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                {isLoading && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.accent} />
                    <Text style={styles.loadingText}>
                      AI is working on your lyrics...
                    </Text>
                  </View>
                )}

                {result && !isLoading && (
                  <View style={styles.resultContainer}>
                    <Text style={styles.resultLabel}>AI Suggestion:</Text>
                    <View style={styles.resultBox}>
                      <Text style={styles.resultText}>{result}</Text>
                    </View>

                    <View style={styles.resultActions}>
                      <Button
                        title="Try Again"
                        onPress={handleReset}
                        variant="secondary"
                        style={styles.resultButton}
                      />
                      <Button
                        title="Apply"
                        onPress={handleApply}
                        variant="primary"
                        style={styles.resultButton}
                      />
                    </View>
                  </View>
                )}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.base,
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  scrollView: {
    maxHeight: 500,
  },
  actionButton: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  styleButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  styleButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.medium,
  },
  loadingContainer: {
    padding: SPACING.xxxl,
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  resultContainer: {
    marginTop: SPACING.md,
  },
  resultLabel: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  resultBox: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    maxHeight: 300,
  },
  resultText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.text,
    lineHeight: FONT_SIZES.base * 1.5,
  },
  resultActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  resultButton: {
    flex: 1,
  },
});
