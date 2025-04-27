import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Animated,
  PanResponder,
  Easing,
} from "react-native";
import Swiper from "react-native-deck-swiper";
import { FontAwesome } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
const { width, height } = Dimensions.get("window");
import { Colors } from "../../../constants/Colors";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import appConfig from "../../../configs/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "expo-router";
import { debounce } from "lodash";
import { Slider, RangeSlider } from "@react-native-assets/slider";

const API_URL = appConfig.API_URL;

const MatchScreen = () => {
  const router = useRouter()
  const swiperRef = useRef(null)
  const scrollViewRef = useRef(null)

  const [userId, setUserId] = useState(null)
  const [potentialMatches, setPotentialMatches] = useState([])
  const [currentUser, setCurrentUser] = useState(null) // Current user to display in the profile view
  const [hoverSide, setHoverSide] = useState(null) // null, 'left', or 'right'
  const [showFilters, setShowFilters] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Filter state
  const [genderFilter, setGenderFilter] = useState('Girls')
  const [distanceFilter, setDistanceFilter] = useState(40)
  const [ageRange, setAgeRange] = useState([20, 28])
  const [userPreferences, setUserPreferences] = useState(null)
  
  const MIN_AGE = 18
  const MAX_AGE = 100
  const MAX_DISTANCE = 500 // Maximum distance in km

  // Temp state for filters
  const [tempAgeRange, setTempAgeRange] = useState(ageRange);
  const [tempDistanceFilter, setTempDistanceFilter] = useState(distanceFilter);

  // Inside settings preferences modal
  const [isModalReady, setIsModalReady] = useState(false);
  const [modalPosition] = useState(new Animated.Value(height));
  const [overlayOpacity] = useState(new Animated.Value(0));
  const [modalHeight, setModalHeight] = useState(0);

  const panResponder = useRef(
    PanResponder.create({
      // Request permission to start dragging the modal
      onStartShouldSetPanResponder: () => true,

      // Handle the drag gesture
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy >= 0) {
          // Chỉ cho phép kéo xuống (dy >= 0)
          const newPosition = Math.min(gestureState.dy, height); // Giới hạn giá trị tối đa là height
          modalPosition.setValue(newPosition);
          const opacity = 1 - newPosition / height;
          overlayOpacity.setValue(Math.max(0, opacity));
        } else {
          modalPosition.setValue(0); // Nếu kéo lên trên, giữ modal ở vị trí 0
          overlayOpacity.setValue(1);
        }
      },

      // Allow the user to release the modal
      onPanResponderRelease: (evt, gestureState) => {
        const effectiveModalHeight = modalHeight || height * 0.5;
        const minimumDragThreshold = 50;

        if (
          gestureState.dy > effectiveModalHeight / 2 &&
          gestureState.dy > minimumDragThreshold
        ) {
          Animated.parallel([
            Animated.timing(modalPosition, {
              toValue: height,
              duration: 300,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(overlayOpacity, {
              toValue: 0,
              duration: 300,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]).start(() => {
            setShowFilters(false);
          });
        } else {
          Animated.parallel([
            Animated.spring(modalPosition, {
              toValue: 0,
              friction: 8,
              tension: 40,
              useNativeDriver: true,
            }),
            Animated.timing(overlayOpacity, {
              toValue: 1,
              duration: 300,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (showFilters) {
      // Đặt giá trị ban đầu
      modalPosition.setValue(height);
      overlayOpacity.setValue(0);

      // Đầu tiên, chỉ hiển thị overlay
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        // Sau đó mới hiển thị modal
        Animated.timing(modalPosition, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start(() => {
          setIsModalReady(true);
        });
      });
    } else {
      setIsModalReady(false);
      // Đầu tiên, ẩn modal
      Animated.timing(modalPosition, {
        toValue: height,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        // Sau đó mới ẩn overlay
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
      });
    }
  }, [showFilters]);

  // Debounced state updates for distance filter - to avoid spamming
  const debouncedSetDistanceFilter = useCallback(
    debounce((newDistance) => {
      setDistanceFilter(newDistance);
    }, 300),
    []
  );

  // Handle distance change - When the user drags the markers on the slider
  const handleDistanceChange = (values) => {
    // values: single value for distance slider
    setTempDistanceFilter(values);
    debouncedSetDistanceFilter(values);
  };

  // Handle distance completion - When the user releases the markers of multislider
  const handleDistanceComplete = (values) => {
    setDistanceFilter(values);
    setTempDistanceFilter(values);
  };

  // Debounced state updates for age range filter - to avoid spamming
  const debouncedSetAgeRange = useCallback(
    debounce((newRange) => {
      setAgeRange(newRange);
    }, 300),
    []
  );

  // Handle age range change - When the user drags the markers on the slider
  const handleAgeRangeChange = (values) => {
    setTempAgeRange(values);
    setAgeRange(values);
  };

  // Handle age range completion - When the user releases the markers of multislider
  const handleAgeRangeComplete = (values) => {
    setAgeRange(values);
    debouncedSetAgeRange(values);
  };

  // Modify state variables to handle pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    hasNextPage: false,
  });

  // Fetch user ID when the component mounts
  const fetchUserId = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        const decoded = jwtDecode(token);
        setUserId(decoded.userId);
        return decoded.userId;
      } else {
        console.log("No token found, redirecting to login");
        router.replace("/(auth)/login");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user ID:", error);
      return null;
    }
  };

  // Calculate age from birthday
  const calculateAge = (birthdayString) => {
    const birthday = new Date(birthdayString);
    const ageDifMs = Date.now() - birthday.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  // Debounced fetch potential matches to avoid spamming the API
  const debouncedFetchPotentialMatches = useCallback(
    debounce((userId, page, append) => {
      fetchPotentialMatches(userId, page, append);
    }, 500),
    []
  );

  // Function to fetch potential matches - Call API /match/:id/potential-matches
  const fetchPotentialMatches = async (userId, page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setIsFetchingMore(true);
      }

      const URL = `${API_URL}/match/${userId}/potential-matches?page=${page}&limit=${pagination.limit}`;
      const response = await fetch(URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Potential matches response: ", data);

      if (data && data.status === "success") {
        const paginationMetadata = {
          page: data.metadata.page,
          limit: data.metadata.limit,
          total: data.metadata.total,
          hasNextPage: data.metadata.hasNextPage,
        };
        console.log("Pagination metadata: ", paginationMetadata);

        // Update pagination state
        setPagination(paginationMetadata);

          // Notify if no potential matches found on first page
          if (data.data.length === 0 && page === 1) {
            setPotentialMatches([])
            setCurrentUser(null)
            console.log(("No matches found", "Try adjusting your filters or come back later."))
            return
          }

        const formattedUsers = data.data.map((user, index) => {
          // Preload images for the first 5 users
          const avatar = user.avatar || "https://default-avatar-url.com";

          return {
            id: user._id,
            name: user.name,
            age: calculateAge(user.birthday),
            distance: user.distance,
            location: user.location,
            image: user.avatar,
            gallery: user.profileImgs?.length
              ? user.profileImgs
              : [user.avatar],
            profession: user.description?.split(".")[0] || "No description",
            about: user.description || "No description available",
            interests: user.hobbies || [],
            gender: user.gender,
            birthday: user.birthday,
          };
        });

        if (append) {
          setPotentialMatches((prevMatches) => [
            ...prevMatches,
            ...formattedUsers,
          ]);
        } else {
          setPotentialMatches(formattedUsers);
        }

        if (formattedUsers.length > 0 && page === 1) {
          setCurrentUser(formattedUsers[0])
        }
      } else {
        console.log("Failed to fetch potential matches")
      }
    } catch (error) {
      console.error("Error fetching potential matches:", error)
    } finally {
      setLoading(false)
      setIsFetchingMore(false)
      setIsRefreshing(false)
    }
  }

  // Load more matches
  const loadMoreMatches = () => {
    if (pagination.hasNextPage && !isFetchingMore) {
      const nextPage = pagination.page + 1;
      fetchPotentialMatches(userId, nextPage, true);
    }
  };

  // Function to refresh matches
  const refreshMatches = () => {
    setIsRefreshing(true);
    setPagination((prev) => ({ ...prev, page: 1 }));
    debouncedFetchPotentialMatches(userId, 1, false);
  };

  // Add a function to check for new matches
  const checkForNewMatches = () => {
    // Only check if run out of current list
    if (
      potentialMatches.length === 0 ||
      (!pagination.hasNextPage && currentUser === null)
    ) {
      // Reset pagination and fetch first page again
      setPagination((prev) => ({ ...prev, page: 1 }));
      debouncedFetchPotentialMatches(userId, 1, false);
    }
  };

  // Fetch user preferences - Call get preferences GET API /user/:id/preferences
  const fetchUserPreferences = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/match/${userId}/preferences`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("User preferences response: ", data);

      if (data.status === "success") {
        const preferences = {
          gender: mapAPIToGender(data.data.preference.gender),
          maxDistance: data.data.preference.maxDistance,
          ageRange: [data.data.preference.minAge, data.data.preference.maxAge],
        };

        // Set the preferences in state
        setUserPreferences(preferences);
        setGenderFilter(preferences.gender);
        setDistanceFilter(preferences.maxDistance);
        setAgeRange(preferences.ageRange);
      } else {
        console.error("Failed to fetch preferences:", data.message);
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
    }
  };

  // Update user preferences - Call update preferences PUT API /user/:id/preferences
  const updatePreferences = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      const payload = {
        gender: mapGenderToAPI(genderFilter),
        maxDistance: distanceFilter,
        minAge: ageRange[0],
        maxAge: ageRange[1],
      };

      const URL = `${API_URL}/match/${userId}/preferences`;
      console.log("URL: ", URL);
      const response = await fetch(URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json()
      console.log('Update preferences response: ', data)
        
      if (data && data.status === 'success') {
        setUserPreferences({
          gender: genderFilter,
          maxDistance: distanceFilter,
          ageRange,
        })
        setPagination({ 
          page: 1, 
          limit: 20, 
          total: 0, 
          hasNextPage: false })
        debouncedFetchPotentialMatches(userId, 1, false)  // Fetch new matches
        toggleFiltersModal()
      } else {
        console.log('Failed to update preferences')
      }
    } catch (error) {
      console.error('Error updating preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle like action - Call like API /match/:id/like
  const handleLike = async (swipedUserId) => {
    if (!userId) return;

    try {
      const response = await fetch(`${API_URL}/match/${swipedUserId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: userId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Like response: ", data);
    } catch (error) {
      console.error("Error liking user:", error);
    }
  };

  // Handle dislike/skip action - Call dislike API /match/:id/dislike
  const handleSkip = async (swipedUserId) => {
    if (!userId) return;

    try {
      const response = await fetch(`${API_URL}/match/${swipedUserId}/dislike`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: userId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Skip response: ", data);
    } catch (error) {
      console.error("Error skipping user:", error);
    }
  };

  const handleSwipeComplete = (index) => {
    // When user has swiped through 80% of loaded matches, fetch more
    if (
      potentialMatches.length > 0 &&
      index >= potentialMatches.length * 0.8 &&
      pagination.hasNextPage &&
      !isFetchingMore
    ) {
      loadMoreMatches();
    }

    // Update current user display
    if (index < potentialMatches.length - 1) {
      setCurrentUser(potentialMatches[index + 1]);
    } else {
      setCurrentUser(null);
      if (!pagination.hasNextPage) {
        setPotentialMatches([])
        console.log(
          "No more matches",
          "We have shown you everyone that matches your preferences."
        );
        checkForNewMatches()
      }
    }
  }

  // Handle swipe
  const handleSwipe = (index, direction) => {
    console.log("Swiped: ", index, " - ", direction);
    if (potentialMatches.length === 0) return;

    // Get the swiped user ID
    const swipedUserId = potentialMatches[index].id;

    // Handle the swipe action based on the direction
    if (direction === "right") {
      handleLike(swipedUserId);
    } else if (direction === "left") {
      handleSkip(swipedUserId);
    }

    // Update the current user to the next one in the list
    handleSwipeComplete(index);

    setHoverSide(null);
  };

  // Function to clear hover state
  const clearHoverState = () => {
    console.log("Clearing hover state");
    setHoverSide(null);
  };

  // Function to toggle filter modal
  const toggleFiltersModal = () => {
    console.log("Toggling filters modal");
    setShowFilters(!showFilters);
  };

  // Reset filters based on user preferences, use default values if not available
  const clearFilters = () => {
    if (userPreferences) {
      setGenderFilter(userPreferences.gender);
      setDistanceFilter(userPreferences.maxDistance);
      setTempDistanceFilter(userPreferences.maxDistance); // Set temp distance state to synchronize with distance filter
      setAgeRange(userPreferences.ageRange);
      setTempAgeRange(userPreferences.ageRange); // Set temp age state to synchronize with age range
    } else {
      // Fallback to default values if preferences not loaded
      setGenderFilter("Girls");
      setDistanceFilter(40);
      setTempDistanceFilter(40);
      setAgeRange([20, 28]);
      setTempAgeRange([20, 28]);
    }
  };

  // Handle age range change
  // const handleAgeRangeChange = (type, value) => {
  //     if (type === 'min') {
  //         setAgeRange([Math.min(value, ageRange[1]), ageRange[1]])
  //     } else {
  //         setAgeRange([ageRange[0], Math.max(value, ageRange[0])])
  //     }
  // }

  // Toggle profile view
  const toggleProfileView = () => {
    setShowProfile(!showProfile);

    // If showing profile, scroll to the top of it
    if (!showProfile) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: height * 0.6, animated: true });
      }, 100);
    }
  };

  // Map gender filter to API format value ('female', 'male','any')
  const mapGenderToAPI = (gender) => {
    switch (gender) {
      case "Girls":
        return "female";
      case "Boys":
        return "male";
      case "Any":
        return "any";
      default:
        return "female";
    }
  };

  const mapAPIToGender = (genderAPIForm) => {
    switch (genderAPIForm) {
      case "female":
        return "Girls";
      case "male":
        return "Boys";
      case "any":
        return "Any";
      default:
        return "Girls";
    }
  };

  // Synchronize temp age range when ageRange changes
  useEffect(() => {
    setTempAgeRange(ageRange);
  }, [ageRange]);

  // Synchronize temp age range when distanceFilter changes
  useEffect(() => {
    setTempDistanceFilter(distanceFilter);
  }, [distanceFilter]);

  // When the component mounts
  useEffect(() => {
    const initialize = async () => {
      const userId = await fetchUserId();
      if (userId) {
        setUserId(userId);
        await Promise.all([
          fetchUserPreferences(userId),
          fetchPotentialMatches(userId, 1, false),
        ]);
      }
    };
    initialize();
  }, []);

  // To open detai-photo-profile
  const handleOpenGallery = (gallery, selectedIndex = 0) => {
    // Lưu gallery vào AsyncStorage trước khi chuyển trang
    AsyncStorage.setItem("viewingGallery", JSON.stringify(gallery))
      .then(() => {
        // Chuyển đến trang detail-photo-profile
        router.push({
          pathname: "/(tabs)/match/detail-photo-profile",
          params: { selectedIndex },
        });
      })
      .catch((error) => {
        console.error("Error saving gallery data:", error);
      });
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        nestedScrollEnabled={true}
        scrollEventThrottle={16}
        stickyHeaderIndices={[0]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshMatches}
          />
        }
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton}>
              <MaterialIcons
                style={{ marginLeft: 5 }}
                name="arrow-back-ios"
                size={20}
                color={Colors.primaryColor}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.backButton}
              onPress={toggleFiltersModal}
            >
              <FontAwesome5
                name="sliders-h"
                size={24}
                color={Colors.primaryColor}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primaryColor} />
          </View>
        )}

        {/* Swiper Component */}
        {!loading && potentialMatches.length > 0 && (
          <View style={styles.swiperContainer}>
            <Swiper
              ref={swiperRef}
              cards={potentialMatches}
              renderCard={(user) => (
                <TouchableOpacity
                  style={styles.card}
                  onTouchEnd={clearHoverState}
                  onPress={toggleProfileView}
                  activeOpacity={0.95}
                >
                  <Image
                    source={{ uri: user.image }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                  <View style={styles.overlay}>
                    <Text style={styles.distance}>{user.distance}km</Text>
                    <Text style={styles.name}>
                      {user.name}, {user.age}
                    </Text>
                    <Text style={styles.profession}>{user.profession}</Text>
                  </View>
                </TouchableOpacity>
              )}
              onSwipedLeft={(index) => handleSwipe(index, "left")}
              onSwipedRight={(index) => handleSwipe(index, "right")}
              onSwiped={handleSwipe}
              stackSize={3}
              backgroundColor="transparent"
              containerStyle={styles.swiperContainerStyle}
              animateCardOpacity
              animateOverlayLabelsOpacity
              swipeAnimationDuration={350}
            />

            {/* Left hover indicator (skip) */}
            {hoverSide === "left" && (
              <View style={styles.leftHoverIndicator}>
                <FontAwesome name="times" size={40} color="orange" />
              </View>
            )}

            {/* Right hover indicator (heart) */}
            {hoverSide === "right" && (
              <View style={styles.rightHoverIndicator}>
                <FontAwesome
                  name="heart"
                  size={40}
                  color={Colors.primaryColor}
                />
              </View>
            )}
          </View>
        )}

        {/* No potential matches found */}
        {!loading && potentialMatches.length === 0 && (
          <View style={styles.noUsersContainer}>
            <Text style={styles.noUsersText}>
              Looks like there’s no match right now
            </Text>
            <Text style={styles.noUsersSubtext}>
              Try tweaking your filters or come back later
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => swiperRef.current.swipeLeft()}
          >
            <FontAwesome name="times" size={28} color="orange" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.likeButton}
            onPress={() => swiperRef.current.swipeRight()}
          >
            <FontAwesome name="heart" size={40} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.superLikeButton}>
            <FontAwesome name="star" size={28} color="purple" />
          </TouchableOpacity>
        </View>

        {/* Profile View */}
        {currentUser && (
          <View style={styles.profileContainer}>
            <View style={styles.profileHeader}>
              <Text style={styles.profileName}>
                {currentUser.name}, {currentUser.age}
              </Text>
              <TouchableOpacity style={styles.shareButton}>
                <FontAwesome5
                  name="share"
                  size={18}
                  color={Colors.primaryColor}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.locationContainer}>
              <FontAwesome5
                name="map-marker-alt"
                size={12}
                color="#ff4466"
                style={{ marginRight: 5 }}
              />
              {/* <Text style={styles.locationText}>{currentUser.location}</Text> */}
              <View style={styles.kmBadge}>
                <Text style={styles.kmText}>{currentUser.distance}</Text>
              </View>
            </View>

            <View style={styles.aboutSection}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.aboutText}>{currentUser.about}</Text>
              <TouchableOpacity>
                <Text style={styles.readMoreText}>Read more</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.interestsSection}>
              <Text style={styles.sectionTitle}>Interests</Text>
              <View style={styles.interestTags}>
                {currentUser.interests.map((interest, index) => (
                  <View
                    key={index}
                    style={[
                      styles.interestTag,
                      index < 2 && styles.interestTagHighlighted,
                    ]}
                  >
                    <Text
                      style={[
                        styles.interestText,
                        index < 2 && styles.interestTextHighlighted,
                      ]}
                    >
                      {index < 2 && (
                        <FontAwesome5
                          name={index === 0 ? "plane" : "book"}
                          size={12}
                          style={styles.interestIcon}
                        />
                      )}{" "}
                      {interest}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.gallerySection}>
              <View style={styles.galleryHeader}>
                <Text style={styles.sectionTitle}>Gallery</Text>
                <TouchableOpacity>
                  <Text
                    style={styles.seeAllText}
                    onPress={() => handleOpenGallery(currentUser.gallery, 0)}
                  >
                    See all
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.galleryGrid}>
                {currentUser.gallery.slice(0, 6).map((image, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.galleryItem}
                    onPress={() =>
                      handleOpenGallery(currentUser.gallery, index)
                    }
                  >
                    <Image
                      source={{ uri: image }}
                      style={styles.galleryImage}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Filters Modal */}
        <Modal
          animationType="none"
          transparent={true}
          visible={showFilters}
          onRequestClose={toggleFiltersModal}
        >
          <TouchableWithoutFeedback onPress={toggleFiltersModal}>
            <Animated.View
              style={[styles.modalOverlay, { opacity: overlayOpacity }]}
            >
              <TouchableWithoutFeedback>
                <Animated.View
                  style={[
                    styles.filterModalContainer,
                    { transform: [{ translateY: modalPosition }] },
                  ]}
                  onLayout={(event) => {
                    const { height } = event.nativeEvent.layout;
                    setModalHeight(height);
                  }}
                >
                  <View
                    style={styles.filterModalHandle}
                    {...panResponder.panHandlers}
                  />

                  <View style={styles.filterModalHeader}>
                    <Text style={styles.filterModalTitle}>Filters</Text>
                    <TouchableOpacity onPress={clearFilters}>
                      <Text style={styles.clearText}>Clear</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Gender Filter */}
                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>Interested in</Text>
                    <View style={styles.genderButtonsContainer}>
                      <TouchableOpacity
                        style={[
                          styles.genderButton,
                          genderFilter === "Girls" && styles.genderButtonActive,
                        ]}
                        onPress={() => setGenderFilter("Girls")}
                      >
                        <Text
                          style={[
                            styles.genderButtonText,
                            genderFilter === "Girls" &&
                              styles.genderButtonTextActive,
                          ]}
                        >
                          Girls
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.genderButton,
                          genderFilter === "Boys" && styles.genderButtonActive,
                        ]}
                        onPress={() => setGenderFilter("Boys")}
                      >
                        <Text
                          style={[
                            styles.genderButtonText,
                            genderFilter === "Boys" &&
                              styles.genderButtonTextActive,
                          ]}
                        >
                          Boys
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.genderButton,
                          genderFilter === "Any" && styles.genderButtonActive,
                        ]}
                        onPress={() => setGenderFilter("Any")}
                      >
                        <Text
                          style={[
                            styles.genderButtonText,
                            genderFilter === "Any" &&
                              styles.genderButtonTextActive,
                          ]}
                        >
                          Any
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Distance Filter */}
                  <View style={styles.filterSection}>
                    <View style={styles.filterSectionHeader}>
                      <Text style={styles.filterSectionTitle}>Distance</Text>
                      <Text style={styles.filterValue}>
                        {tempDistanceFilter}km
                      </Text>
                    </View>
                    <View style={styles.sliderContainer}>
                      <Slider
                        value={tempDistanceFilter}
                        minimumValue={1}
                        maximumValue={MAX_DISTANCE}
                        step={1}
                        onValueChange={(value) => {
                          handleDistanceChange(value);
                        }}
                        onSlidingComplete={(value) => {
                          handleDistanceComplete(value);
                        }}
                        minimumTrackTintColor={Colors.primaryColor}
                        maximumTrackTintColor="#E5E5E5"
                        thumbTintColor={Colors.primaryColor}
                        thumbSize={18}
                        thumbStyle={styles.sliderThumb}
                        trackStyle={styles.sliderTrack}
                      />
                    </View>
                  </View>

                  {/* Age Filter */}
                  <View style={styles.filterSection}>
                    <View style={styles.filterSectionHeader}>
                      <Text style={styles.filterSectionTitle}>Age</Text>
                      <Text style={styles.filterValue}>
                        {tempAgeRange[0]}-{tempAgeRange[1]}
                      </Text>
                    </View>
                    <View style={styles.sliderContainer}>
                      <RangeSlider
                        range={tempAgeRange}
                        minimumValue={MIN_AGE}
                        maximumValue={MAX_AGE}
                        step={1}
                        onValueChange={(values) => {
                          handleAgeRangeChange(values);
                        }}
                        onSlidingComplete={(range) => {
                          handleAgeRangeComplete(range);
                        }}
                        minimumTrackTintColor={Colors.primaryColor}
                        maximumTrackTintColor="#FFFFFF"
                        inboundColor={Colors.primaryColor}
                        outboundColor={"#E5E5E5"}
                        thumbTintColor={Colors.primaryColor}
                        crossingAllowed={false}
                        thumbSize={18}
                        thumbStyle={styles.sliderThumb}
                        trackStyle={styles.sliderTrack}
                      />
                    </View>
                  </View>

                  {/* Continue Button */}
                  <TouchableOpacity
                    style={styles.continueButton}
                    onPress={updatePreferences}
                  >
                    <Text style={styles.continueButtonText}>Continue</Text>
                  </TouchableOpacity>
                </Animated.View>
              </TouchableWithoutFeedback>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    paddingHorizontal: 20,
    zIndex: 10,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 0,
  },
  backButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
  },
  swiperContainer: {
    height: height * 0.6,
  },
  swiperContainerStyle: {
    backgroundColor: "transparent",
  },
  card: {
    width: width * 0.9,
    height: height * 0.6,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    backgroundColor: "#fff",
    zIndex: 1,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  overlay: {
    position: "absolute",
    bottom: 20,
    left: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 10,
    borderRadius: 5,
  },
  distance: {
    color: "white",
    fontSize: 14,
  },
  name: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  profession: {
    color: "white",
    fontSize: 16,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 30,
    marginTop: 60,
    zIndex: 10,
    backgroundColor: "#fff",
  },
  skipButton: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 50,
    backgroundColor: "#f0f2f2",
    elevation: 2,
  },
  likeButton: {
    backgroundColor: Colors.primaryColor,
    padding: 28,
    borderRadius: 50,
    elevation: 3,
  },
  superLikeButton: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 50,
    backgroundColor: "#f0f2f2",
    elevation: 2,
  },
  // Hover indicators
  leftHoverIndicator: {
    position: "absolute",
    top: "50%",
    left: "20%",
    transform: [{ translateY: -30 }],
    borderRadius: 50,
    padding: 15,
    zIndex: 2,
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: "white",
    elevation: 2,
  },
  rightHoverIndicator: {
    position: "absolute",
    top: "50%",
    right: "20%",
    transform: [{ translateY: -30 }],
    backgroundColor: "white",
    borderRadius: 50,
    padding: 15,
    zIndex: 2,
  },

  // Profile Styles
  profileContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    marginTop: 10,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  shareButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  locationText: {
    color: "#555",
    fontSize: 14,
    flex: 1,
  },
  kmBadge: {
    backgroundColor: "#ffe5e9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  kmText: {
    color: "#ff4466",
    fontSize: 12,
    fontWeight: "500",
  },
  aboutSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  aboutText: {
    color: "#555",
    lineHeight: 20,
    marginBottom: 5,
  },
  readMoreText: {
    color: Colors.primaryColor,
    fontWeight: "600",
  },
  interestsSection: {
    marginBottom: 25,
  },
  interestTags: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  interestTag: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  interestTagHighlighted: {
    borderColor: Colors.primaryColor,
    backgroundColor: "#ffe5e9",
  },
  interestText: {
    color: "#555",
  },
  interestTextHighlighted: {
    color: Colors.primaryColor,
  },
  interestIcon: {
    marginRight: 5,
  },
  gallerySection: {
    marginBottom: 30,
  },
  galleryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  seeAllText: {
    color: Colors.primaryColor,
    fontWeight: "600",
  },

  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: -5,
  },

  galleryItem: {
    width: "31%", // Giảm width một chút để đảm bảo 3 ảnh trên một hàng với margin
    aspectRatio: 1,
    marginBottom: 10,
    borderRadius: 8,
    overflow: "hidden",
    marginLeft: 8, // Sử dụng marginLeft thay vì marginHorizontal
  },
  galleryImage: {
    width: "100%",
    height: "100%",
  },

  // Filter Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  filterModalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
  },
  filterModalHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#e0e0e0",
    alignSelf: "center",
    borderRadius: 3,
    marginBottom: 20,
  },
  filterModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  clearText: {
    color: Colors.primaryColor,
    fontSize: 16,
  },
  filterSection: {
    marginBottom: 30,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 15,
  },
  filterSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  filterValue: {
    color: "#888",
    fontSize: 16,
  },
  genderButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
    marginHorizontal: 5,
    borderRadius: 5,
  },
  genderButtonActive: {
    backgroundColor: Colors.primaryColor,
    borderColor: Colors.primaryColor,
  },
  genderButtonText: {
    color: "#555",
    fontWeight: "500",
  },
  genderButtonTextActive: {
    color: "white",
  },
  // Slider styles
  sliderContainer: {
    width: "100%",
    height: 40,
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  sliderTrack: {
    height: 5,
    borderRadius: 2,
  },
  sliderFill: {
    height: "100%",
    backgroundColor: "#FF4466",
    borderRadius: 2,
  },
  slider: {
    width: "100%",
    height: 40,
    opacity: 0.9,
  },
  sliderThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primaryColor,
    shadowColor: Colors.primaryColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 5,
  },
  sliderLabel: {
    color: "#555",
    marginBottom: 5,
  },
  continueButton: {
    backgroundColor: Colors.primaryColor,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
  },
  continueButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
  },
  noUsersContainer: {
    height: height * 0.5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 15,
    margin: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noUsersText: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.primaryColor,
    textAlign: "center",
    marginBottom: 15,
  },
  noUsersSubtext: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  noUsersIcon: {
    marginBottom: 20,
  },
})

export default MatchScreen;
