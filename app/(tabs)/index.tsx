import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { auditWebsite, type AuditResult } from "@/lib/audit-engine";
import { router } from "expo-router";
import { ThemeToggleCompact } from "@/components/theme-toggle";

const RECENT_AUDITS_KEY = "recent_audits";

export default function HomeScreen() {
  const colors = useColors();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentAudits, setRecentAudits] = useState<AuditResult[]>([]);

  useEffect(() => {
    loadRecentAudits();
  }, []);

  const loadRecentAudits = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_AUDITS_KEY);
      if (stored) {
        const audits = JSON.parse(stored) as AuditResult[];
        setRecentAudits(audits.slice(0, 5));
      }
    } catch (error) {
      console.error("Failed to load recent audits:", error);
    }
  };

  const saveAudit = async (result: AuditResult) => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_AUDITS_KEY);
      const audits = stored ? (JSON.parse(stored) as AuditResult[]) : [];
      const filtered = audits.filter(a => a.url !== result.url);
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
      let auditUrl = url.trim();
      if (!auditUrl.startsWith("http://") && !auditUrl.startsWith("https://")) {
        auditUrl = "https://" + auditUrl;
      }

      const result = await auditWebsite(auditUrl);
      await saveAudit(result);

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
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 p-6 md:p-12 max-w-5xl mx-auto w-full gap-12">
          {/* Header */}
          <View className="flex-row items-center justify-between animate-fade-in">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-primary rounded-xl items-center justify-center shadow-lg shadow-primary/20">
                <i className="fa-solid fa-magnifying-glass-chart text-white text-xl"></i>
              </View>
              <Text className="text-2xl font-bold tracking-tight text-foreground">Site Auditor Pro</Text>
            </View>
            <ThemeToggleCompact />
          </View>
          
          {/* Hero Section */}
          <View className="items-center gap-4 py-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <Text className="text-5xl md:text-6xl font-black text-foreground text-center tracking-tighter leading-none">
              Everything you need to <Text className="text-primary">audit your site</Text>
            </Text>
            <Text className="text-lg md:text-xl text-muted-foreground text-center max-w-2xl leading-relaxed">
              Analyze your website for CSS consistency, JavaScript quality, and accessibility issues. Built for modern web developers.
            </Text>
            <View className="flex-row gap-4 mt-4">
              <TouchableOpacity className="btn-primary flex-row items-center gap-2 px-8 py-4">
                <Text className="text-primary-foreground font-bold text-lg">Get Started</Text>
                <i className="fa-solid fa-arrow-right text-primary-foreground"></i>
              </TouchableOpacity>
              <TouchableOpacity className="bg-secondary px-8 py-4 rounded-lg flex-row items-center gap-2">
                <Text className="text-secondary-foreground font-bold text-lg">Documentation</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Input Card */}
          <View className="w-full card-atmos p-8 gap-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <View className="gap-2">
              <Text className="text-sm font-bold uppercase tracking-widest text-primary">Audit Tool</Text>
              <Text className="text-2xl font-bold text-foreground">Enter your website URL</Text>
            </View>
            
            <View className="flex-row gap-3">
              <View className="flex-1 relative">
                <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  <i className="fa-solid fa-globe text-muted-foreground"></i>
                </View>
                <TextInput
                  placeholder="https://example.com"
                  placeholderTextColor={colors.muted}
                  value={url}
                  onChangeText={setUrl}
                  editable={!loading}
                  className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-4 text-foreground text-lg focus:border-primary"
                  style={{ outlineStyle: 'none' } as any}
                />
              </View>
              <TouchableOpacity
                onPress={handleAudit}
                disabled={loading}
                className="bg-primary px-8 rounded-xl items-center justify-center shadow-lg shadow-primary/20"
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white font-bold text-lg">Run Audit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Features Grid */}
          <View className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <View className="card-atmos p-6 gap-4">
              <View className="w-12 h-12 bg-blue-500/10 rounded-xl items-center justify-center">
                <i className="fa-solid fa-palette text-blue-500 text-xl"></i>
              </View>
              <Text className="text-xl font-bold text-foreground">CSS Consistency</Text>
              <Text className="text-muted-foreground leading-relaxed">
                Analyze fragmentation, naming patterns, and minification across your stylesheets.
              </Text>
            </View>
            <View className="card-atmos p-6 gap-4">
              <View className="w-12 h-12 bg-green-500/10 rounded-xl items-center justify-center">
                <i className="fa-solid fa-code text-green-500 text-xl"></i>
              </View>
              <Text className="text-xl font-bold text-foreground">JS Quality</Text>
              <Text className="text-muted-foreground leading-relaxed">
                Detect duplicates, fragmentation, and best practice violations in your scripts.
              </Text>
            </View>
            <View className="card-atmos p-6 gap-4">
              <View className="w-12 h-12 bg-purple-500/10 rounded-xl items-center justify-center">
                <i className="fa-solid fa-universal-access text-purple-500 text-xl"></i>
              </View>
              <Text className="text-xl font-bold text-foreground">Accessibility</Text>
              <Text className="text-muted-foreground leading-relaxed">
                Comprehensive WCAG 2.1 and 3.0 checks for both light and dark mode themes.
              </Text>
            </View>
          </View>

          {/* Recent Audits */}
          {recentAudits.length > 0 && (
            <View className="gap-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <View className="flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-foreground">Recent Audits</Text>
                <TouchableOpacity onPress={() => router.push("/history")}>
                  <Text className="text-primary font-bold">View All</Text>
                </TouchableOpacity>
              </View>
              
              <View className="gap-4">
                {recentAudits.map((audit, index) => (
                  <View key={index} className="card-atmos hover:border-primary transition-colors group">
                    <TouchableOpacity
                      onPress={() => handleRecentAudit(audit)}
                      className="p-6 flex-row items-center justify-between"
                    >
                      <View className="flex-row items-center gap-4 flex-1">
                        <View className="w-10 h-10 bg-secondary rounded-lg items-center justify-center">
                          <i className="fa-solid fa-link text-muted-foreground"></i>
                        </View>
                        <View>
                          <Text className="text-lg font-bold text-foreground">{audit.url}</Text>
                          <Text className="text-sm text-muted-foreground">
                            {new Date(audit.timestamp).toLocaleDateString()} • {audit.issues.length} issues found
                          </Text>
                        </View>
                      </View>
                      
                      <View className="flex-row items-center gap-8">
                        <View className="items-end">
                          <Text
                            className="text-2xl font-black"
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
                          <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Score</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => removeAudit(audit.url)}
                          className="p-2 hover:bg-destructive/10 rounded-lg"
                        >
                          <i className="fa-solid fa-trash-can text-destructive opacity-0 group-hover:opacity-100 transition-opacity"></i>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Footer */}
          <View className="border-t border-border pt-12 pb-8 flex-row items-center justify-between text-muted-foreground">
            <Text className="text-sm">© 2026 Site Auditor Pro. Built with ❤️ for developers.</Text>
            <View className="flex-row gap-6">
              <TouchableOpacity onPress={() => router.push("/privacy")}>
                <Text className="text-sm hover:text-primary">Privacy Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text className="text-sm hover:text-primary">Terms of Service</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
