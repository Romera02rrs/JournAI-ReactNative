import React from "react";
import { TouchableOpacity, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { saveScrollPosition } from "@/utils/functions/storage";
import locale from "@/i18n";
import { GradientColors, Entry } from "@/utils/types";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import {
  dateFormatOptions,
  editableEntriesDates,
} from "@/utils/functions/dateUtils";
import { ratingColorsGradient } from "@/constants/Colors";
import { useTranslation } from "react-i18next";
import { useThemeColor } from "@/hooks/useThemeColor";

const EditableEntries = ({
  allEntries,
  gradients,
  position,
}: {
  allEntries: Entry[];
  gradients: GradientColors;
  position: number;
}) => {
  const { t } = useTranslation();
  const contrast = useThemeColor({}, "contrast");
  const textColor = useThemeColor({}, "text");
  const softContrast = useThemeColor({}, "softContrast");

  // Obtenemos las fechas faltantes (si las hay)
  const datesToRender = editableEntriesDates(allEntries);

  console.log("EditableEntries datesToRender", datesToRender);
  

  
  // Si no hay fechas para renderizar, no mostramos nada
  if (datesToRender.length === 0) {
    return null;
  }

  // Función que asigna los textos adecuados según el día
  const getPlaceholderTexts = (dateId: string) => {
    const yesterdayStr = datesToRender[0];
    const dayBeforeYesterdayStr = datesToRender[1];

    if (dateId === yesterdayStr) {
      return {
        title: t("journal_list.yesterday_entry.title"),
        content: t("journal_list.yesterday_entry.content"),
        noTitle: t("journal_list.yesterday_entry.yesterday_no_title"),
        noContent: t("journal_list.yesterday_entry.yesterday_no_content"),
      };
    } else if (dateId === dayBeforeYesterdayStr) {
      return {
        title: t("journal_list.entry_from_two_days_ago.title"),
        content: t("journal_list.entry_from_two_days_ago.content"),
        noTitle: t("journal_list.entry_from_two_days_ago.two_days_ago_no_title"),
        noContent: t("journal_list.entry_from_two_days_ago.two_days_ago_no_content"),
      };
    }
    return { title: "", content: "", noTitle: "", noContent: "" };
  };

  return (
    <View>
      {datesToRender.map((dateId) => {
        // Busca la entrada si existe             
        if (dateId === getToday()) return null; 
        const entry = allEntries.find((item) => item.id === dateId);
        const placeholderTexts = getPlaceholderTexts(dateId);

        return (
          <TouchableOpacity
            key={dateId}
            onPress={() => {
              saveScrollPosition(position);
              router.push(`/journal-editor/${dateId}/?edit=true`);
            }}
          >
            <View style={[styles.entryShadowContainer, { shadowColor: contrast }]}>
              <LinearGradient
                colors={gradients.silver}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.entryContainer, { borderColor: softContrast }]}
              >
                <Text style={styles.entryDate}>
                  {new Date(dateId).toLocaleDateString(
                    locale.language,
                    dateFormatOptions
                  )}
                </Text>
                <Text
                  style={[
                    styles.entryTitle,
                    { color: textColor },
                    (!entry || !entry.title || entry.title.trim() === "") && {
                      color: "#6b7280",
                    },
                  ]}
                >
                  {entry && entry.title && entry.title.trim() !== ""
                    ? entry.title
                    : placeholderTexts.noTitle}
                </Text>
                <Text style={styles.entryContent} numberOfLines={2}>
                  {entry && entry.content && entry.content.trim() !== ""
                    ? entry.content
                    : placeholderTexts.noContent}
                </Text>
                <View style={styles.entryFooter}>
                  {entry &&
                  entry.rating !== null &&
                  entry.rating !== undefined ? (
                    <View style={styles.shadowContainer}>
                      <LinearGradient
                        colors={
                          ratingColorsGradient[entry.rating ?? 1]
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
                                ratingColorsGradient[entry.rating ?? 1].color,
                            },
                          ]}
                        >
                          Stars: {entry.rating}/5
                        </Text>
                      </LinearGradient>
                    </View>
                  ) : (
                    <Text style={styles.EntryNoRating}>
                      {t("journal_list.today_entry.today_no_rating")}
                    </Text>
                  )}
                  <Feather name="edit-3" size={16} color={textColor} />
                </View>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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

export default EditableEntries;
