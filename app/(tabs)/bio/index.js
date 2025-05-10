import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, SafeAreaView, TouchableOpacity, Image, Switch, Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router, useFocusEffect } from 'expo-router'
import { jwtDecode } from 'jwt-decode'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { Colors } from '../../../constants/Colors'
import { LinearGradient } from 'expo-linear-gradient'
import appConfigs from '../../../configs/config'
import * as ImagePicker from 'expo-image-picker'

const API_URL = appConfigs.API_URL

const ProfileScreen = () => {
  // Initialize state variables
  const [userData, setUserData] = useState({
    name: '',
    age: '',
    avatar: '',
    description: '',
  })
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notificationEnabled, setNotificationEnabled] = useState(true)
  const [updatingAvatar, setUpdatingAvatar] = useState(false)

  // Function calculate age from birthday
  const calculateAge = (birthday) => {
    const today = new Date()
    const birthdayDateObject = new Date(birthday)
    let age = today.getFullYear() - birthdayDateObject.getFullYear()
    const monthDiff = today.getMonth() - birthdayDateObject.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdayDateObject.getDate())) {
      --age
    }

    return age
  }

  const fetchUserId = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken')
      if (token) {
        const decoded = jwtDecode(token)
        setUserId(decoded.userId)
        return decoded.userId
      } else {
        console.log('No token found, redirecting to login')
        router.replace('/(auth)/login')
        return null
      }
    } catch (error) {
      console.error("Error fetching user ID:", error)
      return null
    }
  }

  // Fetch user data from the server
  const fetchUserData = async (userId) => {
    try {
      const URL = `${API_URL}/profile/${userId}`
      console.log('Fetching user data from:', URL)

      const response = await fetch(URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.status}`)
      }

      const result = await response.json()

      if (result.status === 'success' && result.data) {
        const { name, birthday, avatar, description } = result.data
        setUserData({
          name,
          age: calculateAge(birthday),
          avatar: avatar || '../../../assets/images/placeholder_avatar.png',
          description,
        })
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching user data:', error)
      setLoading(false)
    }
  }

  // Navigate to profile edit page
  const navigateToEditProfile = () => {
    router.push('/(tabs)/bio/edit-profile')
  }

  // Navigate to location settings
  const navigateToLocation = () => {
    router.push('/(tabs)/bio/location')
  }
  const navigateToChangePassword = () => {
    router.push('/(tabs)/bio/change-password');
  };

  const navigateToScanQR = () => {
    router.push('/(tabs)/bio/scan-qr');
  };

  const navigateToMyQR = () => {
    router.push('/(tabs)/bio/my-qr');
  };

  // Logout function - Delete user token and redirect to login page
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken')
      router.replace('/(auth)/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }
  
  // Handle avatar selection and upload
  const handleAvatarUpdate = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library to update your avatar')
        return
      }

      // Open image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0].uri
        // Upload to Cloudinary
        await uploadAvatarToCloudinary(selectedImage)
      }
    } catch (error) {
      console.error('Error picking image:', error)
      Alert.alert('Error', 'Failed to pick image. Please try again.')
    }
  }

  // Upload avatar to Cloudinary
  // imageUri: image path from user device
  const uploadAvatarToCloudinary = async (imageUri) => {
    try {
      setUpdatingAvatar(true)
      
      // Create form data for upload
      const formData = new FormData() // multipart/form-data
      const filename = imageUri.split('/').pop()
      console.log('Filename upload:', filename)
      const match = /\.(\w+)$/.exec(filename) // File extension .jpg, .png, .jpeg,..
      const type = match ? `image/${match[1]}` : 'image'  // Image type image/jpg, image/png
      
      formData.append('file', {
        uri: imageUri,
        name: filename,
        type,
      })
      
      formData.append('upload_preset', process.env.EXPO_PUBLIC_CLOUDINARY_PRESET || 'dating_app_preset')

      // Upload to Cloudinary
      const cloudinaryUrl = process.env.EXPO_PUBLIC_CLOUDINARY_ENDPOINT || 'https://api.cloudinary.com/v1_1/your_cloud_name/upload'
      const response = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      })
      
      const data = await response.json()
      
      if (data.secure_url) {
        // Update avatar in database with the Cloudinary URL
        console.log('Cloudinary avatar URL:', data.secure_url)
        await updateAvatarInDatabase(data.secure_url)
      } else {
        throw new Error('Failed to upload image to Cloudinary')
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
    } finally {
      setUpdatingAvatar(false)
    }
  }

  const updateAvatarInDatabase = async (avatarUrl) => {
    try {
      const response = await fetch(`${API_URL}/profile/update-avatar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          avatarUrl,
        }),
      })

      const result = await response.json()
      
      if (result.status === 'success') {
        // Update local user data with new avatar
        setUserData(prevData => ({
          ...prevData,
          avatar: avatarUrl,
        }))
        Alert.alert('Success', 'Avatar updated successfully')
      } else {
        Alert.alert('Error', result.message || 'Failed to update avatar')
      }
    } catch (error) {
      console.error('Error updating avatar in database:', error)
    }
  }

  // Fetch user ID when the component mounts
  // useEffect(() => {
  //   const loadUserData = async () => {
  //     const userId = await fetchUserId()
  //     if (userId) {
  //       // Fetch user data once
  //       fetchUserData(userId)
  //     }
  //   }

  //   loadUserData()
  // }, [])

  useFocusEffect(
    useCallback(() => {
      const loadUserData = async () => {
        setLoading(true)
        const userId = await fetchUserId()
        if (userId) {
          await fetchUserData(userId)
        }
      }
      loadUserData()
    }, [])
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primaryColor} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          {/* <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FF4D67" />
          </TouchableOpacity> */}
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.iconButton} onPress={navigateToMyQR}>
              <Ionicons name="qr-code" size={24} color="#FF4D67" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={navigateToScanQR}>
              <Ionicons name="scan-outline" size={24} color="#FF4D67" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuButton}>
              <Ionicons name="menu-outline" size={24} color="#FF4D67" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile view */}
        <View style={styles.profileContainer}>
          <View style={styles.profileImageContainer}>
            <LinearGradient
              colors={[Colors.primaryColor, '#FF758C', Colors.secondaryColor, '#FF9A8B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientAvatarBorder}
            >
              <View style={styles.profileAvatarWrapper}>
                <Image
                  source={
                    userData.avatar
                      ? { uri: userData.avatar }
                      : require('../../../assets/images/default-img.jpg')
                  }
                  defaultSource={require('../../../assets/images/default-img.jpg')}
                  style={styles.profileImage}
                />
                {updatingAvatar && (
                  <View style={styles.avatarLoadingOverlay}>
                    <ActivityIndicator size="large" color="#ffffff" />
                  </View>
                )}
              </View>
            </LinearGradient>
            <TouchableOpacity style={styles.editImageButton} onPress={handleAvatarUpdate} disabled={updatingAvatar}>
              <MaterialIcons name="edit" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.nameAgeContainer}>
            <Text style={styles.name}>{userData.name},</Text>
            <Text style={styles.age}>{userData.age}</Text>
          </View>
          
          <Text style={styles.description}>{userData.description}</Text>

          {/* Divider between Profile & Functionalities */}
          <LinearGradient 
            style={styles.divider}
            colors={['transparent', Colors.primaryColor, Colors.secondaryColor, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>

        {/* Functionalities & Settings */}
        <View style={styles.settingsContainer}>
          {/* Edit profile */}
          <TouchableOpacity style={styles.settingItem} onPress={navigateToEditProfile}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="person-outline" size={20} color="#FF4D67" />
            </View>
            <Text style={styles.settingText}>Edit profile</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={navigateToChangePassword}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="refresh-outline" size={20} color="#FF4D67" />
            </View>
            <Text style={styles.settingText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="notifications-outline" size={20} color="#FF4D67" />
            </View>
            <Text style={styles.settingText}>Notifications  </Text>
            <Switch
              value={notificationEnabled}
              onValueChange={setNotificationEnabled}
              trackColor={{ false: '#D1D1D6', true: '#FFCDD5' }}
              thumbColor={notificationEnabled ? '#FF4D67' : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity style={styles.settingItem} onPress={navigateToLocation}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="location-outline" size={20} color="#FF4D67" />
            </View>
            <Text style={styles.settingText}>Location</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="link-outline" size={20} color="#FF4D67" />
            </View>
            <Text style={styles.settingText}>Linked Account</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="help-circle-outline" size={20} color="#FF4D67" />
            </View>
            <Text style={styles.settingText}>Helps</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          {/* Logout Section */}
          <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="log-out-outline" size={20} color="#FF4D67" />
            </View>
            <Text style={styles.settingText}>Logout</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.primaryColor,
  },

  /**
   * Header Styles
   */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 4,
    marginRight: 10,
  },
  menuButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primaryColor,
  },

  /**
   * Profile Styles
   */
  profileContainer: {
    marginBottom: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientAvatarBorder: {
    width: 174,
    height: 174,
    aspectRatio: 1,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'FFF',
    shadowColor: '#FD5564',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  profileAvatarWrapper: {
    borderRadius: 100,
    position: 'relative',
  },
  profileImage: {
    width: 160,
    height: 160,
    aspectRatio: 1,
    borderRadius: 80
  },
  avatarLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageButton: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: '#FF4D67',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  nameAgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  age: {
    fontSize: 22,
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },

  /**
   * Gradient Divider Addtional Styles
   */
  divider: {
    width: '90%',
    height: 1.5,
    marginVertical: 12,
    alignSelf: 'center',
  },

  /**
   * Functionality & Settings Styles 
   */
  settingsContainer: {
    backgroundColor: '#FFF8F9',
    borderRadius: 15,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE0E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
})

export default ProfileScreen