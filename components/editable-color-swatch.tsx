import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface EditableColorSwatchProps {
  name: string;
  value: string;
  isModified: boolean;
  onPress: () => void;
}

export function EditableColorSwatch({
  name,
  value,
  isModified,
  onPress,
}: EditableColorSwatchProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center justify-between rounded-xl border px-3 py-2 ${
        isModified
          ? "border-primary bg-primary/10"
          : "border-border bg-surface"
      }`}
    >
      <View className="flex-row items-center gap-3 flex-1">
        <View
          className="h-8 w-8 rounded-lg border-2 border-border"
          style={{ backgroundColor: value }}
        />
        <View className="flex-1">
          <Text className="text-sm font-semibold text-foreground">{name}</Text>
          {isModified && (
            <Text className="text-xs text-primary font-semibold">Modified</Text>
          )}
        </View>
      </View>
      <Text className="text-xs font-mono text-muted">{value}</Text>
    </TouchableOpacity>
  );
}
