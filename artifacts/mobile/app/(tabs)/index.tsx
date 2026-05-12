import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";

const POPULAR_SITES = [
  { name: "YouTube", url: "https://youtube.com" },
  { name: "Facebook", url: "https://facebook.com" },
  { name: "Instagram", url: "https://instagram.com" },
  { name: "Wikipedia", url: "https://wikipedia.org" },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [url, setUrl] = useState("");
  const [appName, setAppName] = useState("");

  function isValidUrl(str: string) {
    try {
      const u = new URL(str.startsWith("http") ? str : `https://${str}`);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }

  async function handleGenerate() {
    const cleanUrl = url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`;
    if (!url.trim()) {
      Alert.alert("URL Zaroori Hai", "Koi website URL enter karein.");
      return;
    }
    if (!isValidUrl(url.trim())) {
      Alert.alert("Galat URL", "Sahi website URL enter karein, jaise: https://example.com");
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/converting",
      params: { url: cleanUrl, appName: appName.trim() },
    });
  }

  function selectPopular(site: { name: string; url: string }) {
    setUrl(site.url);
    setAppName(site.name);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  const firstName = user?.name?.split(" ")[0] || "User";

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.scroll,
        {
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20),
          paddingBottom: insets.bottom + 100,
        },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Salam, {firstName}! 👋</Text>
          <Text style={styles.subGreeting}>APKs banaye: {user?.apkCount ?? 0}</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.moonIcon}>☽</Text>
        <Text style={styles.heroTitle}>Kisi bhi website ko APK banao</Text>
        <Text style={styles.heroSub}>URL enter karo, baaki ChandMod karta hai</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formLabel}>Website ka URL</Text>
        <View style={styles.inputRow}>
          <Feather name="link" size={18} color="#8892b0" />
          <TextInput
            style={styles.input}
            placeholder="https://example.com"
            placeholderTextColor="#8892b0"
            value={url}
            onChangeText={setUrl}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {url.length > 0 && (
            <TouchableOpacity onPress={() => setUrl("")}>
              <Feather name="x" size={16} color="#8892b0" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.formLabel}>App ka naam (optional)</Text>
        <View style={styles.inputRow}>
          <Feather name="smartphone" size={18} color="#8892b0" />
          <TextInput
            style={styles.input}
            placeholder="Meri App"
            placeholderTextColor="#8892b0"
            value={appName}
            onChangeText={setAppName}
          />
        </View>

        <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate} activeOpacity={0.85}>
          <Text style={styles.generateBtnText}>☽ APK Banao</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.popularTitle}>Popular Websites</Text>
      <View style={styles.popularGrid}>
        {POPULAR_SITES.map((site) => (
          <TouchableOpacity
            key={site.name}
            style={styles.popularChip}
            onPress={() => selectPopular(site)}
            activeOpacity={0.7}
          >
            <Feather name="globe" size={14} color="#FFD700" />
            <Text style={styles.popularChipText}>{site.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  scroll: {
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
  },
  subGreeting: {
    fontSize: 13,
    color: "#8892b0",
    marginTop: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFD700",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#1a1a2e",
    fontWeight: "bold",
    fontSize: 18,
  },
  heroCard: {
    backgroundColor: "#16213e",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#0f3460",
  },
  moonIcon: {
    fontSize: 48,
    color: "#FFD700",
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 13,
    color: "#8892b0",
    textAlign: "center",
  },
  formCard: {
    backgroundColor: "#16213e",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#0f3460",
  },
  formLabel: {
    fontSize: 13,
    color: "#8892b0",
    marginBottom: 8,
    fontWeight: "500",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#0f3460",
  },
  input: {
    flex: 1,
    height: 50,
    color: "#ffffff",
    fontSize: 15,
  },
  generateBtn: {
    backgroundColor: "#FFD700",
    borderRadius: 14,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  generateBtnText: {
    color: "#1a1a2e",
    fontWeight: "bold",
    fontSize: 18,
  },
  popularTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
  },
  popularGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  popularChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#16213e",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#0f3460",
  },
  popularChipText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "500",
  },
});
