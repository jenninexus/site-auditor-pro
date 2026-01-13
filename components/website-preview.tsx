import React, { useEffect, useRef, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";

interface WebsitePreviewProps {
  html: string;
  baseUrl: string;
  modifiedVariables?: Map<string, string>;
  className?: string;
  onIframeLoad?: (iframe: HTMLIFrameElement) => void;
}

export function WebsitePreview({
  html,
  baseUrl,
  modifiedVariables,
  className = "",
  onIframeLoad,
}: WebsitePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!iframeRef.current || !modifiedVariables || modifiedVariables.size === 0) {
      return;
    }

    try {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

      if (!iframeDoc) return;

      const existingStyle = iframeDoc.getElementById("custom-variables");
      if (existingStyle) existingStyle.remove();

      const styleElement = iframeDoc.createElement("style");
      styleElement.id = "custom-variables";

      const cssVariables = Array.from(modifiedVariables.entries())
        .map(([name, value]) => `  ${name}: ${value} !important;`)
        .join("\n");

      styleElement.textContent = `:root {\n${cssVariables}\n}`;
      iframeDoc.head.appendChild(styleElement);
    } catch (err) {
      console.error("Failed to inject CSS:", err);
    }
  }, [modifiedVariables]);

  const handleLoad = () => {
    setIsLoading(false);
    setError(null);
    if (onIframeLoad && iframeRef.current) {
      onIframeLoad(iframeRef.current);
    }
  };

  const handleError = () => {
    setIsLoading(false);
    setError("Failed to load preview");
  };

  const prepareHTML = () => {
    let modifiedHTML = html;
    if (!html.includes("<base")) {
      const baseTag = `<base href="${baseUrl}">`;
      modifiedHTML = html.replace("<head>", `<head>\n  ${baseTag}`);
    }
    if (!html.includes("viewport")) {
      const viewportTag = `<meta name="viewport" content="width=device-width, initial-scale=1.0">`;
      modifiedHTML = modifiedHTML.replace("<head>", `<head>\n  ${viewportTag}`);
    }
    return modifiedHTML;
  };

  return (
    <View className={`relative w-full h-full bg-secondary/10 ${className}`}>
      {isLoading && (
        <View className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <ActivityIndicator size="large" color="#715BFF" />
          <Text className="mt-4 text-muted-foreground font-bold">Rendering Preview...</Text>
        </View>
      )}

      {error && (
        <View className="absolute inset-0 flex items-center justify-center bg-background z-10 p-6">
          <i className="fa-solid fa-shield-halved text-destructive text-4xl mb-4"></i>
          <Text className="text-foreground font-bold text-center">{error}</Text>
          <Text className="mt-2 text-muted-foreground text-center text-sm">
            Security restrictions (CSP) may prevent live preview for this site.
          </Text>
        </View>
      )}

      <iframe
        ref={iframeRef}
        srcDoc={prepareHTML()}
        onLoad={handleLoad}
        onError={handleError}
        sandbox="allow-same-origin allow-scripts allow-forms"
        className="w-full h-full border-0"
        title="Website Preview"
      />

      <View className="absolute top-4 right-4 bg-primary/90 px-4 py-2 rounded-full shadow-lg flex-row items-center gap-2">
        <View className="w-2 h-2 rounded-full bg-white animate-pulse" />
        <Text className="text-white text-[10px] font-black uppercase tracking-widest">Live Playground</Text>
      </View>
    </View>
  );
}
