import { useCallback, useRef, useState, useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  areEntriesDirty,
  clearEntriesDirtyFlag,
  getAllEntries,
  getScrollPosition,
  saveScrollPosition,
  checkIsTodayWritten,
} from "@/utils/functions/storage";
import { getTodayId } from "@/utils/functions/getTodayId";
import {
  Entry,
  GradientColors,
  RatingColorsGradient,
  ScrollEvent,
} from "@/utils/types";
import { useTranslation } from "react-i18next";
import locale from "@/i18n";
import { TouchableOpacity } from "react-native-gesture-handler";
import { startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

export default function DiaryEntriesScreen() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [allEntries, setAllEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [textSearch, setTextSearch] = useState("");
  const [isTodayEntryWritten, setIsTodayEntryWritten] = useState(false);

  const entryBackgroundColor = useThemeColor({}, "soft");
  const contrast = useThemeColor({}, "contrast");
  const textColor = useThemeColor({}, "text");
  const entryColor = useThemeColor({}, "entry");
  const softContrast = useThemeColor({}, "softContrast");

  const parallaxRef = useRef<ParallaxScrollRef>(null);
  const hasLoadedEntriesOnce = useRef(false);
  const searchInputRef = useRef<TextInput>(null);
  const { t } = useTranslation();
  const colorScheme = useColorScheme();

  let position = 0;

  const today = useMemo(() => new Date(), []);
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Lunes
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Domingo

  const weekDays = [
    t("week_day.monday"),
    t("week_day.tuesday"),
    t("week_day.wednesday"),
    t("week_day.thursday"),
    t("week_day.friday"),
    t("week_day.saturday"),
    t("week_day.sunday"),
  ];

  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const entriesThisWeek = entries.filter((entry) => {
    const entryDate = new Date(entry.date || "");
    return isWithinInterval(entryDate, { start: weekStart, end: weekEnd });
  });

  const completedDays = entriesThisWeek.map((entry) =>
    new Date(entry.date || "").getDay()
  );

  const coverImage =
    colorScheme === "dark"
      ? require("@/assets/images/journal-list_cover_dark.webp")
      : require("@/assets/images/journal-list_cover_light.webp");

  const gradients: GradientColors = {
    purlple:
      colorScheme === "dark"
        ? ["#342f5850", "#1f1625aa"]
        : ["#e3f5fe", "#f1e3fb"],
    red:
      colorScheme === "dark"
      ? ["#3a1e1e80", "#3a2f1eaa"]
      : ["#f8d6d6", "#fff1daba"],
    orange:
      colorScheme === "dark"
        ? ["#b92a2cd0", "#a55d0094"]
        : ["#ff383bd0", "#ff910095"],
    green:
      colorScheme === "dark"
        ? ["#1b2e2a75", "#1b4a2175"]
        : ["#e6fdf2", "#effae4"],
    silver:
      colorScheme === "dark" ? ["#232527", "#1F1F22"] : ["#efefef", "#fcfcfc"],
  };

  const ratingColorsGradient: RatingColorsGradient = {
    5: {
      backgroundColor: ["#ECFDF5", "#D6F5E9"],
      color: "#2F5D50",
    },
    4: {
      backgroundColor: ["#E6F4FA", "#D3EDF7"],
      color: "#355A7A",
    },
    3: {
      backgroundColor: ["#FAF9E6", "#F4F1C8"],
      color: "#7A6405",
    },
    2: {
      backgroundColor: ["#FFF3E6", "#FFE3CC"],
      color: "#A05318",
    },
    1: {
      backgroundColor: ["#FFE4E6", "#FDCAD0"],
      color: "#B3364A",
    },
  };

  const handleScrollEvent = (event: ScrollEvent) => {
    position = event.nativeEvent.contentOffset.y;
  };

  const handleTextSearch = (text: string) => {
    setTextSearch(text);
    if (text.trim() === "") {
      setEntries(allEntries);
    } else {
      const filteredEntries = allEntries.filter((entry) =>
        entry.title?.toLowerCase().includes(text.toLowerCase())
      );
      setEntries(filteredEntries);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchEntries = async () => {
        const dirty = await areEntriesDirty();
        if (!dirty && hasLoadedEntriesOnce.current) {
          return;
        }

        setLoading(true);
        const storedEntries = await getAllEntries();
        if (!isActive) return;

        const sorted = storedEntries.sort((a: Entry, b: Entry) => {
          return new Date(b.id).getTime() - new Date(a.id).getTime();
        });
        setAllEntries(sorted);
        setEntries(sorted);

        const isTodayWritten = await checkIsTodayWritten();
        setIsTodayEntryWritten(isTodayWritten);

        hasLoadedEntriesOnce.current = true;
        setLoading(false);
        await clearEntriesDirtyFlag();

        requestAnimationFrame(async () => {
          const position = await getScrollPosition();
          parallaxRef.current?.scrollTo(position, true);
        });
      };

      fetchEntries();

      return () => {
        isActive = false;
      };
    }, [])
  );

  console.log("Is today entry written:", isTodayEntryWritten);
  console.log("Today's date:", today);
  

  return (
    <ParallaxScrollView
      ref={parallaxRef}
      onScroll={handleScrollEvent}
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={<Image source={coverImage} style={styles.coverImage} />}
    >
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: textColor }]}>
          {t("journal_list.title")}
        </Text>
        <Text style={styles.date}>{t("journal_list.caption")}</Text>
      </View>
      <View style={styles.dateSearchContainer}>
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: entryColor,
              shadowColor: contrast,
              borderColor: softContrast,
            },
          ]}
        >
          <TouchableOpacity onPress={() => searchInputRef.current?.focus()}>
            <IconSymbol
              name="magnifyingglass"
              size={20}
              color={textColor}
              style={styles.searchIconLeft}
            />
          </TouchableOpacity>
          <TextInput
            ref={searchInputRef}
            placeholder={t("journal_list.search_placeholder")}
            style={styles.searchInput}
            placeholderTextColor={textColor}
            value={textSearch}
            onChangeText={handleTextSearch}
          />
          {textSearch.length > 0 && (
            <TouchableOpacity onPress={() => handleTextSearch("")}>
              <IconSymbol
                name="xmark"
                size={20}
                color={textColor}
                style={styles.searchIconRight}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.weekContainer}>
        <View style={styles.weekHeader}>
          <Text style={[styles.weekTitle, { color: textColor }]}>
            {t("journal_list.week_entries")}
          </Text>
          <Text style={styles.weekSubtitle}>
            {entriesThisWeek.length}/7 {t("journal_list.days_completed")}
          </Text>
        </View>
        <View style={styles.weekGrid}>
          {weekDays.map((day, index) => {
            // Ajusta el índice del domingo para que coincida con 0
            const dayIndex = index === 6 ? 0 : index + 1;
            
            const hasEntry = completedDays.includes(dayIndex);
            const isToday = today.getDay() === dayIndex;

            return hasEntry ? (
              <LinearGradient
                key={index}
                colors={gradients.green}
                style={[
                  styles.dayCellGradient,
                  {
                    borderWidth: isToday ? 1.2 : 0,
                    borderColor: isToday ? "#84cc16" : "transparent",
                  },
                ]}
              >
                <View style={styles.dayCellInner}>
                  <Text
                    style={[
                      styles.dayLabel,
                      styles.dayLabelActive,
                      { color: textColor, shadowColor: contrast },
                    ]}
                  >
                    {day}
                  </Text>
                  <LinearGradient
                    colors={gradients.orange}
                    style={styles.dayIndicator}
                  />
                </View>
              </LinearGradient>
            ) : (
              <View
                key={index}
                style={[
                  styles.dayCell,
                  styles.dayCellInactive,
                  {
                    borderWidth: isToday ? 1.2 : 0,
                    borderColor: isToday ? "#B3364A" : "transparent",
                  },
                ]}
              >
                <Text
                  style={[styles.dayLabel, { color: entryBackgroundColor }]}
                >
                  {day}
                </Text>
                <View
                  style={[
                    styles.dayIndicator,
                    { backgroundColor: entryBackgroundColor },
                  ]}
                />
              </View>
            );
          })}
        </View>
      </View>
      {loading ? (
        <View style={{ padding: 20 }}>
          <ActivityIndicator size="large" color={textColor} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.listContent]}>
          <TouchableOpacity
            onPress={() => {
              saveScrollPosition(position);
              router.push(`/journal-editor/${getTodayId()}`);
            }}
          >
            <View
              style={[
                styles.entryShadowContainer,
                { shadowColor: contrast, margin: 0 },
              ]}
            >
              <LinearGradient
                colors={isTodayEntryWritten ? gradients.purlple : gradients.red }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.entryContainer,
                  styles.todayEntry,
                  { borderColor: softContrast },
                ]}
              >
                <Text style={[styles.entryDate, { fontSize: 13.5 }]}>
                  {today.toLocaleDateString(locale.language, options)}
                </Text>
                <Text
                  style={[
                    styles.entryTitle,
                    { color: textColor, fontSize: 21 },
                  ]}
                >
                  {t("journal_list.today_entry.title")}
                </Text>
                <Text
                  style={[styles.entryContent, { fontSize: 14.5 }]}
                  numberOfLines={2}
                >
                  {t("journal_list.today_entry.content")}
                </Text>
                <View style={styles.entryFooter}>
                  <LinearGradient
                    colors={ ratingColorsGradient[3].backgroundColor}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.starsGradientContainer}
                  >
                    <Text
                      style={[
                        styles.entryStars,
                        { color: ratingColorsGradient[3].color },
                      ]}
                    >
                      Stars: 3/5
                    </Text>
                  </LinearGradient>
                  <Feather name="chevron-right" size={19} color={textColor} />
                </View>
              </LinearGradient>
            </View>
          </TouchableOpacity>

          {entries.map((item: Entry) => {
            const ratingStyle = ratingColorsGradient[item.rating ?? 1] || {
              backgroundColor: ["#E5E7EB", "#D1D5DB"],
              color: "#374151",
            };

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
                    <Text style={[styles.entryTitle, { color: textColor }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.entryContent]} numberOfLines={2}>
                      {item.content}
                    </Text>
                    <View style={[styles.entryFooter]}>
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
                      <Feather
                        name="chevron-right"
                        size={16}
                        color={textColor}
                      />
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
  headerImage: {
    position: "absolute",
    left: -35,
    bottom: -90,
    color: "#808080",
  },
  coverImage: {
    position: "absolute",
    height: "100%",
    width: "100%",
    objectFit: "cover",
  },
  header: {
    marginBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
  },
  date: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },

  // Búsqueda
  dateSearchContainer: {}, // wrapper para la búsqueda
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 5,
    borderWidth: 0.5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchIconLeft: {
    marginRight: 8,
  },
  searchIconRight: {
    marginLeft: 8,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 8,
    fontSize: 16,
    color: "#000",
  },

  // Lista de entradas
  listContent: {
    paddingBottom: 20,
  },
  entryContainer: {
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
  entryCard: {
    margin: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
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
  todayEntry: {
    borderWidth: 0,
  },

  // Semana
  weekContainer: {
    marginVertical: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000",
  },
  weekSubtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  weekGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  // Días de la semana (celdas)
  dayCell: {
    width: "13%",
    height: 48,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  dayCellActive: {
    backgroundColor: "rgba(0,122,255,0.1)",
    borderColor: "rgba(0,122,255,0.2)",
  },
  dayCellInactive: {},
  dayLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  dayLabelActive: {},
  dayIndicator: {
    width: 8,
    height: 8,
    borderRadius: 5,
    marginTop: 4,
  },
  dayCellGradient: {
    width: "13%",
    height: 48,
    borderWidth: 1,
    borderRadius: 5,
    padding: 6,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  dayCellInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  starsGradientContainer: {
    borderRadius: 5,
    padding: 5,
  },
});
