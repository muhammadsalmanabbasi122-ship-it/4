import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { login, signup } = useAuth();
  const [tab, setTab] = useState<"signup" | "login">("signup");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function resetFields() {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPass(false);
    setShowConfirmPass(false);
  }

  function switchTab(t: "signup" | "login") {
    resetFields();
    setTab(t);
  }

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Email and password are required.");
      return;
    }
    if (tab === "signup") {
      if (!name.trim()) {
        Alert.alert("Error", "Name is required.");
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert("Error", "Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        Alert.alert("Error", "Password must be at least 6 characters.");
        return;
      }
    }

    setLoading(true);
    try {
      if (tab === "login") {
        await login(email.trim(), password);
      } else {
        await signup(name.trim(), email.trim(), password);
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (e: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoWrapper}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.logo}
              contentFit="contain"
            />
          </View>
          <Text style={styles.appName}>ChandMod</Text>
          <Text style={styles.tagline}>Turn any website into an Android APK</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.tabRow}>
            {(["signup", "login"] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tab, tab === t && styles.tabActive]}
                onPress={() => switchTab(t)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                  {t === "signup" ? "Sign Up" : "Login"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {tab === "signup" && (
            <View style={styles.inputGroup}>
              <Feather name="user" size={18} color="#8892b0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Your full name"
                placeholderTextColor="#8892b0"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Feather name="mail" size={18} color="#8892b0" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#8892b0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputGroup}>
            <Feather name="lock" size={18} color="#8892b0" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#8892b0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              returnKeyType={tab === "signup" ? "next" : "done"}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
              <Feather name={showPass ? "eye-off" : "eye"} size={18} color="#8892b0" />
            </TouchableOpacity>
          </View>

          {tab === "signup" && (
            <View style={styles.inputGroup}>
              <Feather name="lock" size={18} color="#8892b0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#8892b0"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPass}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPass(!showConfirmPass)}
                style={styles.eyeBtn}
              >
                <Feather name={showConfirmPass ? "eye-off" : "eye"} size={18} color="#8892b0" />
              </TouchableOpacity>
            </View>
          )}

          {tab === "login" && (
            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#1a1a2e" />
            ) : (
              <Text style={styles.submitText}>
                {tab === "signup" ? "Create Account" : "Login"}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>
              {tab === "signup" ? "Already have an account? " : "New user? "}
            </Text>
            <TouchableOpacity onPress={() => switchTab(tab === "signup" ? "login" : "signup")}>
              <Text style={styles.switchLink}>
                {tab === "signup" ? "Login" : "Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoWrapper: {
    width: 88,
    height: 88,
    borderRadius: 22,
    backgroundColor: "#16213e",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 2,
    borderColor: "#FFD700",
    overflow: "hidden",
  },
  logo: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FFD700",
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 13,
    color: "#8892b0",
    marginTop: 6,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#16213e",
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: "#0f3460",
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: "#FFD700",
  },
  tabText: {
    color: "#8892b0",
    fontWeight: "600",
    fontSize: 15,
  },
  tabTextActive: {
    color: "#1a1a2e",
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#0f3460",
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 52,
    color: "#ffffff",
    fontSize: 15,
  },
  eyeBtn: {
    padding: 6,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: 16,
    marginTop: -4,
  },
  forgotText: {
    color: "#FFD700",
    fontSize: 13,
  },
  submitBtn: {
    backgroundColor: "#FFD700",
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: "#1a1a2e",
    fontWeight: "bold",
    fontSize: 16,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
  },
  switchLabel: {
    color: "#8892b0",
    fontSize: 14,
  },
  switchLink: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "bold",
  },
});
