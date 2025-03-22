import { Stack } from "expo-router";

export default function JournalEditorLayout() {
  return (
    <Stack
      screenOptions={{
        gestureEnabled: true, // habilita el gesto de swipe
        gestureDirection: "horizontal", // dirección del gesto
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          headerTitle: "Diario",
          headerShown: true,
        }}
      />
    </Stack>
  );
}
