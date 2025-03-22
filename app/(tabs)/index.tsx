import { Image, StyleSheet, Platform } from "react-native";

import { BookEmoji } from "@/components/BookEmoji";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Text, Alert } from 'react-native';
import { useThemeColor } from "@/hooks/useThemeColor";
import { addExampleEntries } from "@/utils/functions/storage";
import { sampleEntries } from "@/utils/example_data/sampleEntries";
import { removeAllEntries } from "@/utils/functions/storage";


export default function HomeScreen() {

  const entryBackgroundColor = useThemeColor({}, "soft");
  const textColor = useThemeColor({}, "text");


  const resetOnboarding = async () => {
    Alert.alert('Resetear onboarding', '¿Seguro que quieres resetear el onboarding?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'destructive',
      },
      {text: 'OK', onPress: async () => {
        try {
          await AsyncStorage.removeItem("hasOnboarded");
        } catch (error) {
          console.error("Error al borrar el flag:", error);
        }
      },},
    ]);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/pen_book.webp")}
          style={styles.coverImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome to JournAI!</ThemedText>
        <BookEmoji />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit{" "}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText>{" "}
          to see changes. Press{" "}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: "cmd + d",
              android: "cmd + m",
              web: "F12",
            })}
          </ThemedText>{" "}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        <ThemedText>
          Tap the Explore tab to learn more about what's included in this
          starter app.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          When you're ready, run{" "}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText>{" "}
          to get a fresh <ThemedText type="defaultSemiBold">app</ThemedText>{" "}
          directory. This will move the current{" "}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{" "}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
      <TouchableOpacity style={[styles.button, { backgroundColor: entryBackgroundColor }]} onPress={resetOnboarding}>
        <Text style={[styles.buttonText, { color: textColor }]}>
          Reset onboarding
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { backgroundColor: entryBackgroundColor }]} onPress={ ()=> addExampleEntries(sampleEntries)}>
        <Text style={[styles.buttonText, { color: textColor }]}>
          Add Entries
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { backgroundColor: entryBackgroundColor, marginBottom: 50 }]} onPress={removeAllEntries}>
        <Text style={[styles.buttonText, { color: textColor }]}>
          Remove all Entries
        </Text>
      </TouchableOpacity>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  coverImage: {
    objectFit: "cover",
    position: "absolute",
    height: "100%",
    width: "100%",
  },
  button: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#000',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
});
