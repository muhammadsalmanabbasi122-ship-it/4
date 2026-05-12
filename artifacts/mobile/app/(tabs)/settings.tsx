import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState<"en" | "ur">("en");

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 16);

  function toggleSwitch(setter: (v: boolean) => void, current: boolean) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setter(!current);
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: topPad, paddingBottom: insets.bottom + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.screenTitle}>Settings</Text>

      <Text style={styles.sectionTitle}>Preferences</Text>
      <View style={styles.menuCard}>
        <View style={styles.menuItem}>
          <Feather name="moon" size={18} color="#FFD700" />
          <Text style={styles.menuText}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={() => toggleSwitch(setDarkMode, darkMode)}
            trackColor={{ false: "#0f3460", true: "#FFD700" }}
            thumbColor="#ffffff"
          />
        </View>

        <View style={styles.menuDivider} />

        <View style={styles.menuItem}>
          <Feather name="bell" size={18} color="#FFD700" />
          <Text style={styles.menuText}>Notifications</Text>
          <Switch
            value={notifications}
            onValueChange={() => toggleSwitch(setNotifications, notifications)}
            trackColor={{ false: "#0f3460", true: "#FFD700" }}
            thumbColor="#ffffff"
          />
        </View>

        <View style={styles.menuDivider} />

        <View style={styles.menuItem}>
          <Feather name="globe" size={18} color="#FFD700" />
          <Text style={styles.menuText}>Language</Text>
          <View style={styles.langToggle}>
            {([["en", "EN"], ["ur", "اردو"]] as const).map(([code, label]) => (
              <TouchableOpacity
                key={code}
                style={[styles.langOption, language === code && styles.langOptionActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setLanguage(code);
                }}
              >
                <Text style={[styles.langText, language === code && styles.langTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>App</Text>
      <View style={styles.menuCard}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() =>
            Alert.alert(
              "ChandMod",
              "Version: 1.0.0\n\nChandMod lets you turn any website into an Android APK. Just enter a URL and your APK is ready to download!",
            )
          }
        >
          <Feather name="info" size={18} color="#FFD700" />
          <Text style={styles.menuText}>About</Text>
          <Text style={styles.menuValue}>v1.0.0</Text>
          <Feather name="chevron-right" size={16} color="#8892b0" />
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => Linking.openURL("https://chandmod.app/privacy")}
        >
          <Feather name="shield" size={18} color="#FFD700" />
          <Text style={styles.menuText}>Privacy Policy</Text>
          <Feather name="chevron-right" size={16} color="#8892b0" />
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => Linking.openURL("mailto:support@chandmod.app")}
        >
          <Feather name="mail" size={18} color="#FFD700" />
          <Text style={styles.menuText}>Contact Us</Text>
          <Feather name="chevron-right" size={16} color="#8892b0" />
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() =>
            Alert.alert("Rate ChandMod", "Your rating helps us grow! Please give us 5 stars on the Play Store.")
          }
        >
          <Feather name="star" size={18} color="#FFD700" />
          <Text style={styles.menuText}>Rate the App</Text>
          <Feather name="chevron-right" size={16} color="#8892b0" />
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>ChandMod v1.0.0 • Made with ☽</Text>
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
  screenTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8892b0",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  menuCard: {
    backgroundColor: "#16213e",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#0f3460",
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    color: "#ffffff",
  },
  menuValue: {
    fontSize: 13,
    color: "#8892b0",
    marginRight: 4,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#0f3460",
    marginHorizontal: 16,
  },
  langToggle: {
    flexDirection: "row",
    backgroundColor: "#1a1a2e",
    borderRadius: 8,
    padding: 2,
  },
  langOption: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  langOptionActive: {
    backgroundColor: "#FFD700",
  },
  langText: {
    color: "#8892b0",
    fontSize: 13,
    fontWeight: "600",
  },
  langTextActive: {
    color: "#1a1a2e",
  },
  footer: {
    textAlign: "center",
    color: "#0f3460",
    fontSize: 12,
    marginTop: 8,
  },
});
