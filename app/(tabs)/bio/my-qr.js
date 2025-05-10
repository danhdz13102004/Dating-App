import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Platform,
  Dimensions
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { Colors } from '../../../constants/Colors';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const logoSize = 40;

const MyQRCode = () => {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user ID when component mounts
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          const decoded = jwtDecode(token);
          setUserId(decoded.userId);
        } else {
          console.log('No token found');
        }
      } catch (error) {
        console.error('Error fetching user ID:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserId();
  }, []);

  // Generate QR value in the format that scan-qr.js expects: "like:userId"
  const qrValue = userId ? `like:${userId}` : '';

  // Navigate back to bio index
  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f6f8" />
      
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primaryColor} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>QR Code</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Main content */}
      <View style={styles.container}>
        {/* Logo */}
        <Image 
          source={require('../../../assets/images/cupid_icon.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Text style={styles.title}>My Personal QR Code</Text>
        <Text style={styles.subtitle}>Let others scan this to like you instantly</Text>
        
        <LinearGradient
          colors={['#ffffff', '#f9f9f9']}
          style={styles.qrContainer}
        >
          <View style={styles.qrWrapper}>
            {loading ? (
              <ActivityIndicator size="large" color={Colors.primaryColor} />
            ) : userId ? (
              <QRCode
                value={qrValue}
                size={250}
                color="#000"
                backgroundColor="#fff"
                logo={require('../../../assets/images/cupid_icon.png')}
                logoSize={logoSize}
                logoBackgroundColor="white"
                logoBorderRadius={10}
              />
            ) : (
              <Text style={styles.errorText}>Could not load user information</Text>
            )}
          </View>
        </LinearGradient>
        
        <View style={styles.instructionsContainer}>
          <Ionicons name="information-circle-outline" size={24} color={Colors.primaryColor} style={styles.infoIcon} />
          <Text style={styles.instructions}>
            When someone scans this QR code, they'll automatically send you a match request.
          </Text>
        </View>
        
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-social-outline" size={20} color="white" />
          <Text style={styles.shareButtonText}>Share My QR Code</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  backButton: {
    padding: 8,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  qrContainer: {
    borderRadius: 20,
    padding: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 15,
    elevation: 8,
  },
  qrWrapper: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    marginHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoIcon: {
    marginRight: 10,
  },
  instructions: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    lineHeight: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryColor,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 50,
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primaryColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  shareButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default MyQRCode;
