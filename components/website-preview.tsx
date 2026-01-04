/**
 * Website Preview Component
 * Displays a website in an iframe with ability to inject custom CSS
 */

import React, { useEffect, useRef, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";

interface WebsitePreviewProps {
  html: string;
  url: string;
  modifiedVariables?: Map<string, string>;
  className?: string;
}

export function WebsitePreview({
  html,
  url,
  modifiedVariables,
  className = "",
}: WebsitePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inject custom CSS variables into the iframe
  useEffect(() => {
    if (!iframeRef.current || !modifiedVariables || modifiedVariables.size === 0) {
      return;
    }

    try {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

      if (!iframeDoc) {
        console.warn("Cannot access iframe document");
        return;
      }

      // Remove previous custom style if exists
      const existingStyle = iframeDoc.getElementById("custom-variables");
      if (existingStyle) {
        existingStyle.remove();
      }

      // Create new style element with modified variables
      const styleElement = iframeDoc.createElement("style");
      styleElement.id = "custom-variables";

      // Generate CSS from modified variables
      const cssVariables = Array.from(modifiedVariables.entries())
        .map(([name, value]) => `  ${name}: ${value};`)
        .join("\n");

      styleElement.textContent = `:root {\n${cssVariables}\n}`;

      // Inject into iframe head
      iframeDoc.head.appendChild(styleElement);
    } catch (err) {
      console.error("Failed to inject CSS:", err);
    }
  }, [modifiedVariables]);

  // Handle iframe load
  const handleLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  // Handle iframe error
  const handleError = () => {
    setIsLoading(false);
    setError("Failed to load preview");
  };

  // Prepare HTML for iframe
  const prepareHTML = () => {
    // Add base tag to handle relative URLs
    let modifiedHTML = html;

    // Add base href if not present
    if (!html.includes("<base")) {
      const baseTag = `<base href="${url}">`;
      modifiedHTML = html.replace("<head>", `<head>\n  ${baseTag}`);
    }

    // Add meta viewport for responsive preview
    if (!html.includes("viewport")) {
      const viewportTag = `<meta name="viewport" content="width=device-width, initial-scale=1.0">`;
      modifiedHTML = modifiedHTML.replace(
        "<head>",
        `<head>\n  ${viewportTag}`
      );
    }

    return modifiedHTML;
  };

  return (
    <View className={`relative w-full h-full bg-gray-100 ${className}`}>
      {/* Loading indicator */}
      {isLoading && (
        <View className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <ActivityIndicator size="large" color="#0a7ea4" />
          <Text className="mt-4 text-gray-600">Loading preview...</Text>
        </View>
      )}

      {/* Error message */}
      {error && (
        <View className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <Text className="text-red-500 text-lg">{error}</Text>
          <Text className="mt-2 text-gray-600">
            The website may have security restrictions
          </Text>
        </View>
      )}

      {/* Iframe preview */}
      <iframe
        ref={iframeRef}
        srcDoc={prepareHTML()}
        onLoad={handleLoad}
        onError={handleError}
        sandbox="allow-same-origin allow-scripts allow-forms"
        className="w-full h-full border-0"
        title="Website Preview"
      />

      {/* Preview overlay info */}
      <View className="absolute top-2 left-2 bg-black/70 px-3 py-1 rounded">
        <Text className="text-white text-xs">Live Preview</Text>
      </View>
    </View>
  );
}

/**
 * Fallback preview component for when iframe fails
 */
export function StaticPreview({ html, className = "" }: { html: string; className?: string }) {
  return (
    <View className={`w-full h-full bg-white overflow-auto ${className}`}>
      <div
        className="p-4"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </View>
  );
}
