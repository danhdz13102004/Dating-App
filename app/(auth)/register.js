import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../../constants/Colors'
import { router } from 'expo-router'
import appConfig from '../../configs/config'
import { useToast } from "../../context/ToastContext";

const Register = ({ navigation }) => {
  const { showToast } = useToast();
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Error states
  const [usernameError, setUsernameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [generalError, setGeneralError] = useState('')

  const validateUsername = () => {
    if (!username.trim()) {
      setUsernameError('Username is required')
      return false
    } else if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters')
      return false
    }
    setUsernameError('')
    return true
  }

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim()) {
      setEmailError('Email is required')
      return false
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address')
      return false
    }
    setEmailError('')
    return true
  }

  const validatePassword = () => {
    if (!password) {
      setPasswordError('Password is required')
      return false
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return false
    }
    setPasswordError('')

    if (confirmPassword && password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match')
      return false
    }
    return true
  }

  const validateConfirmPassword = () => {
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password')
      return false
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match')
      return false
    }
    setConfirmPasswordError('')
    return true
  }

  const validateForm = () => {
    const isUsernameValid = validateUsername()
    const isEmailValid = validateEmail()
    const isPasswordValid = validatePassword()
    const isConfirmPasswordValid = validateConfirmPassword()
    
    return isUsernameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid
  }

  const handleSignUp = async () => {
    console.log("Sign Up Button Pressed")

    if (validateForm()) {
      try {
        setGeneralError('')
        
        // Show loading state
        
        // Make API request to your server
        const url = `${appConfig.API_URL}/auth/register`
        console.log("URL: ", url)
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: username, // Matching your server's expected fields
            email: email,
            password: password,
            confirmPassword: confirmPassword,
          }),
        })
        
        // Parse the response
        const data = await response.json()
        
        // Check if registration was successful
        if (response.ok) {
          // Registration successful
          console.log('Registration successful:', data)
          showToast("Đăng kí tài khoản mới thành công", "success");
          router.push('(auth)/login')
        } else {
          // Registration failed - show error message from server
          console.log('Registration failed:', data)
          showToast(data.message || 'Đăng ký thất bại. Vui lòng thử lại.', "error");
          setGeneralError(data.message || 'Registration failed. Please try again.')
        }
      } catch (error) {
        console.error('Registration error:', error);
        showToast("Network error. Please check your connection.", "error");
        setGeneralError('Network error. Please check your connection and try again.')
      }
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled" // Ensures keyboard dismisses when tapping outside of input fields
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoWrapper}>
              <Text style={styles.logoText}>CUPID ARROW</Text>
              <Image
                  source={require('../../assets/images/cupid_icon.png')}
                  resizeMode="contain"
                  style={styles.logoImage}
              />
            </View>
            <Text style={styles.tagline}>Meet the right person</Text>
          </View>
          
          {/* Form Container */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>Join & Start Matching!</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>
            
            {/* Username field */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.textField, usernameError ? styles.textFieldError : null]}
                placeholder="Username"
                value={username}
                onChangeText={(text) => {
                  setUsername(text)
                  if (usernameError) setUsernameError('')
                }}
                onBlur={validateUsername}
                autoCapitalize='none'
              />
            </View>
            <View style={styles.errorContainer}>
              {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}
            </View>
            
            {/* Email field */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.textField, emailError ? styles.textFieldError : null]}
                placeholder="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text)
                  if (emailError) setEmailError('')
                }}
                onBlur={validateEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.errorContainer}>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>
            
            {/* Password field */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.textField, passwordError ? styles.textFieldError : null]}
                placeholder="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text)
                  if (passwordError) setPasswordError('')

                  if (confirmPassword) {
                    if (text === confirmPassword) {
                      setConfirmPasswordError('')
                    } else {
                      setConfirmPasswordError('Passwords do not match')
                    }
                  }
                }}
                onBlur={validatePassword}
                secureTextEntry={!showPassword}
                autoCapitalize='none'
              />
              <TouchableOpacity 
                style={styles.eyeButton} 
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={24} 
                  color={Colors.light.lightText}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.errorContainer}>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>
            
            {/* Confirm Password field */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.textField, confirmPasswordError ? styles.textFieldError : null]}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text)
                  if (confirmPasswordError) setConfirmPasswordError('')

                  if (password) {
                    if (text === password) {
                      setPasswordError('')
                    } else {
                      setConfirmPasswordError('Passwords do not match')
                    }
                  }
                }}
                onBlur={validateConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize='none'
              />
              <TouchableOpacity 
                style={styles.eyeButton} 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                  size={24} 
                  color={Colors.light.lightText}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.errorContainer}>
              {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
            </View>
            
            {/* Sign Up Button */}
            <TouchableOpacity 
              style={styles.signUpButton} 
              onPress={handleSignUp}
              activeOpacity={0.8}
            >
              <Text style={styles.signUpButtonText}>SIGN UP</Text>
            </TouchableOpacity>
            
            {/* Sign In Button */}
            <TouchableOpacity 
              style={styles.signInButton} 
              onPress={() => {
                router.push('(auth)/login')
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.signInButtonText}>SIGN IN</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryColor,
  },
  scrollContent: {
    flexGrow: 1,
  },

  /**
   * Header
   */
  header: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: "center",
    gap: 10
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  tagline: {
    fontSize: 14,
    color: Colors.light.background,
  },

  /**
   * Form Container
   */
  formContainer: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 25,
    paddingBottom: 20,
    paddingHorizontal: 25,
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.primaryColor,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.lightText,
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },
  textField: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  textFieldError: {
    borderBottomColor: '#FF3B30',
  },
  eyeButton: {
    padding: 10,
  },
  errorContainer: {
    height: 20, // Fixed height for error messages
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: 4,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
  },
  signUpButton: {
    backgroundColor: Colors.primaryColor,
    borderRadius: 10,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  signUpButtonText: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  signInButton: {
    borderWidth: 1,
    borderColor: Colors.primaryColor,
    borderRadius: 10,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInButtonText: {
    color: Colors.primaryColor,
    fontSize: 16,
    fontWeight: 'bold',
  },
})

export default Register