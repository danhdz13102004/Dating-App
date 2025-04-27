import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
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
  const now = new Date();
  const date = new Date(isoTime);
  const secondsDiff = Math.floor((now - date) / 1000);
  
  // Less than a minute
  if (secondsDiff < 60) {
    return `${secondsDiff}s ago`;
  }
  
  // Less than an hour
  const minutesDiff = Math.floor(secondsDiff / 60);
  if (minutesDiff < 60) {
    return `${minutesDiff}m ago`;
  }
  
  // Less than a day
  const hoursDiff = Math.floor(minutesDiff / 60);
  if (hoursDiff < 24) {
    return `${hoursDiff}h ago`;
  }
  
  // Less than a week
  const daysDiff = Math.floor(hoursDiff / 24);
  if (daysDiff < 7) {
    return `${daysDiff}d ago`;
  }
  
  // Less than a month (approximately 30 days)
  if (daysDiff < 30) {
    const weeksDiff = Math.floor(daysDiff / 7);
    return `${weeksDiff}w ago`;
  }
  
  // Less than a year
  const monthsDiff = Math.floor(daysDiff / 30);
  if (monthsDiff < 12) {
    return `${monthsDiff}mo ago`;
  }
  
  // More than a year
  const yearsDiff = Math.floor(monthsDiff / 12);
  return `${yearsDiff}y ago`;
};

const NotificationItem = ({ createdAt, content, is_read, url = 'https://cdn.pixabay.com/photo/2021/11/15/23/30/bell-6799634_1280.png' }) => {
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
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

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
            querySnapshot.forEach((doc) => {
              console.log("🔥 New accepted:", doc.data());

              const firestoreData = doc.data();

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

      <ScrollView 
        style={styles.notificationsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF4C7F"]}
            tintColor="#FF4C7F"
          />
        }
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#4488ff" style={{ marginTop: 50 }} />
        ) : notifications.length > 0 ? (
          notifications.map((item, index) => (
            <React.Fragment key={item._id}>
              <NotificationItem
                createdAt={item.createdAt}
                content={item.content}
                is_read={item.is_read}
                url={item.url}
              />
              {index !== notifications.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))
        ) : (
          <View style={styles.emptyNotificationContainer}>
            <Ionicons name="notifications-off-outline" size={60} color="#cccccc" />
            <Text style={styles.emptyNotificationTitle}>No Notifications</Text>
            <Text style={styles.emptyNotificationText}>You don't have any notifications yet</Text>
          </View>
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
  emptyNotificationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyNotificationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyNotificationText: {
    fontSize: 16,
    color: '#888888',
  },
});

export default NotificationsScreen;
