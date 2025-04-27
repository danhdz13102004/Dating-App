import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    FlatList,
    Image,
    StatusBar,
    Alert,
    Modal,
    Dimensions,
    ActivityIndicator,
    Animated,
    RefreshControl,
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from 'expo-image-picker';
import { Colors } from "../../../constants/Colors";
import appConfig from "../../../configs/config";
import {
    onSnapshot,
    query,
    collection,
    orderBy,
    serverTimestamp,
    addDoc,
    limit,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig";

// Cloudinary configuration
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dmw4uwbpl/upload";
const CLOUDINARY_PRESET = "test_upload";

const { width, height } = Dimensions.get('window');

const noImageUrl = "https://www.shutterstock.com/image-vector/no-image-available-like-missing-260nw-1811092264.jpg"

const MessagesScreen = () => {
    const [messages, setMessages] = useState([]);
    const [activities, setActivities] = useState([]);
    const [userId, setUserId] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [storyModalVisible, setStoryModalVisible] = useState(false);
    const [currentStory, setCurrentStory] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [showPostModal, setShowPostModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
    const [myPost, setMyPost] = useState(null);
    const progressAnim = useRef(new Animated.Value(0)).current;
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const time_format = (isoTime) => {
        const time = Math.max(0, Math.floor((new Date() - new Date(isoTime)) / 1000));
        if (time < 60) return time + 's ago';
        let min = Math.round(time / 60);
        if (min < 60) return min + 'm ago';
        let hour = Math.round(min / 60);
        return hour + 'h ago';
    };

    // Add this function to fetch the user's newest post
    const fetchMyNewestPost = async (uid) => {
        try {
            const response = await fetch(
                `${appConfig.API_URL}/post/newest-image/${uid}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            const data = await response.json();
            console.log("📥 User's newest post fetched:", data);
            
            if (data.status === "success" && data.hasRecentImage && data.data) {
                console.log("User's newest post:", data.data);
                setMyPost(data.data);
                return data.data;
            } else {
                setMyPost(null);
                return null;
            }
        } catch (error) {
            console.error("❌ Error fetching user's newest post:", error);
            return null;
        }
    };

    // Fetch user data
    const fetchUserData = async () => {
        try {
            setRefreshing(true);
            const token = await AsyncStorage.getItem("authToken");
            if (token) {
                const decoded = jwtDecode(token);
                const uid = decoded.userId;
                setUserId(uid);
                
                // Fetch current user data
                const userResponse = await fetch(
                    `${appConfig.API_URL}/user/profile/${uid}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
                const userData = await userResponse.json();
                console.log("📥 User fetched from API:", userData);
                setCurrentUser(userData.data);
                
                // Fetch user's newest post
                await fetchMyNewestPost(uid);
                
                // Fetch conversations
                const conversationResponse = await fetch(
                    `${appConfig.API_URL}/user/conversation/${uid}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
                const conversationData = await conversationResponse.json();
                // console.log("📥 Conversation fetched from API:", conversationData);
                setMessagesFromConver(conversationData["data"], uid);
                setActivitiesFromConver(conversationData["data"], uid);
            }
        } catch (error) {
            console.error("❌ Error fetching data:", error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const onRefresh = () => {
        fetchUserData();
    };

    const setMessagesFromConver = (conversations, uid) => {
        let _message = [];
        conversations.forEach(conversation => {
            let _partner = conversation.receiver._id == uid ? conversation.sender : conversation.receiver;
            let message = {
                id: conversation._id,
                name: _partner.name,
                partnerId: _partner._id,
                avatar: _partner.avatar,
                message: conversation.last_message ? conversation.last_message : "Hãy gửi tin nhắn để bắt đầu!",
                time: time_format(conversation.updatedAt),
                unread: conversation.unread
            };
            _message.push(message);
        });
        // console.log(_message);
        setMessages(_message);
    };

    const setActivitiesFromConver = (conversations, uid) => {
        let _activities = [];
        conversations.forEach(conversation => {
            // console.log("check conversation", conversation);
            let _partner = conversation.receiver._id == uid ? conversation.sender : conversation.receiver;
            let activity = {
                id: _partner._id,
                name: _partner.name,
                avatar: _partner.avatar,
                hasStory: conversation.hasStory,
                storyImage: conversation.imagePost ? conversation.imagePost[0] : _partner.avatar,
            };
            if(activity.hasStory) {
                _activities.unshift(activity);
            }
            else {
                _activities.push(activity);
            }
        });
        
        setActivities(_activities);
    };

    useEffect(() => {
        let unsubscribe;

        const fetchUserIdAndSubscribe = async () => {
            try {
                const token = await AsyncStorage.getItem("authToken");
                if (token) {
                    const decoded = jwtDecode(token);
                    const uid = decoded.userId;
                    setUserId(uid);

                    const q = query(
                        collection(db, `messages/${uid}/messages`),
                        orderBy("createdAt", "desc"),
                        limit(1)
                    );

                    unsubscribe = onSnapshot(q, (querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            console.log("🔥 New message:", doc.data());

                            const firestoreData = doc.data();
                            // console.log("🔥 Firestore data:", firestoreData);

                            const newMsg = {
                                _id: doc.id,
                                content: firestoreData.content || "",
                                conversation: firestoreData.conversation || "",
                                createdAt: firestoreData.createdAt?.toDate().toISOString() || new Date().toISOString(),
                                updatedAt: firestoreData.updatedAt?.toDate().toISOString() || firestoreData.createdAt?.toDate().toISOString() || new Date().toISOString(),
                                status: firestoreData.status || "sent",
                                sender: {
                                    _id: firestoreData.senderId
                                },
                                __v: 0
                            };

                            setMessages(prev => {
                                // console.log("check prev mess", prev);
                                let newCon = [];
                                for (let i = 0; i < prev.length; i++) {
                                    // console.log(prev[i].id, newMsg.conversation);
                                    if (prev[i].id === newMsg.conversation) {
                                        prev[i].message = newMsg.content;
                                        prev[i].time = time_format(newMsg.updatedAt);
                                        newCon.unshift(prev[i]);
                                    }
                                    else { newCon.push(prev[i]); }
                                }
                                // console.log("check after loop prev mess", newCon);
                                return newCon;
                            });

                            // console.log("🔥 New formatted message:", newMsg);
                        });
                    });
                }
            } catch (error) {
                console.error("❌ Error in subscription:", error);
            }
        };

        fetchUserIdAndSubscribe();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const animateStoryProgress = () => {
        Animated.timing(progressAnim, {
            toValue: 1,
            duration: 5000,
            useNativeDriver: false
        }).start(() => {
            setStoryModalVisible(false);
            progressAnim.setValue(0);
        });
    };

    const viewStory = (story) => {
        console.log("View story:", story);

        // If it's the current user and they have a recent post,
        // use the post image as the story image
        if (story.isCurrentUser) {
            if (myPost) {
                setCurrentStory({
                    ...story,
                    storyImage: myPost.images[0]
                });
            }
            else {
                Alert.alert('Warning', 'You dont have any post!')
                return;
            }
        } else {
            setCurrentStory(story);
        }

        setStoryModalVisible(true);
        progressAnim.setValue(0);
        setTimeout(animateStoryProgress, 200);
    };

    const pickImage = async () => {
        try {
            const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (galleryStatus.status !== 'granted') {
                Alert.alert('Permission required', 'Please allow access to your photo library to upload images.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const imageUri = result.assets[0].uri;
                setSelectedImage(imageUri);
                setShowPostModal(true);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        }

        setModalVisible(false);
    };

    const uploadImageToCloudinary = async (imageUri) => {
        try {
            setUploading(true);

            const formData = new FormData();
            formData.append("file", {
                uri: imageUri,
                type: "image/jpeg",
                name: "upload.jpg",
            });
            formData.append("upload_preset", process.env.EXPO_PUBLIC_CLOUDINARY_PRESET);

            const response = await fetch(process.env.EXPO_PUBLIC_CLOUDINARY_ENDPOINT, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            console.log("Cloudinary upload response:", data);

            if (data.secure_url) {
                setUploadedImageUrl(data.secure_url);
                return data.secure_url;
            } else {
                throw new Error("Failed to get image URL from Cloudinary");
            }
        } catch (error) {
            console.error("Error uploading to Cloudinary:", error);
            Alert.alert("Upload Error", "Failed to upload image to Cloudinary. Please try again.");
            throw error;
        } finally {
            setUploading(false);
        }
    };

    const createPost = async (imageURL) => {
        try {
            console.log("Creating post with image URL:", imageURL);
            const response = await fetch(`${appConfig.API_URL}/post/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    imageURL: imageURL,
                    content: 'Check out this image!'
                })
            });

            const result = await response.json();

            if (result.status === "success") {
                Alert.alert('Success', 'Post created successfully!');

                // Update myPost with the newly created post
                if (result.data) {
                    setMyPost({
                        _id: result.data._id,
                        images: [imageURL],
                        createdAt: new Date().toISOString()
                    });
                }

                setSelectedImage(null);
                setUploadedImageUrl(null);
                setShowPostModal(false);
            } else {
                Alert.alert('Error', result.message || 'Failed to create post');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            Alert.alert('Error', 'Failed to create post. Please try again.');
        }
    };

    const uploadImageAndCreatePost = async () => {
        if (!selectedImage) {
            Alert.alert('Error', 'No image selected');
            return;
        }

        try {
            setUploading(true);

            const cloudinaryUrl = await uploadImageToCloudinary(selectedImage);

            if (cloudinaryUrl) {
                await createPost(cloudinaryUrl);
            }
        } catch (error) {
            console.error('Error in upload and post creation:', error);
            Alert.alert('Error', 'Failed to process image and create post');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = async () => {
        try {
            console.log("Removing image...");
            const response = await fetch(`${appConfig.API_URL}/post/remove-newest/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (result.success) {
                setMyPost(null);
                setCurrentUser(prev => ({
                    ...prev,
                    avatar: result.data.avatar || 'https://via.placeholder.com/150'
                }));
                Alert.alert('Success', 'Profile image removed successfully');
            } else {
                setMyPost(null);
                Alert.alert('Success', result.message || 'Failed to remove profile image');
            }
        } catch (error) {
            console.error('Error removing image:', error);
            Alert.alert('Error', 'Failed to remove image. Please try again.');
        }

        setModalVisible(false);
    };

    const renderActivity = ({ item, index }) => {
        if (index === 0 && item.isCurrentUser) {
            return (
                <TouchableOpacity
                    style={styles.activityItem}
                    onPress={() => setModalVisible(true)}
                >
                    <View style={styles.currentUserActivityAvatar}>
                        <Image source={{ uri: item.avatar }} style={styles.activityImage} />
                        <View style={styles.editIconContainer}>
                            <Icon name="add-a-photo" size={14} color="#fff" />
                        </View>
                    </View>
                    <Text style={styles.activityName}>You</Text>
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity
                style={styles.activityItem}
                onPress={() => item.hasStory ? viewStory(item) : null}
            >
                <View style={[
                    styles.activityAvatar,
                    item.hasStory ? styles.hasStoryRing : null
                ]}>
                    <Image source={{ uri: item.avatar }} style={styles.activityImage} />
                </View>
                <Text style={styles.activityName}>{item.name}</Text>
            </TouchableOpacity>
        );
    };

    const navigate = async (converId, receiverId, name, avatar) => {
        console.log(converId, receiverId);

        try {

            // Gửi request đến backend để đánh dấu là đã đọc
            await fetch(`${appConfig.API_URL}/user/markAsRead/${converId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: userId }),// userId đã có từ useEffect
            });
        } catch (error) {
            console.error("❌ Lỗi khi đánh dấu tin nhắn đã đọc:", error);
        }

        // Điều hướng sang trang chi tiết chat
        router.navigate(`/(tabs)/chat/detail-chat?idCoversation=${converId}&id_partner=${receiverId}&name=${name}&avatar=${avatar}`);
    };



    const renderMessage = ({ item }) => (
        <TouchableOpacity style={styles.messageItem} onPress={() => navigate(item.id, item.partnerId, item.name, item.avatar)}>
            <Image source={{ uri: item.avatar }} style={styles.messageAvatar} />
            <View style={styles.messageContent}>
                <View style={styles.messageHeader}>
                    <Text style={styles.messageName}>{item.name}</Text>
                    <Text style={styles.messageTime}>{item.time}</Text>
                </View>
                <View style={styles.messagePreview}>
                    {item.isYou && <Text style={styles.youLabel}>You: </Text>}
                    <Text
                        style={[
                            styles.messageText,
                            item.unread > 0 ? styles.unreadMessageText : null
                        ]}
                        numberOfLines={1}
                    >
                        {item.message}
                    </Text>
                    {item.unread > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadBadgeText}>{item.unread}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    const activitiesData = React.useMemo(() => {
        if (!currentUser) return activities;

        const currentUserActivity = {
            id: currentUser._id || userId,
            name: currentUser.name || 'You',
            avatar: currentUser.avatar || 'https://via.placeholder.com/150',
            isCurrentUser: true,
            hasStory: myPost !== null, // Set hasStory based on myPost
            storyImage: myPost ? myPost.images : currentUser.avatar // Use myPost image if available
        };

        return [currentUserActivity, ...activities];
    }, [activities, currentUser, userId, myPost]);



    const handleSearch = async (text) => {
        setSearchQuery(text);

        if (text.trim().length === 0) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);

        try {
            const response = await fetch(
                `${appConfig.API_URL}/user/search/${userId}?q=${encodeURIComponent(text)}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            // Sửa lại code xử lý dữ liệu:
            const data = await response.json();
            console.log("Search results:", data);

            if (data && data.data && Array.isArray(data.data)) {
                setSearchResults(data.data);
            } else if (Array.isArray(data)) {
                setSearchResults(data);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error("Error searching for conversations:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Add a function to render search results
    const renderSearchResult = ({ item }) => (
        <TouchableOpacity
            style={styles.messageItem}
            onPress={() => navigate(item.id, item.partnerId || item.id, item.name, item.avatar || noImageUrl)}
        >
            <Image
                source={{ uri: item.avatar || noImageUrl }}
                style={styles.messageAvatar}
            />
            <View style={styles.messageContent}>
                <View style={styles.messageHeader}>
                    <Text style={styles.messageName}>{item.name}</Text>
                    <Text style={styles.messageTime}>{item.last_message ? time_format(new Date()) : ""}</Text>
                </View>
                <View style={styles.messagePreview}>
                    <Text
                        style={styles.messageText}
                        numberOfLines={1}
                    >
                        {item.last_message || "Bắt đầu cuộc trò chuyện"}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Messages</Text>
                <TouchableOpacity style={styles.editButton}>
                    <Icon name="tune" size={20} color={Colors.primaryColor} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <Icon name="search" size={18} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search"
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => {
                        setSearchQuery("");
                        setSearchResults([]);
                    }}>
                        <Icon name="cancel" size={18} color="#999" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Add search results container */}
            {searchQuery.length > 0 && (
                <View style={styles.searchResultsWrapper}>
                    <Text style={styles.sectionTitle}>Kết quả tìm kiếm</Text>
                    {isSearching ? (
                        <ActivityIndicator size="small" color={Colors.primaryColor} style={styles.searchLoader} />
                    ) : searchResults.length > 0 ? (
                        <FlatList
                            data={searchResults}
                            renderItem={renderSearchResult}
                            keyExtractor={(item) => item.id}
                            style={styles.messagesList}
                            initialNumToRender={10}
                        />
                    ) : (
                        <Text style={styles.noResultsText}>Không tìm thấy kết quả</Text>
                    )}
                </View>
            )}

            <View style={styles.activitiesSection}>
                <Text style={styles.sectionTitle}>Activities</Text>
                <FlatList
                    horizontal
                    data={activitiesData}
                    renderItem={renderActivity}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.activitiesList}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[Colors.primaryColor]}
                            tintColor={Colors.primaryColor}
                        />
                    }
                />
            </View>

            <View style={styles.messagesSection}>
                <Text style={styles.sectionTitle}>Messages</Text>
                <FlatList
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messagesList}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[Colors.primaryColor]}
                            tintColor={Colors.primaryColor}
                        />
                    }
                />
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={pickImage}
                        >
                            <Icon name="add-a-photo" size={24} color={Colors.primaryColor} style={styles.modalIcon} />
                            <Text style={styles.modalOptionText}>Upload new photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={removeImage}
                        >
                            <Icon name="delete" size={24} color="#FF3B30" style={styles.modalIcon} />
                            <Text style={styles.modalOptionText}>Remove current photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => {
                                setModalVisible(false);
                                if (currentUser) {
                                    viewStory({
                                        name: currentUser.name || 'You',
                                        storyImage: myPost ? myPost.images : noImageUrl,
                                        avatar: currentUser.avatar,
                                        isCurrentUser: true
                                    });
                                }
                            }}
                        >
                            <Icon name="visibility" size={24} color={Colors.primaryColor} style={styles.modalIcon} />
                            <Text style={styles.modalOptionText}>
                                {myPost ? 'View your story' : 'View your profile'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modalOption, styles.cancelOption]}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal
                animationType="fade"
                transparent={true}
                visible={storyModalVisible}
                onRequestClose={() => {
                    setStoryModalVisible(false);
                    progressAnim.setValue(0);
                }}
            >
                <View style={styles.storyModalContainer}>
                    <Animated.View
                        style={[
                            styles.storyProgressBar,
                            {
                                width: progressAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0%', '100%']
                                })
                            }
                        ]}
                    />

                    <View style={styles.storyHeader}>
                        <View style={styles.storyUser}>
                            {currentStory && (
                                <>
                                    <Image source={{ uri: currentStory.avatar }} style={styles.storyUserAvatar} />
                                    <Text style={styles.storyUserName}>{currentStory.name}</Text>
                                </>
                            )}
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                setStoryModalVisible(false);
                                progressAnim.setValue(0);
                            }}
                        >
                            <Icon name="close" size={24} color="#f54c54" />
                        </TouchableOpacity>
                    </View>

                    {currentStory && (
                        <Image
                            source={{ uri: currentStory.storyImage }}
                            style={styles.storyImage}
                            resizeMode="cover"
                        />
                    )}
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={showPostModal}
                onRequestClose={() => setShowPostModal(false)}
            >
                <View style={styles.postModalContainer}>
                    <View style={styles.postModalHeader}>
                        <TouchableOpacity onPress={() => setShowPostModal(false)}>
                            <Icon name="close" size={24} color="#000" />
                        </TouchableOpacity>
                        <Text style={styles.postModalTitle}>Create Image Post</Text>
                        <TouchableOpacity
                            onPress={uploadImageAndCreatePost}
                            disabled={uploading}
                        >
                            <Text style={[styles.postButton, uploading ? styles.disabledButton : null]}>
                                {uploading ? 'Posting...' : 'Post'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.postContent}>
                        <View style={styles.postUser}>
                            {currentUser && (
                                <>
                                    <Image source={{ uri: currentUser.avatar }} style={styles.postUserAvatar} />
                                    <Text style={styles.postUserName}>{currentUser.name || 'You'}</Text>
                                </>
                            )}
                        </View>

                        {selectedImage && (
                            <View style={styles.selectedImageContainer}>
                                <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => setSelectedImage(null)}
                                >
                                    <Icon name="cancel" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        )}

                        {uploading && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={Colors.primaryColor} />
                                <Text style={styles.loadingText}>Uploading your Post...</Text>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "bold",
    },
    editButton: {
        padding: 8,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 16,
        marginVertical: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: "#f2f2f2",
        borderRadius: 10,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#333",
    },
    activitiesSection: {
        marginTop: 10,
        paddingLeft: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginVertical: 10,
    },
    activitiesList: {
        paddingRight: 16,
    },
    activityItem: {
        alignItems: "center",
        marginRight: 16,
        width: 60,
    },
    activityAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: '#ccc',
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    hasStoryRing: {
        borderColor: Colors.primaryColor,
    },
    currentUserActivityAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: Colors.primaryColor,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        position: "relative",
    },
    activityImage: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    editIconContainer: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: Colors.primaryColor,
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: "center",
        alignItems: "center",
    },
    activityName: {
        marginTop: 5,
        fontSize: 12,
        textAlign: "center",
    },
    messagesSection: {
        flex: 1,
        paddingHorizontal: 16,
    },
    messagesList: {
        paddingBottom: 15,
    },
    messageItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    messageAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    messageContent: {
        flex: 1,
        marginLeft: 12,
    },
    messageHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    messageName: {
        fontSize: 16,
        fontWeight: "600",
    },
    messageTime: {
        fontSize: 12,
        color: "#999",
    },
    messagePreview: {
        flexDirection: "row",
        alignItems: "center",
    },
    youLabel: {
        fontSize: 14,
        color: "#999",
    },
    messageText: {
        fontSize: 14,
        color: "#666",
        flex: 1,
    },
    unreadMessageText: {
        fontWeight: "600",
        color: "#333",
    },
    unreadBadge: {
        backgroundColor: Colors.primaryColor,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 8,
    },
    unreadBadgeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalIcon: {
        marginRight: 16,
    },
    modalOptionText: {
        fontSize: 16,
    },
    cancelOption: {
        justifyContent: 'center',
        borderBottomWidth: 0,
        marginTop: 8,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.primaryColor,
        textAlign: 'center',
    },
    storyModalContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    storyProgressBar: {
        height: 3,
        backgroundColor: '#fff',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 10,
    },
    storyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingTop: 40,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 5,
    },
    storyUser: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    storyUserAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#fff',
    },
    storyUserName: {
        color: '#42b3f5',
        fontWeight: '600',
        fontSize: 14,
    },
    storyImage: {
        flex: 1,
        width: width,
        height: height,
    },
    postModalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    postModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingTop: 50,
    },
    postModalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    postButton: {
        color: Colors.primaryColor,
        fontWeight: '600',
        fontSize: 16,
    },
    disabledButton: {
        opacity: 0.5,
    },
    postContent: {
        padding: 16,
        flex: 1,
    },
    postUser: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    postUserAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    postUserName: {
        fontWeight: '600',
        fontSize: 16,
    },
    selectedImageContainer: {
        marginTop: 16,
        position: 'relative',
    },
    selectedImage: {
        width: '100%',
        height: 300,
        borderRadius: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: Colors.primaryColor,
    },
    // Add these to your StyleSheet
    searchResultsContainer: {
        position: 'absolute',  // Thêm vào để đảm bảo hiển thị trên các phần tử khác
        top: 110,  // Điều chỉnh vị trí theo vị trí của thanh tìm kiếm
        left: 16,
        right: 16,
        backgroundColor: '#fff',
        borderRadius: 10,
        maxHeight: 300,  // Tăng chiều cao tối đa
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 10,  // Tăng elevation
        zIndex: 100,    // Tăng zIndex
    },
    searchResultsList: {
        flex: 1,
    },
    searchResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    searchResultIcon: {
        marginRight: 15,
    },
    searchResultText: {
        fontSize: 16,
        color: '#333',
    },
    noResultsText: {
        padding: 15,
        textAlign: 'center',
        color: '#999',
    },
    searchLoader: {
        padding: 15,
    },
});

export default MessagesScreen;