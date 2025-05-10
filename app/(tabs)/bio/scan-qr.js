import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  AppState,
  Platform,
  StatusBar
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { Colors } from '../../../constants/Colors';
import appConfigs from '../../../configs/config';
import { QROverlay } from '../../components/QROverlay';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

const API_URL = appConfigs.API_URL;

const ScanQRScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        qrLock.current = false;
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Get camera permissions and user ID
  useEffect(() => {
    const setup = async () => {
      // Camera permissions
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      // Fetch user ID
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          const decoded = jwtDecode(token);
          setUserId(decoded.userId);
        } else {
          console.log('No token found, redirecting to login');
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    setup();
  }, []);

  // Automatically navigate back to index after showing success message
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        router.replace('/(tabs)/discover');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleBarCodeScanned = async ({ data }) => {
    try {
      if (data && !qrLock.current) {
        qrLock.current = true;
        setLoading(true);
        console.log('QR Code scanned: ', data);
        // Parse the scanned data to get the user ID to like
        if (data && data.startsWith('like:')) {
          const targetUserId = data.split(':')[1];
          
          if (targetUserId && userId) {
            // Call the like API
            const response = await fetch(`${API_URL}/match/${targetUserId}/like`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ id: userId }),
            });

            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const responseData = await response.json();
            console.log("Like response: ", responseData);
            
            await callAPIToSendToFB(targetUserId);

            setSuccessMessage(responseData.metadata?.isMatch 
              ? 'It\'s a match! 🎉' 
              : 'You liked this person!'
            );
            setLoading(false);
            setShowSuccess(true);
          } else {
            Alert.alert('Invalid QR Code', 'This QR code does not contain valid user information.');
            setLoading(false);
          }
        } else {
          Alert.alert('Invalid QR Code', 'This QR code is not a valid dating app QR code.');
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error handling QR code scan:', error);
      Alert.alert('Error', 'Failed to process the QR code. Please try again.');
      setLoading(false);
      // Reset lock after some time
      setTimeout(() => {
        qrLock.current = false;
      }, 2000);
    }
  };

    const callAPIToSendToFB = async (swipedUserId) => {
    if (!userId) return;

    try {
      
      // GỌI API GỬI FIREBASE ĐỂ THÔNG BÁO
      const response = await fetch(`${API_URL}/match/${userId}/request-match-notify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: swipedUserId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Match notify response: ", data);

    } catch (error) {
      console.error("Error match notify:", error);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primaryColor} />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.permissionText}>
          We need camera access to scan QR codes. Please enable camera permissions in your device settings.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => router.back()}
        >
          <Text style={styles.permissionButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      {Platform.OS === "android" ? <StatusBar hidden /> : null}
      
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={showSuccess ? undefined : handleBarCodeScanned}
      />
      
      <QROverlay />
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primaryColor} />
          <Text style={styles.loadingText}>Processing QR code...</Text>
        </View>
      )}

      {showSuccess && (
        <View style={styles.successOverlay}>
          <View style={styles.successBox}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successText}>{successMessage}</Text>
            <Text style={styles.redirectText}>Redirecting to discover...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 15,
  },
  permissionText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 30,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: Colors.primaryColor,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successBox: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successIcon: {
    color: Colors.primaryColor,
    fontSize: 50,
    marginBottom: 16,
  },
  successText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  redirectText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  }
});

export default ScanQRScreen;
