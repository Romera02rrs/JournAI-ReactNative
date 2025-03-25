import { LinearGradient } from "expo-linear-gradient";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  View,
  type ViewProps,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useMemo } from "react";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  useGradient?: boolean;
};

const { height: screenHeight } = Dimensions.get("window");

export function ThemedView({
  style,
  lightColor,
  darkColor,
  useGradient,
  children,
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );

  const tearImage = require("@/assets/images/paint.png");

  const decorations = useMemo(() => {
    const spacing = 180; // espacio entre manchas
    const count = Math.ceil(screenHeight * 2 / spacing); // generamos el doble del alto de pantalla
    return Array.from({ length: count }, (_, i) => {
      const top = i * spacing + Math.random() * 50;
      const isLeft = Math.random() > 0.5;
      const offset = Math.random() * (140) - 180;
      const rotation = Math.random() * 40 - 20; // entre -20 y +20
      const opacity = 0.4 + Math.random() * 0.3; // entre 0.4 y 0.7

      return {
        key: `tear-${i}`,
        style: {
          top,
          [isLeft ? "left" : "right"]: offset,
          transform: [{ rotate: `${rotation}deg` }],
          opacity,
        },
      };
    });
  }, []);

  if (useGradient) {
    return (
      <View style={[{ flex: 1 }, style]} {...otherProps}>
        <LinearGradient
          colors={["#809474", "#4B988B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* 👇 Renderizar manchas dinámicamente */}
        {decorations.map(({ key, style }) => (
          <Image
            key={key}
            source={tearImage}
            style={[styles.tear, style]}
          />
        ))}

        {children}
      </View>
    );
  }

  return (
    <View style={[{ backgroundColor, flex: 1 }, style]} {...otherProps}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  tear: {
    position: "absolute",
    width: 300,
    height: 300,
    resizeMode: "contain",
  },
});
