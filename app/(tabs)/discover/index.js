import React, { useState, useRef, useEffect } from "react";
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
    ScrollView
} from "react-native";
import Swiper from "react-native-deck-swiper";
import { FontAwesome } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Slider from '@react-native-community/slider';
const { width, height } = Dimensions.get("window");
import { Colors } from "../../../constants/Colors";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const users = [
    {
        id: 1,
        name: "Jessica Parker",
        age: 23,
        profession: "Professional model",
        image: "https://cdnphoto.dantri.com.vn/Im0W2Oa59BulrmFjQo1dOsDcBZY=/thumb_w/990/2021/10/30/trang-nhungdocx-1635528230350.jpeg",
        distance: "1 km",
        location: "Chicago, IL United States",
        about: "My name is Jessica Parker and I enjoy meeting new people and finding ways to help them. I have an uplifting experience. I enjoy reading.",
        interests: ["Travelling", "Books", "Music", "Dancing", "Modeling"],
        gallery: [
            "https://picsum.photos/300/400?random=1",
            "https://picsum.photos/300/400?random=2",
            "https://picsum.photos/300/400?random=3",
            "https://picsum.photos/300/400?random=4",
            "https://picsum.photos/300/400?random=5",
        ],
    },
    {
        id: 2,
        name: "Sophia Williams",
        age: 25,
        profession: "Graphic Designer",
        image: "https://picsum.photos/200",
        distance: "2 km",
        location: "New York, NY United States",
        about: "Creative graphic designer with a passion for visual storytelling and innovative design solutions.",
        interests: ["Design", "Photography", "Art", "Hiking", "Coffee"],
        gallery: [
            "https://picsum.photos/300/400?random=6",
            "https://picsum.photos/300/400?random=7",
            "https://picsum.photos/300/400?random=8",
        ],
    },
    {
        id: 3,
        name: "Emma Johnson",
        age: 27,
        profession: "Marketing Specialist",
        image: "https://picsum.photos/201",
        distance: "3 km",
        location: "Los Angeles, CA United States",
        about: "Marketing specialist with expertise in digital campaigns and brand development.",
        interests: ["Marketing", "Social Media", "Travel", "Cooking", "Yoga"],
        gallery: [
            "https://picsum.photos/300/400?random=9",
            "https://picsum.photos/300/400?random=10",
        ],
    },
    {
        id: 4,
        name: "Olivia Brown",
        age: 24,
        profession: "Software Engineer",
        image: "https://picsum.photos/202",
        distance: "4 km",
        location: "San Francisco, CA United States",
        about: "Software engineer focused on creating elegant solutions to complex problems.",
        interests: ["Coding", "Technology", "Gaming", "Fitness", "Reading"],
        gallery: [
            "https://picsum.photos/300/400?random=11",
            "https://picsum.photos/300/400?random=12",
            "https://picsum.photos/300/400?random=13",
        ],
    },
];

