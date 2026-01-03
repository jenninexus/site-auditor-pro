import { View, Text, Pressable } from "react-native";
import { useState } from "react";
import { useColors } from "@/hooks/use-colors";
import { type ColorSuggestion, getStrategyDescription } from "@/lib/color-suggester";

interface ColorSuggestionCardProps {
  suggestion: ColorSuggestion;
  onSelect?: (suggestion: ColorSuggestion) => void;
}

export function ColorSuggestionCard({ suggestion, onSelect }: ColorSuggestionCardProps) {
  const colors = useColors();
  const [isExpanded, setIsExpanded] = useState(false);

  const getStrategyColor = (strategy: string) => {
    const strategyColors: Record<string, string> = {
      "darken-fg": "#3B82F6",
      "lighten-bg": "#F59E0B",
      "saturate-fg": "#EC4899",
      "desaturate-bg": "#8B5CF6",
      hybrid: "#10B981",
    };
    return strategyColors[strategy] || colors.primary;
  };

  const improvementColor =
    suggestion.improvement > 50 ? colors.success : suggestion.improvement > 20 ? "#F59E0B" : colors.error;

  return (
    <View className="bg-surface rounded-xl border border-border overflow-hidden">
      <Pressable
        onPress={() => setIsExpanded(!isExpanded)}
        className="p-4 gap-3 active:opacity-70"
      >
        {/* Header with strategy badge and improvement */}
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1 gap-2">
            {/* Strategy Badge */}
            <View
              className="rounded-full px-3 py-1 self-start"
              style={{ backgroundColor: getStrategyColor(suggestion.strategy) + "20" }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: getStrategyColor(suggestion.strategy) }}
              >
                {getStrategyDescription(suggestion.strategy)}
              </Text>
            </View>

            {/* Contrast Ratio Display */}
            <View className="flex-row items-baseline gap-2">
              <Text className="text-2xl font-bold text-foreground">
                {suggestion.ratio.toFixed(2)}:1
              </Text>
              <View className="bg-primary rounded-full px-2 py-1">
                <Text className="text-xs font-semibold text-background">
                  {suggestion.wcagLevel}
                </Text>
              </View>
            </View>

            {/* Improvement Percentage */}
            <Text className="text-xs font-semibold" style={{ color: improvementColor }}>
              +{suggestion.improvement}% improvement
            </Text>
          </View>

          {/* Expand/Collapse Indicator */}
          <Text className="text-lg text-muted">{isExpanded ? "−" : "+"}</Text>
        </View>

        {/* Color Preview - Original vs Suggested */}
        <View className="flex-row gap-2 items-center">
          {/* Original */}
          <View className="flex-1 gap-1">
            <Text className="text-xs text-muted font-semibold">Original</Text>
            <View className="flex-row gap-2">
              <View
                className="w-10 h-10 rounded border border-border"
                style={{ backgroundColor: suggestion.preview.original.fg }}
              />
              <Text className="text-xs text-muted">on</Text>
              <View
                className="w-10 h-10 rounded border border-border"
                style={{ backgroundColor: suggestion.preview.original.bg }}
              />
            </View>
            <Text className="text-xs text-muted">
              {suggestion.preview.original.ratio.toFixed(2)}:1
            </Text>
          </View>

          {/* Arrow */}
          <Text className="text-lg text-primary">→</Text>

          {/* Suggested */}
          <View className="flex-1 gap-1">
            <Text className="text-xs text-muted font-semibold">Suggested</Text>
            <View className="flex-row gap-2">
              <View
                className="w-10 h-10 rounded border border-border"
                style={{ backgroundColor: suggestion.foreground }}
              />
              <Text className="text-xs text-muted">on</Text>
              <View
                className="w-10 h-10 rounded border border-border"
                style={{ backgroundColor: suggestion.background }}
              />
            </View>
            <Text className="text-xs font-semibold" style={{ color: colors.success }}>
              {suggestion.ratio.toFixed(2)}:1
            </Text>
          </View>
        </View>
      </Pressable>

      {/* Expanded Details */}
      {isExpanded && (
        <View className="border-t border-border gap-4 p-4">
          {/* Live Preview Section */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Live Preview</Text>

            {/* Original Preview */}
            <View className="gap-1">
              <Text className="text-xs text-muted">Original</Text>
              <View
                className="p-4 rounded-lg items-center justify-center"
                style={{ backgroundColor: suggestion.preview.original.bg }}
              >
                <Text
                  className="text-base font-semibold"
                  style={{ color: suggestion.preview.original.fg }}
                >
                  Sample Text
                </Text>
                <Text
                  className="text-xs"
                  style={{ color: suggestion.preview.original.fg, opacity: 0.7 }}
                >
                  Contrast: {suggestion.preview.original.ratio.toFixed(2)}:1
                </Text>
              </View>
            </View>

            {/* Suggested Preview */}
            <View className="gap-1">
              <Text className="text-xs text-muted">Suggested</Text>
              <View
                className="p-4 rounded-lg items-center justify-center"
                style={{ backgroundColor: suggestion.background }}
              >
                <Text
                  className="text-base font-semibold"
                  style={{ color: suggestion.foreground }}
                >
                  Sample Text
                </Text>
                <Text
                  className="text-xs"
                  style={{ color: suggestion.foreground, opacity: 0.7 }}
                >
                  Contrast: {suggestion.ratio.toFixed(2)}:1
                </Text>
              </View>
            </View>
          </View>

          {/* Color Details */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Color Values</Text>

            {/* Foreground */}
            <View className="gap-1">
              <Text className="text-xs text-muted">Foreground</Text>
              <View className="flex-row items-center gap-2">
                <View
                  className="w-8 h-8 rounded border border-border"
                  style={{ backgroundColor: suggestion.foreground }}
                />
                <Text className="text-sm font-mono text-foreground flex-1">
                  {suggestion.foreground}
                </Text>
              </View>
            </View>

            {/* Background */}
            <View className="gap-1">
              <Text className="text-xs text-muted">Background</Text>
              <View className="flex-row items-center gap-2">
                <View
                  className="w-8 h-8 rounded border border-border"
                  style={{ backgroundColor: suggestion.background }}
                />
                <Text className="text-sm font-mono text-foreground flex-1">
                  {suggestion.background}
                </Text>
              </View>
            </View>
          </View>

          {/* WCAG Compliance */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">WCAG Compliance</Text>
            <View className="gap-1">
              <View className="flex-row justify-between">
                <Text className="text-xs text-muted">WCAG AA (4.5:1)</Text>
                <Text className="text-xs font-semibold" style={{ color: colors.success }}>
                  ✓ Pass
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-muted">WCAG AAA (7:1)</Text>
                <Text className="text-xs font-semibold" style={{ color: colors.success }}>
                  ✓ Pass
                </Text>
              </View>
            </View>
          </View>

          {/* Copy to Clipboard Button */}
          {onSelect && (
            <Pressable
              onPress={() => onSelect(suggestion)}
              className="bg-primary px-4 py-2 rounded-full active:opacity-80"
            >
              <Text className="text-background font-semibold text-center text-sm">
                Use This Color Pair
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}
