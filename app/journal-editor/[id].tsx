import { useCallback, useRef, useState, useMemo } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Dimensions,
  Text,
  ActivityIndicator,
} from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import debounce from "lodash/debounce";
import {
  getEntryById,
  updateEntry,
  selectAndSaveImage,
} from "@/utils/functions/storage";
import { Entry, PanHandlerStateChangeEvent, Rating } from "@/utils/types";
import { TouchableOpacity } from "react-native-gesture-handler";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { getTodayId } from "@/utils/functions/getTodayId";
import { map } from "lodash";
import { useTranslation } from "react-i18next";

export default function NotesScreen() {
  const { t } = useTranslation();
  const defaultImage = Image.resolveAssetSource(
    require("@/assets/images/entry_default_cover_min.webp")
  ).uri;

  const { id: routeId } = useLocalSearchParams();
  const id = useMemo(() => {
    return routeId || getTodayId();
  }, [routeId]);
  console.log("ID:", id);

  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(getTodayId());
  const [image, setImage] = useState(defaultImage);
  const [rating, setRating] = useState<number>(0);
  const ratings: Rating[] = [1, 2, 3, 4, 5];
  const [showMoodOptions, setShowMoodOptions] = useState(false);
  const [mood, setMood] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");

  const handleContentSizeChange = useCallback(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, []);

  const onPanHandlerStateChange = useCallback(
    (event: PanHandlerStateChangeEvent) => {
      if (
        (event.nativeEvent.state === State.END ||
          event.nativeEvent.oldState === State.ACTIVE) &&
        event.nativeEvent.translationX > 10
      ) {
        router.back();
      }
    },
    [router]
  );

  useFocusEffect(
    useCallback(() => {
      const fetchEntries = async () => {
        const entry = await getEntryById(Array.isArray(id) ? id[0] : id);
        if (entry) {
          setText(entry.content || "");
          setTitle(entry.title || "");
          setDate(entry.date || "");
          setRating(entry.rating || 0);
          setImage(entry.imageUri || defaultImage);
          setMood(entry.mood || "");
        }
        setLoading(false);
      };

      fetchEntries();
    }, [defaultImage, id])
  );

  const saveChanges = useMemo(() => {
    return debounce(async (updatedField: Partial<Entry>) => {
      if (!id) return;

      setIsSaving(true); // Inicia el indicador de guardado

      await updateEntry({
        id: Array.isArray(id) ? id[0] : id,
        ...updatedField,
      });

      setIsSaving(false); // Detén el indicador de guardado
    }, 500);
  }, [id]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    saveChanges({ title: newTitle });
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    saveChanges({ content: newText });
  };

  const handleRatingChange = (newRating: Rating) => {
    setRating(newRating);
    saveChanges({ rating: newRating });
  };

  const handleImageChange = async () => {
    const imageUri = await selectAndSaveImage();

    if (imageUri) {
      setImage(imageUri);
      await saveEntryImage(imageUri);
    } else {
      console.log("No se seleccionó ninguna imagen.");
    }
  };

  const saveEntryImage = async (newImageUri: string) => {
    if (!id) return;

    const entry: Entry = {
      id: Array.isArray(id) ? id[0] : id,
      date: Array.isArray(id) ? id[0] : id,
      title,
      content: text,
      imageUri: newImageUri,
    };

    await updateEntry(entry);
  };

  const handleMoodChange = (newMood: string) => {
    setMood(newMood);
    saveChanges({ mood: newMood });
    setShowMoodOptions(false);
  };

  return (
    <PanGestureHandler
      activeOffsetX={10}
      failOffsetY={[-5, 5]}
      onHandlerStateChange={onPanHandlerStateChange}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <TouchableOpacity onPress={handleImageChange}>
          <Image source={{ uri: image }} style={styles.coverImage} />
        </TouchableOpacity>
        {loading ? (
          <View style={{ padding: 20 }}>
            <ActivityIndicator size="large" color={textColor} />
          </View>
        ) : (
          <>
            {isSaving && (
              <View style={styles.savingIndicator}>
                <ActivityIndicator size="small" color={textColor} />
              </View>
            )}
            
            <View style={styles.subheading}>
              <Text style={styles.dateText}>{date}</Text>

              {/* Botón Mood sobrepuesto sin alterar el layout */}
              <View style={styles.moodButtonContainer}>
                <TouchableOpacity
                  style={styles.moodButton}
                  onPress={() => setShowMoodOptions(!showMoodOptions)}
                >
                  <Text style={[styles.moodButtonText, { color: textColor }]}>
                    {mood ? mood : "Mood"}
                  </Text>
                </TouchableOpacity>
              </View>
              {showMoodOptions && (
                <View style={styles.moodOptionsOverlay}>
                  {["😀", "😐", "😢", "😡", "🤔", "😴", "😍", "😎"].map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.moodOptionButton}
                      onPress={() => {
                        handleMoodChange(option);
                      }}
                    >
                      <Text style={styles.moodOptionText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={styles.ratingContainer}>
                {map(ratings, (i, _index) => (
                  <TouchableOpacity
                    key={_index}
                    onPress={() => handleRatingChange(i)}
                  >
                    <IconSymbol
                      name={i <= rating ? "star.fill" : "star"}
                      size={20}
                      color={textColor}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.separator} />
            <View style={styles.header}>
              <TextInput
                style={[styles.titleInput, { color: textColor }]}
                placeholder={t("journal_editor.title_placeholder")}
                placeholderTextColor="#999"
                maxLength={100}
                value={title}
                onChangeText={handleTitleChange}
              />
            </View>
            <ScrollView
              ref={scrollViewRef}
              style={styles.scrollView}
              keyboardDismissMode="interactive"
              showsVerticalScrollIndicator={false}
            >
              <TextInput
                style={[
                  styles.noteInput,
                  {
                    fontSize: 17,
                    color: textColor,
                  },
                ]}
                multiline
                value={text}
                onChangeText={handleTextChange}
                placeholder={t("journal_editor.content_placeholder")}
                placeholderTextColor="#999"
                onContentSizeChange={handleContentSizeChange}
                autoCapitalize="sentences"
                textAlignVertical="top"
              />
            </ScrollView>
          </>
        )}
      </KeyboardAvoidingView>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  coverImage: {
    width: Dimensions.get("window").width,
    height: 250,
    resizeMode: "cover",
  },
  savingIndicator: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#fff",
    padding: 5,
    borderRadius: 5,
    zIndex: 1,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  subheading: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 16,
    position: "relative", // importante para posicionar el overlay
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 10,
  },
  titleInput: {
    fontSize: 28,
    fontWeight: "600",
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    color: "#999",
    marginBottom: 10,
  },
  separator: {
    height: 1,
    backgroundColor: "#CCC",
    marginHorizontal: 16,
    marginTop: 6.5,
    marginBottom: 13,
  },
  scrollView: {
    flex: 1,
  },
  noteInput: {
    flex: 1,
    lineHeight: 26,
    paddingHorizontal: 16,
    marginBottom: 100,
    minHeight: "100%",
  },
  moodButtonContainer: {
    justifyContent: "center",
    marginBottom: 10,
  },
  moodButton: {
    backgroundColor: "#eee",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  moodButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  moodOptionsOverlay: {
    position: "absolute",
    top: 60, // ajusta según altura del header/subheading
    alignSelf: "center",
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 5,
    zIndex: 20,
    elevation: 5,
  },
  moodOptionButton: {
    padding: 8,
    marginHorizontal: 4,
    backgroundColor: "#f2f2f2",
    borderRadius: 5,
  },
  moodOptionText: {
    fontSize: 22,
  },
});
