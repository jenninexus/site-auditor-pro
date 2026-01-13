import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, Alert, Platform, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WebsitePreview } from "../components/website-preview";
import { CSSVariableEditor } from "../components/css-variable-editor";
import { BootstrapThemeExport } from "../components/bootstrap-theme-export";
import { extractBootstrapVariables, BootstrapTheme } from "../lib/bootstrap-theme-exporter";
import {
  extractCSSVariablesByMode,
  getColorVariablesByMode,
  generateDualModeCSSFromVariables,
  CSSVariable,
  CSSVariablePalette,
  ColorMode,
} from "../lib/css-variable-extractor";
import { AuditResult } from "../lib/audit-engine";
import { enhancePaletteWithBootstrapFallback } from "../lib/bootstrap-fallback";
import { extractCSSVariablesFromIframe } from "../lib/client-css-extractor";
import { useColors } from "@/hooks/use-colors";

export default function PreviewPage() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const colors = useColors();
  const auditId = params.id as string;

  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [html, setHtml] = useState<string>("");
  const [palette, setPalette] = useState<CSSVariablePalette | null>(null);
  const [activeMode, setActiveMode] = useState<ColorMode>("light");
  const [lightModified, setLightModified] = useState<Map<string, string>>(new Map());
  const [darkModified, setDarkModified] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    loadAuditData();
  }, [auditId]);

  const handleIframeLoad = (iframe: HTMLIFrameElement) => {
    setIframeLoaded(true);
    if (palette) {
      const totalVars = palette.light.length + palette.dark.length + palette.shared.length;
      if (totalVars === 0) {
        setTimeout(() => {
          const clientPalette = extractCSSVariablesFromIframe(iframe);
          const clientTotal = clientPalette.light.length + clientPalette.dark.length;
          if (clientTotal > 0) {
            setPalette(clientPalette);
          }
        }, 1000);
      }
    }
  };

  const loadAuditData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      let stored: string | null = null;
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        stored = localStorage.getItem(auditId);
      } else {
        stored = await AsyncStorage.getItem(auditId);
      }
      if (!stored) {
        setError("Audit result not found");
        return;
      }
      const result: AuditResult = JSON.parse(stored);
      setAuditResult(result);
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(result.url)}`;
      const response = await fetch(proxyUrl);
      const fetchedHtml = await response.text();
      setHtml(fetchedHtml);
      let extractedPalette = await extractCSSVariablesByMode(fetchedHtml, result.url);
      extractedPalette = enhancePaletteWithBootstrapFallback(extractedPalette, fetchedHtml);
      setPalette(extractedPalette);
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to load audit data:", err);
      setError("Failed to load preview data");
      setIsLoading(false);
    }
  };

  const handleVariableChange = (name: string, value: string) => {
    if (activeMode === "light") {
      setLightModified((prev) => new Map(prev).set(name, value));
    } else {
      setDarkModified((prev) => new Map(prev).set(name, value));
    }
  };

  const handleExport = () => {
    if (!palette) return;
    try {
      const css = generateDualModeCSSFromVariables(palette, lightModified, darkModified);
      const blob = new Blob([css], { type: "text/css" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `site-auditor-theme-${Date.now()}.css`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      Alert.alert("Success", "CSS theme file downloaded!");
    } catch (err) {
      Alert.alert("Error", "Failed to export CSS");
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-4 text-muted-foreground font-bold animate-pulse">Loading Playground...</Text>
      </View>
    );
  }

  if (error || !auditResult) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <i className="fa-solid fa-circle-exclamation text-destructive text-5xl mb-4"></i>
        <Text className="text-2xl font-bold text-foreground mb-2">{error || "Failed to load preview"}</Text>
        <TouchableOpacity onPress={() => router.back()} className="btn-primary mt-4">
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const hasVariables = palette && (palette.light.length > 0 || palette.dark.length > 0 || palette.shared.length > 0);

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-surface border-b border-border px-6 py-4 flex-row items-center justify-between z-10 shadow-sm">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-secondary rounded-xl items-center justify-center">
            <i className="fa-solid fa-arrow-left text-foreground"></i>
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-bold text-foreground">Theme Playground</Text>
            <Text className="text-xs text-muted-foreground font-mono">{auditResult.url}</Text>
          </View>
        </View>
        <View className="flex-row gap-3">
          <TouchableOpacity onPress={handleExport} className="btn-primary flex-row items-center gap-2 px-6">
            <i className="fa-solid fa-download text-white"></i>
            <Text className="text-white font-bold">Export CSS</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1 flex-row">
        {/* Sidebar - Editor */}
        <View className="w-96 bg-surface border-r border-border flex-col">
          <View className="p-4 border-b border-border flex-row gap-2">
            <TouchableOpacity 
              onPress={() => setActiveMode("light")}
              className={`flex-1 py-3 rounded-xl flex-row items-center justify-center gap-2 ${activeMode === 'light' ? 'bg-primary' : 'bg-secondary'}`}
            >
              <i className={`fa-solid fa-sun ${activeMode === 'light' ? 'text-white' : 'text-muted-foreground'}`}></i>
              <Text className={`font-bold ${activeMode === 'light' ? 'text-white' : 'text-muted-foreground'}`}>Light</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setActiveMode("dark")}
              className={`flex-1 py-3 rounded-xl flex-row items-center justify-center gap-2 ${activeMode === 'dark' ? 'bg-primary' : 'bg-secondary'}`}
            >
              <i className={`fa-solid fa-moon ${activeMode === 'dark' ? 'text-white' : 'text-muted-foreground'}`}></i>
              <Text className={`font-bold ${activeMode === 'dark' ? 'text-white' : 'text-muted-foreground'}`}>Dark</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            {!hasVariables ? (
              <View className="items-center py-12 gap-4">
                <i className="fa-solid fa-magnifying-glass text-muted-foreground text-4xl"></i>
                <Text className="text-center text-muted-foreground font-bold">No CSS variables detected yet. Try refreshing or wait for the preview to load.</Text>
              </View>
            ) : (
              <CSSVariableEditor
                variables={getColorVariablesByMode(palette!, activeMode)}
                modifiedValues={activeMode === "light" ? lightModified : darkModified}
                onVariableChange={handleVariableChange}
              />
            )}
          </ScrollView>
        </View>

        {/* Main Content - Preview */}
        <View className="flex-1 bg-secondary/20 relative">
          <View className="absolute inset-0 items-center justify-center">
             {!iframeLoaded && <ActivityIndicator size="large" color={colors.primary} />}
          </View>
          <WebsitePreview
            html={html}
            baseUrl={auditResult.url}
            modifiedVariables={activeMode === "light" ? lightModified : darkModified}
            onIframeLoad={handleIframeLoad}
          />
        </View>
      </View>
    </View>
  );
}
