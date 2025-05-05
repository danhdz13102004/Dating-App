import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import Icon from "react-native-vector-icons/Feather";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import appConfig from "../../configs/config";
import { jwtDecode } from "jwt-decode";
import { router } from "expo-router";
import { Colors } from "../../constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

const ProfileDetails = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [date, setDate] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [userId, setUserId] = useState(null);
  const [avatarURL, setAvatarURL] = useState(null);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);
  const placeholder = require("@/assets/images/placeholder_avatar.png");

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          const decoded = jwtDecode(token);
          setUserId(decoded.userId);
          console.log("User ID: ", decoded.userId);
        } else {
          console.log("No token found, redirecting to login");
          router.replace("/(auth)/login");
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };

    fetchUserId();
  }, []);

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    } else {
      Alert.alert("No Image Selected", "You did not select any image.");
    }
  };

  const formatDate = (date) => {
    if (!date) return "Choose birthday date";
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const showDatePicker = () => {
    setOpen(true);
  };

  const hideDatePicker = () => {
    setOpen(false);
  };

  const handleSelect = (date) => {
    setDate(date);
    hideDatePicker();
  };

  const saveToDB = async (
    _firstName,
    _lastName,
    _birthday,
    _avatarURL,
    _userId
  ) => {
    console.log(_firstName, _lastName, _birthday, _avatarURL, _userId);
    if (_firstName && _lastName && _birthday && _avatarURL) {
      const url = `${appConfig.API_URL}/user/update`;
      console.log("URL: ", url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: _userId,
          name: _firstName + " " + _lastName,
          birthday: _birthday,
          avatarURL: _avatarURL,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Profile updated successfully:", data);
        router.replace("/(auth)/select-gender");
      } else {
        Alert.alert("Error", "Failed to update profile. Please try again.");
      }
    } else {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
    }
  };

  const handleConfirm = async () => {
    if (!selectedImage) {
      Alert.alert("No Image", "Please select a profile image.");
      return;
    }
    console.log('Confirm button pressed with image:', selectedImage);
    await cloudinaryUpload(selectedImage);
  };

  const cloudinaryUpload = async (imagePath) => {
    setUpdatingAvatar(true);
    try {
      const url = process.env.EXPO_PUBLIC_CLOUDINARY_ENDPOINT;
      const formData = new FormData();
      const fileName = imagePath.split("/").pop();
      formData.append("file", {
        uri: imagePath,
        name: fileName,
        type: "image/jpeg",
      });
      formData.append("upload_preset", process.env.EXPO_PUBLIC_CLOUDINARY_PRESET);

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data.url) {
        console.log("Image uploaded successfully:", data.url);
        setAvatarURL(data.url);
        await saveToDB(firstName, lastName, date, data.url, userId);
      } else {
        Alert.alert("Upload Failed", "Failed to upload image. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error", "An error occurred while uploading the image.");
    } finally {
      setUpdatingAvatar(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile Details</Text>
        </View>

        {/* Profile Image */}
        <View style={styles.profileContainer}>
          <LinearGradient
            colors={[Colors.primaryColor, "#FF758C", Colors.secondaryColor, "#FF9A8B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientAvatarBorder}
          >
            <View style={styles.profileAvatarWrapper}>
              <Image
                style={styles.profileImage}
                source={selectedImage ? { uri: selectedImage } : placeholder}
                placeholder={placeholder}
                contentFit="cover"
                transition={500}
              />
              {updatingAvatar && (
                <View style={styles.avatarLoadingOverlay}>
                  <ActivityIndicator size="large" color={Colors.primaryColor} />
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={pickImageAsync}
              disabled={updatingAvatar}
              activeOpacity={0.8}
            >
              <MaterialIcons name="add-a-photo" size={20} color="#FFF" />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          {/* First Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              placeholderTextColor="#B0B0B0"
            />
          </View>

          {/* Last Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
              placeholderTextColor="#B0B0B0"
            />
          </View>

          {/* Birthday */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Birthday</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={showDatePicker}
            >
              <Icon
                name="calendar"
                size={20}
                color={Colors.primaryColor}
                style={styles.calendarIcon}
              />
              <Text style={styles.dateText}>
                {formatDate(date)}
              </Text>
            </TouchableOpacity>
          </View>

          <DateTimePickerModal
            isVisible={open}
            mode="date"
            onConfirm={handleSelect}
            onCancel={hideDatePicker}
            maximumDate={new Date()}
          />
        </View>
        {/* Confirm Button */}
        <TouchableOpacity
          style={[styles.confirmButton, updatingAvatar && styles.disabledButton]}
          onPress={handleConfirm}
          disabled={updatingAvatar}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[Colors.primaryColor, Colors.secondaryColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.confirmText}>
              {updatingAvatar ? "Uploading..." : "Confirm"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#FFF8F9",
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingBottom: 60,
    paddingHorizontal: 24,
  },

  /**
   * Header Styles
   */
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.primaryColor,
  },

  /**
   * Profile Image Styles
   */
  profileContainer: {
    alignItems: "center",
    marginBottom: 40,
  },

  gradientAvatarBorder: {
    width: 160,
    height: 160,
    borderRadius: 160 / 2,
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    position: "relative",
  },
  profileAvatarWrapper: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: "hidden",
    backgroundColor: "#FFF",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  avatarLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 75,
  },
  cameraButton: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: Colors.primaryColor,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  /**
   * Form Styles
   */
  form: {
    flex: 1,
    width: "100%",
    marginBottom: 140,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
    color: "#666",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    borderRadius: 12,
    padding: 14,
  },
  calendarIcon: {
    marginRight: 12,
  },
  dateText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  confirmButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  gradientButton: {
    padding: 16,
    alignItems: "center",
  },
  confirmText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default ProfileDetails;