import { ScrollView, Text, View, TouchableOpacity, Pressable } from "react-native";
import { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { type AuditResult, type AuditIssue } from "@/lib/audit-engine";
import { generateAuditReport } from "@/lib/report-generator";

export default function ResultsScreen() {
  const colors = useColors();
  const params = useLocalSearchParams();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["css"]));

  let auditResult: AuditResult | null = null;
  try {
    if (typeof params.auditId === "string") {
      auditResult = JSON.parse(params.auditId);
    }
  } catch (error) {
    console.error("Failed to parse audit result:", error);
  }

  if (!auditResult) {
    return (
      <ScreenContainer className="p-6 items-center justify-center">
        <Text className="text-foreground text-lg">No audit data available</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-primary px-6 py-2 rounded-full"
        >
          <Text className="text-background font-semibold">Go Back</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return colors.success;
    if (score >= 60) return "#F59E0B";
    return colors.error;
  };

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

  const categories = [
    { key: "css", label: "CSS Issues", icon: "🎨" },
    { key: "javascript", label: "JavaScript Issues", icon: "⚙️" },
    { key: "performance", label: "Performance", icon: "⚡" },
    { key: "best-practice", label: "Best Practices", icon: "✓" },
  ];

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
            <Text className="text-2xl font-bold text-foreground break-words">
              {auditResult.url}
            </Text>
            <Text className="text-xs text-muted">
              {new Date(auditResult.timestamp).toLocaleString()}
            </Text>
          </View>

          {/* Score Cards */}
          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border items-center gap-2">
              <Text className="text-xs text-muted font-semibold uppercase">Overall</Text>
              <Text
                className="text-3xl font-bold"
                style={{ color: getScoreColor(auditResult.overallScore) }}
              >
                {Math.round(auditResult.overallScore)}
              </Text>
            </View>
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border items-center gap-2">
              <Text className="text-xs text-muted font-semibold uppercase">CSS</Text>
              <Text
                className="text-3xl font-bold"
                style={{ color: getScoreColor(auditResult.cssScore) }}
              >
                {Math.round(auditResult.cssScore)}
              </Text>
            </View>
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border items-center gap-2">
              <Text className="text-xs text-muted font-semibold uppercase">JS</Text>
              <Text
                className="text-3xl font-bold"
                style={{ color: getScoreColor(auditResult.jsScore) }}
              >
                {Math.round(auditResult.jsScore)}
              </Text>
            </View>
          </View>

          {/* Summary */}
          <View className="bg-surface rounded-xl p-4 border border-border gap-2">
            <Text className="text-sm font-semibold text-foreground">Summary</Text>
            <View className="gap-1">
              <Text className="text-sm text-muted">
                Total Issues: <Text className="font-semibold text-foreground">{auditResult.summary.totalIssues}</Text>
              </Text>
              <Text className="text-sm text-muted">
                Critical: <Text className="font-semibold" style={{ color: colors.error }}>
                  {auditResult.summary.criticalCount}
                </Text>
              </Text>
              <Text className="text-sm text-muted">
                Warnings: <Text className="font-semibold" style={{ color: "#F59E0B" }}>
                  {auditResult.summary.warningCount}
                </Text>
              </Text>
              <Text className="text-sm text-muted">
                Info: <Text className="font-semibold text-foreground">{auditResult.summary.infoCount}</Text>
              </Text>
            </View>
          </View>

          {/* View Reports Buttons */}
          <View className="gap-3">
            {auditResult.accessibilityReport && (
              <TouchableOpacity
                onPress={() => {
                  router.push({
                    pathname: "/accessibility",
                    params: { report: JSON.stringify(auditResult.accessibilityReport) },
                  });
                }}
                className="bg-primary px-6 py-3 rounded-full active:opacity-80"
              >
                <Text className="text-background font-semibold text-center">Color Contrast Report →</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => {
                const report = generateAuditReport(auditResult);
                router.push({
                  pathname: "/recommendations",
                  params: { report: JSON.stringify(report) },
                });
              }}
              className="bg-primary px-6 py-3 rounded-full active:opacity-80"
            >
              <Text className="text-background font-semibold text-center">View Recommendations →</Text>
            </TouchableOpacity>
          </View>

          {/* Issues by Category */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Findings</Text>
            {categories.map((category) => {
              const categoryIssues = auditResult.issues.filter((i) => i.category === category.key);
              const isExpanded = expandedCategories.has(category.key);

              return (
                <View key={category.key} className="bg-surface rounded-xl border border-border overflow-hidden">
                  <Pressable
                    onPress={() => toggleCategory(category.key)}
                    className="p-4 flex-row items-center justify-between active:opacity-70"
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <Text className="text-xl">{category.icon}</Text>
                      <View className="flex-1">
                        <Text className="font-semibold text-foreground">{category.label}</Text>
                        <Text className="text-xs text-muted">
                          {categoryIssues.length} {categoryIssues.length === 1 ? "issue" : "issues"}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-lg text-muted">{isExpanded ? "−" : "+"}</Text>
                  </Pressable>

                  {isExpanded && categoryIssues.length > 0 && (
                    <View className="border-t border-border gap-3 p-4">
                      {categoryIssues.map((issue, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() =>
                            router.push({
                              pathname: "/issue-detail",
                              params: { issue: JSON.stringify(issue) },
                            })
                          }
                          className="gap-2 pb-3 border-b border-border last:border-b-0 last:pb-0 active:opacity-70"
                        >
                          <View className="flex-row items-start gap-2">
                            <View
                              className="rounded-full px-2 py-1"
                              style={{ backgroundColor: getSeverityColor(issue.severity) + "20" }}
                            >
                              <Text
                                className="text-xs font-semibold capitalize"
                                style={{ color: getSeverityColor(issue.severity) }}
                              >
                                {issue.severity}
                              </Text>
                            </View>
                          </View>
                          <Text className="font-semibold text-foreground text-sm">{issue.title}</Text>
                          <Text className="text-xs text-muted line-clamp-2">{issue.description}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {isExpanded && categoryIssues.length === 0 && (
                    <View className="border-t border-border p-4 items-center">
                      <Text className="text-sm text-muted">No issues found in this category</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
