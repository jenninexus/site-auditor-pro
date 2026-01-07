/**
 * Enhanced Preview & Customize Page
 * Live website preview with separate light/dark mode CSS variable editing
 */

import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, Alert, Platform, TouchableOpacity } from "react-native";
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

export default function PreviewPage() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const auditId = params.id as string;

  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [html, setHtml] = useState<string>("");
  const [palette, setPalette] = useState<CSSVariablePalette | null>(null);
  const [activeMode, setActiveMode] = useState<ColorMode>("light");
  const [lightModified, setLightModified] = useState<Map<string, string>>(new Map());
  const [darkModified, setDarkModified] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load audit result and extract variables
  useEffect(() => {
    loadAuditData();
  }, [auditId]);

  const loadAuditData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load audit result from storage (web-compatible)
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

      // Fetch the HTML again (we need it for preview)
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(result.url)}`;
      const response = await fetch(proxyUrl);
      const fetchedHtml = await response.text();
      setHtml(fetchedHtml);

      // Extract CSS variables by mode (passing baseUrl to fetch external stylesheets)
      let extractedPalette = await extractCSSVariablesByMode(fetchedHtml, result.url);
      
      // If no variables found but Bootstrap is detected, use Bootstrap defaults
      extractedPalette = enhancePaletteWithBootstrapFallback(extractedPalette, fetchedHtml);
      
      setPalette(extractedPalette);

      setIsLoading(false);
    } catch (err) {
      console.error("Failed to load audit data:", err);
      setError("Failed to load preview data");
      setIsLoading(false);
    }
  };

  // Handle variable change
  const handleVariableChange = (name: string, value: string) => {
    if (activeMode === "light") {
      setLightModified((prev) => {
        const next = new Map(prev);
        next.set(name, value);
        return next;
      });
    } else {
      setDarkModified((prev) => {
        const next = new Map(prev);
        next.set(name, value);
        return next;
      });
    }
  };

  // Reset all changes
  const handleReset = () => {
    Alert.alert(
      "Reset Changes",
      `Reset all ${activeMode} mode color changes?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            if (activeMode === "light") {
              setLightModified(new Map());
            } else {
              setDarkModified(new Map());
            }
          },
        },
      ]
    );
  };

  // Export modified CSS
  const handleExport = () => {
    if (!palette) return;

    try {
      const css = generateDualModeCSSFromVariables(
        palette,
        lightModified,
        darkModified
      );

      // Create blob and download
      const blob = new Blob([css], { type: "text/css" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `modified-variables-${Date.now()}.css`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      Alert.alert("Success", "CSS file with light and dark modes downloaded!");
    } catch (err) {
      console.error("Failed to export CSS:", err);
      Alert.alert("Error", "Failed to export CSS file");
    }
  };

  // Get current variables based on active mode
  const getCurrentVariables = (): CSSVariable[] => {
    if (!palette) return [];
    return getColorVariablesByMode(palette, activeMode);
  };

  const getCurrentModified = (): Map<string, string> => {
    return activeMode === "light" ? lightModified : darkModified;
  };

  // Check if site uses Bootstrap
  const hasBootstrap = (): boolean => {
    if (!palette) return false;
    const allVars = [...palette.light, ...palette.dark, ...palette.shared];
    return allVars.some(v => v.name.startsWith('--bs-'));
  };

  // Get Bootstrap theme for export
  const getBootstrapTheme = (): BootstrapTheme => {
    const lightVars = palette?.light || [];
    const darkVars = palette?.dark || [];
    
    // Merge original values with modifications
    const lightMap = extractBootstrapVariables(lightVars);
    lightModified.forEach((value, name) => {
      if (name.startsWith('--bs-')) {
        lightMap.set(name, value);
      }
    });
    
    const darkMap = extractBootstrapVariables(darkVars);
    darkModified.forEach((value, name) => {
      if (name.startsWith('--bs-')) {
        darkMap.set(name, value);
      }
    });
    
    return { light: lightMap, dark: darkMap };
  };

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-muted">Loading preview...</Text>
      </View>
    );
  }

  // Error state
  if (error || !auditResult) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="text-xl font-bold text-destructive mb-2">
          {error || "Failed to load preview"}
        </Text>
        <Text className="text-muted text-center mb-6">
          Unable to load the preview data. Please try running the audit again.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-primary px-6 py-3 rounded-lg"
        >
          <Text className="text-primary-foreground font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // No variables found
  const hasVariables = palette && (palette.light.length > 0 || palette.dark.length > 0);
  if (!hasVariables) {
    return (
      <View className="flex-1 bg-background">
        <View className="p-6 border-b border-border">
          <Text className="text-2xl font-bold text-foreground">
            Preview & Customize
          </Text>
          <Text className="text-muted mt-1">{auditResult.url}</Text>
        </View>
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-xl font-bold text-foreground mb-2">
            No CSS Variables Found
          </Text>
          <Text className="text-muted text-center mb-6">
            This website doesn't use CSS custom properties (variables). The
            color picker feature requires websites that use modern CSS
            variables.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary px-6 py-3 rounded-lg"
          >
            <Text className="text-primary-foreground font-semibold">
              Back to Results
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const lightCount = palette?.light.length || 0;
  const darkCount = palette?.dark.length || 0;
  const sharedCount = palette?.shared.length || 0;

  // Main preview layout
  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-surface px-6 py-4 border-b border-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground">
              Preview & Customize Colors
            </Text>
            <Text className="text-muted mt-1">{auditResult.url}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-muted px-4 py-2 rounded-lg"
          >
            <Text className="text-foreground font-semibold">Back</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Mode Tabs */}
      <View className="bg-surface px-6 py-3 border-b border-border">
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setActiveMode("light")}
            className={`px-4 py-2 rounded-lg ${
              activeMode === "light"
                ? "bg-primary"
                : "bg-muted"
            }`}
          >
            <Text
              className={`font-semibold ${
                activeMode === "light"
                  ? "text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              ☀️ Light Mode ({lightCount} vars)
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setActiveMode("dark")}
            className={`px-4 py-2 rounded-lg ${
              activeMode === "dark"
                ? "bg-primary"
                : "bg-muted"
            }`}
          >
            <Text
              className={`font-semibold ${
                activeMode === "dark"
                  ? "text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              🌙 Dark Mode ({darkCount} vars)
            </Text>
          </TouchableOpacity>

          {sharedCount > 0 && (
            <View className="px-4 py-2 rounded-lg bg-muted">
              <Text className="text-muted-foreground font-semibold">
                🔗 Shared ({sharedCount} vars)
              </Text>
            </View>
          )}
        </View>

        {/* Info banner */}
        <View className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Text className="text-sm text-blue-900 dark:text-blue-100">
            💡 Editing <Text className="font-bold">{activeMode} mode</Text> variables.
            Changes will be reflected in the preview and exported CSS.
          </Text>
        </View>
      </View>

      {/* Split View */}
      <View className="flex-1 flex-row">
        {/* Left: Website Preview */}
        <View className="flex-1 p-4">
          <View className="bg-surface rounded-lg shadow-lg overflow-hidden h-full">
            <View className="p-3 bg-muted border-b border-border">
              <Text className="text-sm font-semibold text-foreground">
                Live Preview ({activeMode} mode)
              </Text>
            </View>
            <WebsitePreview
              html={html}
              url={auditResult.url}
              modifiedVariables={getCurrentModified()}
              className="h-full"
            />
          </View>
        </View>

        {/* Right: Variable Editor */}
        <View className="w-96 border-l border-border">
          <CSSVariableEditor
            variables={getCurrentVariables()}
            modifiedValues={getCurrentModified()}
            onVariableChange={handleVariableChange}
            onReset={handleReset}
            onExport={handleExport}
          />
          
          {/* Bootstrap Theme Export (if Bootstrap detected) */}
          {hasBootstrap() && (
            <View className="p-4 border-t border-border">
              <BootstrapThemeExport
                theme={getBootstrapTheme()}
                siteName={auditResult?.url.replace(/^https?:\/\//, '').split('/')[0]}
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
