import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Colors } from "../../../constants/Colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useLocalSearchParams } from "expo-router";

const { width, height } = Dimensions.get("window");

const ImageGallery = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialIndex = params.selectedIndex
    ? parseInt(params.selectedIndex)
    : 0;

  // State to track the selected image index and gallery images
  const [selectedImageIndex, setSelectedImageIndex] = useState(initialIndex);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Animation values
  const animatedValues = useRef([]).current;
  const opacityValues = useRef([]).current;

  // Ref for ScrollView
  const scrollViewRef = useRef(null);

  // Load gallery images from AsyncStorage
  useEffect(() => {
    async function loadGallery() {
      try {
        const galleryData = await AsyncStorage.getItem("viewingGallery");
        if (galleryData) {
          const gallery = JSON.parse(galleryData);

          // Filter out any empty, null, or invalid URLs
          const validGallery = gallery.filter(
            (url) => url && typeof url === "string" && url.trim().length > 0
          );

          setImages(validGallery);

          // Initialize animation values for each image
          const newAnimatedValues = validGallery.map(
            () => new Animated.Value(1)
          );
          const newOpacityValues = validGallery.map(
            () => new Animated.Value(1)
          );

          // Update refs
          animatedValues.push(...newAnimatedValues);
          opacityValues.push(...newOpacityValues);

          // Initialize animations
          setTimeout(() => {
            const validIndex = Math.min(initialIndex, validGallery.length - 1);
            handleImageSelect(validIndex, false);
            setLoading(false);
          }, 100);
        } else {
          console.log("No gallery data found");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading gallery:", error);
        setLoading(false);
      }
    }

    loadGallery();
  }, [initialIndex]);

  // Function to handle image selection with animation
  const handleImageSelect = (index, animate = true) => {
    if (images.length === 0 || !animatedValues.length) return;

    // Ensure the index is valid
    const safeIndex = Math.max(0, Math.min(index, images.length - 1));

    // Reset all animations first
    animatedValues.forEach((anim, i) => {
      Animated.parallel([
        Animated.timing(anim, {
          toValue: i === safeIndex ? 1.15 : 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValues[i], {
          toValue: i === safeIndex ? 1 : 0.6,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });

    // Update selected index
    setSelectedImageIndex(safeIndex);

    // Scroll to the selected thumbnail
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: safeIndex * 80,
        animated: true,
      });
    }
  };

  // Handle back button press
  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryColor} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <MaterialIcons
            name="arrow-back-ios"
            size={18}
            color={Colors.primaryColor}
          />
        </TouchableOpacity>
      </View>

      {/* Main image display - Simplified */}
      <View style={styles.mainImageContainer}>
        {images.length > 0 && (
          <Image
            source={{ uri: images[selectedImageIndex] }}
            style={styles.mainImage}
            resizeMode="cover"
          />
        )}
      </View>

      {/* Thumbnail row */}
      {images.length > 0 && (
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailContainerContent}
          style={styles.thumbnailContainer}
        >
          {images.map((image, index) => {
            const animatedStyle =
              animatedValues[index] && opacityValues[index]
                ? {
                    transform: [{ scale: animatedValues[index] }],
                    opacity: opacityValues[index],
                  }
                : {};

            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleImageSelect(index)}
                activeOpacity={0.9}
              >
                <Animated.View
                  style={[
                    styles.thumbnailWrapper,
                    animatedStyle,
                    selectedImageIndex === index &&
                      styles.selectedThumbnailWrapper,
                  ]}
                >
                  <Image
                    source={{ uri: image }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                  />
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: StatusBar.currentHeight || 10,
    paddingLeft: 10,
    paddingBottom: 10,
    backgroundColor: "white",
    zIndex: 10,
  },
  backButton: {
    left: 10,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 8,
    height: 40,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  mainImageContainer: {
    flex: 1,
    width: width,
    overflow: "hidden",
    backgroundColor: "#f9f9f9",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  thumbnailContainer: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    maxHeight: 110,
    paddingVertical: 5,
  },
  thumbnailContainerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  thumbnailWrapper: {
    width: 70,
    height: 70,
    borderRadius: 12,
    margin: 5,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#f9f9f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    zIndex: 1,
  },
  selectedThumbnailWrapper: {
    borderColor: Colors.primaryColor,
    transform: [{ scale: 1.05 }],
    zIndex: 2,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ImageGallery;
