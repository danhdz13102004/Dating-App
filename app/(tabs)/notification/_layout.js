import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Image } from 'expo-image';


const time_format = (time) =>{
  if (time < 60) return time + 's ago';
  let min = Math.round(time/60)
  if (min < 60) return min + 'm ago';
  let hour = Math.round(min/60)
  return hour+'h ago'; 
}
const NotificationItem = ({ time, message, isSeen, isPost, username }) => {
  return (
    <View style={isSeen?styles.notificationItem_seen:styles.notificationItem_unseen}>
      <View style={styles.notificationIconContainer}>
        {isSeen ? (
          <View style={styles.greyIcon} />
        ) : (
          <View style={styles.iconWithBadge}>
            <View style={styles.greyIcon} />
            <View style={styles.redBadge} />
          </View>
        )}
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.timeText}>{time_format(time)}</Text>
        <Text style={styles.titleText}>
          {isPost ? (
            <>
              <Text style={styles.usernameText}>{username}</Text> {'has a new post'} 
            </>
          ) : (
            <>
              {'You have a invitation from'} <Text style={styles.usernameText}>{username}</Text> 
            </>
          )
          }
        </Text>
        <Text style={styles.messageText}>{message}</Text>
      </View>
    </View>
  );
};

const NotificationsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.notificationHeader}>
        <TouchableOpacity style={styles.backButton}>
          <AntDesign name="left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.notificationTitle}>Notification</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="black" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.notificationsList}>
        <NotificationItem 
          time={60}
          username={'Danh'} 
          isSeen={false}
        />
        
        <View style={styles.divider} />
        
        <NotificationItem 
          time={60} 
          username={'Phuc'}
          isSeen={false}
        />
        
        <View style={styles.divider} />
        
        <NotificationItem 
          time={6000} 
          message="Thanh xuan nhu mot tac tra ..." 
          isSeen={true}
          isPost={true}
          username="LinhBE"
        />
        
        <View style={styles.divider} />
        
        <NotificationItem 
          message="Yeu em nhu mua thu Ha Noi..." 
          isSeen={true}
          isPost={true}
          username="truong2em2tay"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#4488ff',
    padding: 15,
    paddingBottom: 0,
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
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
  greyIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#cccccc',
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