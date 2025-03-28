import { useState, useRef, useCallback } from "react";
import {
  Text,
  ScrollView,
  ActivityIndicator,
  View,
  TextInput as RNTextInput,
  Image,
  StyleSheet,
} from "react-native";
import ParallaxScrollView, {
  ParallaxScrollRef,
} from "@/components/ParallaxScrollView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColor } from "@/hooks/useThemeColor";
import { TouchableOpacity } from "react-native-gesture-handler";
import { TextInput } from "react-native";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import {
  getAllEntries,
  areEntriesDirty,
  saveScrollPosition,
  getScrollPosition,
  clearEntriesDirtyFlag,
} from "@/utils/functions/storage";
import { Entry, ScrollEvent } from "@/utils/types";
import { getTodayId } from "@/utils/functions/getTodayId";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "react-native";
import locale from "@/i18n";
import { Feather } from "@expo/vector-icons";

const today = new Date();
const options: Intl.DateTimeFormatOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};

export default function DiaryEntriesScreen() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [allEntries, setAllEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [textSearch, setTextSearch] = useState("");

  const entryBackgroundColor = useThemeColor({}, "soft");
  const contrast = useThemeColor({}, "contrast");
  const textColor = useThemeColor({}, "text");
  const entryColor = useThemeColor({}, "entry");
  const softContrast = useThemeColor({}, "softContrast");

  const parallaxRef = useRef<ParallaxScrollRef>(null);
  const hasLoadedEntriesOnce = useRef(false);
  const searchInputRef = useRef<RNTextInput>(null);
  const { t } = useTranslation();
  const colorScheme = useColorScheme();

  let position = 0;

  const weekDays = [
    t("week_day.monday"),
    t("week_day.tuesday"),
    t("week_day.wednesday"),
    t("week_day.thursday"),
    t("week_day.friday"),
    t("week_day.saturday"),
    t("week_day.sunday"),
  ];

  const coverImage =
    colorScheme === "dark"
      ? require("@/assets/images/journal-list_cover_dark.webp")
      : require("@/assets/images/journal-list_cover_light.webp");

  const gradients = {
    purlple:
      colorScheme === "dark"
        ? (["#2e2a4d50", "#261b2eaa"] as [string, string])
        : (["#e3f5fe", "#f1e3fb"] as [string, string]),
    orange:
      colorScheme === "dark"
        ? (["#b92a2cd0", "#a55d0094"] as [string, string])
        : (["#ff383bd0", "#ff910095"] as [string, string]),
    green:
      colorScheme === "dark"
        ? (["#192b2775", "#1a433675"] as [string, string])
        : (["#e6fdf2", "#effae4"] as [string, string]),
    silver:
      colorScheme === "dark"
        ? (["#232527", "#1F1F22"] as [string, string])
        : (["#efefef", "#fcfcfc"] as [string, string]),
  };

  const ratingColorsGradient = {
    5: {
      backgroundColor: ["#ECFDF5", "#D6F5E9"],
      color: "#2F5D50", // Verde medio oscuro
    },
    4: {
      backgroundColor: ["#E6F4FA", "#D3EDF7"],
      color: "#355A7A", // Azul apagado, medio oscuro
    },
    3: {
      backgroundColor: ["#FAF9E6", "#F4F1C8"],
      color: "#7A6405", // Mostaza tostado, más sobrio
    },
    2: {
      backgroundColor: ["#FFF3E6", "#FFE3CC"],
      color: "#A05318", // Naranja tierra, medio apagado
    },
    1: {
      backgroundColor: ["#FFE4E6", "#FDCAD0"],
      color: "#B3364A", // Rojo apagado, tipo cereza suave
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
            5/7 {t("journal_list.days_completed")}
          </Text>
        </View>
        <View style={styles.weekGrid}>
          {weekDays.map((day, index) => {
            const hasEntry = [0, 1, 2, 4, 5].includes(index);
            return hasEntry ? (
              <LinearGradient
                key={index}
                colors={gradients.green}
                style={[styles.dayCellGradient, { borderColor: softContrast }]}
              >
                <View style={styles.dayCellInner}>
                  <Text style={styles.dayLabel}>{day}</Text>
                  <LinearGradient
                    colors={gradients.orange}
                    style={styles.dayIndicator}
                  />
                </View>
              </LinearGradient>
            ) : (
              <View
                key={index}
                style={[styles.dayCell, styles.dayCellInactive]}
              >
                <Text style={styles.dayLabel}>{day}</Text>
                <View
                  style={[styles.dayIndicator, styles.dayIndicatorInactive]}
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
                colors={gradients.purlple}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.entryContainer,
                  styles.todayEntry,
                  { borderColor: softContrast },
                ]}
              >
                <Text style={[styles.entryDate, { fontSize: 13.5 }]}>
                  miércoles, 29 de marzo de 2023
                </Text>
                <Text
                  style={[
                    styles.entryTitle,
                    { color: textColor, fontSize: 21 },
                  ]}
                >
                  El día de hoy
                </Text>
                <Text
                  style={[styles.entryContent, { fontSize: 14.5 }]}
                  numberOfLines={2}
                >
                  Hoy ha sido un buen día en el trabajo, he ido al gym y he
                  comido bien. Despúes de la cena he visto una serie y he
                  escrito un poco en mi diario. Me siento satisfecho con lo que
                  he logrado y listo para enfrentar nuevos desafíos. ¡El
                  aprendizaje continuo es clave para crecer profesionalmente!.
                </Text>
                <View style={styles.entryFooter}>
                  <Feather name="chevron-right" size={19} color={textColor} />
                </View>
              </LinearGradient>
            </View>
          </TouchableOpacity>

          {entries.map((item: Entry) => {
            const ratingStyle = ratingColorsGradient[
              (item.rating ?? 1) as 1 | 2 | 3 | 4 | 5
            ] || {
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
                        colors={ratingStyle.backgroundColor as [string, string]} // Usa el gradiente del rating
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
    color: "#000",
  },
  dayIndicator: {
    width: 8,
    height: 8,
    borderRadius: 5,
    marginTop: 4,
  },
  dayIndicatorActive: {
    backgroundColor: "blue",
  },
  dayIndicatorInactive: {
    backgroundColor: "rgba(0,0,0,0.3)",
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
