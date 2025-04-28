import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
  Animated,
  PanResponder,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { jwtDecode } from 'jwt-decode'
import configs from '../../../configs/config'
import DateTimePickerModal from 'react-native-modal-datetime-picker'

// API Configuration & Cloudinary setup
const API_URL = configs.API_URL
const CLOUDINARY_ENDPOINT = process.env.EXPO_PUBLIC_CLOUDINARY_ENDPOINT
const CLOUDINARY_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_PRESET

// Get device & Define Grid size
const { width, height } = Dimensions.get("window")
const GRID_WIDTH = width / 3 - 16
const GRID_HEIGHT = GRID_WIDTH * 1.5 // Rectangular aspect ratio

// Calculate age from birthday
const calculateAge = (birthdayString) => {
  const birthday = new Date(birthdayString)
  const today = new Date()
  let age = today.getFullYear() - birthday.getFullYear()
  const monthDiff = today.getMonth() - birthday.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
    age--
  }
  
  return age
}

const EditProfileScreen = () => {
  const [activeTab, setActiveTab] = useState("edit") // 'edit' or 'preview'
  const [userData, setUserData] = useState({
    name: '',
    age: '',
    bio: '',
    avatar: null,
    profileImgs: Array(9).fill(null),
    gender: '',
    birthday: null,
    hobbies: [],
    preference: {
      gender: '',
      maxDistance: '',
      minAge: '',
      maxAge: '',
    },
  })
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [draggingIndex, setDraggingIndex] = useState(null)
  const [dropZoneIndex, setDropZoneIndex] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [newImageUploads, setNewImageUploads] = useState([])
  const [isDatePickerVisible, setDatePickerVisible] = useState(false)

  // Animation values for drag and drop
  const pan = useRef(new Animated.ValueXY()).current  // Control drag 2d position
  const gridItemRefs = useRef(Array(9).fill(null).map(() => React.createRef()))
  const gridItemPositions = useRef([])  // Save object position for each item

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
        const { name, birthday, avatar, description, gender, hobbies, profileImgs, preference } = result.data
        
        console.log('Received profile images:', profileImgs)
        console.log('Received birthday:', birthday)
        
        // Prepare profileImgs array (9 slots)
        const profileImgsArray = Array(9).fill(null)
        if (profileImgs && profileImgs.length > 0) {
          profileImgs.forEach((img, index) => {
            if (index < 9) {
              // Mark images from server as already on Cloudinary
              profileImgsArray[index] = { uri: img, isCloudinary: true }
            }
          })
        }
        
        // Convert birthday string to Date object for DatePicker
        const birthdayDate = birthday ? new Date(birthday) : null
        
        setUserData({
          name: name || "",
          age: birthdayDate ? calculateAge(birthdayDate).toString() : "",
          bio: description || "",
          avatar: avatar ? { uri: avatar } : null,
          profileImgs: profileImgsArray,
          gender: gender || "",
          birthday: birthdayDate,
          hobbies: hobbies || [],
          preference: {
            gender: preference?.gender || "any",
            maxDistance: preference?.maxDistance?.toString() || "50",
            minAge: preference?.minAge?.toString() || "18",
            maxAge: preference?.maxAge?.toString() || "100",
          },
        })
      }
      
      // Reset new uploads tracking
      setNewImageUploads([])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching user data:', error)
      setLoading(false)
      Alert.alert("Error", "Failed to load profile data. Please try again.")
    }
  }

  // Store positions of grid items
  const updateGridItemPositions = () => {
    gridItemRefs.current.forEach((ref, index) => {
      if (ref.current) {
        ref.current.measureInWindow((x, y, width, height) => {
          // x,y: position relate to the screen (measureInWindow)
          // width, height: size of component
          gridItemPositions.current[index] = { x, y, width, height }
        })
      }
    })
  }

  // Create PanResponder to drag and drop functionality for each image
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        setIsDragging(true)
        updateGridItemPositions()
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        })
        pan.setValue({ x: 0, y: 0 })
      },
      onPanResponderMove: (evt, gestureState) => {
        Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        })(evt, gestureState)

        // Check if over a dropzone
        const dragX = gestureState.moveX
        const dragY = gestureState.moveY

        // Calculate which position the image is being dragged over
        const hoveringIndex = gridItemPositions.current.findIndex(
          (item, idx) => {
            if (!item) return false
            return (
              dragX >= item.x &&
              dragX <= item.x + item.width &&
              dragY >= item.y &&
              dragY <= item.y + item.height &&
              idx !== draggingIndex
            )
          }
        )

        setDropZoneIndex(hoveringIndex !== -1 ? hoveringIndex : null)
      },
      onPanResponderRelease: (evt, gestureState) => {
        setIsDragging(false)
        pan.flattenOffset()

        if (
          draggingIndex !== null &&
          dropZoneIndex !== null &&
          draggingIndex !== dropZoneIndex
        ) {
          handleImageReorder(draggingIndex, dropZoneIndex)
        }

        // Reset position
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          friction: 5,
          useNativeDriver: false,
        }).start()

        setDraggingIndex(null)
        setDropZoneIndex(null)
      },
    })
  ).current

  // Normalize the profile images array (shift all images to the beginning)
  const normalizeProfileImages = (imagesArray) => {
    // Filter non-null images
    const nonNullImages = imagesArray.filter(img => img !== null)
    
    // Create new array
    const normalizedArray = Array(9).fill(null)
    
    // Insert non-null images into the beginning of normalizedArray 
    nonNullImages.forEach((img, index) => {
      normalizedArray[index] = img
    })
    
    return normalizedArray
  }

  // Reorder images
  const handleImageReorder = (fromIndex, toIndex) => {
    // Create a copy of the profileImgs array
    const updatedImgs = [...userData.profileImgs]

    // Remove the image from the original position
    const movedImage = updatedImgs[fromIndex]

    // If moved image is null (empty slot), don't do anything
    if (movedImage === null) return

    // Handle image position swapping
    if (updatedImgs[toIndex] === null) {
      // If target position is empty, just move the image there
      updatedImgs[fromIndex] = null
      updatedImgs[toIndex] = movedImage
    } else {
      // If target position has an image, swap them
      updatedImgs[fromIndex] = updatedImgs[toIndex]
      updatedImgs[toIndex] = movedImage
    }

    // Normalize the images to ensure no gaps
    const normalizedImages = normalizeProfileImages(updatedImgs)
    
    setUserData({ ...userData, profileImgs: normalizedImages })
    setHasChanges(true)
  }

  const handleRemoveImage = (index) => {
    const newProfileImgs = [...userData.profileImgs]

    // Remove the image
    newProfileImgs[index] = null
    
    // Normalize to ensure no gaps
    const normalizedImages = normalizeProfileImages(newProfileImgs)

    setUserData({ ...userData, profileImgs: normalizedImages })
    setHasChanges(true)
  }

  useEffect(() => {
    const initializeProfile = async () => {
      setLoading(true)
      const id = await fetchUserId()
      if (id) {
        await fetchUserData(id)
      }
    }
    
    initializeProfile()
  }, [])

  useEffect(() => {
    // Set avatar as active in preview mode (instead of first image)
    if (activeTab === "preview") {
      setCurrentPhotoIndex(-1) // Always start with avatar in preview mode
    }
  }, [activeTab])

  const showDatePicker = () => {
    setDatePickerVisible(true)
  }

  const hideDatePicker = () => {
    setDatePickerVisible(false)
  }

  const handleDateConfirm = (date) => {
    setUserData({
      ...userData,
      birthday: date,
      age: calculateAge(date).toString()
    })
    setHasChanges(true)
    hideDatePicker()
  }

  const formatDate = (date) => {
    if (!date) return ''
    
    const d = new Date(date)
    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const year = d.getFullYear()
    
    return `${day}/${month}/${year}`
  }

  const formatDateForAPI = (date) => {
    if (!date) return null
    
    // Return ISO string which will be properly parsed by MongoDB
    return date.toISOString()
  }

  const parseHobbies = (hobbiesString) => {
    if (!hobbiesString) return []
    return hobbiesString.split(',').map(hobby => hobby.trim()).filter(hobby => hobby !== '')
  }

  const formatHobbies = (hobbiesArray) => {
    if (!hobbiesArray || hobbiesArray.length === 0) return ''
    return hobbiesArray.join(', ')
  }

  const handleInputChange = (field, value) => {
    setUserData((prev) => {
      let newData

      if (field === "hobbies") {
        newData = { ...prev, [field]: parseHobbies(value) }
      } else {
        newData = { ...prev, [field]: value }
      }
      
      setHasChanges(true)
      return newData
    })
  }

  const handlePreferenceChange = (field, value) => {
    setUserData((prev) => {
      const newData = {
        ...prev,
        preference: {
          ...prev.preference,
          [field]: value,
        },
      }
      setHasChanges(true)
      return newData
    })
  }

  const pickImage = async (index) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4], // Rectangular aspect ratio like Tinder
        quality: 0.8,    // Slightly reduced quality for better upload performance
      })

      if (!result.canceled) {
        // Find the first available slot
        const firstAvailableIndex = userData.profileImgs.findIndex(img => img === null)
        const targetIndex = firstAvailableIndex !== -1 ? firstAvailableIndex : index
        
        const newProfileImgs = [...userData.profileImgs]
        const imageUri = result.assets[0].uri
        console.log('Selected image URI:', imageUri)
        
        newProfileImgs[targetIndex] = { uri: imageUri, isCloudinary: false }
        
        // Track this as a new upload that needs to be sent to Cloudinary
        setNewImageUploads(prev => [...prev, targetIndex])
        
        setUserData({ ...userData, profileImgs: newProfileImgs })
        setHasChanges(true)
      }
    } catch (error) {
      console.error("Error picking image:", error)
      Alert.alert("Error", "Could not select image. Please try again.")
    }
  }

  const handleSaveProfile = async () => {
    try {
      setLoading(true)
      setUploadingImages(true)
      setUploadProgress(0)
  
      // Upload all new images to Cloudinary first
      const imagesToUpload = newImageUploads.filter(
        (index) =>
          userData.profileImgs[index] !== null &&
          !userData.profileImgs[index].isCloudinary
      )
  
      const totalUploads = imagesToUpload.length
      let completedUploads = 0
  
      console.log(`Starting upload of ${totalUploads} images to Cloudinary`)
  
      let updatedProfileImgs = [...userData.profileImgs] // Copy of profileImgs
  
      // Process all new image uploads first
      if (totalUploads > 0) {
        try {
          await Promise.all(
            imagesToUpload.map(async (index) => {
              try {
                const imageUri = updatedProfileImgs[index]?.uri
                
                if (!imageUri) {
                  console.error(`No URI found for image at index ${index}`)
                  updatedProfileImgs[index] = null
                  return
                }
  
                console.log(
                  `Uploading image ${completedUploads + 1}/${totalUploads}: ${imageUri}`
                )
  
                // Upload to Cloudinary
                const cloudinaryUrl = await uploadImageToCloudinary(imageUri)
  
                // Update with Cloudinary URL in the local state
                updatedProfileImgs[index] = { uri: cloudinaryUrl, isCloudinary: true }
  
                // Update progress
                completedUploads++
                setUploadProgress(
                  Math.floor((completedUploads / totalUploads) * 100)
                )
              } catch (error) {
                console.error(`Error uploading image at index ${index}:`, error)
                updatedProfileImgs[index] = null
                Alert.alert(
                  "Warning",
                  `Failed to upload image at slot ${index + 1}. It will be skipped.`
                )
              }
            })
          )
          
          // Update userData with the Cloudinary URLs
          setUserData((prev) => ({
            ...prev,
            profileImgs: updatedProfileImgs,
          }))
        } catch (error) {
          console.error("Error during image uploads:", error)
          throw new Error("Failed to upload images to Cloudinary")
        }
      }
  
      setUploadingImages(false)
  
      // Extract all Cloudinary image URLs from the profile images
      const profileImageUris = updatedProfileImgs
        .filter((img) => img !== null)
        .map((img) => img.uri)
      
      console.log("Profile image URIs to save:", profileImageUris)
      
      // Properly check if any local URIs remain
      const hasLocalUri = profileImageUris.some((uri) => {
        // Check if this is a local file URI
        return uri && typeof uri === 'string' && (uri.startsWith("file://") || uri.startsWith("content://"))
      })
  
      if (hasLocalUri) {
        console.error("Found local URIs in profile images that weren't uploaded")
        throw new Error("Some images failed to upload to Cloudinary. Please try again.")
      }
  
      // Prepare the data for API
      const profileData = {
        userId,
        name: userData.name,
        description: userData.bio,
        gender: userData.gender,
        birthday: userData.birthday ? formatDateForAPI(userData.birthday) : null, // Ensure birthday is properly formatted
        hobbies: userData.hobbies,
        avatar: userData.avatar?.uri,
        profileImgs: profileImageUris,
        preference: {
          gender: userData.preference.gender,
          maxDistance: parseInt(userData.preference.maxDistance) || 50,
          minAge: parseInt(userData.preference.minAge) || 18,
          maxAge: parseInt(userData.preference.maxAge) || 100,
        },
      }
  
      console.log("Sending profile data to update API:", JSON.stringify(profileData))
      console.log("Birthday being sent:", profileData.birthday) // Log the birthday being sent
  
      const response = await fetch(`${API_URL}/profile/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      })
  
      if (!response.ok) {
        const errorText = await response.text()
        console.error("API response not OK:", response.status, errorText)
        throw new Error(`Failed to update profile: ${response.status}`)
      }
  
      const result = await response.json()
      console.log("Profile update response:", result)
  
      if (result.status === "success") {
        Alert.alert("Success", "Profile updated successfully!")
        setHasChanges(false)
        setNewImageUploads([]) // Reset new uploads tracking
  
        // Refresh user data to get the updated profile
        await fetchUserData(userId)
      } else {
        throw new Error(result.message || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      Alert.alert(
        "Error",
        `Failed to save profile: ${error.message}. Please try again.`
      )
    } finally {
      setLoading(false)
      setUploadingImages(false)
    }
  }

  const goBack = () => {
    if (hasChanges) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Do you want to save before leaving?",
        [
          { text: "Discard", onPress: () => router.back() },
          { text: "Cancel", style: "cancel" },
          {
            text: "Save",
            onPress: async () => {
              await handleSaveProfile()
              router.back()
            },
          },
        ],
      )
    } else {
      router.back()
    }
  }

  const navigatePhoto = (direction) => {
    const validIndices = userData.profileImgs
      .map((img, index) => (img !== null ? index : -1))
      .filter((index) => index !== -1)

    if (validIndices.length === 0) return

    if (currentPhotoIndex === -1) {
      // If showing avatar, move to first valid image
      setCurrentPhotoIndex(validIndices[0])
      return
    }

    const currentIdxPosition = validIndices.indexOf(currentPhotoIndex)

    if (direction === "next" && currentIdxPosition < validIndices.length - 1) {
      // Move to next photo
      setCurrentPhotoIndex(validIndices[currentIdxPosition + 1])
    } else if (direction === "prev" && currentIdxPosition > 0) {
      // Move to previous photo
      setCurrentPhotoIndex(validIndices[currentIdxPosition - 1])
    } else if (direction === "prev" && currentIdxPosition === 0) {
      // If on first photo and going previous, show avatar
      setCurrentPhotoIndex(-1)
    }
  }

  const getPhotoCount = () => {
    return userData.profileImgs.filter((img) => img !== null).length + 1 // +1 for avatar
  }

  const getActivePhotoNumber = () => {
    if (currentPhotoIndex === -1) return 1 // Avatar is first photo

    const validIndices = userData.profileImgs
      .map((img, index) => (img !== null ? index : -1))
      .filter((index) => index !== -1)

    return validIndices.indexOf(currentPhotoIndex) + 2 // +2 because avatar is first (index 1)
  }

  // Add the uploadImageToCloudinary function
  const uploadImageToCloudinary = async (uri) => {
    try {
      console.log('Starting Cloudinary upload for:', uri)
      
      // Create form data for the image
      const formData = new FormData()
      
      // Get filename from URI
      const uriParts = uri.split('/')
      const fileName = uriParts[uriParts.length - 1]
      
      // Get file type (extension)
      const fileType = fileName.split('.').pop()
      
      // Append the image to form data
      formData.append('file', {
        uri: uri,
        name: fileName,
        type: `image/${fileType}`
      })
      
      // Add upload preset (required by Cloudinary for unsigned uploads)
      formData.append('upload_preset', CLOUDINARY_PRESET)
      
      console.log('Sending to Cloudinary with preset:', CLOUDINARY_PRESET)
      
      // Send the request to Cloudinary
      const response = await fetch(CLOUDINARY_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Cloudinary upload failed:', errorText)
        throw new Error(`Cloudinary upload failed: ${response.status}`)
      }
      
      // Parse the response
      const data = await response.json()
      
      console.log('Cloudinary upload successful, received URL:', data.secure_url)
      
      // Return the secure URL of the uploaded image
      return data.secure_url
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error)
      throw new Error(`Failed to upload image: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        {uploadingImages ? (
          <>
            <Text style={styles.loadingText}>
              Uploading images: {uploadProgress}%
            </Text>
            <ActivityIndicator size="large" color="#FF4D67" />
            <Text style={styles.loadingSubText}>
              Please don't close the app
            </Text>
          </>
        ) : (
          <>
            <ActivityIndicator size="large" color="#FF4D67" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </>
        )}
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={goBack}>
          <Ionicons name="chevron-back" size={24} color="#FF4D67" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        {hasChanges ? (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveProfile}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerButton} />
        )}
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "edit" && styles.activeTab]}
          onPress={() => setActiveTab("edit")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "edit" && styles.activeTabText,
            ]}
          >
            Edit
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "preview" && styles.activeTab]}
          onPress={() => setActiveTab("preview")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "preview" && styles.activeTabText,
            ]}
          >
            Preview
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "edit" ? (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>

            {isDragging && (
              <View style={styles.dragHintContainer}>
                <Text style={styles.dragHintText}>
                  Drag to reorder your photos
                </Text>
              </View>
            )}

            <View style={styles.photoGrid}>
              {userData.profileImgs.map((image, index) => (
                <View 
                  key={index} 
                  style={styles.imageContainer}
                  ref={gridItemRefs.current[index]}
                >
                  {image ? (
                    <Animated.View
                      style={[
                        styles.imageWrapper,
                        draggingIndex === index
                          ? {
                              transform: [
                                { translateX: pan.x },
                                { translateY: pan.y },
                              ],
                              zIndex: 999,
                              elevation: 5,
                              shadowColor: "#000",
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.25,
                              shadowRadius: 3.84,
                            }
                          : {},
                      ]}
                      {...(draggingIndex === index
                        ? panResponder.panHandlers
                        : {})}
                    >
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onLongPress={() => setDraggingIndex(index)}
                        delayLongPress={200}
                      >
                        <Image source={image} style={styles.image} />
                        {index === 0 && (
                          <View style={styles.mainPhotoIndicator}>
                            <Text style={styles.mainPhotoText}>MAIN</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveImage(index)}
                      >
                        <Ionicons name="close-circle" size={24} color="#FFF" />
                      </TouchableOpacity>
                    </Animated.View>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.addImageButton,
                        dropZoneIndex === index ? styles.dropZoneHighlight : {},
                      ]}
                      onPress={() => pickImage(index)}
                    >
                      <Ionicons name="add" size={36} color="#FF4D67" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.addMediaButton}
              onPress={() => {
                const emptySlotIndex = userData.profileImgs.findIndex(img => img === null)
                if (emptySlotIndex !== -1) {
                  pickImage(emptySlotIndex)
                } else {
                  Alert.alert("Maximum reached", "You can only add up to 9 photos.")
                }
              }}
            >
              <Text style={styles.addMediaButtonText}>Add media</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <TextInput
              style={styles.bioInput}
              multiline
              placeholder="Write something about yourself..."
              value={userData.bio}
              onChangeText={(text) => handleInputChange("bio", text)}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Info</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={userData.name}
                onChangeText={(text) => handleInputChange("name", text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Birthday</Text>
              <TouchableOpacity 
                style={styles.datePickerButton} 
                onPress={showDatePicker}
              >
                <Text style={styles.dateText}>
                  {userData.birthday ? formatDate(userData.birthday) : 'Select your birthday'}
                </Text>
                <Ionicons name="calendar-outline" size={22} color="#666" />
              </TouchableOpacity>
              <Text style={styles.ageText}>
                Age: {userData.age || ''}
              </Text>
              
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleDateConfirm}
                onCancel={hideDatePicker}
                date={userData.birthday || new Date()} // Set initial date to user's birthday
                maximumDate={new Date()} // Can't select future dates
                minimumDate={new Date(1920, 0, 1)} // Reasonable minimum year
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    userData.gender === "male" && styles.selectedGender,
                  ]}
                  onPress={() => handleInputChange("gender", "male")}
                >
                  <Text
                    style={[
                      styles.genderText,
                      userData.gender === "male" && styles.selectedGenderText,
                    ]}
                  >
                    Male
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    userData.gender === "female" && styles.selectedGender,
                  ]}
                  onPress={() => handleInputChange("gender", "female")}
                >
                  <Text
                    style={[
                      styles.genderText,
                      userData.gender === "female" && styles.selectedGenderText,
                    ]}
                  >
                    Female
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    userData.gender === "other" && styles.selectedGender,
                  ]}
                  onPress={() => handleInputChange("gender", "other")}
                >
                  <Text
                    style={[
                      styles.genderText,
                      userData.gender === "other" && styles.selectedGenderText,
                    ]}
                  >
                    Other
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Interests</Text>
              <TextInput
                style={styles.textInput}
                value={formatHobbies(userData.hobbies)}
                onChangeText={(text) => handleInputChange("hobbies", text)}
                placeholder="Enter interests separated by commas"
              />
              <Text style={styles.helperText}>
                Enter interests separated by commas (e.g., Swimming, Music, Travel)
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.footer} />
        </ScrollView>
      ) : (
        <TouchableOpacity
          style={styles.previewContainer}
          activeOpacity={0.9}
          onPress={(e) => {
            // Determine direction based on touch position
            const touchX = e.nativeEvent.locationX
            if (touchX < width / 2) {
              navigatePhoto("prev")
            } else {
              navigatePhoto("next")
            }
          }}
        >
          {/* Current Photo */}
          {currentPhotoIndex === -1
            ? userData.avatar && (
                <Image
                  source={userData.avatar}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              )
            : userData.profileImgs[currentPhotoIndex] && (
                <Image
                  source={userData.profileImgs[currentPhotoIndex]}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              )}

          {/* Photo indicators in Tinder style */}
          <View style={styles.photoIndicatorsContainer}>
            <View style={styles.photoIndicators}>
              {Array(getPhotoCount())
                .fill(0)
                .map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.photoIndicator,
                      index === getActivePhotoNumber() - 1
                        ? styles.activePhotoIndicator
                        : {},
                    ]}
                  />
                ))}
            </View>
          </View>

          <View style={styles.previewOverlay}>
            {/* Display user distance only for avatar view */}
            {currentPhotoIndex === -1 && (
              <View style={styles.distanceContainer}>
                <Ionicons
                  name="location-outline"
                  size={16}
                  color="#FFF"
                  style={{ marginRight: 5 }}
                />
                <Text style={styles.distanceText}>0 km away</Text>
              </View>
            )}

            <View style={styles.previewInfoContainer}>
              <Text style={styles.previewName}>
                {userData.name}{" "}
                <Text style={styles.previewAge}>{userData.age}</Text>
              </Text>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="white" />
              </View>
            </View>

            {/* Show bio only on first photo (avatar) */}
            {currentPhotoIndex === -1 && (
              <Text style={styles.previewBio} numberOfLines={2}>
                {userData.bio || "No bio yet"}
              </Text>
            )}

            <View style={styles.previewTags}>
              {userData.hobbies.map((hobby, index) => (
                <View key={index} style={styles.hobbyTag}>
                  <Text style={styles.hobbyTagText}>{hobby}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.infoButton}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="#FFF"
            />
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#FF4D67",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#FF4D67",
  },
  loadingSubText: {
    marginTop: 6,
    fontSize: 14,
    color: "#888",
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#FF4D67",
  },
  tabText: {
    fontSize: 16,
    color: "#999",
  },
  activeTabText: {
    color: "#FF4D67",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  imageContainer: {
    width: GRID_WIDTH,
    height: GRID_HEIGHT,
    marginBottom: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  imageWrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    zIndex: 10,
  },
  addImageButton: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  dropZoneHighlight: {
    borderColor: "#FF4D67",
    backgroundColor: "rgba(255, 77, 103, 0.1)",
  },
  addMediaButton: {
    backgroundColor: "#FF4D67",
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 20,
  },
  addMediaButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  smartPhotosContainer: {
    marginTop: 16,
  },
  smartPhotosText: {
    fontSize: 16,
    fontWeight: "600",
  },
  smartPhotosDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    flex: 1,
    paddingRight: 12,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  toggleSwitch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E0E0E0",
    padding: 2,
    justifyContent: "center",
  },
  toggleButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "white",
  },
  divider: {
    height: 8,
    backgroundColor: "#F8F8F8",
  },
  bioInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  genderOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: "center",
  },
  selectedGender: {
    backgroundColor: "#FF4D67",
    borderColor: "#FF4D67",
  },
  genderText: {
    color: "#666",
  },
  selectedGenderText: {
    color: "#FFF",
    fontWeight: "500",
  },
  ageRangeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  ageSeparator: {
    fontSize: 20,
    color: "#666",
  },
  footer: {
    height: 80,
  },
  previewContainer: {
    flex: 1,
    position: "relative",
    backgroundColor: "#000",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  photoIndicatorsContainer: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    padding: 8,
    zIndex: 10,
  },
  photoIndicators: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  photoIndicator: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 2,
  },
  activePhotoIndicator: {
    backgroundColor: "#FFF",
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  distanceText: {
    color: "white",
    fontSize: 14,
  },
  previewOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  previewInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  previewName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginRight: 8,
  },
  previewAge: {
    fontSize: 26,
    color: "white",
  },
  verifiedBadge: {
    marginLeft: 8,
  },
  previewBio: {
    fontSize: 16,
    color: "white",
    marginTop: 8,
    lineHeight: 22,
  },
  previewTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  hobbyTag: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  hobbyTagText: {
    color: "white",
    fontSize: 14,
  },
  infoButton: {
    position: "absolute",
    bottom: 25,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  ageText: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
  },
  helperText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    fontStyle: 'italic',
  },
})

export default EditProfileScreen
