import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { auditWebsite, type AuditResult } from "@/lib/audit-engine";
import { router } from "expo-router";
import { ThemeToggleCompact } from "@/components/theme-toggle";
import { IconSymbol } from "@/components/ui/icon-symbol";

const RECENT_AUDITS_KEY = "recent_audits";

export default function HomeScreen() {
  const colors = useColors();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentAudits, setRecentAudits] = useState<AuditResult[]>([]);

  // Load recent audits on mount
  useEffect(() => {
    loadRecentAudits();
  }, []);

  const loadRecentAudits = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_AUDITS_KEY);
      if (stored) {
        const audits = JSON.parse(stored) as AuditResult[];
        setRecentAudits(audits.slice(0, 5)); // Show last 5 audits
      }
    } catch (error) {
      console.error("Failed to load recent audits:", error);
    }
  };

  const saveAudit = async (result: AuditResult) => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_AUDITS_KEY);
      const audits = stored ? (JSON.parse(stored) as AuditResult[]) : [];
      
      // Remove existing audit for same URL to avoid duplicates
      const filtered = audits.filter(a => a.url !== result.url);
      
      // Add new audit to the beginning and keep only last 10
      const updated = [result, ...filtered].slice(0, 10);
      await AsyncStorage.setItem(RECENT_AUDITS_KEY, JSON.stringify(updated));
      setRecentAudits(updated.slice(0, 5));
    } catch (error) {
      console.error("Failed to save audit:", error);
    }
  };

  const removeAudit = async (urlToRemove: string) => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_AUDITS_KEY);
      if (stored) {
        const audits = JSON.parse(stored) as AuditResult[];
        const updated = audits.filter(a => a.url !== urlToRemove);
        await AsyncStorage.setItem(RECENT_AUDITS_KEY, JSON.stringify(updated));
        setRecentAudits(updated.slice(0, 5));
      }
    } catch (error) {
      console.error("Failed to remove audit:", error);
    }
  };

  const handleAudit = async () => {
    if (!url.trim()) {
      Alert.alert("Error", "Please enter a website URL");
      return;
    }

    setLoading(true);
    try {
      // Ensure URL has protocol
      let auditUrl = url.trim();
      if (!auditUrl.startsWith("http://") && !auditUrl.startsWith("https://")) {
        auditUrl = "https://" + auditUrl;
      }

      const result = await auditWebsite(auditUrl);
      await saveAudit(result);

      // Navigate to results screen with the audit data
      router.push({
        pathname: "/results",
        params: { auditId: JSON.stringify(result) },
      });
    } catch (error) {
      Alert.alert("Audit Failed", `${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRecentAudit = async (audit: AuditResult) => {
    router.push({
      pathname: "/results",
      params: { auditId: JSON.stringify(audit) },
    });
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 gap-8">
          {/* Theme Toggle */}
          <View className="items-end">
            <ThemeToggleCompact />
          </View>
          
          {/* Hero Section */}
          <View className="items-center gap-3">
            <Text className="text-4xl font-bold text-foreground">Site Auditor</Text>
            <Text className="text-base text-muted text-center leading-relaxed">
              Analyze your website for CSS and JavaScript consistency issues
            </Text>
          </View>

          {/* Input Card */}
          <View className="w-full bg-surface rounded-2xl p-6 shadow-sm border border-border gap-4">
            <Text className="text-sm font-semibold text-foreground">Website URL</Text>
            <TextInput
              placeholder="example.com"
              placeholderTextColor={colors.muted}
              value={url}
              onChangeText={setUrl}
              editable={!loading}
              returnKeyType="done"
              onSubmitEditing={handleAudit}
              className="border border-border rounded-lg px-4 py-3 text-foreground"
              style={{
                backgroundColor: colors.background,
                color: colors.foreground,
              }}
            />
            <TouchableOpacity
              onPress={handleAudit}
              disabled={loading}
              className="bg-primary px-6 py-3 rounded-full active:opacity-80 flex-row items-center justify-center"
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              {loading ? (
                <ActivityIndicator color={colors.background} size="small" />
              ) : (
                <Text className="text-background font-semibold text-center">Audit Website</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Info Card */}
          <View className="w-full bg-surface rounded-2xl p-6 shadow-sm border border-border gap-3">
            <Text className="text-lg font-semibold text-foreground">What We Check</Text>
            <View className="gap-2">
              <Text className="text-sm text-muted">
                <Text className="font-semibold text-foreground">CSS Consistency</Text> — Fragmentation, naming patterns, minification
              </Text>
              <Text className="text-sm text-muted">
                <Text className="font-semibold text-foreground">JavaScript Quality</Text> — Duplicates, fragmentation, best practices
              </Text>
              <Text className="text-sm text-muted">
                <Text className="font-semibold text-foreground">Performance</Text> — Asset optimization, HTTP requests
              </Text>
            </View>
          </View>

          {/* Recent Audits */}
          {recentAudits.length > 0 && (
            <View className="gap-3">
              <Text className="text-lg font-semibold text-foreground">Recent Audits</Text>
              {recentAudits.map((audit, index) => (
                <View key={index} className="relative">
                  <TouchableOpacity
                    onPress={() => handleRecentAudit(audit)}
                    className="bg-surface rounded-xl p-4 border border-border active:opacity-70"
                  >
                    <View className="flex-row items-center justify-between gap-3">
                      <View className="flex-1 pr-8">
                        <Text className="text-sm font-semibold text-foreground truncate">
                          {audit.url}
                        </Text>
                        <Text className="text-xs text-muted mt-1">
                          {new Date(audit.timestamp).toLocaleDateString()}
                        </Text>
                      </View>
                      <View className="items-center">
                        <Text
                          className="text-lg font-bold"
                          style={{
                            color:
                              audit.overallScore >= 80
                                ? colors.success
                                : audit.overallScore >= 60
                                  ? "#F59E0B"
                                  : colors.error,
                          }}
                        >
                          {Math.round(audit.overallScore)}
                        </Text>
                        <Text className="text-xs text-muted">Score</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                  
                  {/* Remove Button */}
                  <TouchableOpacity
                    onPress={() => removeAudit(audit.url)}
                    className="absolute top-0 right-0 p-3 z-10"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <IconSymbol name="xmark.circle.fill" size={22} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
