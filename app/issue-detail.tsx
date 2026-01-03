import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { type AuditIssue } from "@/lib/audit-engine";

export default function IssueDetailScreen() {
  const colors = useColors();
  const params = useLocalSearchParams();

  let issue: AuditIssue | null = null;
  try {
    if (typeof params.issue === "string") {
      issue = JSON.parse(params.issue);
    }
  } catch (error) {
    console.error("Failed to parse issue:", error);
  }

  if (!issue) {
    return (
      <ScreenContainer className="p-6 items-center justify-center">
        <Text className="text-foreground text-lg">Issue data not available</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-primary px-6 py-2 rounded-full"
        >
          <Text className="text-background font-semibold">Go Back</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return colors.error;
      case "warning":
        return "#F59E0B";
      case "info":
        return colors.muted;
      default:
        return colors.muted;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return colors.success;
      case "medium":
        return "#F59E0B";
      case "hard":
        return colors.error;
      default:
        return colors.muted;
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-row items-center gap-2 mb-2"
            >
              <Text className="text-primary text-lg">←</Text>
              <Text className="text-primary font-semibold">Back</Text>
            </TouchableOpacity>

            <Text className="text-2xl font-bold text-foreground">{issue.title}</Text>

            <View className="flex-row gap-2 flex-wrap">
              <View
                className="rounded-full px-3 py-1"
                style={{ backgroundColor: getSeverityColor(issue.severity) + "20" }}
              >
                <Text
                  className="text-xs font-semibold capitalize"
                  style={{ color: getSeverityColor(issue.severity) }}
                >
                  {issue.severity}
                </Text>
              </View>
              <View
                className="rounded-full px-3 py-1"
                style={{ backgroundColor: getDifficultyColor(issue.difficulty) + "20" }}
              >
                <Text
                  className="text-xs font-semibold capitalize"
                  style={{ color: getDifficultyColor(issue.difficulty) }}
                >
                  {issue.difficulty} fix
                </Text>
              </View>
              <View
                className="rounded-full px-3 py-1"
                style={{
                  backgroundColor:
                    issue.impact === "high"
                      ? colors.success + "20"
                      : issue.impact === "medium"
                        ? "#F59E0B20"
                        : colors.muted + "20",
                }}
              >
                <Text
                  className="text-xs font-semibold capitalize"
                  style={{
                    color:
                      issue.impact === "high"
                        ? colors.success
                        : issue.impact === "medium"
                          ? "#F59E0B"
                          : colors.muted,
                  }}
                >
                  {issue.impact} impact
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View className="bg-surface rounded-xl p-4 border border-border gap-2">
            <Text className="text-sm font-semibold text-foreground">Issue Description</Text>
            <Text className="text-sm text-muted leading-relaxed">{issue.description}</Text>
          </View>

          {/* Examples */}
          {issue.examples && issue.examples.length > 0 && (
            <View className="bg-surface rounded-xl p-4 border border-border gap-2">
              <Text className="text-sm font-semibold text-foreground">Examples</Text>
              <View className="gap-2">
                {issue.examples.map((example, index) => (
                  <View
                    key={index}
                    className="bg-background rounded-lg p-3 border border-border"
                  >
                    <Text className="text-xs text-muted font-mono break-words">{example}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Recommendation */}
          <View className="bg-surface rounded-xl p-4 border border-border gap-2">
            <Text className="text-sm font-semibold text-foreground">Recommended Fix</Text>
            <Text className="text-sm text-muted leading-relaxed">{issue.recommendation}</Text>
          </View>

          {/* Impact */}
          <View className="bg-surface rounded-xl p-4 border border-border gap-3">
            <Text className="text-sm font-semibold text-foreground">Impact Analysis</Text>
            <View className="gap-2">
              <View className="flex-row items-center gap-2">
                <Text className="text-xs text-muted">Severity:</Text>
                <Text className="text-xs font-semibold text-foreground capitalize">
                  {issue.severity}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-xs text-muted">Fix Difficulty:</Text>
                <Text className="text-xs font-semibold text-foreground capitalize">
                  {issue.difficulty}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-xs text-muted">Expected Impact:</Text>
                <Text className="text-xs font-semibold text-foreground capitalize">
                  {issue.impact}
                </Text>
              </View>
            </View>
          </View>

          {/* Category */}
          <View className="bg-surface rounded-xl p-4 border border-border gap-2">
            <Text className="text-sm font-semibold text-foreground">Category</Text>
            <Text className="text-sm text-muted capitalize">{issue.category}</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
