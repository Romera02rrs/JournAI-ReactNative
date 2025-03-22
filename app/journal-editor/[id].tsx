import { useCallback, useRef, useState } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import debounce from "lodash/debounce";
import { getEntryById, updateEntry } from "@/utils/functions/storage";

interface Entry {
  id: string;
  date?: string;
  title?: string;
  content?: string;
  image?: string;
}

export default function NotesScreen() {
  const { id } = useLocalSearchParams();
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  const [fontSize, setFontSize] = useState(17);
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");

  const [loading, setLoading] = useState(true);

  const handleContentSizeChange = useCallback(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, []);

  const router = useRouter();

  interface PanHandlerStateChangeEvent {
    nativeEvent: {
      state: number;
      oldState: number;
      translationX: number;
    };
  }

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
        setLoading(true);
        const entry = await getEntryById(Array.isArray(id) ? id[0] : id);
        if (entry) {
          setText(entry.content || "");
          setTitle(entry.title || "");
          setDate(entry.date || "");
          setLoading(false);
        }
      };

      fetchEntries();
    }, [])
  );

  const saveChanges = useCallback(
    debounce(async (newTitle: string, newText: string) => {
      if (!id) return;

      const entry: Entry = {
        id: Array.isArray(id) ? id[0] : id,
        title: newTitle,
        content: newText,
      };

      await updateEntry(entry);
    }, 500),
    [id]
  );

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    saveChanges(newTitle, text);
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    saveChanges(title, newText);
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
        {loading ? (
          <View style={{ padding: 20 }}>
            <ActivityIndicator size="large" color={textColor} />
          </View>
        ) : (
          <>
            <View>
              <Image
                source={require("@/assets/images/pen_book.webp")}
                style={styles.coverImage}
              />
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
              <Text style={styles.dateText}>{date}</Text>
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
                    fontSize,
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  titleInput: {
    fontSize: 28,
    fontWeight: "600",
    flex: 1,
  },
  dateText: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    fontSize: 14,
    color: "#999",
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

