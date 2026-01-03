import { ScrollView, Text, View, TouchableOpacity, Pressable } from "react-native";
import { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { type AuditReport } from "@/lib/report-generator";

export default function RecommendationsScreen() {
  const colors = useColors();
  const params = useLocalSearchParams();
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  let report: AuditReport | null = null;
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
        <Text className="text-foreground text-lg">Report data not available</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-primary px-6 py-2 rounded-full"
        >
          <Text className="text-background font-semibold">Go Back</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const toggleSteps = (recommendationId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(recommendationId)) {
      newExpanded.delete(recommendationId);
    } else {
      newExpanded.add(recommendationId);
    }
    setExpandedSteps(newExpanded);
  };

  const getEffortColor = (effort: string) => {
    if (effort.includes("1-2 hours")) return colors.success;
    if (effort.includes("2-4 hours")) return "#F59E0B";
    if (effort.includes("4-8 hours")) return "#F59E0B";
    return colors.error;
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
            <Text className="text-2xl font-bold text-foreground">Recommendations</Text>
            <Text className="text-sm text-muted">Prioritized implementation guide</Text>
          </View>

          {/* Executive Summary */}
          <View className="bg-surface rounded-xl p-4 border border-border gap-3">
            <Text className="text-sm font-semibold text-foreground">Summary</Text>
            <Text className="text-sm text-muted leading-relaxed">{report.executiveSummary}</Text>
          </View>

          {/* Implementation Timeline */}
          <View className="bg-surface rounded-xl p-4 border border-border gap-2">
            <Text className="text-sm font-semibold text-foreground">Estimated Effort</Text>
            <Text className="text-lg font-bold text-primary">{report.estimatedTotalEffort}</Text>
            <Text className="text-xs text-muted">
              Based on {report.recommendations.length} recommendations
            </Text>
          </View>

          {/* Recommendations */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Implementation Steps</Text>

            {report.recommendations.map((recommendation, index) => {
              const isExpanded = expandedSteps.has(recommendation.issueId);

              return (
                <View
                  key={recommendation.issueId}
                  className="bg-surface rounded-xl border border-border overflow-hidden"
                >
                  <Pressable
                    onPress={() => toggleSteps(recommendation.issueId)}
                    className="p-4 gap-3 active:opacity-70"
                  >
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1 gap-2">
                        <View className="flex-row items-center gap-2">
                          <Text className="text-lg font-bold text-primary">{index + 1}</Text>
                          <Text className="font-semibold text-foreground flex-1">
                            {recommendation.title}
                          </Text>
                        </View>
                        <View className="flex-row gap-2 flex-wrap">
                          <View
                            className="rounded-full px-2 py-1"
                            style={{
                              backgroundColor:
                                recommendation.priority === "high"
                                  ? colors.error + "20"
                                  : recommendation.priority === "medium"
                                    ? "#F59E0B20"
                                    : colors.success + "20",
                            }}
                          >
                            <Text
                              className="text-xs font-semibold capitalize"
                              style={{
                                color:
                                  recommendation.priority === "high"
                                    ? colors.error
                                    : recommendation.priority === "medium"
                                      ? "#F59E0B"
                                      : colors.success,
                              }}
                            >
                              {recommendation.priority} priority
                            </Text>
                          </View>
                          <View
                            className="rounded-full px-2 py-1"
                            style={{ backgroundColor: getEffortColor(recommendation.estimatedEffort) + "20" }}
                          >
                            <Text
                              className="text-xs font-semibold"
                              style={{ color: getEffortColor(recommendation.estimatedEffort) }}
                            >
                              {recommendation.estimatedEffort}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <Text className="text-lg text-muted">{isExpanded ? "−" : "+"}</Text>
                    </View>
                  </Pressable>

                  {isExpanded && (
                    <View className="border-t border-border gap-4 p-4">
                      {/* Expected Benefit */}
                      <View className="gap-2">
                        <Text className="text-xs font-semibold text-foreground uppercase">
                          Expected Benefit
                        </Text>
                        <Text className="text-sm text-muted">{recommendation.expectedBenefit}</Text>
                      </View>

                      {/* Implementation Steps */}
                      <View className="gap-3">
                        <Text className="text-xs font-semibold text-foreground uppercase">
                          Implementation Steps
                        </Text>
                        {recommendation.steps.map((step) => (
                          <View key={step.step} className="gap-2">
                            <View className="flex-row items-start gap-2">
                              <View
                                className="rounded-full w-6 h-6 items-center justify-center"
                                style={{ backgroundColor: colors.primary + "20" }}
                              >
                                <Text
                                  className="text-xs font-bold"
                                  style={{ color: colors.primary }}
                                >
                                  {step.step}
                                </Text>
                              </View>
                              <View className="flex-1 gap-1">
                                <Text className="font-semibold text-sm text-foreground">
                                  {step.title}
                                </Text>
                                <Text className="text-xs text-muted leading-relaxed">
                                  {step.description}
                                </Text>
                              </View>
                            </View>
                            {step.code && (
                              <View
                                className="bg-background rounded-lg p-3 border border-border ml-8"
                              >
                                <Text className="text-xs text-muted font-mono">{step.code}</Text>
                              </View>
                            )}
                          </View>
                        ))}
                      </View>

                      {/* Tools */}
                      {recommendation.tools.length > 0 && (
                        <View className="gap-2">
                          <Text className="text-xs font-semibold text-foreground uppercase">
                            Recommended Tools
                          </Text>
                          <View className="flex-row gap-2 flex-wrap">
                            {recommendation.tools.map((tool) => (
                              <View
                                key={tool}
                                className="bg-primary rounded-full px-3 py-1"
                              >
                                <Text className="text-xs font-semibold text-background">
                                  {tool}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {/* Related Issues */}
                      {recommendation.relatedIssues.length > 0 && (
                        <View className="gap-2 pt-2 border-t border-border">
                          <Text className="text-xs font-semibold text-foreground uppercase">
                            Related Issues
                          </Text>
                          <Text className="text-xs text-muted">
                            Fixing this issue may also resolve: {recommendation.relatedIssues.join(", ")}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Footer */}
          <View className="bg-surface rounded-xl p-4 border border-border gap-2 mt-4">
            <Text className="text-xs font-semibold text-foreground uppercase">Next Steps</Text>
            <Text className="text-sm text-muted leading-relaxed">
              Start with high-priority recommendations. Implement them in order for best results. Re-run the audit after implementing changes to track improvements.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
