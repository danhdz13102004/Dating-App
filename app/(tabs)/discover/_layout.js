import { Stack } from "expo-router";
import { ToastProvider } from "../../../context/ToastContext";
export default function Layout() {
  return (
    <ToastProvider>
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index"/>
        </Stack>
    </ToastProvider>
  );
}