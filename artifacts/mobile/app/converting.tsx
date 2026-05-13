import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAlert } from "@/context/AlertContext";
import { useAPK } from "@/context/APKContext";
import { useThemeColors } from "@/context/ThemeContext";

const STEPS = ["URL Check", "Packaging", "Ready"];

export default function ConvertingScreen() {
  const c = useThemeColors();
  const styles = makeStyles(c);
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ url: string; appName: string; appIcon?: string }>();
  const { showAlert } = useAlert();
  const { generateAPK, progress, currentStep } = useAPK();

  const rotation = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const didStart = useRef(false);

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  useEffect(() => {
    if (!didStart.current && params.url) {
      didStart.current = true;
      startGeneration();
    }
  }, [params.url]);

  async function startGeneration() {
    try {
      const record = await generateAPK(params.url, params.appName || "", params.appIcon || undefined);
      router.replace({
        pathname: "/download",
        params: {
          id: record.id,
          appName: record.appName,
          url: record.url,
          downloadLink: record.downloadLink,
          size: record.size,
          createdAt: record.createdAt,
          appIcon: params.appIcon || "",
          downloads: String(record.downloads ?? 0),
        },
      });
    } catch (e: any) {
      showAlert("Error", "Failed to build APK. Please try again.");
      router.back();
    }
  }

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.center}>
        <Animated.View style={{ transform: [{ rotate }], marginBottom: 32 }}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.spinningIcon}
            resizeMode="contain"
          />
        </Animated.View>

        <Text style={styles.title}>Building your APK...</Text>
        <Text style={styles.subtitle}>{params.appName || params.url}</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>

        <View style={styles.stepsContainer}>
          {STEPS.map((step, index) => (
            <View key={step} style={styles.stepRow}>
              <View
                style={[
                  styles.stepDot,
                  index < currentStep && styles.stepDotDone,
                  index === currentStep && styles.stepDotActive,
                ]}
              >
                {index < currentStep ? (
                  <Text style={styles.stepCheck}>✓</Text>
                ) : index === currentStep ? (
                  <View style={styles.stepDotInner} />
                ) : null}
              </View>
              <Text
                style={[
                  styles.stepText,
                  index === currentStep && styles.stepTextActive,
                  index < currentStep && styles.stepTextDone,
                ]}
              >
                {step}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={() => {
          showAlert("Cancel", "Stop building the APK?", [
            { text: "No", style: "cancel" },
            { text: "Stop", style: "destructive", onPress: () => router.replace("/(tabs)") },
          ]);
        }}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c.bg,
      justifyContent: "space-between",
      paddingHorizontal: 24,
    },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    spinningIcon: {
      width: 90,
      height: 90,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: c.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 13,
      color: c.textSecondary,
      marginBottom: 32,
      textAlign: "center",
      maxWidth: 280,
    },
    progressContainer: {
      width: "100%",
      marginBottom: 32,
      alignItems: "flex-end",
    },
    progressTrack: {
      width: "100%",
      height: 8,
      backgroundColor: c.surface,
      borderRadius: 4,
      overflow: "hidden",
      marginBottom: 8,
    },
    progressBar: {
      height: "100%",
      backgroundColor: c.accent,
      borderRadius: 4,
    },
    progressText: {
      color: c.accent,
      fontWeight: "bold",
      fontSize: 14,
    },
    stepsContainer: {
      width: "100%",
      gap: 16,
    },
    stepRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    stepDot: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: c.border,
      backgroundColor: c.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    stepDotActive: {
      borderColor: c.accent,
    },
    stepDotDone: {
      borderColor: "#10b981",
      backgroundColor: "#10b981",
    },
    stepDotInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: c.accent,
    },
    stepCheck: {
      color: c.text,
      fontSize: 14,
      fontWeight: "bold",
    },
    stepText: {
      fontSize: 16,
      color: c.textSecondary,
    },
    stepTextActive: {
      color: c.text,
      fontWeight: "600",
    },
    stepTextDone: {
      color: "#10b981",
    },
    cancelBtn: {
      marginBottom: 20,
      padding: 16,
      alignItems: "center",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
    },
    cancelText: {
      color: c.textSecondary,
      fontSize: 16,
    },
  });
}
