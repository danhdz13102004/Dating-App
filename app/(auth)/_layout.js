import { Stack } from "expo-router";
import { ToastProvider } from "../../context/ToastContext";
export default function Layout() {
  return (
    <ToastProvider>
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login"/>
            <Stack.Screen name="register"/>
            <Stack.Screen name="select-gender"/>
            <Stack.Screen name="select-hobbies"/>
        </Stack>
    </ToastProvider>
  );
}