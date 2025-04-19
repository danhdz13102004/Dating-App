import React, {useState, useEffect} from "react";
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
import {useRouter} from 'expo-router'
import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../../../constants/Colors";
import appConfig from "../../../configs/config"
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


const MessagesScreen = () => {
    const [messages, setMessages] = useState([]);
    const [activities, setActivities] = useState([]);
    const [userId, setUserId] = useState(null)
    const router = useRouter()

    const time_format = (isoTime) => {
        const time = Math.max(0,Math.floor((new Date() - new Date(isoTime)) / 1000));
        if (time < 60) return time + 's ago';
        let min = Math.round(time / 60);
        if (min < 60) return min + 'm ago';
        let hour = Math.round(min / 60);
        return hour + 'h ago';
    };

    // Lấy converstion từ API
    useEffect(() => {
        const fetchConversation = async () => {
            try {
                const token = await AsyncStorage.getItem("authToken");
                if (token) {
                    const decoded = jwtDecode(token);
                    const uid = decoded.userId;
                    // const uid = "67fb1dc83f35cac28bea0ea7";
                    setUserId(uid);
                    const response = await fetch(
                        `${appConfig.API_URL}/user/conversation/${uid}`,
                        {
                            method: "GET",
                            headers: {
                            "Content-Type": "application/json",
                            },
                        }
                    );
                    const data = await response.json();
                    console.log("📥 Conversation fetched from API:", data);
                    setMessagesFromConver(data["data"], uid)
                    setAcctivitiesFromConver(data["data"], uid)
                }
            } catch (error) {
                console.error("❌ Error fetching conversation:", error);
            }
        };
        fetchConversation();
    },[])

    const setMessagesFromConver = (conversations, uid) =>{
        let _message = []
        conversations.forEach(conversation => {
            // Perform some operation with each conversation
            let _partner = conversation.receiver._id == uid? conversation.sender: conversation.receiver 
            // console.log("CHeck partner :",_partner, uid, conversation);
            // console.log("sender :", conversation.sender);
            // console.log("receiver :", conversation.receiver);
            console.log("avatar :", _partner.avatar);
            let message = {
            id: conversation._id,
            name: _partner.name,
            partnerId : _partner._id,
            avatar: _partner.avatar,
            message: conversation.last_message,
            time: time_format(conversation.updatedAt),
            unread: 0
            };
            _message.push(message);
        });
        console.log(_message)
        setMessages(_message);
    }

    const setAcctivitiesFromConver = (conversations, uid) =>{
        let _activities = []
        conversations.forEach(conversation => {
            // Perform some operation with each conversation
            let _partner = conversation.receiver._id == uid ? conversation.sender : conversation.receiver;
            let activity = {
            id: _partner._id,
            name: _partner.name,
            avatar: _partner.avatar,
            };
            _activities.push(activity);
        });

        setActivities(_activities);
    }

    useEffect(() => {
        let unsubscribe;
    
        const fetchUserIdAndSubscribe = async () => {
          try {
            const token = await AsyncStorage.getItem("authToken");
            if (token) {
              const decoded = jwtDecode(token);
              const uid = decoded.userId;
            
            // const uid = "67fb1dc83f35cac28bea0ea7";
                setUserId(uid);
        
                const q = query(
                collection(db, `messages/${uid}/messages`),
                orderBy("createdAt", "desc"),
                limit(1) // 🔥 Chỉ lấy tin nhắn mới nhất
                );
        
                unsubscribe = onSnapshot(q, (querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  console.log("🔥 New message:", doc.data());
    
                  const firestoreData = doc.data();
                  console.log("🔥 Firestore data:", firestoreData);
    
                  // 🔁 Chuyển đổi dữ liệu sang định dạng giống API
                  const newMsg = {
                    _id: doc.id,
                    content: firestoreData.content || "",
                    conversation: firestoreData.conversation || "", // nếu có
                    createdAt: firestoreData.createdAt?.toDate().toISOString() || new Date().toISOString(),
                    updatedAt: firestoreData.updatedAt?.toDate().toISOString() || firestoreData.createdAt?.toDate().toISOString() || new Date().toISOString(),
                    status: firestoreData.status || "sent",
                    sender: {
                      _id: firestoreData.senderId
                    }, // nếu lưu trong Firestore
                    __v: 0
                  };
                  
                  setMessages(prev => {
                    console.log("check prev mess",prev)
                    let newCon = []
                    for (let i = 0;i<prev.length;i++){
                        console.log(prev[i].id,newMsg.conversation)
                        if (prev[i].id === newMsg.conversation){
                            prev[i].message = newMsg.content
                            prev[i].time = time_format(newMsg.updatedAt)
                            newCon.unshift(prev[i])
                        }
                        else {newCon.push(prev[i])}
                    }
                    console.log("check after loop prev mess",newCon)
                    return newCon;
                  });
      
                  console.log("🔥 New formatted message:", newMsg);
    
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
    },[])
    

    // Activity item renderer
    const renderActivity = ({ item }) => (
        <TouchableOpacity style={styles.activityItem}>
            <View style={styles.activityAvatar}>
                <Image source={{ uri: item.avatar }} style={styles.activityImage} />
            </View>
            <Text style={styles.activityName}>{item.name}</Text>
        </TouchableOpacity>
    );

    const navigate = (converId, receiverId, name, avatar)=>{
        console.log(converId, receiverId)
        router.navigate(`/(tabs)/chat/detail-chat?idCoversation=${converId}&id_partner=${receiverId}&name=${name}&avatar=${avatar}`);
    }
    // Message item renderer
    const renderMessage = ({ item }) => (
        <TouchableOpacity style={styles.messageItem} onPress={()=>navigate(item.id, item.partnerId, item.name, item.avatar)}>
            <Image source={{ uri: item.avatar }} style={styles.messageAvatar} />
            <View style={styles.messageContent}>
                <View style={styles.messageHeader}>
                    <Text style={styles.messageName}>{item.name}</Text>
                    <Text style={styles.messageTime}>{item.time}</Text>
                </View>
                <View style={styles.messagePreview} >
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