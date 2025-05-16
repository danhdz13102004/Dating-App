import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Modal,
  Alert,
} from "react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { Colors } from "../../../constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { db } from "../../../firebaseConfig";
import {
  onSnapshot,
  query,
  collection,
  orderBy,
  serverTimestamp,
  addDoc,
  limit,
  getDocs,
  where,
  writeBatch,
} from "firebase/firestore";
import appConfig from "../../../configs/config";
import { useRouter, useGlobalSearchParams, useLocalSearchParams } from 'expo-router'

const DetailChat = () => {
  const scrollViewRef = useRef(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [content, setContent] = useState("");
  const [userId, setUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const router = useRouter();
  const { idCoversation, id_partner, name, avatar } = useLocalSearchParams();

  const [unreadMessages, setUnreadMessages] = useState([]);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [isBlockLoading, setIsBlockLoading] = useState(false);
  const [conversationData, setConversationData] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);

  // Lấy messages từ API
  useEffect(() => {
    console.log(idCoversation, id_partner);
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `${appConfig.API_URL}/user/messages/${idCoversation}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        // console.log("📥 Messages fetched from API:", data);
        setMessages(data.data || []);
      } catch (error) {
        console.error("❌ Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, []);

  // Fetch conversation data to check blocked status
  useEffect(() => {
    const fetchConversationData = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const decoded = jwtDecode(token);
        // setUserId(decoded.userId);
        console.log("User ID from token:", decoded.userId);
        console.log("Conversation ID:", idCoversation);
        const response = await fetch(`${appConfig.API_URL}/conversation/${idCoversation}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
        });

        const data = await response.json();
        console.log("Conversation data:", data);
        if (data.status === "success") {
          setConversationData(data.data);
          
          // Check if conversation is blocked
          if (data.data.blocked_by) {
            setIsBlocked(true);
            
            // If current user is blocked, show alert and redirect
            if (data.data.blocked_by !== decoded.userId) {
              Alert.alert(
                "Blocked",
                "You cannot send messages because you have been blocked by this user",
                [{ text: "OK", onPress: () => router.push("/(tabs)/chat") }]
              );
            }
          }
        }
      } catch (error) {
        console.error("Error fetching conversation data:", error);
      }
    };

    if (idCoversation) {
      fetchConversationData();
    }
  }, [idCoversation]);

  // Lắng nghe Firestore thay đổi (nếu có)
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

          unsubscribe = onSnapshot(q, async (querySnapshot) => { // Thêm async
            const newUnreadMessages = []; // Tạo mảng để theo dõi tin nhắn chưa đọc mới

            querySnapshot.forEach((doc) => {
              // console.log("🔥 New message from detail:", doc.data());

              const firestoreData = doc.data();
              // console.log("🔥 Firestore data:", firestoreData);
              // console.log(firestoreData.sender, id_partner);
              if (firestoreData.sender != id_partner) return;

              // 🔁 Chuyển đổi dữ liệu sang định dạng giống API
              const newMsg = {
                _id: doc.id,
                content: firestoreData.content || "",
                conversation: firestoreData.conversation || "", // nếu có
                createdAt: firestoreData.createdAt?.toDate().toISOString() || new Date().toISOString(),
                updatedAt: firestoreData.updatedAt?.toDate().toISOString() || firestoreData.createdAt?.toDate().toISOString() || new Date().toISOString(),
                status: firestoreData.status || "sent",
                sender: {
                  _id: firestoreData.sender
                }, // nếu lưu trong Firestore
                __v: 0
              };

              setMessages(prev => {
                return [...prev, newMsg];
              });


              // Nếu tin nhắn chưa đọc, thêm vào mảng chưa đọc
              if (!newMsg.isRead && newMsg.sender._id !== uid) {
                newUnreadMessages.push(doc.id);
              }
            });

            // Nếu có tin nhắn mới chưa đọc, đánh dấu đã đọc
            if (newUnreadMessages.length > 0) {
              // Cập nhật state trước
              setUnreadMessages(prev => [...prev, ...newUnreadMessages]);

              // Đánh dấu đã đọc tự động vì người dùng đang trong chat
              markMessagesAsRead();
            }
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


  // Thêm hàm markMessagesAsRead
  const markMessagesAsRead = async () => {
    try {
      if (!userId || !idCoversation) return;

      // Cập nhật đánh dấu đã đọc ở backend
      await fetch(`${appConfig.API_URL}/user/markAsRead/${idCoversation}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: userId }),
      });

      // Cập nhật đánh dấu đã đọc trong Firebase
      const messagesRef = collection(db, `messages/${userId}/messages`);
      const q = query(
        messagesRef,
        where("conversation", "==", idCoversation),
        where("isRead", "==", false)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const batch = writeBatch(db);

        querySnapshot.forEach((doc) => {
          batch.update(doc.ref, { isRead: true });
        });

        await batch.commit();
        console.log("🔥 Đã đánh dấu tất cả tin nhắn là đã đọc trong Firebase");

        // Xóa các tin nhắn đã đọc khỏi state
        setUnreadMessages([]);
      }
    } catch (error) {
      console.error("❌ Error marking messages as read:", error);
    }
  };
  useEffect(() => {
    if (userId && idCoversation) {
      markMessagesAsRead();
    }
  }, [userId, idCoversation]);

  // Thêm effect để đánh dấu tin nhắn đã đọc mỗi khi có tin nhắn mới từ id_partner
  useEffect(() => {
    const timer = setTimeout(() => {
      if (unreadMessages.length > 0) {
        markMessagesAsRead();
      }
    }, 1000); // Chờ 1 giây trước khi đánh dấu đã đọc

    return () => clearTimeout(timer);
  }, [unreadMessages]);



  useEffect(() => {

    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Lắng nghe bàn phím
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setIsKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const addToDB = async (
    newMessage
  ) => {
    console.log(newMessage);
    if (newMessage) {
      const url = `${appConfig.API_URL}/message/add`;
      console.log("URL: ", url);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMessage),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Message added successfully:", data);
      }
    } else {
      alert("Sent error");
    }
  };

  const sendMessage = async ({ senderId = "abc" }) => {
    // Check if conversation is blocked
    if (isBlocked) {
      Alert.alert(
        "Blocked Conversation", 
        conversationData?.blocked_by === userId ? 
          `You have blocked ${name}. Unblock to send messages.` : 
          `You have been blocked by ${name}.`
      );
      return;
    }
    
    try {
      const receiverId = id_partner; // ID của người dùng khác
      console.log("CHECK SEND MESS :", senderId, receiverId)
      const messagesSubcollectionRef = collection(
        db,
        `messages/${receiverId}/messages`
      );

      const newMsg = {
        _id: "123",
        content: content,
        conversation: idCoversation, // nếu có
        status: "sent",
        createdAt: new Date().toISOString(),
        sender: {
          _id: senderId
        }
      };

      setMessages(prev => {
        return [...prev, newMsg];
      });
      setContent("");
      let time = new Date().toISOString()
      const newMessage = {
        conversation: idCoversation,
        sender: senderId,
        content: content,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const newMessageForDB = {
        conversation: idCoversation,
        sender: senderId,
        content: content,
        createdAt: time,
        updatedAt: time
      };
      await addDoc(messagesSubcollectionRef, newMessage);

      await addToDB(newMessageForDB)

      console.log("✅ Tin nhắn đã được gửi!");
    } catch (error) {
      console.error("❌ Gửi tin nhắn thất bại:", error);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Block user function
  const handleBlockUser = async () => {
    try {
      setIsBlockLoading(true);

      const url = `${appConfig.API_URL}/conversation/${idCoversation}/block`;
      console.log("URL: ", url);
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          blocked_by: userId,
        }),
      });

      const data = await response.json();
      
      if (data.status === "success") {
        setIsBlocked(true);
        Alert.alert(
          "User Blocked",
          `You have blocked ${name}. You will no longer receive messages from this user.`,
          [{ text: "OK", onPress: () => router.push("/(tabs)/chat") }]
        );
      } else {
        Alert.alert("Error", data.message || "Failed to block user");
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      Alert.alert("Error", "An error occurred while trying to block the user");
    } finally {
      setIsBlockLoading(false);
      setShowBlockModal(false);
    }
  };

  // Confirm block action
  const confirmBlock = () => {
    Alert.alert(
      "Block User",
      `Are you sure you want to block ${name}? You will no longer receive messages from this user.`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setShowBlockModal(false),
        },
        {
          text: "Block",
          style: "destructive",
          onPress: handleBlockUser,
        },
      ]
    );
  };
  
  // Unblock user function
  const handleUnblockUser = async () => {
    try {
      setIsBlockLoading(true);

      const url = `${appConfig.API_URL}/conversation/${idCoversation}/unblock`;
      console.log("URL: ", url);
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();
      
      if (data.status === "success") {
        setIsBlocked(false);
        Alert.alert(
          "User Unblocked",
          `You have unblocked ${name}. You can now send and receive messages from this user.`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", data.message || "Failed to unblock user");
      }
    } catch (error) {
      console.error("Error unblocking user:", error);
      Alert.alert("Error", "An error occurred while trying to unblock the user");
    } finally {
      setIsBlockLoading(false);
      setShowBlockModal(false);
    }
  };
  
  // Confirm unblock action
  const confirmUnblock = () => {
    Alert.alert(
      "Unblock User",
      `Are you sure you want to unblock ${name}? You will start receiving messages from this user again.`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setShowBlockModal(false),
        },
        {
          text: "Unblock",
          onPress: handleUnblockUser,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push("/(tabs)/chat")}>
            <MaterialIcons
              style={{ marginLeft: 5 }}
              name="arrow-back-ios"
              size={20}
              color={Colors.primaryColor}
            />
          </TouchableOpacity>

          <View style={styles.profileContainer}>
            <Image
              source={{ uri: avatar }}
              style={styles.avatar}
            />
            <View style={styles.userInfo}>
              <Text style={styles.username}>{name}</Text>
              <View style={styles.onlineStatus}>
                <View style={styles.onlineDot} />
                <Text style={styles.statusText}>Online</Text>
              </View>
            </View>

          </View>

          <TouchableOpacity 
            style={styles.moreButton}
            onPress={() => setShowBlockModal(true)}
          >
            <MaterialIcons
              name="more-vert"
              size={24}
              color={Colors.primaryColor}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Nội dung chat */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Block User Modal */}
        <Modal
          transparent={true}
          visible={showBlockModal}
          animationType="fade"
          onRequestClose={() => setShowBlockModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowBlockModal(false)}
          >
            <View style={styles.modalContent}>
              {isBlocked ? (
                <TouchableOpacity 
                  style={styles.modalOption}
                  onPress={confirmUnblock}
                  disabled={isBlockLoading}
                >
                  <MaterialIcons name="lock-open" size={24} color={Colors.primaryColor} />
                  <Text style={styles.unblockText}>
                    {isBlockLoading ? "Unblocking..." : "Unblock User"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.modalOption}
                  onPress={confirmBlock}
                  disabled={isBlockLoading}
                >
                  <MaterialIcons name="block" size={24} color="#FF3B30" />
                  <Text style={styles.blockText}>
                    {isBlockLoading ? "Blocking..." : "Block User"}
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.modalOption, styles.cancelOption]} 
                onPress={() => setShowBlockModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        <TouchableOpacity
          activeOpacity={1}
          style={{ flex: 1 }}
          onPress={dismissKeyboard}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.messageScroll}
            contentContainerStyle={styles.messageContentContainer}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
          >
            <View style={styles.dateContainer}>
              <View style={styles.dateLine} />
              <Text style={styles.dateText}>Today</Text>
              <View style={styles.dateLine} />
            </View>

            {/* Hiển thị message từ API */}
            {messages.map((msg, index) => {
              // console.log(msg.sender._id, userId);
              const isSent = msg.sender._id === userId;
              // console.log("isSent", isSent);
              const time = msg.createdAt
                ? new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
                : "";

              const isLast = index === messages.length - 1;
              if (isLast) {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }
                  , 200);
              }

              return (
                <View key={msg.id || index}>
                  {isSent ? (
                    <>
                      <View style={styles.sentMessageContainer}>
                        <Text style={styles.messageText}>{msg.content}</Text>
                      </View>
                      <View style={styles.timeContainerRight}>
                        <Text style={styles.timeTextRight}>{time}</Text>
                        <MaterialIcons
                          name="done-all"
                          size={16}
                          color={Colors.primaryColor}
                        />
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.receivedMessageContainer}>
                        <Text style={styles.messageText}>{msg.content}</Text>
                      </View>
                      <Text style={styles.timeTextLeft}>{time}</Text>
                    </>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </TouchableOpacity>

        {/* Nhập message */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={[
              styles.inputContainer,
              isBlocked && styles.disabledInput
            ]}>
              <TextInput
                style={styles.input}
                placeholder={isBlocked ? "Blocked conversation" : "Your message"}
                placeholderTextColor={isBlocked ? "#FF3B30" : "#999"}
                value={content}
                onChangeText={(text) => setContent(text)}
                editable={!isBlocked}
              />
            </View>
            <TouchableOpacity
              onPress={() => sendMessage({ senderId: userId })}
              style={[styles.buttonSend, isBlocked && styles.disabledButton]}
              disabled={isBlocked}
            >
              <Feather 
                name="send" 
                size={24} 
                color={isBlocked ? "#CCCCCC" : Colors.primaryColor} 
              />
            </TouchableOpacity>
          </View>
          {isBlocked && (
            <Text style={styles.blockedText}>
              {conversationData?.blocked_by === userId ? 
                `You have blocked ${name}` : 
                `You have been blocked by ${name}`}
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { marginTop: 15, marginBottom: 15, padding: 10 },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    justifyContent: "space-between",
  },
  backButton: { padding: 5 },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.primaryColor,
  },
  userInfo: { marginLeft: 10 },
  username: { fontSize: 16, fontWeight: "bold" },
  onlineStatus: { flexDirection: "row", alignItems: "center" },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryColor,
    marginRight: 5,
  },
  statusText: { fontSize: 12, color: "#000", fontWeight: "400" },
  moreButton: { padding: 5 },
  messageScroll: { flex: 1 },
  messageContentContainer: { padding: 20, paddingBottom: 70 },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  dateLine: { flex: 1, height: 1, backgroundColor: "#E0E0E0" },
  dateText: { marginHorizontal: 10, fontSize: 12, color: "#666" },
  receivedMessageContainer: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF0F0",
    padding: 10,
    marginVertical: 5,
    marginLeft: 15,
    maxWidth: "80%",
    borderRadius: 20,
    borderTopLeftRadius: 5,
  },
  sentMessageContainer: {
    alignSelf: "flex-end",
    marginVertical: 5,
    maxWidth: "80%",
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 20,
    borderTopRightRadius: 5,
    marginHorizontal: 15,
  },
  messageText: { fontSize: 16, color: "#000" },
  timeTextLeft: {
    fontSize: 12,
    color: "#000",
    marginLeft: 5,
    paddingLeft: 20,
    marginBottom: 15,
  },
  timeContainerRight: {
    flexDirection: "row",
    alignSelf: "flex-end",
    marginRight: 18,
    marginBottom: 15,
  },
  timeTextRight: { fontSize: 12, color: "#000", marginRight: 5 },
  footer: {
    padding: 10,
    backgroundColor: "#fff",
    width: "100%",
  },
  footerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    borderRadius: 15,
    alignItems: "center",
    paddingHorizontal: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    height: 48,
  },
  input: { flex: 1, fontSize: 16, height: 48 },
  buttonSend: {
    width: 48,
    height: 48,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  blockText: {
    marginLeft: 15,
    fontSize: 16,
    fontWeight: "500",
    color: "#FF3B30",
  },
  unblockText: {
    marginLeft: 15,
    fontSize: 16,
    fontWeight: "500",
    color: Colors.primaryColor,
  },
  cancelOption: {
    justifyContent: "center",
    marginTop: 10,
    borderBottomWidth: 0,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.primaryColor,
    textAlign: "center",
  },
  disabledInput: {
    backgroundColor: "#F8F8F8",
    borderColor: "#DDDDDD",
  },
  disabledButton: {
    borderColor: "#DDDDDD",
    backgroundColor: "#F8F8F8",
  },
  blockedText: {
    color: "#FF3B30",
    fontSize: 12,
    textAlign: "center",
    marginTop: 5,
    fontStyle: "italic",
  },
});

export default DetailChat;
