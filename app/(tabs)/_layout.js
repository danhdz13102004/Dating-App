import { Tabs } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Colors } from "../../constants/Colors";
import React, { useState, useEffect } from "react";
import { Keyboard } from "react-native";

export default function Layout() {
  const [tabBarVisible, setTabBarVisible] = useState(true);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setTabBarVisible(false); // Ẩn TabBar khi bàn phím xuất hiện
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setTabBarVisible(true); // Hiện lại TabBar khi bàn phím ẩn
      }
    );

    // Dọn dẹp khi component unmount
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { display: tabBarVisible ? "flex" : "none" },
      }}
    >
      <Tabs.Screen
        name="match"
        options={{
          title: "",
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <MaterialCommunityIcons
                name="cards"
                size={24}
                color={Colors.primaryColor}
              />
            ) : (
              <MaterialCommunityIcons
                name="cards-outline"
                size={24}
                color="black"
              />
            ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: "",
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Ionicons
                name="chatbubble-ellipses"
                size={24}
                color={Colors.primaryColor}
              />
            ) : (
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={24}
                color="black"
              />
            ),
        }}
      />

      <Tabs.Screen
        name="notification"
        options={{
          title: "",
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <FontAwesome name="bell" size={24} color={Colors.primaryColor} />
            ) : (
              <FontAwesome name="bell-o" size={24} color="black" />
            ),
        }}
      />

      <Tabs.Screen
        name="bio"
        options={{
          title: "",
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Ionicons name="person" size={24} color={Colors.primaryColor} />
            ) : (
              <Ionicons name="person-outline" size={24} color="black" />
            ),
        }}
      />
    </Tabs>
  );
}
