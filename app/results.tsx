import { ScrollView, Text, View, TouchableOpacity, Platform, Alert, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { type AuditResult, type AuditIssue, auditWebsite } from "@/lib/audit-engine";
import { generateAuditReport } from "@/lib/report-generator";
import { exportPDFReport, printPDFReport } from "@/lib/pdf-report-generator";
import { addToHistory, getURLHistory } from "@/lib/audit-history-tracker";

export default function ResultsEnhancedScreen() {
  const colors = useColors();
  const params = useLocalSearchParams();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["css"]));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [history, setHistory] = useState<any>(null);
  const [improvement, setImprovement] = useState<number | null>(null);

  let auditResult: AuditResult | null = null;
  try {
    if (typeof params.auditId === "string") {
      auditResult = JSON.parse(params.auditId);
    }
  } catch (error) {
    console.error("Failed to parse audit result:", error);
  }

  // Load history on mount
  useEffect(() => {
    if (auditResult) {
      loadHistory();
      addToHistory(auditResult);
    }
  }, [auditResult?.url]);

  const loadHistory = async () => {
    if (!auditResult) return;
    const urlHistory = await getURLHistory(auditResult.url);
    setHistory(urlHistory);
    if (urlHistory && urlHistory.entries.length > 1) {
      setImprovement(urlHistory.improvement);
    }
  };

  const handleRefreshAudit = async () => {
    if (!auditResult) return;
    setIsRefreshing(true);
    try {
      // Re-audit with cache-busting timestamp
      const freshResult = await auditWebsite(auditResult.url, true);
      await addToHistory(freshResult);
      
      // Update the current audit result
      router.push({
        pathname: "/results",
        params: { auditId: JSON.stringify(freshResult) },
      });
    } catch (error) {
      Alert.alert("Error", `Failed to refresh audit: ${error}`);
    } finally {
      setIsRefreshing(false);
    }
  };

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

          {/* Improvement Badge */}
          {improvement !== null && (
            <View
              className={`p-3 rounded-lg border ${
                improvement > 0
                  ? "bg-success/10 border-success/30"
                  : improvement < 0
                  ? "bg-error/10 border-error/30"
                  : "bg-muted/10 border-muted/30"
              }`}
            >
              <Text
                className={`font-semibold text-sm ${
                  improvement > 0
                    ? "text-success"
                    : improvement < 0
                    ? "text-error"
                    : "text-muted"
                }`}
              >
                {improvement > 0 ? "📈" : improvement < 0 ? "📉" : "➡️"} {Math.abs(improvement).toFixed(1)}%{" "}
                {improvement > 0 ? "improvement" : improvement < 0 ? "decline" : "stable"} from first audit
              </Text>
            </View>
          )}

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

          {/* Action Buttons */}
          <View className="gap-3">
            {/* Refresh Audit Button */}
            <TouchableOpacity
              onPress={handleRefreshAudit}
              disabled={isRefreshing}
              className="bg-cyan-600 px-6 py-3 rounded-full active:opacity-80 flex-row items-center justify-center gap-2"
              style={{ opacity: isRefreshing ? 0.6 : 1 }}
            >
              {isRefreshing ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-semibold text-center">🔄 Refresh Audit</Text>
              )}
            </TouchableOpacity>

            {Platform.OS === "web" && (
              <>
                <TouchableOpacity
                  onPress={() => {
                    try {
                      exportPDFReport(auditResult, { companyName: "Site Auditor Pro" });
                      Alert.alert("Success", "Report exported as HTML. You can print it as PDF from your browser.");
                    } catch (error) {
                      Alert.alert("Error", "Failed to export report");
                    }
                  }}
                  className="bg-blue-600 px-6 py-3 rounded-full active:opacity-80"
                >
                  <Text className="text-white font-semibold text-center">📄 Export as PDF</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    try {
                      printPDFReport(auditResult, { companyName: "Site Auditor Pro" });
                    } catch (error) {
                      Alert.alert("Error", "Failed to print report");
                    }
                  }}
                  className="bg-indigo-600 px-6 py-3 rounded-full active:opacity-80"
                >
                  <Text className="text-white font-semibold text-center">🖨️ Print Report</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              onPress={() => {
                const auditId = `audit_${Date.now()}`;
                const auditData = JSON.stringify(auditResult);

                if (Platform.OS === "web" && typeof localStorage !== "undefined") {
                  localStorage.setItem(auditId, auditData);
                  router.push({
                    pathname: "/preview",
                    params: { id: auditId },
                  });
                } else {
                  import("@react-native-async-storage/async-storage").then(({ default: AsyncStorage }) => {
                    AsyncStorage.setItem(auditId, auditData);
                    router.push({
                      pathname: "/preview",
                      params: { id: auditId },
                    });
                  });
                }
              }}
              className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 rounded-full active:opacity-80"
            >
              <Text className="text-white font-semibold text-center">🎨 Preview & Customize Colors →</Text>
            </TouchableOpacity>
          </View>

          {/* Issues List */}
          <View className="gap-3">
            {categories.map((category) => {
              const categoryIssues = auditResult.issues.filter((issue: AuditIssue) => issue.category === category.key);
              if (categoryIssues.length === 0) return null;

              const isExpanded = expandedCategories.has(category.key);

              return (
                <View key={category.key} className="bg-surface rounded-xl border border-border overflow-hidden">
                  <TouchableOpacity
                    onPress={() => toggleCategory(category.key)}
                    className="p-4 flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <Text className="text-xl">{category.icon}</Text>
                      <View className="flex-1">
                        <Text className="font-semibold text-foreground">{category.label}</Text>
                        <Text className="text-xs text-muted">{categoryIssues.length} issues</Text>
                      </View>
                    </View>
                    <Text className="text-lg text-muted">{isExpanded ? "▼" : "▶"}</Text>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View className="border-t border-border">
                      {categoryIssues.map((issue: AuditIssue, index: number) => (
                        <View key={index} className="p-4 border-t border-border first:border-t-0 gap-2">
                          <View className="flex-row items-center gap-2">
                            <View
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getSeverityColor(issue.severity) }}
                            />
                            <Text className="font-semibold text-foreground flex-1">{issue.title}</Text>
                            <Text className="text-xs font-bold text-muted uppercase">{issue.severity}</Text>
                          </View>
                          <Text className="text-sm text-muted">{issue.description}</Text>
                          {issue.recommendation && (
                            <Text className="text-xs text-success mt-2">💡 {issue.recommendation}</Text>
                          )}
                        </View>
                      ))}
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
