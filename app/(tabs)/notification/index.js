import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'expo-router';
import appConfig from '../../../configs/config'; 
import { db } from "../../../firebaseConfig";
import {
  onSnapshot,
  query,
  collection,
  orderBy,
  limit,
} from "firebase/firestore";


const time_format = (isoTime) => {
  const time = Math.floor((new Date() - new Date(isoTime)) / 1000);
  if (time < 60) return time + 's ago';
  let min = Math.round(time / 60);
  if (min < 60) return min + 'm ago';
  let hour = Math.round(min / 60);
  return hour + 'h ago';
};

const NotificationItem = ({ createdAt, content, is_read, url = 'https://picsum.photos/200' }) => {
  return (
    <View style={is_read ? styles.notificationItem_seen : styles.notificationItem_unseen}>
      <View style={styles.notificationIconContainer}>
        {is_read ? (
          <Image source={{ uri: url }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={styles.iconWithBadge}>
            <Image source={{ uri: url }} style={styles.image} contentFit="cover" />
            <View style={styles.redBadge} />
          </View>
        )}
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.timeText}>{time_format(createdAt)}</Text>
        <Text style={styles.titleText}>New notification</Text>
        <Text style={styles.messageText}>{content}</Text>
      </View>
    </View>
  );
};

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          console.log('No token found, redirecting to login');
          router.replace('/(auth)/login');
          return;
        }

        const decoded = jwtDecode(token);
        const id_user = decoded?.userId;
        console.log('User ID:', id_user);
        const url = `${appConfig.API_URL}/user/notifications/${id_user}`;
        console.log('Fetching notifications from:', url);   
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          } 
        });

        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }

        const json = await response.json();
        console.log('Notifications data:', json.data);
        setNotifications(json.data || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
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
          // setUserId(uid);
    
          const q = query(
            collection(db, `acceptedMatches/${uid}/acceptedMatches`),
            orderBy("createdAt", "desc"),
            limit(1) // 🔥 Chỉ lấy tin nhắn mới nhất
          );
    
          unsubscribe = onSnapshot(q, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
              console.log("🔥 New accepted:", doc.data());

              const firestoreData = doc.data();
              // console.log("🔥 Firestore data:", firestoreData);

              // 🔁 Chuyển đổi dữ liệu sang định dạng giống API
              const newNtf = {
                _id: doc.id,
                createdAt: firestoreData.createdAt?.toDate().toISOString() || new Date().toISOString(),
                content: firestoreData.content || "",
                is_read: false,
                url : firestoreData.sender.avatar,
              };
  
              setNotifications(prev => {
                return [newNtf, ...prev];
              });
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.notificationHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <AntDesign name="left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.notificationTitle}>Notification</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.notificationsList}>
        {loading ? (
          <ActivityIndicator size="large" color="#4488ff" style={{ marginTop: 50 }} />
        ) : (
          notifications.map((item, index) => (
            <React.Fragment key={item._id}>
              <NotificationItem
                createdAt={item.createdAt}
                content={item.content}
                is_read={item.is_read}
              />
              {index !== notifications.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: 'white',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  moreButton: {
    padding: 5,
  },
  notificationsList: {
    flex: 1,
    backgroundColor: 'white',
  },
  notificationItem_unseen: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff2f4',
  },
  notificationItem_seen: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#ffffff',
  },
  notificationIconContainer: {
    marginRight: 15,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#cccccc',
    overflow: 'hidden',
  },
  iconWithBadge: {
    position: 'relative',
  },
  redBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#FF4C7F',
  },
  notificationContent: {
    flex: 1,
  },
  timeText: {
    color: '#999',
    marginBottom: 3,
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  usernameText: {
    color: '#000',
    fontWeight: 'bold',
  },
  messageText: {
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
  },
});

export default NotificationsScreen;
