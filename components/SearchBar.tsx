import { useRef, useState, useCallback } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { StyleSheet, TextInput, View, Animated, Easing } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useTranslation } from "react-i18next";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useFocusEffect } from "@react-navigation/native";

const SearchBar = ({
  setEntries,
  allEntries,
}: {
  setEntries: (entries: any[]) => void;
  allEntries: any[];
}) => {
  const [textSearch, setTextSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const shadowAnim = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef<TextInput>(null);
  const { t } = useTranslation();

  const entryColor = useThemeColor({}, "entry");
  const contrast = useThemeColor({}, "contrast");
  const textColor = useThemeColor({}, "text");

  const handleTextSearch = (text: string) => {
    setTextSearch(text);
    if (text.trim() === "") {
      setTextSearch("");
      setEntries(allEntries);
    } else {
      const filteredEntries = allEntries.filter((entry) =>
        entry.title?.toLowerCase().includes(text.toLowerCase())
      );
      setEntries(filteredEntries);
    }
  };

  const handleFocus = () => {
    setIsSearchFocused(true);
    Animated.timing(shadowAnim, {
      toValue: 1,
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsSearchFocused(false);
    Animated.timing(shadowAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  const shadowOpacity = shadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.35],
  });

  useFocusEffect(
    useCallback(() => {
      setTextSearch("");
      setEntries(allEntries);
    }, [allEntries])
  );

  return (
    <View style={[styles.dateSearchContainer, styles.section]}>
      <Animated.View
        style={[
          styles.searchContainer,
          {
            backgroundColor: entryColor,
            shadowColor: contrast,
            shadowOpacity: shadowOpacity,
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
          onFocus={handleFocus}
          onBlur={handleBlur}
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
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Búsqueda
  dateSearchContainer: {}, // wrapper para la búsqueda
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 5,
    shadowRadius: 5,
    shadowOffset: { width: 2, height: 2 },
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
  section: {
    marginBottom: 24,
  },
});

export default SearchBar;
