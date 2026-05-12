import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

interface Props {
  size?: number;
  color?: string;
}

export default function MoonLoader({ size = 60, color = "#FFD700" }: Props) {
  const rotation = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.15,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { width: size, height: size },
        { transform: [{ rotate }, { scale: pulse }] },
      ]}
    >
      <View
        style={[
          styles.moon,
          { width: size, height: size, borderRadius: size / 2 },
          {
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 12,
          },
        ]}
      >
        <View
          style={[
            styles.shadow,
            {
              width: size * 0.7,
              height: size * 0.7,
              borderRadius: (size * 0.7) / 2,
              top: -size * 0.1,
              right: -size * 0.05,
            },
          ]}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  moon: {
    backgroundColor: "#FFD700",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  shadow: {
    position: "absolute",
    backgroundColor: "#1a1a2e",
  },
});
