import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Ekran główny" }} />
      <Stack.Screen name="SettingsScreen" options={{ title: "Ustawienia" }} />
    </Stack>
  );
}

