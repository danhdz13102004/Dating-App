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
} from "firebase/firestore";
import appConfig from "../../../configs/config";
import { useRouter, useGlobalSearchParams, useLocalSearchParams } from 'expo-router'

const  DetailChat = () => {
  const scrollViewRef = useRef(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [content, setContent] = useState("");
  const [userId, setUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const router = useRouter();
  const { idCoversation, id_partner, name, avatar } = useLocalSearchParams();
  
  

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
    
          unsubscribe = onSnapshot(q, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
              console.log("🔥 New message:", doc.data());

              const firestoreData = doc.data();
              // console.log("🔥 Firestore data:", firestoreData);

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
                return [...prev, newMsg];
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
    try {
      const receiverId = id_partner; // ID của người dùng khác
      console.log("CHECK SEND MESS :",senderId, receiverId)
      const messagesSubcollectionRef = collection(
        db,
        `messages/${receiverId}/messages`
      );

      const newMsg = {
        _id: "123",
        content: content,
        conversation: idCoversation, // nếu có
        status:"sent",
        createdAt:new Date().toISOString(),
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={()=>router.push("/(tabs)/chat")}>
            <MaterialIcons
              style={{ marginLeft: 5 }}
              name="arrow-back-ios"
              size={20}
              color={Colors.primaryColor}
            />
          </TouchableOpacity>

          <View style={styles.profileContainer}>
            <Image
              source={{ uri: avatar}}
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

          <TouchableOpacity style={styles.moreButton}>
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
              if(isLast) {
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
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Your message"
                placeholderTextColor="#999"
                value={content}
                onChangeText={(text) => setContent(text)}
              />
            </View>
            <TouchableOpacity
              onPress={() => sendMessage({ senderId: userId })}
              style={styles.buttonSend}
            >
              <Feather name="send" size={24} color={Colors.primaryColor} />
            </TouchableOpacity>
          </View>
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
});

export default DetailChat;
