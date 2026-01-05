import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal } from "react-native";

interface ColorPickerModalProps {
  isVisible: boolean;
  colorName: string;
  currentColor: string;
  onClose: () => void;
  onApply: (color: string) => void;
}

export function ColorPickerModal({
  isVisible,
  colorName,
  currentColor,
  onClose,
  onApply,
}: ColorPickerModalProps) {
  const [hexColor, setHexColor] = useState(currentColor);

  useEffect(() => {
    setHexColor(currentColor);
  }, [currentColor]);

  const handleApply = () => {
    // Validate hex color format
    if (/^#[0-9A-F]{6}$/i.test(hexColor)) {
      onApply(hexColor);
      onClose();
    }
  };

  // Convert hex to RGB for display
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const rgb = hexToRgb(hexColor);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-background rounded-2xl p-6 w-full max-w-sm border border-border">
          {/* Header */}
          <Text className="text-lg font-bold text-foreground mb-1">
            Edit Color
          </Text>
          <Text className="text-sm text-muted font-mono mb-4">
            {colorName}
          </Text>

          {/* Color Preview */}
          <View
            className="w-full h-32 rounded-xl mb-4 border-2 border-border"
            style={{ backgroundColor: hexColor }}
          />

          {/* Hex Input */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">
              Hex Value
            </Text>
            <TextInput
              className="w-full px-3 py-2 border border-border rounded-lg font-mono text-foreground bg-surface"
              value={hexColor}
              onChangeText={setHexColor}
              placeholder="#000000"
              placeholderTextColor="#999"
            />
          </View>

          {/* RGB Display */}
          {rgb && (
            <View className="mb-4 p-3 bg-surface rounded-lg border border-border">
              <Text className="text-xs text-muted font-mono">
                RGB({rgb.r}, {rgb.g}, {rgb.b})
              </Text>
            </View>
          )}

          {/* Actions */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="flex-1 py-3 rounded-lg bg-surface border border-border"
              onPress={onClose}
            >
              <Text className="text-center font-semibold text-foreground">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3 rounded-lg bg-primary"
              onPress={handleApply}
            >
              <Text className="text-center font-semibold text-background">
                Apply
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
