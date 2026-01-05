import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { fixCode } from "@/lib/code-fixer";

interface AnalysisResult {
  type: "css" | "js";
  issues: {
    severity: "critical" | "warning" | "info";
    title: string;
    description: string;
    line?: number;
  }[];
  stats: {
    lines: number;
    size: number;
  };
}

export default function CodeAnalyzerScreen() {
  const colors = useColors();
  const [code, setCode] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [fixedCode, setFixedCode] = useState<string | null>(null);

  const analyzeCode = () => {
    if (!code.trim()) return;
    
    setIsAnalyzing(true);
    setFixedCode(null);
    
    // Simulate analysis delay
    setTimeout(() => {
      const isCSS = code.includes("{") && (code.includes(":") || code.includes("."));
      const issues: AnalysisResult["issues"] = [];
      
      if (isCSS) {
        // Simple CSS checks
        if (code.includes("!important")) {
          issues.push({
            severity: "warning",
            title: "Avoid !important",
            description: "Using !important makes CSS difficult to maintain and override.",
          });
        }
        if (code.match(/#[0-9a-fA-F]{3,6}/g)) {
          issues.push({
            severity: "info",
            title: "Use CSS Variables",
            description: "Hardcoded hex colors found. Consider using CSS variables for better theme support.",
          });
        }
        if (code.includes("float:")) {
          issues.push({
            severity: "warning",
            title: "Legacy Layout (Float)",
            description: "Consider using Flexbox or Grid instead of floats for layout.",
          });
        }
      } else {
        // Simple JS checks
        if (code.includes("var ")) {
          issues.push({
            severity: "warning",
            title: "Use let/const",
            description: "Avoid using 'var'. Use 'let' or 'const' for better scoping.",
          });
        }
        if (code.includes("console.log")) {
          issues.push({
            severity: "info",
            title: "Remove Console Logs",
            description: "Found console.log statements. Remember to remove them for production.",
          });
        }
        if (code.includes("eval(")) {
          issues.push({
            severity: "critical",
            title: "Security Risk: eval()",
            description: "The eval() function is a security risk and should be avoided.",
          });
        }
      }

      setResult({
        type: isCSS ? "css" : "js",
        issues,
        stats: {
          lines: code.split("\n").length,
          size: code.length,
        },
      });
      setIsAnalyzing(false);
    }, 800);
  };

  const handleAutoFix = () => {
    if (!result) return;
    
    const fixed = fixCode(code, result.type);
    setFixedCode(fixed.fixed);
    
    Alert.alert(
      "Auto-Fix Applied",
      `${fixed.fixesApplied.length} fixes applied:\n\n${fixed.fixesApplied.join("\n")}`,
      [
        {
          text: "Copy Fixed Code",
          onPress: () => {
            if (typeof navigator !== "undefined" && navigator.clipboard) {
              navigator.clipboard.writeText(fixed.fixed);
              Alert.alert("Copied!", "Fixed code copied to clipboard");
            }
          },
        },
        { text: "Close", style: "cancel" },
      ]
    );
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          <View>
            <Text className="text-3xl font-bold text-foreground">Code Analyzer</Text>
            <Text className="text-muted mt-1">Paste CSS or JS to get instant improvement recommendations</Text>
          </View>

          <View className="bg-surface rounded-2xl p-4 border border-border">
            <TextInput
              multiline
              placeholder="Paste your CSS or JavaScript here..."
              placeholderTextColor={colors.muted}
              value={code}
              onChangeText={setCode}
              className="h-64 text-foreground font-mono text-sm"
              textAlignVertical="top"
              style={{ color: colors.foreground }}
            />
            
            <TouchableOpacity
              onPress={analyzeCode}
              disabled={isAnalyzing || !code.trim()}
              className="bg-primary mt-4 py-3 rounded-xl flex-row items-center justify-center"
              style={{ opacity: isAnalyzing || !code.trim() ? 0.6 : 1 }}
            >
              {isAnalyzing ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <IconSymbol name="chevron.left.forwardslash.chevron.right" size={20} color="white" />
                  <Text className="text-white font-bold ml-2">Analyze Code</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {result && (
            <View className="gap-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-xl font-bold text-foreground">Analysis Results</Text>
                <View className="bg-muted px-3 py-1 rounded-full">
                  <Text className="text-xs font-bold text-muted-foreground uppercase">{result.type}</Text>
                </View>
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1 bg-surface p-4 rounded-xl border border-border items-center">
                  <Text className="text-2xl font-bold text-foreground">{result.stats.lines}</Text>
                  <Text className="text-xs text-muted">Lines</Text>
                </View>
                <View className="flex-1 bg-surface p-4 rounded-xl border border-border items-center">
                  <Text className="text-2xl font-bold text-foreground">{(result.stats.size / 1024).toFixed(1)}kb</Text>
                  <Text className="text-xs text-muted">Size</Text>
                </View>
                <View className="flex-1 bg-surface p-4 rounded-xl border border-border items-center">
                  <Text className="text-2xl font-bold text-foreground">{result.issues.length}</Text>
                  <Text className="text-xs text-muted">Issues</Text>
                </View>
              </View>

              {result.issues.length === 0 ? (
                <View className="bg-success/10 p-6 rounded-2xl border border-success/20 items-center">
                  <Text className="text-success font-bold text-lg">No issues found!</Text>
                  <Text className="text-success/80 text-center mt-1">Your code looks clean and follows best practices.</Text>
                </View>
              ) : (
                <>
                  {result.issues.map((issue, index) => (
                    <View key={index} className="bg-surface p-4 rounded-2xl border border-border flex-row gap-4">
                      <View className={`w-1 rounded-full ${
                        issue.severity === "critical" ? "bg-error" : 
                        issue.severity === "warning" ? "bg-warning" : "bg-info"
                      }`} />
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                          <Text className="font-bold text-foreground">{issue.title}</Text>
                          <View className={`px-2 py-0.5 rounded-full ${
                            issue.severity === "critical" ? "bg-error/10" : 
                            issue.severity === "warning" ? "bg-warning/10" : "bg-info/10"
                          }`}>
                            <Text className={`text-[10px] font-bold uppercase ${
                              issue.severity === "critical" ? "text-error" : 
                              issue.severity === "warning" ? "text-warning" : "text-info"
                            }`}>{issue.severity}</Text>
                          </View>
                        </View>
                        <Text className="text-sm text-muted mt-1">{issue.description}</Text>
                      </View>
                    </View>
                  ))}
                  
                  <TouchableOpacity
                    onPress={handleAutoFix}
                    className="bg-success py-4 rounded-2xl flex-row items-center justify-center gap-2 mt-2"
                  >
                    <IconSymbol name="paperplane.fill" size={20} color="white" />
                    <Text className="text-white font-bold text-lg">Fix My Code</Text>
                  </TouchableOpacity>
                </>
              )}
              
              {fixedCode && (
                <View className="bg-success/10 p-4 rounded-2xl border border-success/20 mt-4">
                  <Text className="text-success font-bold mb-2">Fixed Code Preview:</Text>
                  <Text className="text-success/90 font-mono text-xs" numberOfLines={10}>
                    {fixedCode.substring(0, 300)}...
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
