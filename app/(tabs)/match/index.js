import React, { useState, useRef } from "react";
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, SafeAreaView, Platform } from "react-native";
import Swiper from "react-native-deck-swiper";
import { FontAwesome } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
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
    
    
    // Function to clear hover state
    const clearHoverState = () => {
        console.log("clearHoverState");
        setHoverSide(null);
    };
    
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton}>
                            <MaterialIcons style={{ marginLeft: 5 }} name="arrow-back-ios" size={20} color={Colors.primaryColor} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.backButton}>
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
                                // onTouchCancel={clearHoverState}
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
    // New styles for hover indicators
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
    }
});

export default MatchScreen;