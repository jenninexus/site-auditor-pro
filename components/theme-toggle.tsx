/**
 * Theme Toggle Component
 * Allows users to switch between light and dark mode
 */

import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { useThemeContext } from "@/lib/theme-provider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { colorScheme, setColorScheme } = useThemeContext();
  const isDark = colorScheme === "dark";

  const toggleTheme = () => {
    setColorScheme(isDark ? "light" : "dark");
  };

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      className={`flex-row items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border ${className}`}
      activeOpacity={0.7}
    >
      <Text className="text-xl">{isDark ? "🌙" : "☀️"}</Text>
      <Text className="text-sm font-medium text-foreground">
        {isDark ? "Dark" : "Light"}
      </Text>
    </TouchableOpacity>
  );
}

/**
 * Compact Theme Toggle (Icon Only)
 */
export function ThemeToggleCompact({ className = "" }: { className?: string }) {
  const { colorScheme, setColorScheme } = useThemeContext();
  const isDark = colorScheme === "dark";

  const toggleTheme = () => {
    setColorScheme(isDark ? "light" : "dark");
  };

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      className={`w-10 h-10 items-center justify-center rounded-lg bg-surface border border-border ${className}`}
      activeOpacity={0.7}
    >
      <Text className="text-xl">{isDark ? "🌙" : "☀️"}</Text>
    </TouchableOpacity>
  );
}
