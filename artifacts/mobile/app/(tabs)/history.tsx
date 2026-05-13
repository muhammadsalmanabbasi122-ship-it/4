import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAlert } from "@/context/AlertContext";
import { useAPK, APKRecord } from "@/context/APKContext";
import { useThemeColors } from "@/context/ThemeContext";

export default function HistoryScreen() {
  const c = useThemeColors();
  const styles = makeStyles(c);
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const { history, deleteAPK } = useAPK();
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? history.filter((a) =>
        a.appName.toLowerCase().includes(search.toLowerCase()) ||
        a.url.toLowerCase().includes(search.toLowerCase())
      )
    : history;

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  }

  async function handleDelete(id: string, name: string) {
    showAlert(
      "Delete APK?",
      `Remove "${name}" from history?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await deleteAPK(id);
          },
        },
      ]
    );
  }

  function renderItem({ item }: { item: APKRecord }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          <View style={styles.appIcon}>
            <Feather name="smartphone" size={20} color={c.accent} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.appName} numberOfLines={1}>{item.appName}</Text>
            <Text style={styles.url} numberOfLines={1}>{item.url}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.meta}>{formatDate(item.createdAt)}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.meta}>{item.size}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Feather name="download" size={10} color={c.textSecondary} />
              <Text style={styles.meta}>{item.downloads ?? 0}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() =>
              router.push({
                pathname: "/download",
                params: {
                  id: item.id,
                  appName: item.appName,
                  url: item.url,
                  downloadLink: item.downloadLink,
                  size: item.size,
                  createdAt: item.createdAt,
                  appIcon: (item as any).appIcon || "",
                  downloads: String(item.downloads ?? 0),
                },
              })
            }
          >
            <Feather name="download" size={18} color={c.accent} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() =>
              router.push({
                pathname: "/converting",
                params: { url: item.url, appName: item.appName, appIcon: (item as any).appIcon || "" },
              })
            }
          >
            <Feather name="refresh-cw" size={16} color="#10b981" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => handleDelete(item.id, item.appName)}
          >
            <Feather name="trash-2" size={16} color={c.danger} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 16);

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <Text style={styles.screenTitle}>APK History</Text>
      <Text style={styles.screenSub}>{filtered.length} of {history.length} APK{history.length !== 1 ? "s" : ""}</Text>

      <View style={styles.searchRow}>
        <Feather name="search" size={16} color={c.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or URL..."
          placeholderTextColor={c.placeholder}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Feather name="x" size={16} color={c.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!history.length}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="inbox" size={56} color={c.border} />
            <Text style={styles.emptyTitle}>No APKs yet</Text>
            <Text style={styles.emptySub}>You haven't built any APKs yet.{"\n"}Go to Home to get started!</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.push("/(tabs)")}
            >
              <Text style={styles.emptyBtnText}>Build an APK</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c.bg,
      paddingHorizontal: 20,
    },
    screenTitle: {
      fontSize: 26,
      fontWeight: "bold",
      color: c.text,
      marginBottom: 4,
    },
    screenSub: {
      fontSize: 13,
      color: c.textSecondary,
      marginBottom: 20,
    },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: c.surface,
      borderRadius: 12,
      paddingHorizontal: 14,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: c.border,
      height: 46,
    },
    searchInput: {
      flex: 1,
      height: 46,
      color: c.text,
      fontSize: 14,
    },
    list: {
      gap: 12,
    },
    card: {
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: c.border,
    },
    cardLeft: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    appIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: c.bg,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: c.border,
    },
    cardInfo: {
      flex: 1,
    },
    appName: {
      fontSize: 15,
      fontWeight: "bold",
      color: c.text,
      marginBottom: 2,
    },
    url: {
      fontSize: 12,
      color: c.textSecondary,
      marginBottom: 4,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    meta: {
      fontSize: 11,
      color: c.textSecondary,
    },
    metaDot: {
      color: c.textSecondary,
      fontSize: 10,
    },
    cardActions: {
      flexDirection: "row",
      gap: 8,
      marginLeft: 8,
    },
    actionBtn: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: c.bg,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: c.border,
    },
    deleteBtn: {
      borderColor: c.dangerBorder,
      backgroundColor: c.dangerBg,
    },
    empty: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 80,
      gap: 12,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: c.text,
    },
    emptySub: {
      fontSize: 14,
      color: c.textSecondary,
      textAlign: "center",
      lineHeight: 22,
    },
    emptyBtn: {
      backgroundColor: c.accent,
      borderRadius: 12,
      paddingHorizontal: 24,
      paddingVertical: 12,
      marginTop: 8,
    },
    emptyBtnText: {
      color: c.accentText,
      fontWeight: "bold",
      fontSize: 15,
    },
  });
}
