import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Feather";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { Image, Alert } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { removeAllEntries, addExampleEntries } from "@/utils/functions/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sampleEntries } from "@/utils/example_data/sampleEntries";
import { useColorScheme } from "react-native";
import { useRouter } from "expo-router";

const resetOnboarding = async () => {
  Alert.alert(
    "Resetear onboarding",
    "¿Seguro que quieres resetear el onboarding?",
    [
      {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "destructive",
      },
      {
        text: "OK",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("hasOnboarded");
          } catch (error) {
            console.error("Error al borrar el flag:", error);
          }
        },
      },
    ]
  );
};

export default function HomeScreen() {
  
  const colorScheme = useColorScheme();
  const entryBackgroundColor = useThemeColor({}, "soft");
  const contrast = useThemeColor({}, "contrast");
  const textColor = useThemeColor({}, "text");
  const entryColor = useThemeColor({}, "entry");

  const router = useRouter();

  const today = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = today.toLocaleDateString("en-US", options);

  const hour = today.getHours();
  let greeting = "Good morning";
  if (hour >= 12 && hour < 18) greeting = "Good afternoon";
  else if (hour >= 18) greeting = "Good evening";

  const recentEntries = [
    { date: "March 25, 2025", title: "A productive day" },
    { date: "March 24, 2025", title: "Meeting with friends" },
    { date: "March 23, 2025", title: "Weekend reflections" },
  ];

  const coverImage =
    colorScheme === "dark"
      ? require("@/assets/images/home_cover_dark.png")
      : require("@/assets/images/home_cover_light.png");

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={coverImage}
          style={styles.coverImage}
        />
      }
    >
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: textColor }]}>{greeting}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
      <LinearGradient colors={["#eef2ff", "#f5e8ff"]} style={styles.entryCard}>
        <View style={styles.entryHeader}>
          <Icon name="sun" size={32} color="#f59e0b" />
          <Text style={[styles.entryLabel, { color: textColor }]}>Today's Entry</Text>
        </View>
        <Text style={[styles.entryTitle, { color: textColor }]}>Reflect on your day</Text>
        <Text style={styles.entryDescription}>
          Take a moment to capture your thoughts, feelings, and experiences.
        </Text>
        <TouchableOpacity style={styles.button}>
          <Icon
            name="edit-3"
            size={16}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.buttonText]}>Write Today's Entry</Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Journal Insights</Text>
        <View style={styles.insights}>
          <LinearGradient
            colors={["#fff1f2", "#fff7ed"]}
            style={styles.insightCard}
          >
            <Text style={styles.insightNumber}>7</Text>
            <Text style={styles.insightLabel}>Entries this week</Text>
          </LinearGradient>
          <LinearGradient
            colors={["#ecfdf5", "#f0fdfa"]}
            style={styles.insightCard}
          >
            <Text style={styles.insightNumber}>24</Text>
            <Text style={styles.insightLabel}>Total entries</Text>
          </LinearGradient>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Recent Entries</Text>
          <TouchableOpacity style={styles.viewAll}>
            <Text style={[styles.viewAllText, { color: textColor }]}
              onPress={() => router.push('/journal-list')}
            >View all</Text>
            <Icon name="chevron-right" size={16} color={ textColor } />
          </TouchableOpacity>
        </View>

        <View style={styles.recentList}>
          {recentEntries.map((entry, i) => (
            <View key={i} style={[styles.recentCard, { backgroundColor: entryColor, shadowColor: contrast }]}>
              <Text style={styles.recentDate}>{entry.date}</Text>
              <Text style={[styles.recentTitle, { color: textColor }]}>{entry.title}</Text>
            </View>
          ))}
        </View>
      </View>
      <View
        style={{ height: 3, backgroundColor: "#6e6e6e", marginVertical: 10 }}
      />
      <TouchableOpacity
        style={[styles.button, { backgroundColor: entryBackgroundColor }]}
        onPress={resetOnboarding}
      >
        <Text style={[styles.buttonText, { color: textColor }]}>
          Reset onboarding
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: entryBackgroundColor }]}
        onPress={() => addExampleEntries(sampleEntries)}
      >
        <Text style={[styles.buttonText, { color: textColor }]}>
          Add Entries
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: entryBackgroundColor, marginBottom: 50 },
        ]}
        onPress={removeAllEntries}
      >
        <Text style={[styles.buttonText, { color: textColor }]}>
          Remove all Entries
        </Text>
      </TouchableOpacity>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  coverImage: {
    objectFit: "cover",
    position: "absolute",
    height: "100%",
    width: "100%",
  },
  header: {
    marginBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
  },
  date: {
    color: "#6b7280", // Tailwind's text-muted
  },
  entryCard: {
    borderRadius: 5,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  entryLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  entryDescription: {
    color: "#6b7280",
    marginBottom: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 5,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  insights: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  insightCard: {
    flex: 1,
    borderRadius: 5,
    padding: 16,
    marginRight: 8,
  },
  insightNumber: {
    fontSize: 28,
    fontWeight: "bold",
  },
  insightLabel: {
    color: "#6b7280",
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewAll: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    fontSize: 12,
    marginRight: 4,
  },
  recentList: {
    marginTop: 12,
  },
  recentCard: {
    backgroundColor: "#ffffff",
    borderRadius: 5,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  recentDate: {
    color: "#6b7280",
    fontSize: 12,
  },
  recentTitle: {
    fontWeight: "500",
  },
});
