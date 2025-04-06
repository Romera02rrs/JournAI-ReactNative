import { useCallback, useRef, useState, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeColor } from "@/hooks/useThemeColor";
import { startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { useTranslation } from "react-i18next";
import { Entry, GradientColors } from "@/utils/types/";
import { useColorScheme } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function WeekDay({ entries }: { entries: Entry[] }) {
  const entryBackgroundColor = useThemeColor({}, "soft");
  const textColor = useThemeColor({}, "text");
  const contrast = useThemeColor({}, "contrast");
  const softContrast = useThemeColor({}, "softContrast");

  const { t } = useTranslation();
  const colorScheme = useColorScheme();

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

  const entriesThisWeek = entries.filter((entry) => {
    const entryDate = new Date(entry.date || "");
    return isWithinInterval(entryDate, { start: weekStart, end: weekEnd });
  });

  const completedDays = entriesThisWeek.map((entry) =>
    new Date(entry.date || "").getDay()
  );

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
        ? ["#1f363275", "#1a451c75"]
        : ["#d4fcf6", "#eaf8dd"],
    silver:
      colorScheme === "dark" ? ["#232527", "#1F1F22"] : ["#efefef", "#fcfcfc"],
  };

  return (
    <View style={[styles.entryShadowContainer, { shadowColor: contrast }]}>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        colors={gradients.silver}
        style={[styles.weekContainer, { borderColor: softContrast }]}
      >
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
              <View
                key={index}
                style={[
                  styles.dayCellGradient,
                  styles.shadowContainer,
                  { shadowColor: contrast },
                ]}
              >
                <LinearGradient
                  start={{ x: 1, y: 1 }}
                  end={{ x: 1, y: 0 }}
                  colors={gradients.green}
                  style={[
                    styles.linearGradientContainer,
                    {
                      borderWidth: isToday ? 1.2 : 0,
                      borderColor: isToday ? "#4caf50" : "transparent",
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
                    <View
                      style={{
                        width: "100%",
                        height: 1,
                        backgroundColor: contrast,
                        marginVertical: 5,
                      }}
                    />
                    <Feather name="edit-3" size={16} color={contrast} />
                  </View>
                </LinearGradient>
              </View>
            ) : (
              <View
                key={index}
                style={[
                  styles.dayCell,
                  styles.dayCellInactive,
                  isToday && styles.todayDayCellInactive,
                  
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
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  entryShadowContainer: {
    borderRadius: 5,
    shadowOpacity: 0.07,
    shadowRadius: 5,
    shadowOffset: { width: 1, height: 2 },
  },
  date: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  entryDate: {
    fontSize: 12,
    marginBottom: 4,
    color: "#6b7280",
  },
  weekContainer: {
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 24,

    padding: 16,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: "600",
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
    width: "11%",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  dayCellActive: {},
  dayCellInactive: {
    padding: 6,
    paddingBottom: 18.8,
  },
  todayDayCellInactive: {
    backgroundColor: "#f4433614",
    borderWidth: 1.2,
    borderColor: "#f4433661",
  },
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
  shadowContainer: {
    borderRadius: 5,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 1, height: 2 },
  },
  dayCellGradient: {
    width: "11%",
    borderRadius: 5,
  },
  linearGradientContainer: {
    margin: 0,
    padding: 6,
    borderRadius: 5,
  },
  dayCellInner: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
});
