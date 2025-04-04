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
  getTodayEntry,
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

export default function DiaryEntriesScreen() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [allEntries, setAllEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [textSearch, setTextSearch] = useState("");
  const [isTodayEntryWritten, setIsTodayEntryWritten] = useState(false);
  const [todayEntry, setTodayEntry] = useState<Entry | null>(null);

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

  const isRecentEntry = (entryDate: string | undefined) => {
    if (!entryDate) return false;
    const entryDay = new Date(entryDate).setHours(0, 0, 0, 0);
    const todayDay = today.setHours(0, 0, 0, 0);
    const yesterdayDay = new Date(today);
    yesterdayDay.setDate(today.getDate() - 1);
    const dayBeforeYesterday = new Date(today);
    dayBeforeYesterday.setDate(today.getDate() - 2);

    return (
      entryDay === todayDay ||
      entryDay === yesterdayDay.setHours(0, 0, 0, 0) ||
      entryDay === dayBeforeYesterday.setHours(0, 0, 0, 0)
    );
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

        if (isTodayWritten) {
          const entry = await getTodayEntry();
          setTodayEntry(entry);
        } else {
          setTodayEntry(null);
        }

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
  console.log("Today's entry:", todayEntry);

  return (
    <ParallaxScrollView
      ref={parallaxRef}
      onScroll={handleScrollEvent}
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={<Image source={coverImage} style={styles.coverImage} />}
    >
      
      <View style={[styles.section, { marginBottom: 21 }]}>
        <Text style={[styles.greeting, { color: textColor }]}>
          {t("journal_list.title")}
        </Text>
        <Text style={styles.date}>{t("journal_list.caption")}</Text>
      </View>

      <View style={[styles.dateSearchContainer, styles.section]}>
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
            style={[styles.searchInput, { color: textColor }]}
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

      {loading ? (
        <View style={{ padding: 20 }}>
          <ActivityIndicator size="large" color={textColor} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.listContent]}>

          {/* Today's Entry */}
          <TouchableOpacity
            onPress={() => {
              saveScrollPosition(position);
              router.push(`/journal-editor/${getTodayId()}`);
            }}
          >
            <View
              style={[styles.entryShadowContainer, { shadowColor: contrast }]}
            >
              <LinearGradient
                colors={isTodayEntryWritten ? gradients.purlple : gradients.red}
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
                  {isTodayEntryWritten
                    ? todayEntry?.title === "" ||
                      todayEntry?.title === undefined
                      ? t("journal_list.today_entry.today_no_title")
                      : todayEntry?.title
                    : t("journal_list.today_entry.title")}
                </Text>
                <Text
                  style={[styles.entryContent, { fontSize: 14.5 }]}
                  numberOfLines={2}
                >
                  {isTodayEntryWritten
                    ? todayEntry?.content === "" ||
                      todayEntry?.content === undefined
                      ? t("journal_list.today_entry.today_no_content")
                      : todayEntry?.content
                    : t("journal_list.today_entry.content")}
                </Text>
                <View style={styles.entryFooter}>
                  {isTodayEntryWritten &&
                  todayEntry &&
                  (todayEntry.rating ?? 0) > 0 ? (
                    <LinearGradient
                      colors={
                        ratingColorsGradient[todayEntry.rating ?? 1]
                          .backgroundColor
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.starsGradientContainer}
                    >
                      <Text
                        style={[
                          styles.entryStars,
                          {
                            color:
                              ratingColorsGradient[todayEntry.rating ?? 1]
                                .color,
                          },
                        ]}
                      >
                        Stars: {todayEntry.rating}/5
                      </Text>
                    </LinearGradient>
                  ) : (
                    <Text style={styles.TodayNoRating}>
                      {t("journal_list.today_entry.today_no_rating")}
                    </Text>
                  )}
                  <Feather name="chevron-right" size={19} color={textColor} />
                </View>
              </LinearGradient>
            </View>
          </TouchableOpacity>
            
          {/* Entry list */}
          {entries.map((item: Entry) => {
            if (item.id === getTodayId()) return null; // Skip today's entry

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
                        name={isRecentEntry(item.date) ? "chevron-right" : "lock"}
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
  todayEntry: {
    borderWidth: 0,
  },
  TodayNoRating: {
    fontSize: 12,
    color: "#6b7280",
    borderRadius: 5,
    padding: 4,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  starsGradientContainer: {
    borderRadius: 5,
    padding: 5,
  },
});
