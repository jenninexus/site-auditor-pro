import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { CSSVariable } from "../lib/css-variable-extractor";

interface CSSVariableEditorProps {
  variables: CSSVariable[];
  modifiedValues: Map<string, string>;
  onVariableChange: (name: string, value: string) => void;
}

export function CSSVariableEditor({
  variables,
  modifiedValues,
  onVariableChange,
}: CSSVariableEditorProps) {
  const [selectedVariable, setSelectedVariable] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVariables = variables.filter((v) =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCurrentValue = (variable: CSSVariable): string => {
    return modifiedValues.get(variable.name) || variable.value;
  };

  const isModified = (variable: CSSVariable): boolean => {
    return modifiedValues.has(variable.name);
  };

  return (
    <View className="flex-1">
      {/* Search */}
      <View className="mb-6 relative">
        <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          <i className="fa-solid fa-magnifying-glass text-muted-foreground text-sm"></i>
        </View>
        <TextInput
          className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-foreground text-sm focus:border-primary"
          placeholder="Search variables..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ outlineStyle: 'none' } as any}
        />
      </View>

      {/* Variable List */}
      <View className="gap-3">
        {filteredVariables.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-muted-foreground text-center">
              {searchQuery ? "No variables match your search" : "No CSS variables found"}
            </Text>
          </View>
        ) : (
          filteredVariables.map((variable) => (
            <TouchableOpacity
              key={`${variable.name}-${variable.selector}`}
              onPress={() => setSelectedVariable(variable.name)}
              className={`p-4 rounded-xl border transition-all ${
                isModified(variable) ? "border-primary bg-primary/5" : "border-border bg-background"
              }`}
            >
              <View className="flex-row items-center gap-4">
                <View
                  className="w-12 h-12 rounded-lg border border-border shadow-sm"
                  style={{ backgroundColor: getCurrentValue(variable) }}
                />
                <View className="flex-1">
                  <Text className="font-mono text-xs font-bold text-foreground" numberOfLines={1}>
                    {variable.name.replace('--', '')}
                  </Text>
                  <Text className="font-mono text-[10px] text-muted-foreground mt-1">
                    {getCurrentValue(variable)}
                  </Text>
                </View>
                {isModified(variable) && (
                  <View className="w-2 h-2 rounded-full bg-primary" />
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Color Picker Modal */}
      {selectedVariable && (
        <ColorPickerModal
          variable={variables.find((v) => v.name === selectedVariable)!}
          currentValue={getCurrentValue(variables.find((v) => v.name === selectedVariable)!)}
          onClose={() => setSelectedVariable(null)}
          onChange={(value: string) => {
            onVariableChange(selectedVariable, value);
            setSelectedVariable(null);
          }}
        />
      )}
    </View>
  );
}

function ColorPickerModal({ variable, currentValue, onClose, onChange }: any) {
  const [color, setColor] = useState(currentValue);

  return (
    <View className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
      <View className="bg-surface rounded-2xl p-8 w-full max-w-md shadow-2xl border border-border animate-fade-in">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-2xl font-bold text-foreground">Edit Color</Text>
            <Text className="text-xs font-mono text-muted-foreground mt-1">{variable.name}</Text>
          </View>
          <TouchableOpacity onPress={onClose} className="w-10 h-10 bg-secondary rounded-full items-center justify-center">
            <i className="fa-solid fa-xmark text-foreground"></i>
          </TouchableOpacity>
        </View>

        <View className="mb-8">
          <View className="w-full h-32 rounded-2xl border border-border shadow-inner mb-4" style={{ backgroundColor: color }} />
          <View className="relative">
            <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
              <i className="fa-solid fa-hashtag text-muted-foreground"></i>
            </View>
            <TextInput
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-4 text-foreground font-mono text-lg focus:border-primary"
              value={color.replace('#', '')}
              onChangeText={(text) => setColor('#' + text)}
              style={{ outlineStyle: 'none' } as any}
            />
          </View>
        </View>

        <View className="flex-row gap-3">
          <TouchableOpacity onPress={onClose} className="flex-1 bg-secondary py-4 rounded-xl items-center">
            <Text className="text-foreground font-bold">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onChange(color)} className="flex-1 bg-primary py-4 rounded-xl items-center shadow-lg shadow-primary/20">
            <Text className="text-white font-bold">Apply Change</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
