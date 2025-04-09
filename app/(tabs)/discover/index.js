import React, { useState, useRef } from "react";
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
  TouchableWithoutFeedback
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
    },
    {
        id: 2,
        name: "Sophia Williams",
        age: 25,
        profession: "Graphic Designer",
        image: "https://picsum.photos/200",
        distance: "2 km",
    },
    {
        id: 3,
        name: "Emma Johnson",
        age: 27,
        profession: "Marketing Specialist",
        image: "https://picsum.photos/201",
        distance: "3 km",
    },
    {
        id: 4,
        name: "Olivia Brown",
        age: 24,
        profession: "Software Engineer",
        image: "https://picsum.photos/202",
        distance: "4 km",
    },
];

const MatchScreen = () => {
    const swiperRef = useRef(null);
    const [hoverSide, setHoverSide] = useState(null); // null, 'left', or 'right'
    const [showFilters, setShowFilters] = useState(false);
    const [genderFilter, setGenderFilter] = useState('Girls');
    
    // Distance filter settings
    const [distanceFilter, setDistanceFilter] = useState(40);
    const MAX_DISTANCE = 100; // Maximum distance in km
    
    // Age filter settings
    const [ageRange, setAgeRange] = useState([20, 28]);
    const MIN_AGE = 18;
    const MAX_AGE = 50;
    
    // Function to clear hover state
    const clearHoverState = () => {
        console.log("clearHoverState");
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

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
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

                <View style={styles.swiperContainer}>
                    <Swiper
                        ref={swiperRef}
                        cards={users}
                        onSwiping={(direction) => {
                            if (direction < 0) {
                                setHoverSide('left');
                            } else if (direction > 0) {
                                setHoverSide('right');
                            } else {
                                setHoverSide(null);
                            }
                        }}
                        renderCard={(user) => (
                            <View 
                                style={styles.card}
                                onTouchEnd={clearHoverState}
                            >
                                <Image source={{ uri: user.image }} style={styles.image} />
                                
                                <View style={styles.overlay}>
                                    <Text style={styles.distance}>{user.distance}</Text>
                                    <Text style={styles.name}>{user.name}, {user.age}</Text>
                                    <Text style={styles.profession}>{user.profession}</Text>
                                </View>
                            </View>
                        )}
                        onSwipedLeft={() => console.log("Bỏ qua")}
                        onSwipedRight={() => console.log("Thích")}
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
                                                <View style={[styles.sliderFill, {width: `${(distanceFilter/MAX_DISTANCE) * 100}%`}]} />
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
                                                thumbStyle={styles.sliderThumb}
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
                                                <View style={[styles.sliderFill, {width: `${((ageRange[0] - MIN_AGE) / (MAX_AGE - MIN_AGE)) * 100}%`}]} />
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
                                                thumbStyle={styles.sliderThumb}
                                            />
                                        </View>
                                        <Text style={styles.sliderLabel}>Max: {ageRange[1]}</Text>
                                        <View style={styles.sliderContainer}>
                                            <View style={styles.sliderTrack}>
                                                <View style={[styles.sliderFill, {width: `${((ageRange[1] - MIN_AGE) / (MAX_AGE - MIN_AGE)) * 100}%`}]} />
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
                                                thumbStyle={styles.sliderThumb}
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
            </View>
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
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    backButton: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 10,
    },
    swiperContainer: {
        flex: 1
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
        paddingBottom: 20,
        paddingHorizontal: 30,
        zIndex: 10,
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
    // New slider styles
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