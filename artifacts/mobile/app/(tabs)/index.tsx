import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAlert } from "@/context/AlertContext";
import { useAuth } from "@/context/AuthContext";
import { useThemeColors } from "@/context/ThemeContext";

const CONTACT_LINKS = [
  { name: "WhatsApp", url: "https://wa.me/message/63ORB7U3LWOWD1", icon: "message-circle" },
  { name: "WhatsApp Channel", url: "https://whatsapp.com/channel/0029VaZrEGYIN9ih4PxcFQ33", icon: "message-square" },
  { name: "YouTube", url: "https://www.youtube.com/@chandtricker/", icon: "play-circle" },
  { name: "YouTube 2.0", url: "https://youtube.com/@chandtricker2.0", icon: "play-circle" },
  { name: "Facebook", url: "https://www.facebook.com/OWNER.CHAND", icon: "share-2" },
  { name: "Instagram", url: "https://www.instagram.com/chand.tricker/", icon: "camera" },
  { name: "Telegram", url: "https://t.me/CHANDTRICKER", icon: "send" },
  { name: "GitHub", url: "https://github.com/chandtricker", icon: "github" },
];

export default function HomeScreen() {
  const c = useThemeColors();
  const styles = makeStyles(c);
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const { user } = useAuth();
  const [url, setUrl] = useState("");
  const [appName, setAppName] = useState("");
  const [appIcon, setAppIcon] = useState<string | null>(null);

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
      showAlert("URL Required", "Please enter a website URL.");
      return;
    }
    if (!isValidUrl(url.trim())) {
      showAlert("Invalid URL", "Please enter a valid URL, e.g. https://example.com");
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/converting",
      params: { url: cleanUrl, appName: appName.trim(), appIcon: appIcon || "" },
    });
  }

  async function pickIcon() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setAppIcon(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  function openContact(link: { name: string; url: string }) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(link.url);
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
          <Text style={styles.greeting}>Hello, {firstName}! 👋</Text>
          <Text style={styles.subGreeting}>APKs created: {user?.apkCount ?? 0}</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.heroCard}>
        <Image
          source={require("@/assets/images/icon.png")}
          style={styles.heroIcon}
          contentFit="contain"
        />
        <Text style={styles.heroTitle}>Turn any website into an APK</Text>
        <Text style={styles.heroSub}>Enter a URL and ChandMod does the rest</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formLabel}>Website URL</Text>
        <View style={styles.inputRow}>
          <Feather name="link" size={18} color={c.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="https://example.com"
            placeholderTextColor={c.placeholder}
            value={url}
            onChangeText={setUrl}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {url.length > 0 && (
            <TouchableOpacity onPress={() => setUrl("")}>
              <Feather name="x" size={16} color={c.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.formLabel}>App Name (optional)</Text>
        <View style={styles.inputRow}>
          <Feather name="smartphone" size={18} color={c.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="My App"
            placeholderTextColor={c.placeholder}
            value={appName}
            onChangeText={setAppName}
          />
        </View>

        <Text style={styles.formLabel}>App Icon (optional)</Text>
        <TouchableOpacity style={styles.iconPicker} onPress={pickIcon} activeOpacity={0.8}>
          {appIcon ? (
            <Image source={{ uri: appIcon }} style={styles.iconPreview} contentFit="cover" />
          ) : (
            <>
              <Feather name="image" size={20} color={c.textSecondary} />
              <Text style={styles.iconPickerText}>Choose an icon</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate} activeOpacity={0.85}>
          <Text style={styles.generateBtnText}>Build APK</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.popularTitle}>Connect with me</Text>
      <View style={styles.popularGrid}>
        {CONTACT_LINKS.map((link) => (
          <TouchableOpacity
            key={link.name}
            style={styles.popularChip}
            onPress={() => openContact(link)}
            activeOpacity={0.7}
          >
            <Feather name={link.icon as any} size={14} color={c.accent} />
            <Text style={styles.popularChipText}>{link.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

function makeStyles(c: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c.bg,
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
      color: c.text,
    },
    subGreeting: {
      fontSize: 13,
      color: c.textSecondary,
      marginTop: 2,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: c.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      color: c.accentText,
      fontWeight: "bold",
      fontSize: 18,
    },
    heroCard: {
      backgroundColor: c.surface,
      borderRadius: 20,
      padding: 28,
      alignItems: "center",
      marginBottom: 20,
      borderWidth: 1,
      borderColor: c.border,
    },
    heroIcon: {
      width: 64,
      height: 64,
      marginBottom: 12,
    },
    heroTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: c.text,
      textAlign: "center",
      marginBottom: 8,
    },
    heroSub: {
      fontSize: 13,
      color: c.textSecondary,
      textAlign: "center",
    },
    formCard: {
      backgroundColor: c.surface,
      borderRadius: 20,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: c.border,
    },
    formLabel: {
      fontSize: 13,
      color: c.textSecondary,
      marginBottom: 8,
      fontWeight: "500",
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: c.bg,
      borderRadius: 12,
      paddingHorizontal: 14,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: c.border,
    },
    input: {
      flex: 1,
      height: 50,
      color: c.text,
      fontSize: 15,
    },
    iconPicker: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: c.bg,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: c.border,
      borderStyle: "dashed",
      minHeight: 50,
    },
    iconPreview: {
      width: 44,
      height: 44,
      borderRadius: 10,
    },
    iconPickerText: {
      color: c.textSecondary,
      fontSize: 14,
    },
    generateBtn: {
      backgroundColor: c.accent,
      borderRadius: 14,
      height: 56,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 4,
      shadowColor: c.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    generateBtnText: {
      color: c.accentText,
      fontWeight: "bold",
      fontSize: 18,
    },
    popularTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: c.text,
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
      backgroundColor: c.surface,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: c.border,
    },
    popularChipText: {
      color: c.text,
      fontSize: 13,
      fontWeight: "500",
    },
  });
}
