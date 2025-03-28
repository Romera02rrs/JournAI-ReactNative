import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  removeAllEntries,
  addExampleEntries,
  getRecentEntryes,
} from "@/utils/functions/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sampleEntries } from "@/utils/example_data/sampleEntries";
import { useColorScheme } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import locale from "@/i18n";
import { getTodayId } from "@/utils/functions/getTodayId";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const entryBackgroundColor = useThemeColor({}, "soft");
  const contrast = useThemeColor({}, "contrast");
  const textColor = useThemeColor({}, "text");
  const entryColor = useThemeColor({}, "entry");
  const { t } = useTranslation();
  const router = useRouter();
  const today = new Date();

  const [recentEntries, setRecentEntries] = useState<
    { date: string; title: string; id: string }[]
  >([]);

  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const formattedDate = today.toLocaleDateString(locale.language, options);

  const gradients = {
    entryCard:
      colorScheme === "dark"
        ? (["#2e2a4d50", "#261b2eaa"] as [string, string])
        : (["#e3f5fe", "#f1e3fb"] as [string, string]),
    insight1:
      colorScheme === "dark"
        ? (["#4b2e2e75", "#4a3c2a75"] as [string, string])
        : (["#fdeaea", "#fef3e6"] as [string, string]),
    insight2:
      colorScheme === "dark"
        ? (["#192b2775", "#1a433675"] as [string, string])
        : (["#e6fdf2", "#effae4"] as [string, string]),
  };

  const hour = today.getHours();
  let greeting = t("greeting_1");
  if (hour >= 12 && hour < 20) greeting = t("greeting_2");
  else if (hour >= 20 || hour < 5) greeting = t("greeting_3");

  useFocusEffect(
    useCallback(() => {
      const fetchRecent = async () => {
        const recent = await getRecentEntryes();
        setRecentEntries(recent);
      };
      fetchRecent();
    }, [])
  );

  const coverImage =
    colorScheme === "dark"
      ? require("@/assets/images/home_cover_dark.webp")
      : require("@/assets/images/home_cover_light.webp");

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

  // Función para alternar el idioma: si está en inglés se cambia a español, y viceversa.
  const toggleLanguage = () => {
    if (i18n.language.startsWith("en")) {
      i18n.changeLanguage("es");
    } else {
      i18n.changeLanguage("en");
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={<Image source={coverImage} style={styles.coverImage} />}
    >
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: textColor }]}>{greeting}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
      <LinearGradient
        colors={gradients.entryCard}
        style={[styles.entryCard, { shadowColor: contrast }]}
      >
        <View style={styles.entryHeader}>
          <Feather name="sun" size={32} color="#f59e0b" />
          <Text style={[styles.entryLabel, { color: '#6b7280' }]}>
            {t("entry.today")}
          </Text>
        </View>
        <Text style={[styles.entryTitle, { color: textColor }]}>
          {t("entry.reflectPrompt")}
        </Text>
        <Text style={styles.entryDescription}>
          {t("entry.reflectDescription")}
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            router.push(`/journal-editor/${getTodayId()}`);
          }}
        >
          <Feather
            name="edit-3"
            size={16}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.buttonText]}>{t("entry.write_today")}</Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          {t("insights.title")}
        </Text>
        <View style={[styles.insights, { shadowColor: contrast }]}>
          <LinearGradient
            colors={gradients.insight1}
            style={styles.insightCard}
          >
            <Text style={[styles.insightNumber, { color: textColor }]}>7</Text>
            <Text style={[styles.insightLabel, { color: textColor }]}>
              {t("insights.entries_this_week")}
            </Text>
          </LinearGradient>
          <LinearGradient
            colors={gradients.insight2}
            style={styles.insightCard}
          >
            <Text style={[styles.insightNumber, { color: textColor }]}>
              24 / <Text>30</Text>
            </Text>
            <Text style={styles.insightLabel}>
              {t("insights.total_entries")}
            </Text>
          </LinearGradient>
        </View>
      </View>

      <View style={styles.section}>
        <View style={[styles.sectionHeader, { marginBottom: 12 }]}>
          <Text
            style={[styles.sectionTitle, { color: textColor, marginBottom: 0 }]}
          >
            {t("entry.recent")}
          </Text>
          <TouchableOpacity style={styles.viewAll}>
            <Text
              style={[styles.viewAllText, { color: textColor }]}
              onPress={() => router.push("/journal-list")}
            >
              {t("entry.view_all")}
            </Text>
            <Feather name="chevron-right" size={16} color={textColor} />
          </TouchableOpacity>
        </View>
        <View style={styles.recentList}>
          {recentEntries.map((entry, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.recentCard,
                { backgroundColor: entryColor, shadowColor: contrast },
              ]}
              onPress={() => {
                router.push(`/journal-editor/${entry.id}`);
              }}
            >
              <Text style={styles.recentDate}>
                {new Date(entry.date).toLocaleDateString(
                  i18n.language,
                  options
                )}
              </Text>
              <Text style={[styles.recentTitle, { color: textColor }]}>
                {entry.title}
              </Text>
            </TouchableOpacity>
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
          Add entries
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: entryBackgroundColor }]}
        onPress={toggleLanguage}
      >
        <Text style={[styles.buttonText, { color: textColor }]}>
          Force language
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
          Remove all entries
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
    color: "#6b7280",
  },
  entryCard: {
    borderRadius: 5,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
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
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
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
