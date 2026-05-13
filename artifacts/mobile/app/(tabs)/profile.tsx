import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
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
import { useAPK } from "@/context/APKContext";
import { useThemeColors } from "@/context/ThemeContext";

export default function ProfileScreen() {
  const c = useThemeColors();
  const styles = makeStyles(c);
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const { user, logout, updateProfile } = useAuth();
  const { history } = useAPK();
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");

  async function handleSave() {
    if (!newName.trim()) {
      showAlert("Error", "Name cannot be empty.");
      return;
    }
    await updateProfile({ name: newName.trim() });
    setEditing(false);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  async function handleLogout() {
    showAlert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await logout();
          router.replace("/auth");
        },
      },
    ]);
  }

  const firstName = user?.name?.split(" ")[0] || "U";
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 16);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: topPad, paddingBottom: insets.bottom + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.avatarSection}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
        </View>
        {editing ? (
          <View style={styles.editRow}>
            <TextInput
              style={styles.nameInput}
              value={newName}
              onChangeText={setNewName}
              placeholderTextColor={c.placeholder}
              autoFocus
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Feather name="check" size={18} color={c.accentText} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelEditBtn}
              onPress={() => { setEditing(false); setNewName(user?.name || ""); }}
            >
              <Feather name="x" size={18} color={c.textSecondary} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{user?.name}</Text>
            <TouchableOpacity onPress={() => setEditing(true)} style={styles.editIconBtn}>
              <Feather name="edit-2" size={14} color={c.accent} />
            </TouchableOpacity>
          </View>
        )}
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{history.length}</Text>
          <Text style={styles.statLabel}>APKs Built</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {new Date(user?.createdAt || Date.now()).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}
          </Text>
          <Text style={styles.statLabel}>Member Since</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={() => setEditing(true)}>
            <Feather name="edit-2" size={18} color={c.accent} />
            <Text style={styles.menuText}>Edit Profile</Text>
            <Feather name="chevron-right" size={16} color={c.textSecondary} />
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/(tabs)/history")}>
            <Feather name="clock" size={18} color={c.accent} />
            <Text style={styles.menuText}>APK History</Text>
            <Text style={styles.menuBadge}>{history.length}</Text>
            <Feather name="chevron-right" size={16} color={c.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/(tabs)/settings")}>
            <Feather name="settings" size={18} color={c.accent} />
            <Text style={styles.menuText}>Settings</Text>
            <Feather name="chevron-right" size={16} color={c.textSecondary} />
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuItem}>
            <Feather name="info" size={18} color={c.accent} />
            <Text style={styles.menuText}>App Version</Text>
            <Text style={styles.menuBadge}>1.0.0</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
        <Feather name="log-out" size={18} color={c.danger} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
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
    avatarSection: {
      alignItems: "center",
      marginBottom: 24,
    },
    avatarLarge: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: c.accent,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
      shadowColor: c.accent,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
    },
    avatarText: {
      color: c.accentText,
      fontWeight: "bold",
      fontSize: 36,
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 4,
    },
    userName: {
      fontSize: 22,
      fontWeight: "bold",
      color: c.text,
    },
    editIconBtn: {
      padding: 4,
    },
    userEmail: {
      fontSize: 14,
      color: c.textSecondary,
    },
    editRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 4,
    },
    nameInput: {
      fontSize: 18,
      fontWeight: "bold",
      color: c.text,
      borderBottomWidth: 1,
      borderBottomColor: c.accent,
      paddingBottom: 4,
      minWidth: 120,
    },
    saveBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: c.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelEditBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: c.surface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: c.border,
    },
    statsRow: {
      flexDirection: "row",
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
    },
    statCard: {
      flex: 1,
      alignItems: "center",
    },
    statNumber: {
      fontSize: 22,
      fontWeight: "bold",
      color: c.accent,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: c.textSecondary,
    },
    statDivider: {
      width: 1,
      height: 40,
      backgroundColor: c.border,
    },
    section: {
      marginBottom: 20,
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
    menuBadge: {
      fontSize: 13,
      color: c.textSecondary,
      marginRight: 4,
    },
    menuDivider: {
      height: 1,
      backgroundColor: c.border,
      marginHorizontal: 16,
    },
    logoutBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      backgroundColor: c.dangerBg,
      borderRadius: 14,
      height: 52,
      borderWidth: 1,
      borderColor: c.dangerBorder,
      marginTop: 8,
    },
    logoutText: {
      color: c.danger,
      fontWeight: "bold",
      fontSize: 16,
    },
  });
}
