import React, { useCallback, useRef, useState, useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColorScheme } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import ParallaxScrollView, {
  ParallaxScrollRef,
} from "@/components/ParallaxScrollView";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  areEntriesDirty,
  clearEntriesDirtyFlag,
  getAllEntries,
  getScrollPosition,
  saveScrollPosition,
} from "@/utils/functions/storage";
import { Entry, GradientColors, ScrollEvent } from "@/utils/types";
import { useTranslation } from "react-i18next";
import locale from "@/i18n";
import { TouchableOpacity } from "react-native-gesture-handler";
import { ratingColorsGradient } from "@/constants/Colors";
import TodayEntry from "@/components/TodayEntry";
import SearchBar from "@/components/SearchBar";
import { getToday, isEntryExpired } from "@/utils/functions/dateUtils";

export default function DiaryEntriesScreen() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [allEntries, setAllEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const contrast = useThemeColor({}, "contrast");
  const textColor = useThemeColor({}, "text");
  const softContrast = useThemeColor({}, "softContrast");

  const parallaxRef = useRef<ParallaxScrollRef>(null);
  const hasLoadedEntriesOnce = useRef(false);
  const { t } = useTranslation();
  const colorScheme = useColorScheme();

  let position = 0;

  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const coverImage =
    colorScheme === "dark"
      ? require("@/assets/images/journal-list_cover_dark.webp")
      : require("@/assets/images/journal-list_cover_light.webp");

  const gradients: GradientColors = {
    silver:
      colorScheme === "dark" ? ["#232527", "#1F1F22"] : ["#efefef", "#fcfcfc"],
  };

  const handleScrollEvent = (event: ScrollEvent) => {
    position = event.nativeEvent.contentOffset.y;
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchEntries = async () => {
        if (!(await areEntriesDirty()) && hasLoadedEntriesOnce.current) return;

        setLoading(true);
        const storedEntries = await getAllEntries();
        if (!isActive) return;

        const sortedEntries = storedEntries.sort(
          (a: Entry, b: Entry) =>
            new Date(b.id).getTime() - new Date(a.id).getTime()
        );
        setAllEntries(sortedEntries);
        setEntries(sortedEntries);

        hasLoadedEntriesOnce.current = true;
        setLoading(false);
        await clearEntriesDirtyFlag();

        const position = await getScrollPosition();
        parallaxRef.current?.scrollTo(position, true);
      };

      fetchEntries();

      return () => {
        isActive = false;
      };
    }, [])
  );

  return (
    <ParallaxScrollView
      ref={parallaxRef}
      onScroll={handleScrollEvent}
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={<Image source={coverImage} style={styles.coverImage} />}
    >
      {/* Header */}
      <View style={[styles.section, { marginBottom: 21 }]}>
        <Text style={[styles.greeting, { color: textColor }]}>
          {t("journal_list.title")}
        </Text>
        <Text style={styles.date}>{t("journal_list.caption")}</Text>
      </View>

      {/* Search Bar */}
      <SearchBar allEntries={allEntries} setEntries={setEntries} />

      {loading ? (
        <View style={{ padding: 20 }}>
          <ActivityIndicator size="large" color={textColor} />
        </View>
      ) : (
        // Entries List Container
        <ScrollView contentContainerStyle={[styles.listContent]}>
          {/* Today's Entry */}

          <TodayEntry />

          {/* Entry list */}
          {/* Renderizar la lista de entradas expiradas.
          Las listas que se renderizan aquí serán bloqueadas en modo edición.
          Renderizar un componente extra para la lista de ayer y antes de ayer */}

          {entries.map((item: Entry) => {
            if (item.id === getToday()) return null; // Skip today's entry
            if (!isEntryExpired(item.id)) return null; // Skip non-expired entries

            const ratingStyle = ratingColorsGradient[item.rating ?? 1] || {
              backgroundColor: ["#E5E7EB", "#D1D5DB"],
              color: "#374151",
            };

            const isTitleEmpty = item.title === "" || item.title === undefined;
            const isContentEmpty =
              item.content === "" || item.content === undefined;
            const isRatingEmpty =
              item.rating === null || item.rating === undefined;

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  saveScrollPosition(position);
                  router.push(`/journal-editor/${item.id}`);
                }}
              >
                <View
                  style={[
                    styles.entryShadowContainer,
                    { shadowColor: contrast },
                  ]}
                >
                  <LinearGradient
                    colors={gradients.silver}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                      styles.entryContainer,
                      { borderColor: softContrast },
                    ]}
                  >
                    <Text style={[styles.entryDate]}>
                      {item.date
                        ? new Date(item.date).toLocaleDateString(
                            locale.language,
                            options
                          )
                        : t("journal_list.no_date")}
                    </Text>
                    <Text
                      style={[
                        styles.entryTitle,
                        { color: textColor },
                        isTitleEmpty ? { color: "#6b7280" } : {},
                      ]}
                    >
                      {isTitleEmpty
                        ? t("journal_list.entries.no_title")
                        : item.title}
                    </Text>
                    <Text style={[styles.entryContent]} numberOfLines={2}>
                      {isContentEmpty
                        ? t("journal_list.entries.no_content")
                        : item.content}
                    </Text>
                    <View style={[styles.entryFooter]}>
                      {isRatingEmpty ? (
                        <Text style={styles.EntryNoRating}>
                          {t("journal_list.today_entry.today_no_rating")}
                        </Text>
                      ) : (
                        <View style={styles.shadowContainer}>
                          <LinearGradient
                            colors={ratingStyle.backgroundColor}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.starsGradientContainer}
                          >
                            <Text
                              style={[
                                styles.entryStars,
                                { color: ratingStyle.color },
                              ]}
                            >
                              Stars: {item.rating}/5
                            </Text>
                          </LinearGradient>
                        </View>
                      )}
                      <Feather name="lock" size={16} color={textColor} />
                    </View>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  // Imágenes y encabezados
  coverImage: {
    position: "absolute",
    height: "100%",
    width: "100%",
    objectFit: "cover",
  },
  section: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
  },
  date: {
    fontSize: 16,
    color: "#6b7280",
  },

  // Lista de entradas
  listContent: {
    paddingBottom: 20,
  },
  entryContainer: {
    paddingTop: 12,
    borderRadius: 5,
    padding: 16,
    paddingBottom: 20,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
  },
  entryShadowContainer: {
    borderRadius: 5,
    margin: 6,
    shadowOpacity: 0.07,
    shadowRadius: 5,
    shadowOffset: { width: 1, height: 2 },
  },
  entryDate: {
    fontSize: 12,
    marginBottom: 4,
    color: "#6b7280",
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  entryContent: {
    fontSize: 14,
    paddingVertical: 8,
    marginBottom: 5,
    color: "#6b7280",
  },
  entryFooter: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  entryStars: {
    fontSize: 12,
    marginStart: 4,
  },
  shadowContainer: {
    borderRadius: 5,
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 1, height: 2 },
    shadowColor: "#000",
  },
  starsGradientContainer: {
    borderRadius: 5,
    padding: 5,
  },
  EntryNoRating: {
    fontSize: 12,
    color: "#6b7280",
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 7,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
});
