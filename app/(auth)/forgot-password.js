import React, { useState, useEffect } from "react";
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
  Image,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { Colors } from "../../constants/Colors";
import { router } from "expo-router";
import appConfig from "../../configs/config";
import { useToast } from "../../context/ToastContext";
import OTPInputField from "../components/OTPInputField";

const ForgotPasswordScreen = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [canResendOtp, setCanResendOtp] = useState(true);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Password visibility states
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  // Error states
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");

  useEffect(() => {
    // Countdown for OTP expiration (2 minutes)
    let intervalId;
    if (otpSent && timeRemaining > 0) {
      intervalId = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(intervalId);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [otpSent, timeRemaining]);

  useEffect(() => {
    // Countdown for resend button (1 minute)
    let resendIntervalId;
    if (resendCountdown > 0) {
      resendIntervalId = setInterval(() => {
        setResendCountdown(prev => {
          if (prev <= 1) {
            setCanResendOtp(true);
            clearInterval(resendIntervalId);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (resendIntervalId) clearInterval(resendIntervalId);
    };
  }, [resendCountdown]);

  const toggleNewPasswordVisibility = () => {
    setNewPasswordVisible(!newPasswordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

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

  const validateOtp = () => {
    if (!otp.trim()) {
      setOtpError("OTP is required");
      return false;
    } else if (otp.length !== 6) {
      setOtpError("OTP must be 6 digits");
      return false;
    }
    setOtpError("");
    return true;
  };

  const validateNewPassword = () => {
    if (!newPassword) {
      setNewPasswordError("New password is required");
      return false;
    } else if (newPassword.length < 6) {
      setNewPasswordError("Password must be at least 6 characters");
      return false;
    }
    setNewPasswordError("");
    return true;
  };

  const validateConfirmPassword = () => {
    if (!confirmPassword) {
      setConfirmPasswordError("Confirm password is required");
      return false;
    } else if (confirmPassword !== newPassword) {
      setConfirmPasswordError("Passwords don't match");
      return false;
    }
    setConfirmPasswordError("");
    return true;
  };

  const validateSendOtpForm = () => {
    return validateEmail();
  };

  const validateResetPasswordForm = () => {
    const isOtpValid = validateOtp();
    const isNewPasswordValid = validateNewPassword();
    const isConfirmPasswordValid = validateConfirmPassword();

    return isOtpValid && isNewPasswordValid && isConfirmPasswordValid;
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleSendOtp = async () => {
    if (!canResendOtp && otpSent) {
      showToast(`Please wait ${formatTime(resendCountdown)} before requesting a new OTP`, "info");
      return;
    }

    if (validateSendOtpForm()) {
      try {
        setIsLoading(true);
        setGeneralError("");

        const response = await fetch(`${appConfig.API_URL}/otp/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok && data.success) {          
          setOtpSent(true);
          setTimeRemaining(120); // 2 minutes in seconds
          setCanResendOtp(false);
          setResendCountdown(60); // 1 minute in seconds
          showToast("OTP sent to your email", "success");
          
          // Navigate to the dedicated OTP verification screen
          router.push({
            pathname: "/(auth)/otp-verification",
            params: { email }
          });
        } else {
          setGeneralError(data.message || "Failed to send OTP. Please try again.");
          showToast(data.message || "Failed to send OTP", "error");
        }
      } catch (error) {
        console.error("Send OTP error:", error);
        setGeneralError("Network error. Please check your connection and try again.");
        showToast("Network error. Please try again.", "error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResetPassword = async () => {
    if (validateResetPasswordForm()) {
      try {
        setIsLoading(true);
        setGeneralError("");

        const response = await fetch(`${appConfig.API_URL}/otp/verify-reset`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
            newPassword
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          showToast("Password reset successful. Please login with your new password.", "success");
          router.replace("/(auth)/login");
        } else {
          setGeneralError(data.message || "Failed to reset password. Please try again.");
          showToast(data.message || "Failed to reset password", "error");
          
          // If OTP is invalid or expired
          if (data.message && data.message.includes("Invalid or expired OTP")) {
            setOtpError("Invalid or expired OTP");
          }
        }
      } catch (error) {
        console.error("Reset password error:", error);
        setGeneralError("Network error. Please check your connection and try again.");
        showToast("Network error. Please try again.", "error");
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
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoWrapper}>
              <Text style={styles.logoText}>CUPID ARROW</Text>
              <Image
                source={require("../../assets/images/cupid_icon.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            <Text style={styles.welcomeText}>Forgot Password</Text>
            <Text style={styles.subtitleText}>
              {otpSent
                ? "Enter the 6-digit OTP sent to your email and set a new password"
                : "Enter your email to receive a verification code"}
            </Text>

            {timeRemaining > 0 && otpSent && (
              <View style={styles.otpTimerContainer}>
                <Text style={styles.otpTimerText}>
                  OTP expires in: <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
                </Text>
              </View>
            )}

            {/* Show general error if any */}
            {generalError ? (
              <View style={styles.generalErrorContainer}>
                <Text style={styles.errorText}>{generalError}</Text>
              </View>
            ) : null}

            {/* Email */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) {
                      setEmailError("");
                    }
                  }}
                  onBlur={validateEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!otpSent} // Disable email input after OTP is sent
                />
              </View>
              <View style={styles.errorContainer}>
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              </View>
            </View>

            {!otpSent ? (
              // Send OTP Button (visible before OTP is sent)
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSendOtp}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.actionButtonText}>Send OTP</Text>
                )}
              </TouchableOpacity>
            ) : (
              <>                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Enter 6-digit OTP</Text>
                  <OTPInputField 
                    otp={otp} 
                    setOtp={setOtp} 
                    error={otpError} 
                    setError={setOtpError}
                  />
                  <View style={styles.errorContainer}>
                    {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}
                  </View>
                </View>

                {/* New Password */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="New Password"
                      value={newPassword}
                      onChangeText={(text) => {
                        setNewPassword(text);
                        if (newPasswordError) {
                          setNewPasswordError("");
                        }
                      }}
                      onBlur={validateNewPassword}
                      secureTextEntry={!newPasswordVisible}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={toggleNewPasswordVisibility}
                    >
                      <Icon
                        name={newPasswordVisible ? "eye" : "eye-off"}
                        size={20}
                        color="#999"
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.errorContainer}>
                    {newPasswordError ? (
                      <Text style={styles.errorText}>{newPasswordError}</Text>
                    ) : null}
                  </View>
                </View>

                {/* Confirm New Password */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm New Password"
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        if (confirmPasswordError) {
                          setConfirmPasswordError("");
                        }
                      }}
                      onBlur={validateConfirmPassword}
                      secureTextEntry={!confirmPasswordVisible}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={toggleConfirmPasswordVisibility}
                    >
                      <Icon
                        name={confirmPasswordVisible ? "eye" : "eye-off"}
                        size={20}
                        color="#999"
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.errorContainer}>
                    {confirmPasswordError ? (
                      <Text style={styles.errorText}>{confirmPasswordError}</Text>
                    ) : null}
                  </View>
                </View>

                {/* Reset Password Button */}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleResetPassword}
                  activeOpacity={0.8}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.actionButtonText}>Reset Password</Text>
                  )}
                </TouchableOpacity>

                {/* Resend OTP option */}
                <TouchableOpacity
                  style={[
                    styles.resendButton,
                    !canResendOtp && styles.resendButtonDisabled
                  ]}
                  onPress={handleSendOtp}
                  activeOpacity={0.8}
                  disabled={!canResendOtp || isLoading}
                >
                  <Text style={[
                    styles.resendButtonText,
                    !canResendOtp && styles.resendButtonTextDisabled
                  ]}>
                    {canResendOtp ? "Resend OTP" : `Resend OTP in ${formatTime(resendCountdown)}`}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* Back to Login */}
            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={() => router.replace("/(auth)/login")}
            >
              <Text style={styles.backToLoginText}>Back to Login</Text>
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
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  header: {
    height: "25%",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 20,
  },
  logoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingTop: 25,
    paddingBottom: 100,
    flex: 1,
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
  otpTimerContainer: {
    backgroundColor: "#E8F5FF",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: "center",
  },
  otpTimerText: {
    color: "#0066CC",
    fontSize: 14,
  },
  timerText: {
    fontWeight: "bold",
  },
  generalErrorContainer: {
    backgroundColor: "#FFEEEE",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
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
    fontSize: 16,
    color: "#333",
  },
  errorContainer: {
    height: 20,
    justifyContent: "center",
    marginTop: 2,
    marginBottom: 4,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
  },
  eyeIcon: {
    padding: 10,
  },
  actionButton: {
    backgroundColor: Colors.primaryColor,
    borderRadius: 10,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 15,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  resendButton: {
    alignSelf: "center",
    padding: 10,
    marginBottom: 20,
  },
  resendButtonDisabled: {
    opacity: 0.6,
  },
  resendButtonText: {
    color: Colors.primaryColor,
    fontSize: 14,
    textDecorationLine: "underline",
  },  resendButtonTextDisabled: {
    textDecorationLine: "none",
  },
  backToLoginButton: {
    alignSelf: "center",
    padding: 10,
  },
  backToLoginText: {
    color: Colors.primaryColor,
    fontSize: 14,
    textDecorationLine: "underline",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
    color: "#666",
  },
});

export default ForgotPasswordScreen;
