import { useMemo, useState, useCallback } from "react";
import locale from "@/i18n";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ratingColorsGradient } from "@/constants/Colors";
import { dateFormatOptions, getToday } from "@/utils/functions/dateUtils";
import { Entry, GradientColors } from "@/utils/types";
import {
  saveScrollPosition,
  checkIsTodayWritten,
  getTodayEntry,
} from "@/utils/functions/storage";
import { useFocusEffect } from "@react-navigation/native";

const TodayEntry = ({ position }: { position: number }) => {
  const [isTodayEntryWritten, setIsTodayEntryWritten] = useState(false);
  const [todayEntry, setTodayEntry] = useState<Entry | null>(null);
  const { t } = useTranslation();
  const today = useMemo(() => new Date(), []);

  const contrast = useThemeColor({}, "contrast");
  const textColor = useThemeColor({}, "text");
  const softContrast = useThemeColor({}, "softContrast");

  const colorScheme = useColorScheme();

  const gradients: GradientColors = {
    purlple:
      colorScheme === "dark"
        ? ["#342f5850", "#1f1625aa"]
        : ["#e3f5fe", "#f1e3fb"],
    red:
      colorScheme === "dark"
        ? ["#3a1e1e80", "#3a2f1eaa"]
        : ["#f8d6d6", "#fff1daba"],
  };

  useFocusEffect(
    useCallback(() => {
      const fetchEntries = async () => {
        const isTodayWritten = await checkIsTodayWritten();
        setIsTodayEntryWritten(isTodayWritten);
        setTodayEntry(isTodayWritten ? await getTodayEntry() : null);
      };

      fetchEntries();
    }, [])
  );

  return (
    <TouchableOpacity
      onPress={() => {
        saveScrollPosition(position);
        router.push(`/journal-editor/${getToday()}`);
      }}
    >
      <View style={[styles.entryShadowContainer, { shadowColor: contrast }]}>
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
            {today.toLocaleDateString(locale.language, dateFormatOptions)}
          </Text>
          <Text style={[styles.entryTitle, { color: textColor, fontSize: 21 }]}>
            {isTodayEntryWritten
              ? todayEntry?.title === "" || todayEntry?.title === undefined
                ? t("journal_list.today_entry.today_no_title")
                : todayEntry?.title
              : t("journal_list.today_entry.title")}
          </Text>
          <Text
            style={[styles.entryContent, { fontSize: 14.5 }]}
            numberOfLines={2}
          >
            {isTodayEntryWritten
              ? todayEntry?.content === "" || todayEntry?.content === undefined
                ? t("journal_list.today_entry.today_no_content")
                : todayEntry?.content
              : t("journal_list.today_entry.content")}
          </Text>
          <View style={styles.entryFooter}>
            {isTodayEntryWritten &&
            todayEntry &&
            (todayEntry.rating ?? 0) > 0 ? (
              <View style={styles.shadowContainer}>
                <LinearGradient
                  colors={
                    ratingColorsGradient[todayEntry.rating ?? 1].backgroundColor
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
                          ratingColorsGradient[todayEntry.rating ?? 1].color,
                      },
                    ]}
                  >
                    Stars: {todayEntry.rating}/5
                  </Text>
                </LinearGradient>
              </View>
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
  );
};

const styles = StyleSheet.create({
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
  shadowContainer: {
    borderRadius: 5,
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 1, height: 2 },
    shadowColor: "#000",
  },
  TodayNoRating: {
    fontSize: 12,
    color: "#6b7280",
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 7,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  starsGradientContainer: {
    borderRadius: 5,
    padding: 5,
  },
});

export default TodayEntry;
