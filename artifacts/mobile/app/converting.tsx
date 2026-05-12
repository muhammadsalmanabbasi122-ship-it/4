import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Alert,
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAPK } from "@/context/APKContext";

const STEPS = ["URL Check", "Packaging", "Ready"];

export default function ConvertingScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ url: string; appName: string }>();
  const { generateAPK, progress, currentStep, isGenerating } = useAPK();

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
      const record = await generateAPK(params.url, params.appName || "");
      router.replace({
        pathname: "/download",
        params: {
          id: record.id,
          appName: record.appName,
          url: record.url,
          downloadLink: record.downloadLink,
          size: record.size,
          createdAt: record.createdAt,
        },
      });
    } catch (e: any) {
      Alert.alert("Error", "APK banane mein masla hua. Dobara koshish karein.");
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
        <Animated.View style={[styles.moonContainer, { transform: [{ rotate }] }]}>
          <View style={styles.moon}>
            <View style={styles.moonShadow} />
          </View>
        </Animated.View>

        <Text style={styles.title}>APK ban raha hai...</Text>
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
          Alert.alert("Cancel", "APK banana rok dein?", [
            { text: "Nahi", style: "cancel" },
            { text: "Rok Dein", style: "destructive", onPress: () => router.replace("/(tabs)") },
          ]);
        }}
      >
        <Text style={styles.cancelText}>Rok Dein</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  moonContainer: {
    width: 100,
    height: 100,
    marginBottom: 32,
  },
  moon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFD700",
    overflow: "hidden",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  moonShadow: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#1a1a2e",
    top: -10,
    right: -8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: "#8892b0",
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
    backgroundColor: "#16213e",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FFD700",
    borderRadius: 4,
  },
  progressText: {
    color: "#FFD700",
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
    borderColor: "#0f3460",
    backgroundColor: "#16213e",
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotActive: {
    borderColor: "#FFD700",
    backgroundColor: "#16213e",
  },
  stepDotDone: {
    borderColor: "#10b981",
    backgroundColor: "#10b981",
  },
  stepDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFD700",
  },
  stepCheck: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  stepText: {
    fontSize: 16,
    color: "#8892b0",
  },
  stepTextActive: {
    color: "#ffffff",
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
    borderColor: "#0f3460",
  },
  cancelText: {
    color: "#8892b0",
    fontSize: 16,
  },
});
