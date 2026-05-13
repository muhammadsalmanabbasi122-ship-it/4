import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
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
import { useAlert } from "@/context/AlertContext";
import { useTheme } from "@/context/ThemeContext";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const { mode, colors, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 16);
  const s = useMemo(() => makeStyles(colors), [colors]);

  function toggleSwitch(setter: (v: boolean) => void, current: boolean) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setter(!current);
  }

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={[
        s.scroll,
        { paddingTop: topPad, paddingBottom: insets.bottom + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={s.screenTitle}>Settings</Text>

      <Text style={s.sectionTitle}>Preferences</Text>
      <View style={s.menuCard}>
        <View style={s.menuItem}>
          <Feather name="moon" size={18} color={colors.accent} />
          <Text style={s.menuText}>Dark Mode</Text>
          <Switch
            value={mode === "dark"}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#ffffff"
          />
        </View>

        <View style={s.menuDivider} />

        <View style={s.menuItem}>
          <Feather name="bell" size={18} color={colors.accent} />
          <Text style={s.menuText}>Notifications</Text>
          <Switch
            value={notifications}
            onValueChange={() => toggleSwitch(setNotifications, notifications)}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      <Text style={s.sectionTitle}>App</Text>
      <View style={s.menuCard}>
        <TouchableOpacity
          style={s.menuItem}
          onPress={() =>
            showAlert(
              "ChandMod",
              "Version: 1.0.0\n\nChandMod lets you turn any website into an Android APK. Just enter a URL and your APK is ready to download!",
            )
          }
        >
          <Feather name="info" size={18} color={colors.accent} />
          <Text style={s.menuText}>About</Text>
          <Text style={s.menuValue}>v1.0.0</Text>
          <Feather name="chevron-right" size={16} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={s.menuDivider} />

        <TouchableOpacity
          style={s.menuItem}
          onPress={() => Linking.openURL("https://chandmod.app/privacy")}
        >
          <Feather name="shield" size={18} color={colors.accent} />
          <Text style={s.menuText}>Privacy Policy</Text>
          <Feather name="chevron-right" size={16} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={s.menuDivider} />

        <TouchableOpacity
          style={s.menuItem}
          onPress={() => Linking.openURL("mailto:support@chandmod.app")}
        >
          <Feather name="mail" size={18} color={colors.accent} />
          <Text style={s.menuText}>Contact Us</Text>
          <Feather name="chevron-right" size={16} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={s.menuDivider} />

        <TouchableOpacity
          style={s.menuItem}
          onPress={() =>
            showAlert("Rate ChandMod", "Your rating helps us grow! Please give us 5 stars on the Play Store.")
          }
        >
          <Feather name="star" size={18} color={colors.accent} />
          <Text style={s.menuText}>Rate the App</Text>
          <Feather name="chevron-right" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={s.footer}>ChandMod v1.0.0 • Made with ☽</Text>
    </ScrollView>
  );
}

function makeStyles(c: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c.bg,
    },
    scroll: {
      paddingHorizontal: 20,
    },
    screenTitle: {
      fontSize: 26,
      fontWeight: "bold",
      color: c.text,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: "600",
      color: c.textSecondary,
      marginBottom: 10,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    menuCard: {
      backgroundColor: c.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
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
      color: c.text,
    },
    menuValue: {
      fontSize: 13,
      color: c.textSecondary,
      marginRight: 4,
    },
    menuDivider: {
      height: 1,
      backgroundColor: c.border,
      marginHorizontal: 16,
    },
    footer: {
      textAlign: "center",
      color: c.footer,
      fontSize: 12,
      marginTop: 8,
    },
  });
}
