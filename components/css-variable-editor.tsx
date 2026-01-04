/**
 * CSS Variable Editor Component
 * Displays CSS variables as swatches with color picker
 */

import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { CSSVariable } from "../lib/css-variable-extractor";

interface CSSVariableEditorProps {
  variables: CSSVariable[];
  modifiedValues: Map<string, string>;
  onVariableChange: (name: string, value: string) => void;
  onReset: () => void;
  onExport: () => void;
}

export function CSSVariableEditor({
  variables,
  modifiedValues,
  onVariableChange,
  onReset,
  onExport,
}: CSSVariableEditorProps) {
  const [selectedVariable, setSelectedVariable] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter variables based on search
  const filteredVariables = variables.filter((v) =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get current value (modified or original)
  const getCurrentValue = (variable: CSSVariable): string => {
    return modifiedValues.get(variable.name) || variable.value;
  };

  // Check if variable has been modified
  const isModified = (variable: CSSVariable): boolean => {
    return modifiedValues.has(variable.name);
  };

  // Count modified variables
  const modifiedCount = modifiedValues.size;

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="p-4 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-900 mb-2">
          CSS Variables
        </Text>
        <Text className="text-sm text-gray-600 mb-3">
          {filteredVariables.length} variables found
          {modifiedCount > 0 && ` • ${modifiedCount} modified`}
        </Text>

        {/* Search */}
        <TextInput
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="Search variables..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Variable List */}
      <ScrollView className="flex-1 p-4">
        {filteredVariables.length === 0 ? (
          <View className="flex items-center justify-center py-12">
            <Text className="text-gray-500 text-center">
              {searchQuery
                ? "No variables match your search"
                : "No CSS variables found in this website"}
            </Text>
          </View>
        ) : (
          <View className="space-y-3">
            {filteredVariables.map((variable) => (
              <VariableItem
                key={`${variable.name}-${variable.selector}`}
                variable={variable}
                currentValue={getCurrentValue(variable)}
                isModified={isModified(variable)}
                isSelected={selectedVariable === variable.name}
                onSelect={() => setSelectedVariable(variable.name)}
                onChange={(value) => onVariableChange(variable.name, value)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Actions */}
      <View className="p-4 border-t border-gray-200 space-y-2">
        <TouchableOpacity
          className="w-full bg-blue-600 py-3 rounded-lg"
          onPress={onExport}
        >
          <Text className="text-white text-center font-semibold">
            Download Modified CSS
          </Text>
        </TouchableOpacity>

        {modifiedCount > 0 && (
          <TouchableOpacity
            className="w-full bg-gray-200 py-3 rounded-lg"
            onPress={onReset}
          >
            <Text className="text-gray-700 text-center font-semibold">
              Reset All Changes
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Color Picker Modal */}
      {selectedVariable && (
        <ColorPickerModal
          variable={variables.find((v) => v.name === selectedVariable)!}
          currentValue={getCurrentValue(
            variables.find((v) => v.name === selectedVariable)!
          )}
          onClose={() => setSelectedVariable(null)}
          onChange={(value) => {
            onVariableChange(selectedVariable, value);
            setSelectedVariable(null);
          }}
        />
      )}
    </View>
  );
}

/**
 * Individual variable item component
 */
interface VariableItemProps {
  variable: CSSVariable;
  currentValue: string;
  isModified: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (value: string) => void;
}

function VariableItem({
  variable,
  currentValue,
  isModified,
  isSelected,
  onSelect,
  onChange,
}: VariableItemProps) {
  return (
    <TouchableOpacity
      className={`p-3 rounded-lg border ${
        isModified
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 bg-white"
      } ${isSelected ? "ring-2 ring-blue-500" : ""}`}
      onPress={onSelect}
    >
      <View className="flex-row items-center space-x-3">
        {/* Color Swatch */}
        {variable.type === "color" && (
          <View
            className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm"
            style={{ backgroundColor: currentValue }}
          />
        )}

        {/* Variable Info */}
        <View className="flex-1">
          <Text className="font-mono text-sm font-semibold text-gray-900">
            {variable.name}
          </Text>
          <Text className="font-mono text-xs text-gray-600 mt-1">
            {currentValue}
          </Text>
          <Text className="text-xs text-gray-500 mt-1">
            {variable.selector}
          </Text>
        </View>

        {/* Modified Badge */}
        {isModified && (
          <View className="bg-blue-600 px-2 py-1 rounded">
            <Text className="text-white text-xs font-semibold">Modified</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

/**
 * Color Picker Modal Component
 */
interface ColorPickerModalProps {
  variable: CSSVariable;
  currentValue: string;
  onClose: () => void;
  onChange: (value: string) => void;
}

function ColorPickerModal({
  variable,
  currentValue,
  onClose,
  onChange,
}: ColorPickerModalProps) {
  const [color, setColor] = useState(currentValue);

  // Parse hex color to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  // RGB to hex
  const rgbToHex = (r: number, g: number, b: number) => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  };

  const rgb = hexToRgb(color);
  const [r, setR] = useState(rgb.r);
  const [g, setG] = useState(rgb.g);
  const [b, setB] = useState(rgb.b);

  // Update color when RGB changes
  React.useEffect(() => {
    setColor(rgbToHex(r, g, b));
  }, [r, g, b]);

  return (
    <View className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
      <View className="bg-white rounded-xl p-6 w-96 max-w-full mx-4 shadow-2xl">
        {/* Header */}
        <View className="mb-4">
          <Text className="text-lg font-bold text-gray-900">
            Edit Color
          </Text>
          <Text className="text-sm font-mono text-gray-600 mt-1">
            {variable.name}
          </Text>
        </View>

        {/* Color Preview */}
        <View className="mb-6">
          <View
            className="w-full h-24 rounded-lg border-2 border-gray-300 shadow-inner"
            style={{ backgroundColor: color }}
          />
          <Text className="text-center font-mono text-sm text-gray-700 mt-2">
            {color}
          </Text>
        </View>

        {/* RGB Sliders */}
        <View className="space-y-4 mb-6">
          <ColorSlider
            label="Red"
            value={r}
            onChange={setR}
            color="#ef4444"
          />
          <ColorSlider
            label="Green"
            value={g}
            onChange={setG}
            color="#10b981"
          />
          <ColorSlider
            label="Blue"
            value={b}
            onChange={setB}
            color="#3b82f6"
          />
        </View>

        {/* Hex Input */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Hex Value
          </Text>
          <TextInput
            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono"
            value={color}
            onChangeText={(text) => {
              setColor(text);
              const newRgb = hexToRgb(text);
              setR(newRgb.r);
              setG(newRgb.g);
              setB(newRgb.b);
            }}
          />
        </View>

        {/* Actions */}
        <View className="flex-row space-x-2">
          <TouchableOpacity
            className="flex-1 bg-gray-200 py-3 rounded-lg"
            onPress={onClose}
          >
            <Text className="text-gray-700 text-center font-semibold">
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-blue-600 py-3 rounded-lg"
            onPress={() => onChange(color)}
          >
            <Text className="text-white text-center font-semibold">Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/**
 * Color Slider Component
 */
interface ColorSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  color: string;
}

function ColorSlider({ label, value, onChange, color }: ColorSliderProps) {
  return (
    <View>
      <View className="flex-row justify-between mb-2">
        <Text className="text-sm font-semibold text-gray-700">{label}</Text>
        <Text className="text-sm font-mono text-gray-600">{value}</Text>
      </View>
      <input
        type="range"
        min="0"
        max="255"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #000, ${color})`,
        }}
      />
    </View>
  );
}
