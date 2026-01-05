import { useState, useCallback, useMemo } from "react";
import { SchemeColors, type ColorScheme } from "@/constants/theme";

export type ColorCustomizations = Record<ColorScheme, Record<string, string>>;

export function useColorCustomization() {
  // Initialize with current theme colors
  const initialCustomizations: ColorCustomizations = useMemo(
    () => ({
      light: { ...SchemeColors.light },
      dark: { ...SchemeColors.dark },
    }),
    []
  );

  const [customizations, setCustomizations] = useState<ColorCustomizations>(
    initialCustomizations
  );

  const updateColor = useCallback(
    (scheme: ColorScheme, colorName: string, value: string) => {
      setCustomizations((prev) => ({
        ...prev,
        [scheme]: {
          ...prev[scheme],
          [colorName]: value,
        },
      }));
    },
    []
  );

  const resetColors = useCallback(() => {
    setCustomizations(initialCustomizations);
  }, [initialCustomizations]);

  const isModified = useCallback(
    (scheme: ColorScheme, colorName: string): boolean => {
      return customizations[scheme][colorName] !== SchemeColors[scheme][colorName];
    },
    []
  );

  const getModifiedCount = useCallback(
    (scheme: ColorScheme): number => {
      return Object.keys(customizations[scheme]).filter((name) =>
        isModified(scheme, name)
      ).length;
    },
    [isModified]
  );

  const exportAsJson = useCallback(() => {
    return JSON.stringify(customizations, null, 2);
  }, [customizations]);

  const exportAsThemeConfig = useCallback(() => {
    const themeConfig = Object.keys(customizations.light).reduce(
      (acc, colorName) => {
        acc[colorName] = {
          light: customizations.light[colorName],
          dark: customizations.dark[colorName],
        };
        return acc;
      },
      {} as Record<string, { light: string; dark: string }>
    );

    return `/** @type {const} */
const themeColors = ${JSON.stringify(themeConfig, null, 2)};

module.exports = { themeColors };`;
  }, [customizations]);

  return {
    customizations,
    updateColor,
    resetColors,
    isModified,
    getModifiedCount,
    exportAsJson,
    exportAsThemeConfig,
  };
}
