/**
 * Bootstrap Theme Export Component
 * UI for exporting customized Bootstrap themes
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import {
  generateBootstrapThemeCSS,
  generateSeparateThemes,
  downloadCSS,
  copyToClipboard,
  BootstrapTheme,
} from '../lib/bootstrap-theme-exporter';

interface BootstrapThemeExportProps {
  theme: BootstrapTheme;
  siteName?: string;
}

export function BootstrapThemeExport({ theme, siteName }: BootstrapThemeExportProps) {
  const [copied, setCopied] = useState(false);
  
  const handleDownloadCombined = () => {
    if (Platform.OS !== 'web') {
      Alert.alert('Not Available', 'Download is only available on web');
      return;
    }
    
    const css = generateBootstrapThemeCSS(theme);
    const filename = siteName 
      ? `${siteName.replace(/[^a-z0-9]/gi, '-')}-bootstrap-theme.css`
      : 'bootstrap-custom-theme.css';
    
    downloadCSS(css, filename);
  };
  
  const handleDownloadSeparate = (mode: 'light' | 'dark') => {
    if (Platform.OS !== 'web') {
      Alert.alert('Not Available', 'Download is only available on web');
      return;
    }
    
    const themes = generateSeparateThemes(theme);
    const css = mode === 'light' ? themes.light : themes.dark;
    const filename = siteName
      ? `${siteName.replace(/[^a-z0-9]/gi, '-')}-${mode}-theme.css`
      : `bootstrap-${mode}-theme.css`;
    
    downloadCSS(css, filename);
  };
  
  const handleCopy = async () => {
    if (Platform.OS !== 'web') {
      Alert.alert('Not Available', 'Copy is only available on web');
      return;
    }
    
    const css = generateBootstrapThemeCSS(theme);
    const success = await copyToClipboard(css);
    
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      Alert.alert('Failed', 'Could not copy to clipboard');
    }
  };
  
  const lightCount = theme.light.size;
  const darkCount = theme.dark.size;
  
  return (
    <View className="bg-surface border border-border rounded-lg p-4 mt-4">
      <Text className="text-lg font-bold text-foreground mb-2">
        📥 Export Bootstrap Theme
      </Text>
      
      <Text className="text-sm text-muted mb-4">
        {lightCount} light mode variables • {darkCount} dark mode variables
      </Text>
      
      {/* Combined Export */}
      <View className="mb-3">
        <Text className="text-sm font-semibold text-foreground mb-2">
          Combined Theme
        </Text>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={handleDownloadCombined}
            className="flex-1 bg-primary px-4 py-3 rounded-lg"
          >
            <Text className="text-primary-foreground font-semibold text-center">
              💾 Download CSS
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleCopy}
            className="flex-1 bg-secondary px-4 py-3 rounded-lg"
          >
            <Text className="text-secondary-foreground font-semibold text-center">
              {copied ? '✅ Copied!' : '📋 Copy CSS'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Separate Exports */}
      <View>
        <Text className="text-sm font-semibold text-foreground mb-2">
          Separate Themes
        </Text>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => handleDownloadSeparate('light')}
            className="flex-1 bg-muted px-4 py-3 rounded-lg border border-border"
          >
            <Text className="text-foreground font-semibold text-center">
              ☀️ Light Only
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleDownloadSeparate('dark')}
            className="flex-1 bg-muted px-4 py-3 rounded-lg border border-border"
          >
            <Text className="text-foreground font-semibold text-center">
              🌙 Dark Only
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Usage Instructions */}
      <View className="mt-4 p-3 bg-muted rounded-lg">
        <Text className="text-xs font-semibold text-foreground mb-1">
          💡 How to Use
        </Text>
        <Text className="text-xs text-muted">
          1. Download or copy the CSS{'\n'}
          2. Add it to your Bootstrap project after bootstrap.css{'\n'}
          3. Your custom theme will override Bootstrap defaults
        </Text>
      </View>
    </View>
  );
}
