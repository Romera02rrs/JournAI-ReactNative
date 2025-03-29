import { useState, useRef, useCallback } from "react";
import {
  StyleSheet,
  Text,
  ScrollView,
  ActivityIndicator,
  View,
  TextInput as RNTextInput,
  Image,
} from "react-native";
import ParallaxScrollView, {
  ParallaxScrollRef,
} from "@/components/ParallaxScrollView";
import { ThemedView } from "@/components/ThemedView";
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

export default function OldEntryList() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [allEntries, setAllEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [textSearch, setTextSearch] = useState("");

  const entryBackgroundColor = useThemeColor({}, "soft");
  const textColor = useThemeColor({}, "text");

  const parallaxRef = useRef<ParallaxScrollRef>(null);
  const hasLoadedEntriesOnce = useRef(false);
  const searchInputRef = useRef<RNTextInput>(null);

  let position = 0;

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
      useGradient
      ref={parallaxRef}
      onScroll={handleScrollEvent}
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <Image
          source={require("@/assets/images/Journal-list_cover.webp")}
          style={styles.coverImage}
        />
      }
    >
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: entryBackgroundColor },
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
          placeholder="Search"
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
            <LinearGradient
              //colors={['#FFEA70', '#FFA000']}
              colors={["#f5d166", "#e5ab4f"]} // Colores más mate y menos vibrantes
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.entryContainer, styles.todayEntry]}
            >
              <Text style={[styles.entryDate, { color: "#3E2C00" }]}>
                TODAY
              </Text>
              <Text
                style={[
                  styles.entryTitle,
                  { color: "#3E2C00", fontWeight: "600" },
                ]}
              >
                TODAY
              </Text>
              <Text
                style={[styles.entryContent, { color: "#3E2C00" }]}
                numberOfLines={2}
              >
                TODAY
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {entries.map((item: Entry) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => {
                saveScrollPosition(position);
                router.push(`/journal-editor/${item.id}`);
              }}
            >
              <ThemedView
                style={[
                  styles.entryContainer,
                  { backgroundColor: entryBackgroundColor as string },
                ]}
              >
                <Text style={[styles.entryDate, { color: textColor }]}>
                  {item.date}
                </Text>
                <Text style={[styles.entryTitle, { color: textColor }]}>
                  {item.title}
                </Text>
                <Text
                  style={[styles.entryContent, { color: textColor }]}
                  numberOfLines={2}
                >
                  {item.content}
                </Text>
              </ThemedView>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  coverImage: {
    objectFit: "cover",
    position: "absolute",
    height: "100%",
    width: "100%",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: 'transparent',
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchIconLeft: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 8,
    fontSize: 16,
    color: "#000",
  },
  searchIconRight: {
    marginLeft: 8,
  },
  listContent: {
    paddingBottom: 20,
  },
  entryContainer: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  entryDate: {
    fontSize: 12,
    marginBottom: 4,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  entryContent: {
    fontSize: 14,
  },
  todayEntry: {
    backgroundColor: "#FFD700", // Gold
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
});