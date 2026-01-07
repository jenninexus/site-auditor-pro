/**
 * Privacy Policy Page
 * Explains data collection and usage practices
 */

import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export default function PrivacyPage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={[styles.backText, { color: colors.tint }]}>← Back</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>Privacy Policy</Text>
        <Text style={[styles.updated, { color: colors.tabIconDefault }]}>
          Last Updated: January 7, 2026
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            1. Information We Collect
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Site Auditor Pro is designed with privacy in mind. We collect minimal information necessary to provide our service:
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • <Text style={styles.bold}>Website URLs:</Text> When you audit a website, we temporarily fetch and analyze the URL you provide. This data is processed in your browser and not stored on our servers.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • <Text style={styles.bold}>Audit Results:</Text> Audit results are stored locally in your browser's storage (localStorage) for your convenience. We do not have access to this data.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • <Text style={styles.bold}>Usage Analytics:</Text> We may collect anonymous usage statistics to improve our service, such as feature usage and error reports. This data cannot be used to identify individual users.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            2. How We Use Your Information
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            The information we collect is used solely to:
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Provide website auditing and analysis services
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Generate accessibility and code quality reports
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Improve our service through anonymous usage analytics
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Respond to technical issues and user feedback
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            3. Data Storage and Security
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • <Text style={styles.bold}>Local Storage:</Text> All audit results and preferences are stored locally in your browser. You can clear this data at any time through your browser settings.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • <Text style={styles.bold}>No Account Required:</Text> Site Auditor Pro does not require user accounts or personal information to function.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • <Text style={styles.bold}>Secure Connections:</Text> All data transmitted between your browser and our service uses HTTPS encryption.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            4. Third-Party Services
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            To provide our auditing service, we use our own proxy server to fetch website content. This is necessary to bypass browser security restrictions (CORS). The websites you audit are temporarily accessed through our proxy but are not logged or stored.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We may use third-party analytics services (such as Google Analytics) to understand how users interact with our service. These services operate under their own privacy policies.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            5. Cookies and Tracking
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Site Auditor Pro uses minimal cookies and browser storage:
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • <Text style={styles.bold}>Essential Cookies:</Text> Used to maintain your session and preferences (such as theme selection).
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • <Text style={styles.bold}>Analytics Cookies:</Text> Optional cookies used to understand usage patterns. You can disable these through your browser settings.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            6. Your Rights and Choices
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            You have full control over your data:
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • <Text style={styles.bold}>Access:</Text> All your audit data is stored locally and accessible through your browser.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • <Text style={styles.bold}>Deletion:</Text> You can delete all stored data by clearing your browser's local storage.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • <Text style={styles.bold}>Opt-Out:</Text> You can disable analytics cookies through your browser settings.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            7. Children's Privacy
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Site Auditor Pro is not intended for children under 13 years of age. We do not knowingly collect personal information from children.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            8. Changes to This Policy
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We may update this privacy policy from time to time. Any changes will be posted on this page with an updated "Last Updated" date. We encourage you to review this policy periodically.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            9. Contact Us
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            If you have questions or concerns about this privacy policy or our data practices, please contact us through our website or GitHub repository.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.tabIconDefault }]}>
            Site Auditor Pro is committed to protecting your privacy and providing a transparent, secure service.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    maxWidth: 800,
    alignSelf: "center",
    width: "100%",
  },
  backButton: {
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  updated: {
    fontSize: 14,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  bold: {
    fontWeight: "600",
  },
  footer: {
    marginTop: 32,
    marginBottom: 40,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  footerText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
  },
});
