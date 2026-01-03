import { ScrollView, Text, View, TouchableOpacity, Pressable } from "react-native";
import { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { type AccessibilityReport } from "@/lib/contrast-analyzer";
import { generateColorSuggestions } from "@/lib/color-suggester";
import { ColorSuggestionCard } from "@/components/color-suggestion-card";

export default function AccessibilityScreen() {
  const colors = useColors();
  const params = useLocalSearchParams();
  const [expandedIssues, setExpandedIssues] = useState<Set<number>>(new Set());
  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<number>>(new Set());

  let report: AccessibilityReport | null = null;
  try {
    if (typeof params.report === "string") {
      report = JSON.parse(params.report);
    }
  } catch (error) {
    console.error("Failed to parse report:", error);
  }

  if (!report) {
    return (
      <ScreenContainer className="p-6 items-center justify-center">
        <Text className="text-foreground text-lg">Accessibility report not available</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-primary px-6 py-2 rounded-full"
        >
          <Text className="text-background font-semibold">Go Back</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const toggleIssue = (index: number) => {
    const newExpanded = new Set(expandedIssues);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedIssues(newExpanded);
  };

  const toggleSuggestions = (index: number) => {
    const newExpanded = new Set(expandedSuggestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSuggestions(newExpanded);
  };

  const getWCAGColor = (wcagAA: boolean, wcagAAA: boolean) => {
    if (wcagAAA) return colors.success;
    if (wcagAA) return "#F59E0B";
    return colors.error;
  };

  const getWCAGLabel = (wcagAA: boolean, wcagAAA: boolean) => {
    if (wcagAAA) return "AAA";
    if (wcagAA) return "AA";
    return "Fail";
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-row items-center gap-2 mb-2"
            >
              <Text className="text-primary text-lg">←</Text>
              <Text className="text-primary font-semibold">Back</Text>
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-foreground">Color Contrast Report</Text>
            <Text className="text-sm text-muted">WCAG 2.1 Accessibility Analysis</Text>
          </View>

          {/* Summary Cards */}
          <View className="gap-3">
            {/* WCAG AA Card */}
            <View className="bg-surface rounded-xl p-4 border border-border gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-foreground">WCAG AA Compliance</Text>
                <View
                  className="rounded-full px-3 py-1"
                  style={{ backgroundColor: "#F59E0B20" }}
                >
                  <Text className="text-xs font-bold" style={{ color: "#F59E0B" }}>
                    {report.wcagAA.percentage}%
                  </Text>
                </View>
              </View>
              <Text className="text-2xl font-bold text-foreground">
                {report.wcagAA.pass}/{report.wcagAA.pass + report.wcagAA.fail}
              </Text>
              <Text className="text-xs text-muted">
                {report.wcagAA.pass} passing • {report.wcagAA.fail} failing
              </Text>
            </View>

            {/* WCAG AAA Card */}
            <View className="bg-surface rounded-xl p-4 border border-border gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-foreground">WCAG AAA Compliance</Text>
                <View
                  className="rounded-full px-3 py-1"
                  style={{ backgroundColor: colors.success + "20" }}
                >
                  <Text className="text-xs font-bold" style={{ color: colors.success }}>
                    {report.wcagAAA.percentage}%
                  </Text>
                </View>
              </View>
              <Text className="text-2xl font-bold text-foreground">
                {report.wcagAAA.pass}/{report.wcagAAA.pass + report.wcagAAA.fail}
              </Text>
              <Text className="text-xs text-muted">
                {report.wcagAAA.pass} passing • {report.wcagAAA.fail} failing
              </Text>
            </View>
          </View>

          {/* Summary */}
          <View className="bg-surface rounded-xl p-4 border border-border gap-2">
            <Text className="text-sm font-semibold text-foreground">Summary</Text>
            <Text className="text-sm text-muted leading-relaxed">{report.summary}</Text>
          </View>

          {/* Contrast Issues */}
          {report.contrastIssues.length > 0 && (
            <View className="gap-3">
              <Text className="text-lg font-semibold text-foreground">Contrast Issues</Text>

              {report.contrastIssues.map((issue, index) => {
                const isExpanded = expandedIssues.has(index);
                const wcagLabel = getWCAGLabel(issue.wcagAA, issue.wcagAAA);
                const wcagColor = getWCAGColor(issue.wcagAA, issue.wcagAAA);

                return (
                  <View
                    key={index}
                    className="bg-surface rounded-xl border border-border overflow-hidden"
                  >
                    <Pressable
                      onPress={() => toggleIssue(index)}
                      className="p-4 gap-3 active:opacity-70"
                    >
                      <View className="flex-row items-center justify-between gap-3">
                        <View className="flex-1 gap-2">
                          <View className="flex-row items-center gap-2">
                            {/* Color Swatch */}
                            <View className="flex-row gap-2">
                              <View
                                className="w-6 h-6 rounded border border-border"
                                style={{ backgroundColor: issue.foreground }}
                              />
                              <Text className="text-xs text-muted">on</Text>
                              <View
                                className="w-6 h-6 rounded border border-border"
                                style={{ backgroundColor: issue.background }}
                              />
                            </View>
                          </View>

                          <View className="flex-row items-center gap-2 flex-wrap">
                            <View
                              className="rounded-full px-2 py-1"
                              style={{ backgroundColor: wcagColor + "20" }}
                            >
                              <Text
                                className="text-xs font-semibold"
                                style={{ color: wcagColor }}
                              >
                                {wcagLabel}
                              </Text>
                            </View>
                            <Text className="text-xs font-semibold text-foreground">
                              {issue.ratio.toFixed(2)}:1
                            </Text>
                            <View className="bg-primary rounded-full px-2 py-1">
                              <Text className="text-xs font-semibold text-background">
                                {issue.textSize === "large" ? "Large" : "Normal"}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <Text className="text-lg text-muted">{isExpanded ? "−" : "+"}</Text>
                      </View>
                    </Pressable>

                    {isExpanded && (
                      <View className="border-t border-border gap-3 p-4">
                        {/* Element Info */}
                        <View className="gap-2">
                          <Text className="text-xs font-semibold text-foreground uppercase">
                            Element
                          </Text>
                          <Text className="text-sm text-muted font-mono">{issue.element}</Text>
                        </View>

                        {/* Colors */}
                        <View className="gap-2">
                          <Text className="text-xs font-semibold text-foreground uppercase">
                            Colors
                          </Text>
                          <View className="gap-2">
                            <View className="flex-row items-center gap-2">
                              <View
                                className="w-8 h-8 rounded border border-border"
                                style={{ backgroundColor: issue.foreground }}
                              />
                              <View className="flex-1">
                                <Text className="text-xs text-muted">Foreground</Text>
                                <Text className="text-sm font-mono text-foreground">
                                  {issue.foreground}
                                </Text>
                              </View>
                            </View>
                            <View className="flex-row items-center gap-2">
                              <View
                                className="w-8 h-8 rounded border border-border"
                                style={{ backgroundColor: issue.background }}
                              />
                              <View className="flex-1">
                                <Text className="text-xs text-muted">Background</Text>
                                <Text className="text-sm font-mono text-foreground">
                                  {issue.background}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>

                        {/* Contrast Ratio */}
                        <View className="gap-2">
                          <Text className="text-xs font-semibold text-foreground uppercase">
                            Contrast Ratio
                          </Text>
                          <Text className="text-lg font-bold text-primary">
                            {issue.ratio.toFixed(2)}:1
                          </Text>
                          <View className="gap-1">
                            <View className="flex-row justify-between">
                              <Text className="text-xs text-muted">WCAG AA</Text>
                              <Text className="text-xs font-semibold" style={{
                                color: issue.wcagAA ? colors.success : colors.error
                              }}>
                                {issue.wcagAA ? "✓ Pass" : "✗ Fail"}
                              </Text>
                            </View>
                            <View className="flex-row justify-between">
                              <Text className="text-xs text-muted">WCAG AAA</Text>
                              <Text className="text-xs font-semibold" style={{
                                color: issue.wcagAAA ? colors.success : colors.error
                              }}>
                                {issue.wcagAAA ? "✓ Pass" : "✗ Fail"}
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Color Suggestions */}
                        <View className="gap-3 pt-2 border-t border-border">
                          <Pressable
                            onPress={() => toggleSuggestions(index)}
                            className="flex-row items-center justify-between active:opacity-70"
                          >
                            <Text className="text-xs font-semibold text-foreground uppercase">
                              Suggested Fixes
                            </Text>
                            <Text className="text-lg text-muted">
                              {expandedSuggestions.has(index) ? "−" : "+"}
                            </Text>
                          </Pressable>

                          {expandedSuggestions.has(index) && (
                            <View className="gap-3">
                              {generateColorSuggestions(
                                issue.foreground,
                                issue.background,
                                issue.textSize
                              ).map((suggestion, suggestionIndex) => (
                                <ColorSuggestionCard
                                  key={suggestionIndex}
                                  suggestion={suggestion}
                                />
                              ))}
                            </View>
                          )}
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* No Issues */}
          {report.contrastIssues.length === 0 && (
            <View className="bg-surface rounded-xl p-6 border border-border items-center gap-2">
              <Text className="text-lg font-bold text-foreground">Excellent!</Text>
              <Text className="text-sm text-muted text-center">
                All text elements meet WCAG AAA contrast requirements.
              </Text>
            </View>
          )}

          {/* WCAG Reference */}
          <View className="bg-surface rounded-xl p-4 border border-border gap-3">
            <Text className="text-sm font-semibold text-foreground">WCAG 2.1 Standards</Text>
            <View className="gap-2">
              <View className="gap-1">
                <Text className="text-xs font-semibold text-foreground">Normal Text</Text>
                <Text className="text-xs text-muted">
                  • AA: 4.5:1 minimum • AAA: 7:1 minimum
                </Text>
              </View>
              <View className="gap-1">
                <Text className="text-xs font-semibold text-foreground">Large Text (18pt+)</Text>
                <Text className="text-xs text-muted">
                  • AA: 3:1 minimum • AAA: 4.5:1 minimum
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
