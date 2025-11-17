/**
 * SectionModal Component
 * Modal for adding new sections
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, Z_INDEX } from '../theme';
import { Button } from './Button';
import { CloseIcon } from './Icons';
import { SECTION_TYPES, SectionType } from '../utils/constants';

interface SectionModalProps {
  visible: boolean;
  onClose: () => void;
  onAddSection: (title: string) => void;
}

export const SectionModal: React.FC<SectionModalProps> = ({
  visible,
  onClose,
  onAddSection,
}) => {
  const [customTitle, setCustomTitle] = useState('');
  const [selectedType, setSelectedType] = useState<SectionType | null>(null);

  useEffect(() => {
    if (!visible) {
      // Reset state when modal closes
      setCustomTitle('');
      setSelectedType(null);
    }
  }, [visible]);

  const handleAddSection = () => {
    const title = customTitle.trim() || selectedType || 'New Section';
    onAddSection(title);
    onClose();
  };

  const handleTypeSelect = (type: SectionType) => {
    setSelectedType(type);
    setCustomTitle('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContainer}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Add Section</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <CloseIcon size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Custom Title Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Custom Title</Text>
                <TextInput
                  style={styles.input}
                  value={customTitle}
                  onChangeText={(text) => {
                    setCustomTitle(text);
                    setSelectedType(null);
                  }}
                  placeholder="Enter custom section name..."
                  placeholderTextColor={COLORS.textSecondary}
                  autoCapitalize="words"
                  returnKeyType="done"
                  onSubmitEditing={handleAddSection}
                />
              </View>

              <Text style={styles.orText}>— or choose a preset —</Text>

              {/* Section Type Presets */}
              <ScrollView
                style={styles.typesScrollView}
                contentContainerStyle={styles.typesContainer}
                showsVerticalScrollIndicator={false}
              >
                {SECTION_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      selectedType === type && styles.typeButtonSelected,
                    ]}
                    onPress={() => handleTypeSelect(type)}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        selectedType === type && styles.typeButtonTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Actions */}
              <View style={styles.actions}>
                <Button
                  title="Cancel"
                  onPress={onClose}
                  variant="secondary"
                  style={styles.actionButton}
                />
                <Button
                  title="Add Section"
                  onPress={handleAddSection}
                  variant="primary"
                  style={styles.actionButton}
                  disabled={!customTitle.trim() && !selectedType}
                />
              </View>
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
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  inputContainer: {
    marginBottom: SPACING.base,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.base,
    color: COLORS.text,
  },
  orText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    marginVertical: SPACING.base,
  },
  typesScrollView: {
    maxHeight: 200,
    marginBottom: SPACING.lg,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  typeButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  typeButtonSelected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  typeButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.medium,
  },
  typeButtonTextSelected: {
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.bold,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionButton: {
    flex: 1,
  },
});
