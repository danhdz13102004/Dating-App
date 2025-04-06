import React from "react";
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
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons'; 

import { Colors } from "../../../constants/Colors";

const MessagesScreen = () => {
    // Activities data (horizontal profile circles)
    const activities = [
        { id: "you", name: "You", avatar: "https://picsum.photos/200" },
        { id: "emma", name: "Emma", avatar: "https://picsum.photos/200" },
        { id: "ava", name: "Ava", avatar: "https://picsum.photos/200" },
        { id: "sophia", name: "Sophia", avatar: "https://picsum.photos/200" },
    ];

    // Messages data
    const messages = [
        {
            id: "1",
            name: "Emelie",
            avatar: "https://picsum.photos/200",
            message: "Sticker 😊",
            time: "23 min",
            unread: 1
        },
        {
            id: "2",
            name: "Abigail",
            avatar: "https://picsum.photos/200",
            message: "Typing...",
            time: "27 min",
            unread: 2
        },
        {
            id: "3",
            name: "Elizabeth",
            avatar: "https://picsum.photos/200",
            message: "Ok, see you then.",
            time: "33 min",
            unread: 0
        },
        {
            id: "4",
            name: "Penelope",
            avatar: "https://picsum.photos/200",
            message: "Hey! What's up, long time...",
            time: "50 min",
            unread: 0,
            isYou: true
        },
        {
            id: "5",
            name: "Chloe",
            avatar: "https://picsum.photos/200",
            message: "Hello how are you?",
            time: "55 min",
            unread: 0,
            isYou: true
        },
        {
            id: "7",
            name: "Grace",
            avatar: "https://picsum.photos/200",
            message: "Great! I will write later",
            time: "1 hour",
            unread: 0,
            isYou: true
        },
        {
            id: "8",
            name: "Grace",
            avatar: "https://picsum.photos/200",
            message: "Great! I will write later",
            time: "1 hour",
            unread: 0,
            isYou: true
        },
        {
            id: "9",
            name: "Grace",
            avatar: "https://picsum.photos/200",
            message: "Great! I will write later",
            time: "1 hour",
            unread: 0,
            isYou: true
        },

    ];

    // Activity item renderer
    const renderActivity = ({ item }) => (
        <TouchableOpacity style={styles.activityItem}>
            <View style={styles.activityAvatar}>
                <Image source={item.avatar} style={styles.activityImage} />
            </View>
            <Text style={styles.activityName}>{item.name}</Text>
        </TouchableOpacity>
    );

    // Message item renderer
    const renderMessage = ({ item }) => (
        <TouchableOpacity style={styles.messageItem}>
            <Image source={item.avatar} style={styles.messageAvatar} />
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

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Messages</Text>
                <TouchableOpacity style={styles.editButton}>
                    <Icon name="tune" size={20} color={Colors.primaryColor} />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Icon name="search" size={18} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search"
                    placeholderTextColor="#999"
                />
            </View>

            {/* Activities Section */}
            <View style={styles.activitiesSection}>
                <Text style={styles.sectionTitle}>Activities</Text>
                <FlatList
                    horizontal
                    data={activities}
                    renderItem={renderActivity}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.activitiesList}
                />
            </View>

            {/* Messages Section */}
            <View style={styles.messagesSection}>
                <Text style={styles.sectionTitle}>Messages</Text>
                <FlatList
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messagesList}
                />
            </View>
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
        borderColor: Colors.primaryColor,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    activityImage: {
        width: 56,
        height: 56,
        borderRadius: 28,
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
    tabBar: {
        flexDirection: "row",
        borderTopWidth: 1,
        borderTopColor: "#eee",
        paddingBottom: 25, // Extra padding for iPhone X and above
        paddingTop: 12,
    },
    tabItem: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: Colors.primaryColor,
    },
});

export default MessagesScreen;