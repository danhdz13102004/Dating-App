import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import appConfig from "../../configs/config";
import { Colors } from "../../constants/Colors";
const GetLocationScreen = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAllowLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to use this feature."
        );
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      console.log("User Location:", location);

      const { latitude, longitude } = location.coords;
      const token = await AsyncStorage.getItem("authToken");
      const userId = JSON.parse(atob(token.split(".")[1])).userId;

      const response = await fetch(
        `${appConfig.API_URL}/user/update-location`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            location: { type: "Point", coordinates: [longitude, latitude] },
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        console.log("Location updated successfully:", data);
        router.replace("/(tabs)/discover");
      } else {
        console.error("Failed to update location:", data);
        Alert.alert("Error", data.message || "Failed to update location.");
      }
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "An error occurred while getting location.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>So, are you from around here?</Text>
        <Text style={styles.subtitle}>
          Set your location to see who’s in your neighborhood or beyond. You
          won’t be able to match with people otherwise.
        </Text>

        <View style={styles.iconContainer}>
          <MaterialIcons name="place" size={50} color="#ABABAB" />
        </View>
      </View>

      <TouchableOpacity
        onPress={handleAllowLocation}
        disabled={loading}
        style={[styles.allowButton, loading && { opacity: 0.7 }]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.allowButtonText}>Allow</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "space-between",
    paddingVertical: 50,
  },
  contentContainer: {
    alignItems: "center",
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    lineHeight: 22,
    marginBottom: 40,
  },
  iconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonWrapper: {
    paddingHorizontal: 20,
  },
  allowButton: {
    backgroundColor: Colors.primaryColor, // dùng màu chính của app
    paddingVertical: 16,
    borderRadius: 50, // bo tròn hoàn toàn
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
  },

  allowButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default GetLocationScreen;
