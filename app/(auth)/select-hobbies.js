import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Colors } from "../../constants/Colors";
import appConfig from "../../configs/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { jwtDecode } from "jwt-decode";

const hobbiesList = [
  { id: 1, name: "Photography", icon: "camera" },
  { id: 2, name: "Shopping", icon: "shopping-bag" },
  { id: 3, name: "Karaoke", icon: "microphone" },
  { id: 4, name: "Yoga", icon: "yin-yang" },
  { id: 5, name: "Cooking", icon: "utensils" },
  { id: 6, name: "Tennis", icon: "table-tennis" },
  { id: 7, name: "Run", icon: "running" },
  { id: 8, name: "Swimming", icon: "swimmer" },
  { id: 9, name: "Art", icon: "palette" },
  { id: 10, name: "Traveling", icon: "plane" },
  { id: 11, name: "Extreme", icon: "bolt" },
  { id: 12, name: "Music", icon: "music" },
  { id: 13, name: "Drink", icon: "wine-glass" },
  { id: 14, name: "Games", icon: "gamepad" },
];

const HobbySelector = () => {
  const [selectedHobbies, setSelectedHobbies] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          const decoded = jwtDecode(token);
          setUserId(decoded.userId);
        } else {
          console.log("No token found, redirecting to login");
          router.replace("/(auth)/login");
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };

    fetchUserId();
    // Set default selected hobbies if needed
  }),
    [];

  const toggleHobby = (hobby) => {
    setSelectedHobbies((prev) =>
      prev.includes(hobby) ? prev.filter((h) => h !== hobby) : [...prev, hobby]
    );
  };

  const updateHobbies = async () => {
    try {
      console.log("User ID: ", userId);

      if (!userId) {
        Alert.alert("Error", "User not found. Please log in again.");
        return;
      }

      // Send request to update hobbies using fetch instead of axios
      const url = `${appConfig.API_URL}/auth/update-hobbies`;
      console.log("URL: ", url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          hobbies: selectedHobbies,
          replace: true,
        }),
      });

      const data = await response.json();
      console.log("Hobbies updated:", data);

      if (response.ok) {
        router.push("/(auth)/get-location");
      } else {
        Alert.alert("Error", data.message || "Failed to update hobbies");
      }
    } catch (error) {
      console.error("Error updating hobbies:", error);
      Alert.alert("Error", "Failed to update hobbies. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <MaterialIcons
            style={{ marginLeft: 5 }}
            name="arrow-back-ios"
            size={20}
            color={Colors.primaryColor}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Your interests</Text>
        <Text style={styles.subtitle}>
          Select a few of your interests and let everyone know what you’re
          passionate about.
        </Text>
      </View>

      <FlatList
        data={hobbiesList}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        columnWrapperStyle={styles.row}
        style={{ marginTop: 20 }}
        renderItem={({ item }) => {
          const isSelected = selectedHobbies.includes(item.name);
          return (
            <Pressable
              onPress={() => toggleHobby(item.name)}
              style={[styles.hobbyItem, isSelected && styles.selectedHobby]}
            >
              <Icon
                name={item.icon}
                size={16}
                color={isSelected ? "#fff" : Colors.primaryColor}
              />
              <Text style={isSelected ? styles.selectedText : styles.text}>
                {item.name}
              </Text>
            </Pressable>
          );
        }}
      />

      {/* Continue Button */}
      <TouchableOpacity onPress={updateHobbies} style={styles.continueButton}>
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    borderWidth: 1,
    borderColor: Colors.primaryColor,
    borderRadius: 10,
    padding: 10,
  },
  skipText: {
    color: Colors.primaryColor,
    fontWeight: "bold",
    fontSize: 16,
  },
  titleContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  row: {
    flex: 1,
    justifyContent: "space-between",
    marginBottom: 12,
  },
  hobbyItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: Colors.primaryColor,
    marginHorizontal: 5,
  },
  selectedHobby: {
    backgroundColor: Colors.primaryColor,
  },
  text: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.primaryColor,
  },
  selectedText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#fff",
  },
  continueButton: {
    backgroundColor: Colors.primaryColor,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
  },
  continueText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default HobbySelector;
