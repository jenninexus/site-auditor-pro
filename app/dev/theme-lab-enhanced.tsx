import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Share,
  Alert,
} from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ColorPickerModal } from "@/components/color-picker-modal";
import { EditableColorSwatch } from "@/components/editable-color-swatch";
import { SchemeColors, type ColorScheme } from "@/constants/theme";
import { useColors } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";
import { useColorCustomization } from "@/hooks/use-color-customization";

type PaletteName = keyof typeof SchemeColors.light;

const paletteNames: PaletteName[] = Object.keys(
  SchemeColors.light
) as PaletteName[];

export default function ThemeLabEnhancedScreen() {
  const [pressCount, setPressCount] = useState(0);
  const [lastAction, setLastAction] = useState<string>("None yet");
  const { colorScheme, setColorScheme } = useThemeContext();
  const colors = useColors();

  // Color customization state
  const {
    customizations,
    updateColor,
    resetColors,
    isModified,
    getModifiedCount,
    exportAsJson,
    exportAsThemeConfig,
  } = useColorCustomization();

  // Color picker state
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState<{
    scheme: ColorScheme;
    name: PaletteName;
  } | null>(null);

  const swatches = useMemo(
    () =>
      paletteNames.map((name) => ({
        name,
        lightValue: customizations.light[name],
        darkValue: customizations.dark[name],
      })),
    [customizations]
  );

  const tileStyles = useMemo(() => {
    const build = (scheme: ColorScheme) => ({
      background: customizations[scheme].background,
      border: customizations[scheme].border,
      text: customizations[scheme].foreground,
      subText: customizations[scheme].muted,
      activeBackground: customizations[scheme].primary,
      activeText: customizations[scheme].background,
    });
    return {
      light: build("light"),
      dark: build("dark"),
    };
  }, [customizations]);

  const handleColorPress = (scheme: ColorScheme, name: PaletteName) => {
    setSelectedColor({ scheme, name });
    setPickerVisible(true);
    setLastAction(`Editing ${name} in ${scheme} mode`);
  };

  const handleColorApply = (newColor: string) => {
    if (selectedColor) {
      updateColor(selectedColor.scheme, selectedColor.name, newColor);
      setLastAction(`Updated ${selectedColor.name} to ${newColor}`);
    }
  };

  const handleExport = async () => {
    const json = exportAsJson();
    const config = exportAsThemeConfig();

    try {
      await Share.share({
        message: `Theme Configuration:\n\n${config}`,
        title: "Export Theme",
      });
    } catch (error) {
      Alert.alert("Export", "Theme configuration copied to clipboard");
    }
  };

  const handleReset = () => {
    Alert.alert(
      "Reset Theme",
      "Are you sure you want to reset all color customizations?",
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Reset",
          onPress: () => {
            resetColors();
            setLastAction("Reset all colors to default");
          },
          style: "destructive",
        },
      ]
    );
  };

  const modifiedCountLight = getModifiedCount("light");
  const modifiedCountDark = getModifiedCount("dark");
  const totalModified = modifiedCountLight + modifiedCountDark;

  return (
    <ScreenContainer className="p-5">
      <ScrollView className="flex-1">
        <View className="gap-4 pb-8">
          {/* Header */}
          <View>
            <Text className="text-2xl font-bold text-foreground">
              Theme Customizer
            </Text>
            <Text className="text-sm text-muted mt-1">
              Customize colors for light and dark modes
            </Text>
            {totalModified > 0 && (
              <Text className="text-sm text-primary font-semibold mt-2">
                {totalModified} color{totalModified !== 1 ? "s" : ""} modified
              </Text>
            )}
          </View>

          {/* Mode Selector */}
          <View className="flex-row gap-2">
            {(["light", "dark"] as ColorScheme[]).map((scheme) => (
              <Pressable
                key={scheme}
                style={[
                  styles.schemeToggle,
                  {
                    backgroundColor:
                      colorScheme === scheme
                        ? tileStyles[scheme].activeBackground
                        : tileStyles[scheme].background,
                    borderColor:
                      colorScheme === scheme
                        ? tileStyles[scheme].activeBackground
                        : tileStyles[scheme].border,
                  },
                ]}
                onPress={() => {
                  setColorScheme(scheme);
                  setLastAction(`Switched to ${scheme} mode`);
                }}
              >
                <Text
                  style={[
                    styles.schemeToggleTitle,
                    {
                      color:
                        colorScheme === scheme
                          ? tileStyles[scheme].activeText
                          : tileStyles[scheme].text,
                    },
                  ]}
                >
                  {scheme === "light" ? "☀️ Light" : "🌙 Dark"}
                </Text>
                <Text
                  style={[
                    styles.schemeToggleSubtitle,
                    {
                      color:
                        colorScheme === scheme
                          ? tileStyles[scheme].activeText
                          : tileStyles[scheme].subText,
                    },
                  ]}
                >
                  {scheme === "light"
                    ? `${modifiedCountLight} modified`
                    : `${modifiedCountDark} modified`}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Color Swatches - Side by Side */}
          <ThemedView className="rounded-2xl border border-border p-4">
            <Text className="text-lg font-bold text-foreground mb-2">
              Color Palette
            </Text>
            <Text className="text-sm text-muted mb-4">
              Click any swatch to customize the color
            </Text>

            <View className="gap-3">
              {swatches.map((swatch) => (
                <View key={swatch.name} className="gap-2">
                  <Text className="text-xs font-semibold text-muted uppercase">
                    {swatch.name}
                  </Text>
                  <View className="flex-row gap-2">
                    {/* Light Mode Swatch */}
                    <View className="flex-1">
                      <Text className="text-xs text-muted mb-1">Light</Text>
                      <EditableColorSwatch
                        name={swatch.name}
                        value={swatch.lightValue}
                        isModified={isModified("light", swatch.name)}
                        onPress={() =>
                          handleColorPress("light", swatch.name)
                        }
                      />
                    </View>

                    {/* Dark Mode Swatch */}
                    <View className="flex-1">
                      <Text className="text-xs text-muted mb-1">Dark</Text>
                      <EditableColorSwatch
                        name={swatch.name}
                        value={swatch.darkValue}
                        isModified={isModified("dark", swatch.name)}
                        onPress={() => handleColorPress("dark", swatch.name)}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </ThemedView>

          {/* Preview Section */}
          <ThemedView className="rounded-2xl border border-border p-4">
            <Text className="text-lg font-bold text-foreground mb-2">
              Component Preview
            </Text>
            <Text className="text-sm text-muted mb-4">
              Buttons and badges using current palette
            </Text>

            <View className="flex-row flex-wrap gap-2">
              <TouchableOpacity
                className="rounded-full px-4 py-2"
                style={{
                  backgroundColor:
                    customizations[colorScheme].primary,
                }}
                onPress={() => {
                  setPressCount((count) => count + 1);
                  setLastAction("Pressed Primary button");
                }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{
                    color: customizations[colorScheme].background,
                  }}
                >
                  Primary
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="rounded-full px-4 py-2 border"
                style={{
                  backgroundColor: customizations[colorScheme].surface,
                  borderColor: customizations[colorScheme].border,
                }}
                onPress={() => {
                  setPressCount((count) => count + 1);
                  setLastAction("Pressed Surface button");
                }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{
                    color: customizations[colorScheme].foreground,
                  }}
                >
                  Surface
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="rounded-full px-4 py-2"
                style={{
                  backgroundColor: customizations[colorScheme].success,
                }}
                onPress={() => {
                  setPressCount((count) => count + 1);
                  setLastAction("Pressed Success button");
                }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{
                    color: customizations[colorScheme].background,
                  }}
                >
                  Success
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="rounded-full px-4 py-2"
                style={{
                  backgroundColor: customizations[colorScheme].warning,
                }}
                onPress={() => {
                  setPressCount((count) => count + 1);
                  setLastAction("Pressed Warning button");
                }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{
                    color: customizations[colorScheme].background,
                  }}
                >
                  Warning
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="rounded-full px-4 py-2"
                style={{
                  backgroundColor: customizations[colorScheme].error,
                }}
                onPress={() => {
                  setPressCount((count) => count + 1);
                  setLastAction("Pressed Error button");
                }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{
                    color: customizations[colorScheme].background,
                  }}
                >
                  Error
                </Text>
              </TouchableOpacity>
            </View>

            {/* Activity Log */}
            <View className="mt-4 rounded-xl bg-background p-4 border border-border">
              <View className="flex-row items-center gap-2 mb-2">
                <IconSymbol
                  name="house.fill"
                  color={customizations[colorScheme].primary}
                  size={20}
                />
                <Text className="text-base font-semibold text-foreground">
                  Activity
                </Text>
              </View>
              <Text className="text-sm text-muted">
                Presses: {pressCount}
              </Text>
              <Text className="text-sm text-muted mt-1">
                Last action: {lastAction}
              </Text>
            </View>
          </ThemedView>

          {/* Actions */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="flex-1 rounded-lg py-3"
              style={{
                backgroundColor: customizations[colorScheme].primary,
              }}
              onPress={handleExport}
            >
              <Text
                className="text-center font-semibold"
                style={{
                  color: customizations[colorScheme].background,
                }}
              >
                Export Theme
              </Text>
            </TouchableOpacity>

            {totalModified > 0 && (
              <TouchableOpacity
                className="flex-1 rounded-lg py-3 border"
                style={{
                  borderColor: customizations[colorScheme].error,
                  backgroundColor: customizations[colorScheme].surface,
                }}
                onPress={handleReset}
              >
                <Text
                  className="text-center font-semibold"
                  style={{
                    color: customizations[colorScheme].error,
                  }}
                >
                  Reset
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Color Picker Modal */}
      {selectedColor && (
        <ColorPickerModal
          isVisible={pickerVisible}
          colorName={selectedColor.name}
          currentColor={
            customizations[selectedColor.scheme][selectedColor.name]
          }
          onClose={() => {
            setPickerVisible(false);
            setSelectedColor(null);
          }}
          onApply={handleColorApply}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  schemeToggle: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
  },
  schemeToggleTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  schemeToggleSubtitle: {
    fontSize: 12,
  },
});
