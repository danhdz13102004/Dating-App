import { Tabs } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Colors } from "../../constants/Colors";
import React, { useState, useEffect, useRef } from "react";
import { Keyboard, View, Text, StyleSheet, Animated, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { jwtDecode } from "jwt-decode";
import { db } from "../../firebaseConfig";

export default function Layout() {
  const [tabBarVisible, setTabBarVisible] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [lastMessageId, setLastMessageId] = useState(null);
  const popupAnimation = useRef(new Animated.Value(0)).current;
  const popupTimeout = useRef(null);

  // Load last message ID from storage when component mounts
  useEffect(() => {
    const loadLastMessageId = async () => {
      try {
        const storedMessageId = await AsyncStorage.getItem('lastMessageId');
        if (storedMessageId) {
          setLastMessageId(storedMessageId);
          console.log("🔄 Loaded last message ID from storage:", storedMessageId);
        }
      } catch (error) {
        console.error("❌ Error loading last message ID:", error);
      }
    };

    loadLastMessageId();
  }, []);

  // Save last message ID to storage whenever it changes
  useEffect(() => {
    const saveLastMessageId = async () => {
      if (lastMessageId) {
        try {
          await AsyncStorage.setItem('lastMessageId', lastMessageId);
          console.log("💾 Saved last message ID to storage:", lastMessageId);
        } catch (error) {
          console.error("❌ Error saving last message ID:", error);
        }
      }
    };

    saveLastMessageId();
  }, [lastMessageId]);

  // Function to show popup notification
  const showNotification = (message, id) => {
    console.log("🔥 Showing notification:", message);

    setPopupMessage(message);
    setShowPopup(true);

    // Animate popup in
    Animated.timing(popupAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Clear any existing timeout
    if (popupTimeout.current) {
      clearTimeout(popupTimeout.current);
    }

    // Auto hide after 3 seconds
    popupTimeout.current = setTimeout(() => {
      Animated.timing(popupAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowPopup(false);
      });
    }, 3000);
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setTabBarVisible(false); // Ẩn TabBar khi bàn phím xuất hiện
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setTabBarVisible(true); // Hiện lại TabBar khi bàn phím ẩn
      }
    );

    // Dọn dẹp khi component unmount
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
      if (popupTimeout.current) {
        clearTimeout(popupTimeout.current);
      }
    };
  }, []);

  //Notify popup
  useEffect(() => {
    let unsubscribe;

    const fetchUserIdAndSubscribe = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          const decoded = jwtDecode(token);
          const uid = decoded.userId;
          // setUserId(uid);

          const q = query(
            collection(db, `acceptedMatches/${uid}/acceptedMatches`),
            orderBy("createdAt", "desc"),
            limit(1)
          );

          unsubscribe = onSnapshot(q, (querySnapshot) => {
            if (!querySnapshot.metadata.hasPendingWrites && !querySnapshot.metadata.fromCache) {
              querySnapshot.forEach(async (doc) => {
                console.log("🔥 New accepted:", doc.data());
                
                const firestoreData = doc.data();
                const storedLastNotifyId = await AsyncStorage.getItem('lastNotifyId');

                  // Check if this is actually a new message
                const isNewNptify = doc.id !== storedLastNotifyId;
                if (isNewNptify) {
                  showNotification(firestoreData.content || "New notify received!");

                  // Update the last message ID in storage
                  await AsyncStorage.setItem('lastNotifyId', doc.id);
                } 
                
              });
            }
            else{
              querySnapshot.forEach(async (doc) => {
                try {
                  await AsyncStorage.setItem('lastNotifyId', doc.id);
                } catch (error) {
                  console.error("❌ Error updating last notify ID:", error);
                }
              });
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



  useEffect(() => {
    let unsubscribe;

    const fetchUserIdAndSubscribe = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          const decoded = jwtDecode(token);
          const uid = decoded.userId;
          // setUserId(uid);

          const q = query(
            collection(db, `messages/${uid}/messages`),
            orderBy("createdAt", "desc"),
            limit(1)
          );

          unsubscribe = onSnapshot(q, (querySnapshot) => {
            // Skip initial data load (when app starts)
            // We'll use a ref to track the initial load
            if (!querySnapshot.metadata.hasPendingWrites && !querySnapshot.metadata.fromCache) {
              querySnapshot.forEach(async (doc) => {
                // console.log("🔥 New message from layout:", doc.data());
                const firestoreData = doc.data();
                // console.log("🔥 Firestore data:", firestoreData);
                // console.log("🔥 Document ID:", doc.id);

                try {
                  // Get the last message ID from storage each time to ensure we have the latest
                  const storedLastMessageId = await AsyncStorage.getItem('lastMessageId');
                  // console.log("📱 Stored lastMessageId:", storedLastMessageId);

                  // Check if this is actually a new message
                  const isNewMessage = doc.id !== storedLastMessageId;
                  const isFromOtherUser = firestoreData.senderId !== uid;

                  // Only show notification if it's both new and from another user
                  if (isNewMessage && isFromOtherUser) {
                    // console.log("📢 New message detected, showing notification");
                    showNotification(firestoreData.content || "New message received!");

                    // Update the last message ID in both state and storage
                    setLastMessageId(doc.id);
                    await AsyncStorage.setItem('lastMessageId', doc.id);
                  } else {
                    // console.log("🔄 Message already seen or sent by current user");
                    if (!isNewMessage) console.log("   - Same message ID as stored");
                    if (!isFromOtherUser) console.log("   - Message from current user");

                    // Still update the last message ID to ensure we're tracking the latest
                    if (isNewMessage) {
                      setLastMessageId(doc.id);
                      await AsyncStorage.setItem('lastMessageId', doc.id);
                    }
                  }
                } catch (error) {
                  console.error("❌ Error processing message:", error);
                }
              });
            } else {
              // console.log("💽 Initial data load or cached data - skipping notification");
              // Still update stored ID for initial data
              querySnapshot.forEach(async (doc) => {
                try {
                  await AsyncStorage.setItem('lastMessageId', doc.id);
                  setLastMessageId(doc.id);
                  // console.log("💾 Updated last message ID on initial load:", doc.id);
                } catch (error) {
                  console.error("❌ Error updating last message ID:", error);
                }
              });
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
  }, []); // Remove lastMessageId dependency to avoid re-subscribing

  return (
    <>
      {/* Custom Popup Notification */}
      {showPopup && (
        <Animated.View
          style={[
            styles.popup,
            {
              opacity: popupAnimation,
              transform: [
                {
                  translateY: popupAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0]
                  })
                }
              ]
            }
          ]}
        >
          <View style={styles.popupContent}>
            <Ionicons name="chatbubble" size={20} color="white" />
            <Text style={styles.popupText}>New Message:</Text>
            <Text style={styles.popupText}>{popupMessage}</Text>
          </View>
          <TouchableOpacity
            style={styles.popupClose}
            onPress={() => {
              Animated.timing(popupAnimation, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }).start(() => {
                setShowPopup(false);
              });
            }}
          >
            <Ionicons name="close" size={16} color="white" />
          </TouchableOpacity>
        </Animated.View>
      )}

      <Tabs
        screenOptions={{
          tabBarStyle: { display: tabBarVisible ? "flex" : "none" },
        }}
      >
        <Tabs.Screen
          name="discover"
          options={{
            title: "",
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <MaterialCommunityIcons
                  name="cards"
                  size={24}
                  color={Colors.primaryColor}
                />
              ) : (
                <MaterialCommunityIcons
                  name="cards-outline"
                  size={24}
                  color="black"
                />
              ),
          }}
        />

        <Tabs.Screen
          name="match"
          options={{
            title: "",
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <AntDesign name="heart" size={24} color={Colors.primaryColor} />
              ) : (
                <AntDesign name="hearto" size={24} color="black" />
              ),
          }}
        />

        <Tabs.Screen
          name="chat"
          options={{
            title: "",
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Ionicons
                  name="chatbubble-ellipses"
                  size={24}
                  color={Colors.primaryColor}
                />
              ) : (
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={24}
                  color="black"
                />
              ),
          }}
        />

        <Tabs.Screen
          name="notification"
          options={{
            title: "",
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <FontAwesome name="bell" size={24} color={Colors.primaryColor} />
              ) : (
                <FontAwesome name="bell-o" size={24} color="black" />
              ),
          }}
        />

        <Tabs.Screen
          name="bio"
          options={{
            title: "",
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Ionicons name="person" size={24} color={Colors.primaryColor} />
              ) : (
                <Ionicons name="person-outline" size={24} color="black" />
              ),
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  popup: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: Colors.primaryColor,
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  popupContent: {
    flex: 1,
    flexDirection: 'row',
    // alignItems: 'center',
  },
  popupText: {
    color: 'white',
    marginLeft: 2,
    fontSize: 14,
    flex: 1,
  },
  popupClose: {
    padding: 5,
  }
});
