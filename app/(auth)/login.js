import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { Colors } from "../../constants/Colors";
import { Image } from "react-native";
import { router } from "expo-router";
import appConfig from "../../configs/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Error states
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [userId, setUserId] = useState(null);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          // router.replace("/(tabs)/discover");
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };
    fetchUserId();
    // Set default selected hobbies if needed
  }, []);

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = () => {
    if (!password) {
      setPasswordError("Password is required");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const validateForm = () => {
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    return isEmailValid && isPasswordValid;
  };

  const handleLogin = async () => {
    console.log("Login Button Pressed");

    if (validateForm()) {
      try {
        setGeneralError("");
        setIsLoading(true);

        // Make API request to your server
        const url = `${appConfig.API_URL}/auth/login`;
        console.log("Login URL: ", url);

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        });

        // Parse the response
        const data = await response.json();

        // Check if login was successful
        if (response.ok) {
          // Login successful
          console.log("Login successful:", data);

          // Check if token is available in response
          if (data.data && data.data.token) {
            // Save token to AsyncStorage
            await AsyncStorage.setItem("authToken", data.data.token);
            console.log("Token saved to AsyncStorage successfully");

            //Get userid from data
            const userId = data.data.user.id;
            console.log("User ID:", userId);

            //Check user's information completion
            const checkResponse = await fetch(
              `${appConfig.API_URL}/user/check-user-info-completion/${userId}`
            );
            const checkData = await checkResponse.json();
            console.log("Check user info completion response:", checkData);

            if (checkResponse.ok && !checkData.data.isCompleted) {
              // User's information is not completed, navigate
              router.replace("/(auth)/profile_detail");
            } else {
              router.replace("/(tabs)/discover");
            }
          } else {
            setGeneralError(
              "Invalid server response. Missing authentication token."
            );
          }
        } else {
          // Login failed - show error message from server
          console.log("Login failed:", data);
          setGeneralError(
            data.message ||
            "Login failed. Please check your credentials and try again."
          );
        }
      } catch (error) {
        console.error("Login error:", error);
        setGeneralError(
          "Network error. Please check your connection and try again."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }} // Ensures the scroll view takes up the full height of the screen
          showsVerticalScrollIndicator={false} // Hides the vertical scroll indicator
          keyboardShouldPersistTaps="handled" // Ensures keyboard dismisses when tapping outside of input fields
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoWrapper}>
              <Text style={styles.logoText}>CUPID ARROW</Text>
              <Image
                source={require("../../assets/images/cupid_icon.png")} // Đường dẫn ảnh
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.tagline}>Meet the right person</Text>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitleText}>Sign in to continue</Text>

            {/* Email */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text)
                    if (emailError) {
                      setEmailError('') // Clear error when user starts typing
                    }
                  }}
                  onBlur={validateEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.errorContainer}>
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) {
                      setPasswordError('')
                    }
                  }}
                  onBlur={validatePassword}
                  secureTextEntry={!passwordVisible}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={togglePasswordVisibility}
                >
                  <Icon
                    name={passwordVisible ? "eye" : "eye-off"}
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.errorContainer}>
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              </View>
            </View>

            {/* SIGN IN Button */}
            <TouchableOpacity
              style={styles.signInButton}
              onPress={handleLogin} // Function to handle login
              activeOpacity={0.8}
            >
              <Text style={styles.signInText}>SIGN IN</Text>
            </TouchableOpacity>

            {/* SIGN UP Button */}
            <TouchableOpacity
              style={styles.signUpButton}
              onPress={() => {
                router.push("/(auth)/register"); // Navigate to the register screen
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.signUpText}>SIGN UP</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryColor,
  },
  header: {
    height: "30%", // Further reduced header height to move form up more
    justifyContent: "flex-end",
    alignItems: "center", // Center alignment for the logo
    paddingBottom: 20,
  },
  logoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10, // Center the text within wrapper
  },
  logoText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: "#FFFFFF"
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingTop: 25,
    paddingBottom: 100,
    flex: 1, // Let form container take remaining space
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    color: Colors.primaryColor,
  },
  subtitleText: {
    fontSize: 14,
    color: "#888",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    position: "relative",
  },
  input: {
    flex: 1,
    height: 50,
    // paddingVertical: 16,
    fontSize: 16,
    color: "#333",
  },
  errorContainer: {
    height: 20,
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: 4,
  },
  inputError: {
    borderBottomColor: "#FF3B30",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
  },
  eyeIcon: {
    padding: 10
  },
  signInButton: {
    backgroundColor: Colors.primaryColor,
    borderRadius: 10,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  signInButtonPressed: {
    backgroundColor: Colors.secondaryColor,
    transform: [{ scale: 0.98 }],
  },
  signInText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  signUpButton: {
    borderWidth: 1,
    borderColor: Colors.primaryColor,
    height: 55,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  signUpButtonPressed: {
    color: Colors.secondaryColor,
    borderColor: Colors.secondaryColor,
    transform: [{ scale: 0.98 }],
  },
  signUpText: {
    color: Colors.primaryColor,
    fontSize: 16,
    fontWeight: "bold",
  },
  logoImage: {
    width: 60,
    height: 60,
    // marginBottom: 10,
  },
});

export default LoginScreen;
