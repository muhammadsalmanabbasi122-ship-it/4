import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Image } from "expo-image";
import {
  Animated,
  Easing,
  Linking,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAlert } from "@/context/AlertContext";
import { useThemeColors } from "@/context/ThemeContext";

export default function DownloadScreen() {
  const c = useThemeColors();
  const styles = makeStyles(c);
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const params = useLocalSearchParams<{
    id: string;
    appName: string;
    url: string;
    downloadLink: string;
    size: string;
    createdAt: string;
    appIcon?: string;
    downloads?: string;
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
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  }

  async function handleDownload() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    showAlert(
      "Download APK",
      `"${params.appName}" APK is ready.\n\nLink: ${params.downloadLink}`,
      [
        { text: "OK" },
        {
          text: "Open in Browser",
          onPress: () => Linking.openURL(params.downloadLink),
        },
      ]
    );
  }

  async function handleShare() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `Download "${params.appName}" APK built with ChandMod:\n${params.downloadLink}`,
        title: `${params.appName} APK`,
      });
    } catch (e) {}
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
      <Animated.View style={[styles.successContainer, { opacity, transform: [{ scale }] }]}>
        <View style={styles.checkCircle}>
          <Feather name="check" size={48} color={c.accentText} />
        </View>
        <Text style={styles.successTitle}>APK Ready!</Text>
        <Text style={styles.successSubtitle}>Your APK has been successfully built</Text>
      </Animated.View>

      <Animated.View style={[styles.detailCard, { opacity }]}>
        {params.appIcon ? (
          <View style={styles.detailIconRow}>
            <Image source={{ uri: params.appIcon }} style={styles.detailIcon} contentFit="cover" />
          </View>
        ) : null}

        <Text style={styles.cardTitle}>APK Details</Text>

        <View style={styles.detailRow}>
          <Feather name="smartphone" size={16} color={c.textSecondary} />
          <Text style={styles.detailLabel}>App Name</Text>
          <Text style={styles.detailValue}>{params.appName}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Feather name="link" size={16} color={c.textSecondary} />
          <Text style={styles.detailLabel}>URL</Text>
          <Text style={styles.detailValue} numberOfLines={1}>{params.url}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Feather name="hard-drive" size={16} color={c.textSecondary} />
          <Text style={styles.detailLabel}>Size</Text>
          <Text style={styles.detailValue}>{params.size}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Feather name="calendar" size={16} color={c.textSecondary} />
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>{formatDate(params.createdAt)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Feather name="download" size={16} color={c.textSecondary} />
          <Text style={styles.detailLabel}>Downloads</Text>
          <Text style={styles.detailValue}>{params.downloads || "0"}</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.buttonGroup, { opacity }]}>
        <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload} activeOpacity={0.85}>
          <Feather name="download" size={20} color={c.accentText} />
          <Text style={styles.downloadText}>Download APK</Text>
        </TouchableOpacity>

        <View style={styles.secondaryRow}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleShare} activeOpacity={0.8}>
            <Feather name="share-2" size={18} color={c.accent} />
            <Text style={styles.secondaryText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() =>
              router.replace({
                pathname: "/converting",
                params: { url: params.url, appName: params.appName },
              })
            }
            activeOpacity={0.8}
          >
            <Feather name="refresh-cw" size={18} color={c.accent} />
            <Text style={styles.secondaryText}>Rebuild</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.secondaryBtn, { width: "100%" }]}
          onPress={() => router.replace("/(tabs)")}
          activeOpacity={0.8}
        >
          <Feather name="home" size={18} color={c.textSecondary} />
          <Text style={[styles.secondaryText, { color: c.textSecondary }]}>Go Home</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c.bg,
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
      backgroundColor: c.accent,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
      shadowColor: c.accent,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 10,
    },
    successTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: c.text,
      marginBottom: 8,
    },
    successSubtitle: {
      fontSize: 14,
      color: c.textSecondary,
    },
    detailIconRow: {
      alignItems: "center",
      marginBottom: 16,
    },
    detailIcon: {
      width: 72,
      height: 72,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: c.accent,
    },
    detailCard: {
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: c.border,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: c.accent,
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
      color: c.textSecondary,
      width: 70,
    },
    detailValue: {
      fontSize: 13,
      color: c.text,
      flex: 1,
      textAlign: "right",
      fontWeight: "500",
    },
    divider: {
      height: 1,
      backgroundColor: c.border,
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
      backgroundColor: c.accent,
      borderRadius: 14,
      height: 56,
    },
    downloadText: {
      color: c.accentText,
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
      backgroundColor: c.surface,
      borderRadius: 14,
      height: 50,
      borderWidth: 1,
      borderColor: c.border,
    },
    secondaryText: {
      color: c.accent,
      fontWeight: "600",
      fontSize: 15,
    },
  });
}
