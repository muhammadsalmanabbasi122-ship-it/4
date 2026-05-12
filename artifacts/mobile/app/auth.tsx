import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Email aur password zaroori hai.");
      return;
    }
    if (tab === "signup") {
      if (!name.trim()) {
        Alert.alert("Error", "Naam zaroori hai.");
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert("Error", "Passwords match nahi kar rahe.");
        return;
      }
      if (password.length < 6) {
        Alert.alert("Error", "Password kam az kam 6 characters ka hona chahiye.");
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
      Alert.alert("Error", e.message || "Kuch masla hua. Dobara koshish karein.");
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
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoWrapper}>
            <Text style={styles.moonEmoji}>☽</Text>
          </View>
          <Text style={styles.appName}>ChandMod</Text>
          <Text style={styles.tagline}>Website ko APK mein badlein</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.tabRow}>
            {(["login", "signup"] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tab, tab === t && styles.tabActive]}
                onPress={() => setTab(t)}
              >
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                  {t === "login" ? "Login" : "Sign Up"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {tab === "signup" && (
            <View style={styles.inputGroup}>
              <Feather name="user" size={18} color="#8892b0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Aapka naam"
                placeholderTextColor="#8892b0"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
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
              <Text style={styles.forgotText}>Password bhul gaye?</Text>
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
                {tab === "login" ? "Login Karein" : "Account Banayein"}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>
              {tab === "login" ? "Naya user? " : "Pehle se account hai? "}
            </Text>
            <TouchableOpacity onPress={() => setTab(tab === "login" ? "signup" : "login")}>
              <Text style={styles.switchLink}>
                {tab === "login" ? "Sign Up" : "Login"}
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
    marginBottom: 32,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#16213e",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  moonEmoji: {
    fontSize: 40,
    color: "#FFD700",
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFD700",
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: "#8892b0",
    marginTop: 6,
  },
  card: {
    backgroundColor: "#16213e",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#0f3460",
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
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
    marginBottom: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#0f3460",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: "#ffffff",
    fontSize: 15,
  },
  eyeBtn: {
    padding: 4,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotText: {
    color: "#FFD700",
    fontSize: 13,
  },
  submitBtn: {
    backgroundColor: "#FFD700",
    borderRadius: 12,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
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
    marginTop: 20,
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
