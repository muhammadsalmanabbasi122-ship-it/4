import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type AlertButton = {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
};

type AlertContextType = {
  showAlert: (title: string, message?: string, buttons?: AlertButton[]) => void;
};

const AlertContext = createContext<AlertContextType>({
  showAlert: () => {},
});

export function useAlert() {
  return useContext(AlertContext);
}

const { width } = Dimensions.get("window");

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [buttons, setButtons] = useState<AlertButton[]>([]);
  const scale = useRef(new Animated.Value(0.9)).current;
  const fade = useRef(new Animated.Value(0)).current;

  const showAlert = useCallback(
    (t: string, m?: string, btns?: AlertButton[]) => {
      setTitle(t);
      setMessage(m || "");
      setButtons(btns || [{ text: "OK" }]);
      setVisible(true);
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 10,
        }),
        Animated.timing(fade, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    },
    []
  );

  function dismiss(cb?: () => void) {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      cb?.();
    });
  }

  function handlePress(btn?: AlertButton) {
    dismiss(btn?.onPress);
  }

  function btnColor(style?: string) {
    switch (style) {
      case "destructive":
        return "#ef4444";
      case "cancel":
        return "#8892b0";
      default:
        return "#FFD700";
    }
  }

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
        <Animated.View style={[styles.backdrop, { opacity: fade }]}>
          <View style={styles.backdropInner} />
        </Animated.View>
        <View style={styles.container}>
          <Animated.View
            style={[styles.card, { transform: [{ scale }], opacity: fade }]}
          >
            <View style={styles.glassIcon}>
              <Text style={styles.iconText}>✦</Text>
            </View>
            <Text style={[styles.title, !message && styles.titleNoMsg]}>{title}</Text>
            {message ? (
              <Text style={styles.message}>{message}</Text>
            ) : null}
            <View style={styles.btnRow}>
              {buttons.map((btn, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.btn,
                    btn.style === "cancel" && styles.btnCancel,
                    btn.style === "destructive" && styles.btnDanger,
                  ]}
                  onPress={() => handlePress(btn)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.btnText, { color: btnColor(btn.style) }]}
                  >
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropInner: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  card: {
    width: width - 64,
    maxWidth: 340,
    backgroundColor: "rgba(22, 33, 62, 0.9)",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.12)",
    ...Platform.select({
      ios: {
        shadowColor: "#FFD700",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  glassIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 215, 0, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.15)",
    marginBottom: 16,
  },
  iconText: {
    fontSize: 22,
    color: "#FFD700",
  },
  title: {
    fontSize: 19,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  titleNoMsg: {
    marginBottom: 20,
  },
  message: {
    fontSize: 14,
    color: "#8892b0",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(26, 26, 46, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.08)",
  },
  btnCancel: {
    borderColor: "rgba(136, 146, 176, 0.15)",
  },
  btnDanger: {
    borderColor: "rgba(239, 68, 68, 0.15)",
  },
  btnText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
