import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Colors } from "../../constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { jwtDecode } from "jwt-decode";
import appConfig from "../../configs/config";
import { useEffect } from "react";
const GenderSelectionScreen = () => {
  const [selectedGender, setSelectedGender] = useState("male");
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
  }, []);

  const updateGender = async () => {
    try {
      if (!userId) {
        Alert.alert("Error", "User not found. Please log in again.");
        return;
      }
      console.log("GENDER:", selectedGender);
      const url = `${appConfig.API_URL}/auth/update-gender`;
      console.log("URL:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          gender: selectedGender,
        }),
      });

      const data = await response.json(); // Parse JSON từ phản hồi

      if (response.ok) {
        // Thành công
        console.log("Gender updated successfully:", data);
        router.push("/(auth)/select-hobbies"); // Chuyển hướng đến màn hình tiếp theo
      } else {
        // Thất bại
        console.error("Failed to update gender:", data);
        Alert.alert("Error", data.message || "Failed to update gender.");
      }
    } catch (error) {
      console.error("Error updating gender:", error);
      Alert.alert("Error", "An error occurred. Please try again.");
    }
  };

  const handleSkip = () => {
    router.push("/(auth)/select-hobbies")
  }

  const handleBack = () => {
    router.push("/(auth)/profile-details")
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* <TouchableOpacity style={styles.backButton}>
          <MaterialIcons
            style={{ marginLeft: 5 }}
            name="arrow-back-ios"
            size={20}
            color={Colors.primaryColor}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity> */}
        <Text style={styles.headerTitle}>Gender Selection</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>I am a</Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.option,
              selectedGender === "female" && styles.optionSelected,
            ]}
            onPress={() => setSelectedGender("female")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.optionText,
                selectedGender === "female" && styles.optionTextSelected,
              ]}
            >
              Woman
            </Text>
            {selectedGender === "female" && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.option,
              selectedGender === "male" && styles.optionSelected,
            ]}
            onPress={() => setSelectedGender("male")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.optionText,
                selectedGender === "male" && styles.optionTextSelected,
              ]}
            >
              Man
            </Text>
            {selectedGender === "male" && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.option,
              selectedGender === "other" && styles.optionSelected,
            ]}
            onPress={() => {
              setSelectedGender("other");
            }}
            activeOpacity={0.8}
          >
            <Text 
              style={[
                styles.optionText,
                selectedGender === "other" && styles.optionTextSelected,
              ]}
            >
              Choose another
            </Text>
            <MaterialIcons
              style={{ marginLeft: 5 }}
              name="arrow-forward-ios"
              size={20}
              color={Colors.primaryColor}
            />
            {selectedGender === "other" && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.continueButton}
        onPress={updateGender}
        activeOpacity={0.8}
      >
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 20,
    paddingBottom: 50,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.primaryColor,
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
    fontFamily: "System",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 34,
    fontWeight: "600",
    letterSpacing: 0,
    lineHeight: 1.5 * 34,
    fontFamily: "System",
    marginTop: 70,
    marginBottom: 50,
  },
  optionsContainer: {
    marginTop: 30,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 20,
    height: 60,
  },
  optionSelected: {
    backgroundColor: Colors.primaryColor,
    borderColor: Colors.primaryColor,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: 0,
    lineHeight: 1.5 * 16,
    fontFamily: "System",
  },
  optionTextSelected: {
    color: "white",
  },
  checkmark: {
    color: "white",
    fontSize: 18,
    fontFamily: "System",
  },
  continueButton: {
    backgroundColor: Colors.primaryColor,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    height: 60,
  },
  continueText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 1.5 * 16,
    fontFamily: "System",
  },
});

export default GenderSelectionScreen;
