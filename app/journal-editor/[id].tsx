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

export default function NotesScreen() {
  const defaultImage = Image.resolveAssetSource(
    require("@/assets/images/entry_default_cover_min.webp")
  ).uri;

  const { id: routeId } = useLocalSearchParams();
  const id = useMemo(() => {
    return routeId || getTodayId();
  }, [routeId]);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [date] = useState("");
  const [image, setImage] = useState(defaultImage);
  const [rating, setRating] = useState<number>(0);
  const ratings: Rating[] = [1, 2, 3, 4, 5];

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
          setRating(entry.rating || 0);
          setImage(entry.imageUri || defaultImage);
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
            <View style={styles.header}>
              <TextInput
                style={[styles.titleInput, { color: textColor }]}
                placeholder="Title"
                placeholderTextColor="#999"
                maxLength={100}
                value={title}
                onChangeText={handleTitleChange}
              />
            </View>
            <View style={styles.subheading}>
              <Text style={styles.dateText}>{date}</Text>
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
                placeholder="Note"
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
    paddingTop: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  subheading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  titleInput: {
    fontSize: 28,
    fontWeight: "600",
    flex: 1,
  },
  dateText: {
    marginTop: 16,
    marginBottom: 16,
    fontSize: 14,
    color: "#999",
  },
  separator: {
    height: 1,
    backgroundColor: "#CCC",
    marginHorizontal: 16,
    marginBottom: 16,
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
});
