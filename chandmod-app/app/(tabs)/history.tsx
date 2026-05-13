import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAPK, APKRecord } from "@/context/APKContext";

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { history, deleteAPK } = useAPK();

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  }

  async function handleDelete(id: string, name: string) {
    Alert.alert(
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
            <Feather name="smartphone" size={20} color="#FFD700" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.appName} numberOfLines={1}>{item.appName}</Text>
            <Text style={styles.url} numberOfLines={1}>{item.url}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.meta}>{formatDate(item.createdAt)}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.meta}>{item.size}</Text>
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
                },
              })
            }
          >
            <Feather name="download" size={18} color="#FFD700" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => handleDelete(item.id, item.appName)}
          >
            <Feather name="trash-2" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 16);

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <Text style={styles.screenTitle}>APK History</Text>
      <Text style={styles.screenSub}>{history.length} APK{history.length !== 1 ? "s" : ""} built</Text>

      <FlatList
        data={history}
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
            <Feather name="inbox" size={56} color="#0f3460" />
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    paddingHorizontal: 20,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  screenSub: {
    fontSize: 13,
    color: "#8892b0",
    marginBottom: 20,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: "#16213e",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#0f3460",
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
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#0f3460",
  },
  cardInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 2,
  },
  url: {
    fontSize: 12,
    color: "#8892b0",
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  meta: {
    fontSize: 11,
    color: "#8892b0",
  },
  metaDot: {
    color: "#8892b0",
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
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#0f3460",
  },
  deleteBtn: {
    borderColor: "#3d1515",
    backgroundColor: "#1f0d0d",
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
    color: "#ffffff",
  },
  emptySub: {
    fontSize: 14,
    color: "#8892b0",
    textAlign: "center",
    lineHeight: 22,
  },
  emptyBtn: {
    backgroundColor: "#FFD700",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8,
  },
  emptyBtnText: {
    color: "#1a1a2e",
    fontWeight: "bold",
    fontSize: 15,
  },
});