const MatchScreen = () => {
    const swiperRef = useRef(null);
    const scrollViewRef = useRef(null);
    const [hoverSide, setHoverSide] = useState(null); // null, 'left', or 'right'
    const [showFilters, setShowFilters] = useState(false);
    const [genderFilter, setGenderFilter] = useState('Girls');
    const [currentUser, setCurrentUser] = useState(users[0]);
    const [showProfile, setShowProfile] = useState(false);

    // Distance filter settings
    const [distanceFilter, setDistanceFilter] = useState(40);
    const MAX_DISTANCE = 100; // Maximum distance in km

    // Age filter settings
    const [ageRange, setAgeRange] = useState([20, 28]);
    const MIN_AGE = 18;
    const MAX_AGE = 50;

    // Handle swipe
    const handleSwipe = (index) => {
        // Update the current user to the next card
        if (index < users.length - 1) {
            setCurrentUser(users[index + 1]);
        }
        setHoverSide(null);
    };

    // Function to clear hover state
    const clearHoverState = () => {
        console.log("Clearing hover state");
        setHoverSide(null);
    };

    // Function to toggle filter modal
    const toggleFiltersModal = () => {
        setShowFilters(!showFilters);
    };

    // Function to reset filters
    const clearFilters = () => {
        setGenderFilter('Girls');
        setDistanceFilter(40);
        setAgeRange([20, 28]);
    };

    // Handle age range change
    const handleAgeRangeChange = (type, value) => {
        if (type === 'min') {
            setAgeRange([Math.min(value, ageRange[1]), ageRange[1]]);
        } else {
            setAgeRange([ageRange[0], Math.max(value, ageRange[0])]);
        }
    };

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

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                ref={scrollViewRef}
                style={styles.container}
                nestedScrollEnabled={true}
                scrollEventThrottle={16}
                stickyHeaderIndices={[0]}
            >
                {/* Header */}
                <View style={styles.headerContainer}>
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton}>
                            <MaterialIcons style={{ marginLeft: 5 }} name="arrow-back-ios" size={20} color={Colors.primaryColor} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.backButton} onPress={toggleFiltersModal}>
                            <FontAwesome5 name="sliders-h" size={24} color={Colors.primaryColor} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Swiper Component */}
                <View style={styles.swiperContainer}>
                    <Swiper
                        ref={swiperRef}
                        cards={users}
                        renderCard={(user) => (
                            <TouchableOpacity
                                style={styles.card}
                                onTouchEnd={clearHoverState}
                                onPress={toggleProfileView}
                                activeOpacity={0.95}
                            >
                                <Image source={{ uri: user.image }} style={styles.image} />

                                <View style={styles.overlay}>
                                    <Text style={styles.distance}>{user.distance}</Text>
                                    <Text style={styles.name}>{user.name}, {user.age}</Text>
                                    <Text style={styles.profession}>{user.profession}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        onSwipedLeft={() => console.log("Bỏ qua")}
                        onSwipedRight={() => console.log("Thích")}
                        onSwiped={handleSwipe}
                        stackSize={3}
                        backgroundColor="transparent"
                        containerStyle={styles.swiperContainerStyle}
                    />

                    {/* Left hover indicator (skip) */}
                    {hoverSide === 'left' && (
                        <View style={styles.leftHoverIndicator}>
                            <FontAwesome name="times" size={40} color="orange" />
                        </View>
                    )}

                    {/* Right hover indicator (heart) */}
                    {hoverSide === 'right' && (
                        <View style={styles.rightHoverIndicator}>
                            <FontAwesome name="heart" size={40} color={Colors.primaryColor} />
                        </View>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity style={styles.skipButton} onPress={() => swiperRef.current.swipeLeft()}>
                        <FontAwesome name="times" size={28} color="orange" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.likeButton} onPress={() => swiperRef.current.swipeRight()}>
                        <FontAwesome name="heart" size={40} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.superLikeButton}>
                        <FontAwesome name="star" size={28} color="purple" />
                    </TouchableOpacity>
                </View>

                {/* Profile View (Similar to Image 1) */}
                <View style={styles.profileContainer}>
                    <View style={styles.profileHeader}>
                        <Text style={styles.profileName}>{currentUser.name}, {currentUser.age}</Text>
                        <TouchableOpacity style={styles.shareButton}>
                            <FontAwesome5 name="share" size={18} color={Colors.primaryColor} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.locationContainer}>
                        <FontAwesome5 name="map-marker-alt" size={12} color="#ff4466" style={{ marginRight: 5 }} />
                        <Text style={styles.locationText}>{currentUser.location}</Text>
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
                                <View key={index} style={[styles.interestTag, index < 2 && styles.interestTagHighlighted]}>
                                    <Text style={[styles.interestText, index < 2 && styles.interestTextHighlighted]}>
                                        {index < 2 && <FontAwesome5 name={index === 0 ? "plane" : "book"} size={12} style={styles.interestIcon} />} {interest}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.gallerySection}>
                        <View style={styles.galleryHeader}>
                            <Text style={styles.sectionTitle}>Gallery</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeAllText}>See all</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.galleryGrid}>
                            {currentUser.gallery.slice(0, 6).map((image, index) => (
                                <View key={index} style={[styles.galleryItem, (index === 2 || index === 5) && { marginRight: 0 }]}>
                                    <Image source={{ uri: image }} style={styles.galleryImage} />
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Filters Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showFilters}
                    onRequestClose={toggleFiltersModal}
                >
                    <TouchableWithoutFeedback onPress={toggleFiltersModal}>
                        <View style={styles.modalOverlay}>
                            <TouchableWithoutFeedback>
                                <View style={styles.filterModalContainer}>
                                    <View style={styles.filterModalHandle} />

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
                                                    genderFilter === 'Girls' && styles.genderButtonActive
                                                ]}
                                                onPress={() => setGenderFilter('Girls')}
                                            >
                                                <Text style={[
                                                    styles.genderButtonText,
                                                    genderFilter === 'Girls' && styles.genderButtonTextActive
                                                ]}>Girls</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[
                                                    styles.genderButton,
                                                    genderFilter === 'Boys' && styles.genderButtonActive
                                                ]}
                                                onPress={() => setGenderFilter('Boys')}
                                            >
                                                <Text style={[
                                                    styles.genderButtonText,
                                                    genderFilter === 'Boys' && styles.genderButtonTextActive
                                                ]}>Boys</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[
                                                    styles.genderButton,
                                                    genderFilter === 'Any' && styles.genderButtonActive
                                                ]}
                                                onPress={() => setGenderFilter('Any')}
                                            >
                                                <Text style={[
                                                    styles.genderButtonText,
                                                    genderFilter === 'Any' && styles.genderButtonTextActive
                                                ]}>Any</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Distance Filter */}
                                    <View style={styles.filterSection}>
                                        <View style={styles.filterSectionHeader}>
                                            <Text style={styles.filterSectionTitle}>Distance</Text>
                                            <Text style={styles.filterValue}>{distanceFilter}km</Text>
                                        </View>
                                        <View style={styles.sliderContainer}>
                                            <View style={styles.sliderTrack}>
                                                <View style={[styles.sliderFill, { width: `${(distanceFilter / MAX_DISTANCE) * 100}%` }]} />
                                            </View>
                                            <Slider
                                                style={styles.slider}
                                                minimumValue={1}
                                                maximumValue={MAX_DISTANCE}
                                                step={1}
                                                value={distanceFilter}
                                                onValueChange={setDistanceFilter}
                                                minimumTrackTintColor="#FF4466"
                                                maximumTrackTintColor="#E5E5E5"
                                                thumbTintColor="#FF4466"
                                            />
                                        </View>
                                    </View>

                                    {/* Age Filter */}
                                    <View style={styles.filterSection}>
                                        <View style={styles.filterSectionHeader}>
                                            <Text style={styles.filterSectionTitle}>Age</Text>
                                            <Text style={styles.filterValue}>{ageRange[0]}-{ageRange[1]}</Text>
                                        </View>
                                        <Text style={styles.sliderLabel}>Min: {ageRange[0]}</Text>
                                        <View style={styles.sliderContainer}>
                                            <View style={styles.sliderTrack}>
                                                <View style={[styles.sliderFill, { width: `${((ageRange[0] - MIN_AGE) / (MAX_AGE - MIN_AGE)) * 100}%` }]} />
                                            </View>
                                            <Slider
                                                style={styles.slider}
                                                minimumValue={MIN_AGE}
                                                maximumValue={MAX_AGE}
                                                step={1}
                                                value={ageRange[0]}
                                                onValueChange={(value) => handleAgeRangeChange('min', value)}
                                                minimumTrackTintColor="#FF4466"
                                                maximumTrackTintColor="#E5E5E5"
                                                thumbTintColor="#FF4466"
                                            />
                                        </View>
                                        <Text style={styles.sliderLabel}>Max: {ageRange[1]}</Text>
                                        <View style={styles.sliderContainer}>
                                            <View style={styles.sliderTrack}>
                                                <View style={[styles.sliderFill, { width: `${((ageRange[1] - MIN_AGE) / (MAX_AGE - MIN_AGE)) * 100}%` }]} />
                                            </View>
                                            <Slider
                                                style={styles.slider}
                                                minimumValue={MIN_AGE}
                                                maximumValue={MAX_AGE}
                                                step={1}
                                                value={ageRange[1]}
                                                onValueChange={(value) => handleAgeRangeChange('max', value)}
                                                minimumTrackTintColor="#FF4466"
                                                maximumTrackTintColor="#E5E5E5"
                                                thumbTintColor="#FF4466"
                                            />
                                        </View>
                                    </View>

                                    {/* Continue Button */}
                                    <TouchableOpacity
                                        style={styles.continueButton}
                                        onPress={toggleFiltersModal}
                                    >
                                        <Text style={styles.continueButtonText}>Continue</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'android' ? 25 : 0
    },
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    headerContainer: {
        paddingHorizontal: 20,
        zIndex: 10,
        backgroundColor: '#fff',
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
        backgroundColor: 'transparent',
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
        backgroundColor: '#fff',
        zIndex: 1
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
        backgroundColor: '#fff',
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
        zIndex: 2
    },

    // Profile Styles
    profileContainer: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingBottom: 50,
    },
    profileHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        marginTop: 10,
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    shareButton: {
        padding: 10,
        borderWidth: 1,
        borderColor: "#eee",
        borderRadius: 20,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    locationText: {
        color: '#555',
        fontSize: 14,
        flex: 1,
    },
    kmBadge: {
        backgroundColor: '#ffe5e9',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    kmText: {
        color: '#ff4466',
        fontSize: 12,
        fontWeight: '500',
    },
    aboutSection: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    aboutText: {
        color: '#555',
        lineHeight: 20,
        marginBottom: 5,
    },
    readMoreText: {
        color: Colors.primaryColor,
        fontWeight: '600',
    },
    interestsSection: {
        marginBottom: 25,
    },
    interestTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    interestTag: {
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginRight: 10,
        marginBottom: 10,
    },
    interestTagHighlighted: {
        borderColor: Colors.primaryColor,
        backgroundColor: '#ffe5e9',
    },
    interestText: {
        color: '#555',
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    seeAllText: {
        color: Colors.primaryColor,
        fontWeight: '600',
    },
    galleryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    galleryItem: {
        width: '32%',
        aspectRatio: 1,
        marginBottom: 10,
        borderRadius: 8,
        overflow: 'hidden',
    },
    galleryImage: {
        width: '100%',
        height: '100%',
    },

    // Filter Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    filterModalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 30,
    },
    filterModalHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#e0e0e0',
        alignSelf: 'center',
        borderRadius: 3,
        marginBottom: 20,
    },
    filterModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    filterModalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
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
        fontWeight: '500',
        marginBottom: 15,
    },
    filterSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    filterValue: {
        color: '#888',
        fontSize: 16,
    },
    genderButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    genderButton: {
        flex: 1,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        alignItems: 'center',
        marginHorizontal: 5,
        borderRadius: 5,
    },
    genderButtonActive: {
        backgroundColor: Colors.primaryColor,
        borderColor: Colors.primaryColor,
    },
    genderButtonText: {
        color: '#555',
        fontWeight: '500',
    },
    genderButtonTextActive: {
        color: 'white',
    },
    // Slider styles
    sliderContainer: {
        width: '100%',
        height: 40,
        justifyContent: 'center',
        position: 'relative',
    },
    sliderTrack: {
        position: 'absolute',
        height: 5,
        width: '100%',
        backgroundColor: '#E5E5E5',
        borderRadius: 2,
    },
    sliderFill: {
        height: '100%',
        backgroundColor: '#FF4466',
        borderRadius: 2,
    },
    slider: {
        width: '100%',
        height: 40,
        opacity: 0.9,
    },
    sliderThumb: {
        width: 30,
        height: 30,
        borderRadius: 10,
        backgroundColor: '#FF4466',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    sliderLabel: {
        color: '#555',
        marginBottom: 5,
    },
    continueButton: {
        backgroundColor: Colors.primaryColor,
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 20,
    },
    continueButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '500',
    }
});

export default MatchScreen;