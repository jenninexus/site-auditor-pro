import { ScrollView, Text, View, TouchableOpacity, Platform, Alert, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { type AuditResult, type AuditIssue, auditWebsite } from "@/lib/audit-engine";
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
      const freshResult = await auditWebsite(auditResult.url, true);
      await addToHistory(freshResult);
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
        <TouchableOpacity onPress={() => router.back()} className="btn-primary mt-4">
          <Text className="text-white font-bold">Go Back</Text>
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

  const categories = [
    { key: "css", label: "CSS Issues", icon: "fa-palette", color: "text-blue-500" },
    { key: "javascript", label: "JavaScript Issues", icon: "fa-code", color: "text-yellow-500" },
    { key: "performance", label: "Performance", icon: "fa-bolt", color: "text-green-500" },
    { key: "best-practice", label: "Best Practices", icon: "fa-check-double", color: "text-purple-500" },
  ];

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 p-6 md:p-12 max-w-5xl mx-auto w-full gap-8">
          {/* Header */}
          <View className="flex-row items-center justify-between animate-fade-in">
            <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-2">
              <i className="fa-solid fa-arrow-left text-primary"></i>
              <Text className="text-primary font-bold">Back to Home</Text>
            </TouchableOpacity>
            <View className="flex-row gap-3">
              <TouchableOpacity onPress={handleRefreshAudit} disabled={isRefreshing} className="bg-secondary p-3 rounded-xl">
                {isRefreshing ? <ActivityIndicator size="small" /> : <i className="fa-solid fa-rotate text-foreground"></i>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => printPDFReport(auditResult, { companyName: "Site Auditor Pro" })} className="bg-secondary p-3 rounded-xl">
                <i className="fa-solid fa-print text-foreground"></i>
              </TouchableOpacity>
            </View>
          </View>

          {/* Title Section */}
          <View className="gap-2 animate-fade-in">
            <Text className="text-sm font-bold uppercase tracking-widest text-primary">Audit Results</Text>
            <Text className="text-4xl font-black text-foreground break-words">{auditResult.url}</Text>
            <Text className="text-muted-foreground">Analyzed on {new Date(auditResult.timestamp).toLocaleString()}</Text>
          </View>

          {/* Score Overview */}
          <View className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            <View className="card-atmos p-8 items-center justify-center gap-2 border-b-4" style={{ borderBottomColor: getScoreColor(auditResult.overallScore) }}>
              <Text className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Overall Score</Text>
              <Text className="text-6xl font-black" style={{ color: getScoreColor(auditResult.overallScore) }}>{Math.round(auditResult.overallScore)}</Text>
            </View>
            <View className="card-atmos p-8 items-center justify-center gap-2 border-b-4" style={{ borderBottomColor: getScoreColor(auditResult.cssScore) }}>
              <Text className="text-sm font-bold uppercase tracking-widest text-muted-foreground">CSS Score</Text>
              <Text className="text-6xl font-black" style={{ color: getScoreColor(auditResult.cssScore) }}>{Math.round(auditResult.cssScore)}</Text>
            </View>
            <View className="card-atmos p-8 items-center justify-center gap-2 border-b-4" style={{ borderBottomColor: getScoreColor(auditResult.jsScore) }}>
              <Text className="text-sm font-bold uppercase tracking-widest text-muted-foreground">JS Score</Text>
              <Text className="text-6xl font-black" style={{ color: getScoreColor(auditResult.jsScore) }}>{Math.round(auditResult.jsScore)}</Text>
            </View>
          </View>

          {/* Main Actions */}
          <View className="animate-fade-in">
            <TouchableOpacity
              onPress={() => {
                const auditId = `audit_${Date.now()}`;
                const auditData = JSON.stringify(auditResult);
                if (Platform.OS === "web" && typeof localStorage !== "undefined") {
                  localStorage.setItem(auditId, auditData);
                  router.push({ pathname: "/preview", params: { id: auditId } });
                }
              }}
              className="btn-primary flex-row items-center justify-center gap-3 py-5 shadow-xl shadow-primary/30"
            >
              <i className="fa-solid fa-wand-magic-sparkles text-white text-xl"></i>
              <Text className="text-white font-black text-xl">Preview & Customize Colors</Text>
              <i className="fa-solid fa-chevron-right text-white/50"></i>
            </TouchableOpacity>
          </View>

          {/* Issues Breakdown */}
          <View className="gap-6 animate-fade-in">
            <Text className="text-2xl font-bold text-foreground">Detailed Breakdown</Text>
            <View className="gap-4">
              {categories.map((cat) => {
                const issues = auditResult.issues.filter(i => i.category === cat.key);
                const isExpanded = expandedCategories.has(cat.key);
                return (
                  <View key={cat.key} className="card-atmos overflow-hidden">
                    <TouchableOpacity onPress={() => toggleCategory(cat.key)} className="p-6 flex-row items-center justify-between bg-secondary/30">
                      <View className="flex-row items-center gap-4">
                        <View className={`w-10 h-10 rounded-lg items-center justify-center bg-background`}>
                          <i className={`fa-solid ${cat.icon} ${cat.color}`}></i>
                        </View>
                        <Text className="text-xl font-bold text-foreground">{cat.label}</Text>
                        <View className="bg-background px-3 py-1 rounded-full border border-border">
                          <Text className="text-xs font-bold text-muted-foreground">{issues.length} Issues</Text>
                        </View>
                      </View>
                      <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'} text-muted-foreground`}></i>
                    </TouchableOpacity>
                    
                    {isExpanded && (
                      <View className="p-6 gap-4 border-t border-border">
                        {issues.length === 0 ? (
                          <View className="items-center py-8 gap-2">
                            <i className="fa-solid fa-circle-check text-success text-3xl"></i>
                            <Text className="text-muted-foreground font-bold">No issues found in this category!</Text>
                          </View>
                        ) : (
                          issues.map((issue, idx) => (
                            <View key={idx} className="p-4 bg-secondary/20 rounded-xl border-l-4" style={{ borderLeftColor: issue.severity === 'critical' ? colors.error : '#F59E0B' }}>
                              <View className="flex-row justify-between items-start mb-2">
                                <Text className="text-lg font-bold text-foreground flex-1">{issue.title}</Text>
                                <View className={`px-2 py-1 rounded uppercase text-[10px] font-black ${issue.severity === 'critical' ? 'bg-error/10 text-error' : 'bg-warning/10 text-warning'}`}>
                                  {issue.severity}
                                </View>
                              </View>
                              <Text className="text-muted-foreground mb-3">{issue.description}</Text>
                              <View className="bg-background p-3 rounded-lg border border-border">
                                <Text className="text-xs font-bold text-primary uppercase mb-1">Recommendation</Text>
                                <Text className="text-sm text-foreground">{issue.recommendation}</Text>
                              </View>
                            </View>
                          ))
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
