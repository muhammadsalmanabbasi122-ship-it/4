import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Alert,
  Animated,
  Easing,
  Linking,
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DownloadScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id: string;
    appName: string;
    url: string;
    downloadLink: string;
    size: string;
    createdAt: string;
  }>();

  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 6 }),
        Animated.timing(opacity, { toValue: 1, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
  }

  async function handleDownload() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Download",
      `"${params.appName}" APK download shuru ho raha hai.\n\nLink: ${params.downloadLink}`,
      [
        { text: "OK" },
        {
          text: "Browser Mein Kholein",
          onPress: () => Linking.openURL(params.downloadLink),
        },
      ]
    );
  }

  async function handleShare() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `ChandMod se "${params.appName}" ka APK download karein:\n${params.downloadLink}`,
        title: `${params.appName} APK`,
      });
    } catch (e) {}
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
      <Animated.View style={[styles.successContainer, { opacity, transform: [{ scale }] }]}>
        <View style={styles.checkCircle}>
          <Feather name="check" size={48} color="#1a1a2e" />
        </View>
        <Text style={styles.successTitle}>APK Tayar Hai!</Text>
        <Text style={styles.successSubtitle}>Aapka APK successfully ban gaya hai</Text>
      </Animated.View>

      <Animated.View style={[styles.detailCard, { opacity }]}>
        <Text style={styles.cardTitle}>APK Details</Text>

        <View style={styles.detailRow}>
          <Feather name="smartphone" size={16} color="#8892b0" />
          <Text style={styles.detailLabel}>App Name</Text>
          <Text style={styles.detailValue}>{params.appName}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Feather name="link" size={16} color="#8892b0" />
          <Text style={styles.detailLabel}>URL</Text>
          <Text style={styles.detailValue} numberOfLines={1}>{params.url}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Feather name="hard-drive" size={16} color="#8892b0" />
          <Text style={styles.detailLabel}>Size</Text>
          <Text style={styles.detailValue}>{params.size}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Feather name="calendar" size={16} color="#8892b0" />
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>{formatDate(params.createdAt)}</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.buttonGroup, { opacity }]}>
        <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload} activeOpacity={0.85}>
          <Feather name="download" size={20} color="#1a1a2e" />
          <Text style={styles.downloadText}>APK Download Karein</Text>
        </TouchableOpacity>

        <View style={styles.secondaryRow}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleShare} activeOpacity={0.8}>
            <Feather name="share-2" size={18} color="#FFD700" />
            <Text style={styles.secondaryText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.replace("/(tabs)")}
            activeOpacity={0.8}
          >
            <Feather name="home" size={18} color="#8892b0" />
            <Text style={[styles.secondaryText, { color: "#8892b0" }]}>Ghar Jao</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  successContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFD700",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: "#8892b0",
  },
  detailCard: {
    backgroundColor: "#16213e",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#0f3460",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: "#8892b0",
    width: 70,
  },
  detailValue: {
    fontSize: 13,
    color: "#ffffff",
    flex: 1,
    textAlign: "right",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#0f3460",
    marginVertical: 10,
  },
  buttonGroup: {
    gap: 12,
  },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#FFD700",
    borderRadius: 14,
    height: 56,
  },
  downloadText: {
    color: "#1a1a2e",
    fontWeight: "bold",
    fontSize: 17,
  },
  secondaryRow: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#16213e",
    borderRadius: 14,
    height: 50,
    borderWidth: 1,
    borderColor: "#0f3460",
  },
  secondaryText: {
    color: "#FFD700",
    fontWeight: "600",
    fontSize: 15,
  },
});
