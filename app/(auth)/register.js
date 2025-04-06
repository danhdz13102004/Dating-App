import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { router } from 'expo-router';

const Register = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Error states
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const validateUsername = () => {
    if (!username.trim()) {
      setUsernameError('Username is required');
      return false;
    } else if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return false;
    }
    setUsernameError('');
    return true;
  }

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = () => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = () => {
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const validateForm = () => {
    const isUsernameValid = validateUsername();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();
    
    return isUsernameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid;
  };

  const handleSignUp = () => {
    if (validateForm()) {
      console.log('Sign up with:', { username, email, password });
      
      alert('Registration successful!');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
                setUsername(text);
                if (usernameError) setUsernameError('');
              }}
              onBlur={validateUsername}
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
                setEmail(text);
                if (emailError) setEmailError('');
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
                setPassword(text);
                if (passwordError) setPasswordError('');
              }}
              onBlur={validatePassword}
              secureTextEntry={!showPassword}
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
                setConfirmPassword(text);
                if (confirmPasswordError) setConfirmPasswordError('');
              }}
              onBlur={validateConfirmPassword}
              secureTextEntry={!showConfirmPassword}
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
          >
            <Text style={styles.signUpButtonText}>SIGN UP</Text>
          </TouchableOpacity>
          
          {/* Sign In Button */}
          <TouchableOpacity 
            style={styles.signInButton} 
            onPress={() => {
              router.push('(auth)/login')
            }}
          >
            <Text style={styles.signInButtonText}>SIGN IN</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Indicator */}
      <View style={styles.bottomBar} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryColor,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
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
    fontSize: 30,
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
  formContainer: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    paddingBottom: 40,
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
    marginBottom: 25,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
    paddingVertical: 2,
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
    marginTop: 25,
    marginBottom: 15,
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
  bottomBar: {
    height: 5,
    width: 50,
    bottom: 8,
    position: 'absolute',
    alignSelf: 'center',
    borderRadius: 3
  },
});

export default Register;