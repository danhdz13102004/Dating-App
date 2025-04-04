import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Colors } from "../../constants/Colors";

const GenderSelectionScreen = () => {
  const [selectedGender, setSelectedGender] = useState("Man");

  return (
    <View style={styles.container}>
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

      <View style={styles.content}>
        <Text style={styles.title}>I am a</Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.option,
              selectedGender === "Woman" && styles.optionSelected,
            ]}
            onPress={() => setSelectedGender("Woman")}
          >
            <Text
              style={[
                styles.optionText,
                selectedGender === "Woman" && styles.optionTextSelected,
              ]}
            >
              Woman
            </Text>
            {selectedGender === "Woman" && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.option,
              selectedGender === "Man" && styles.optionSelected,
            ]}
            onPress={() => setSelectedGender("Man")}
          >
            <Text
              style={[
                styles.optionText,
                selectedGender === "Man" && styles.optionTextSelected,
              ]}
            >
              Man
            </Text>
            {selectedGender === "Man" && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.option,
              selectedGender === "Other" && styles.optionSelected,
            ]}
            onPress={() => {
              setSelectedGender("Other");
            }}
          >
            <Text style={styles.optionText}>Choose another</Text>
            <MaterialIcons
              style={{ marginLeft: 5 }}
              name="arrow-forward-ios"
              size={20}
              color={Colors.primaryColor}
            />
            {selectedGender === "Other" && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.continueButton}>
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 45,
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
    marginTop: 50,
    marginBottom: 70,
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
    marginBottom: 15,
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
    marginBottom: 30,
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
