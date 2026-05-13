import React, { Component, PropsWithChildren } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends Component<PropsWithChildren, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.msg}>{this.state.error?.message}</Text>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.btnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff", marginBottom: 12 },
  msg: { fontSize: 14, color: "#8892b0", textAlign: "center", marginBottom: 24 },
  btn: {
    backgroundColor: "#FFD700",
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  btnText: { color: "#1a1a2e", fontWeight: "bold", fontSize: 15 },
});
