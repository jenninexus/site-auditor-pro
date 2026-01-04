/**
 * Preview & Customize Page
 * Main page for live website preview with CSS variable editing
 */

import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WebsitePreview } from "../components/website-preview";
import { CSSVariableEditor } from "../components/css-variable-editor";
import {
  extractCSSVariables,
  getColorVariables,
  generateCSSFromVariables,
  CSSVariable,
} from "../lib/css-variable-extractor";
import { AuditResult } from "../lib/audit-engine";

export default function PreviewPage() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const auditId = params.id as string;

  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [html, setHtml] = useState<string>("");
  const [variables, setVariables] = useState<CSSVariable[]>([]);
  const [modifiedValues, setModifiedValues] = useState<Map<string, string>>(
    new Map()
  );
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

      // Load audit result from storage
      const stored = await AsyncStorage.getItem(`audit_${auditId}`);
      if (!stored) {
        setError("Audit result not found");
        return;
      }

      const result: AuditResult = JSON.parse(stored);
      setAuditResult(result);

      // Fetch the HTML again (we need it for preview)
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
        result.url
      )}`;
      const response = await fetch(proxyUrl);
      const fetchedHtml = await response.text();
      setHtml(fetchedHtml);

      // Extract CSS variables
      const extractedVars = extractCSSVariables(fetchedHtml);
      const colorVars = getColorVariables(extractedVars);
      setVariables(colorVars);

      setIsLoading(false);
    } catch (err) {
      console.error("Failed to load audit data:", err);
      setError("Failed to load preview data");
      setIsLoading(false);
    }
  };

  // Handle variable change
  const handleVariableChange = (name: string, value: string) => {
    setModifiedValues((prev) => {
      const next = new Map(prev);
      next.set(name, value);
      return next;
    });
  };

  // Reset all changes
  const handleReset = () => {
    Alert.alert(
      "Reset Changes",
      "Are you sure you want to reset all color changes?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => setModifiedValues(new Map()),
        },
      ]
    );
  };

  // Export modified CSS
  const handleExport = () => {
    try {
      const css = generateCSSFromVariables(variables, modifiedValues);

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

      Alert.alert("Success", "CSS file downloaded successfully!");
    } catch (err) {
      console.error("Failed to export CSS:", err);
      Alert.alert("Error", "Failed to export CSS file");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text className="mt-4 text-gray-600">Loading preview...</Text>
      </View>
    );
  }

  // Error state
  if (error || !auditResult) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <Text className="text-xl font-bold text-red-600 mb-2">
          {error || "Failed to load preview"}
        </Text>
        <Text className="text-gray-600 text-center mb-6">
          Unable to load the preview data. Please try running the audit again.
        </Text>
        <button
          onClick={() => router.back()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Go Back
        </button>
      </View>
    );
  }

  // No variables found
  if (variables.length === 0) {
    return (
      <View className="flex-1 bg-white">
        <View className="p-6 border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900">
            Preview & Customize
          </Text>
          <Text className="text-gray-600 mt-1">{auditResult.url}</Text>
        </View>
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-xl font-bold text-gray-900 mb-2">
            No CSS Variables Found
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            This website doesn't use CSS custom properties (variables). The
            color picker feature requires websites that use modern CSS
            variables.
          </Text>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Back to Results
          </button>
        </View>
      </View>
    );
  }

  // Main preview layout
  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">
              Preview & Customize
            </Text>
            <Text className="text-gray-600 mt-1">{auditResult.url}</Text>
          </View>
          <button
            onClick={() => router.back()}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300"
          >
            Back to Results
          </button>
        </View>
      </View>

      {/* Split View */}
      <View className="flex-1 flex-row">
        {/* Left: Website Preview */}
        <View className="flex-1 p-4">
          <View className="bg-white rounded-lg shadow-lg overflow-hidden h-full">
            <WebsitePreview
              html={html}
              url={auditResult.url}
              modifiedVariables={modifiedValues}
              className="h-full"
            />
          </View>
        </View>

        {/* Right: Variable Editor */}
        <View className="w-96 border-l border-gray-200">
          <CSSVariableEditor
            variables={variables}
            modifiedValues={modifiedValues}
            onVariableChange={handleVariableChange}
            onReset={handleReset}
            onExport={handleExport}
          />
        </View>
      </View>
    </View>
  );
}
