import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import appConfig from '../../../configs/config';
import { jwtDecode } from 'jwt-decode';
import { db } from "../../../firebaseConfig";
import {
  collection,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";

const MatchCard = ({ name, age, imageUrl, onRemove, onLike }) => {
  return (
    <View style={styles.matchCard}>
      <Image
        source={{ uri: imageUrl || 'https://picsum.photos/200' }}
        style={styles.matchImage}
        onError={(e) => console.log('Image failed to load:', e.nativeEvent.error)}
      />
      <View style={styles.matchInfo}>
        <Text style={styles.matchText}>{name || 'Unknown'}, {age || '?'}</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={onRemove}>
          <FontAwesome name="close" size={30} color="white" />
        </TouchableOpacity>
        <View style={styles.buttonDivider} />
        <TouchableOpacity style={styles.actionButton} onPress={onLike}>
          <AntDesign name="heart" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const MatchesScreen = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  // Hàm lấy userId từ token
  const getUserId = async () => {
    try {
      // Lấy token từ AsyncStorage
      const authToken = await AsyncStorage.getItem('authToken');

      if (!authToken) {
        console.log('No token found, redirecting to login');
        router.replace('/(auth)/login');
        return null;
      }

      setToken(authToken);

      // Decode token để lấy userId
      try {
        const decoded = jwtDecode(authToken);
        console.log('Decoded token:', decoded);

        // Tìm userId trong token - có thể là một trong các field này tùy thuộc vào JWT của bạn
        const id = decoded.userId || decoded.id || decoded._id || decoded.sub;

        if (!id) {
          console.error('UserId not found in token payload');
          throw new Error('Invalid token format');
        }

        console.log('Found userId in token:', id);
        setUserId(id);
        return id;
      } catch (decodeError) {
        console.error('Error decoding token:', decodeError);
        Alert.alert('Authentication Error', 'Your session has expired. Please log in again.');
        router.replace('/(auth)/login');
        return null;
      }
    } catch (error) {
      console.error('Error fetching user ID:', error);
      setError('Authentication error. Please login again.');
      return null;
    }
  };

  // Hàm gọi API để lấy danh sách matches
  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      // Lấy userId từ token
      const id = await getUserId();
      if (!id) {
        setLoading(false);
        return;
      }

      console.log('Fetching matches for userId:', id);

      // Chuẩn bị URL và options cho API request
      const url = `${appConfig.API_URL}/conversation/match-requests`;
      const options = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      // Nếu method là GET, thêm userId vào query params thay vì body
      const finalUrl = `${url}/${id}`;

      console.log('API Request URL:', finalUrl);

      // Gọi API
      const response = await fetch(finalUrl, options);

      // Kiểm tra response status
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Server responded with status: ${response.status}`);
      }

      // Parse response JSON
      const responseText = await response.text();
      console.log('API Response preview:', responseText);

      const data = JSON.parse(responseText);

      // Xử lý dữ liệu trả về
      if (data && data.data && Array.isArray(data.data)) {
        console.log(`Received ${data.data.length} matches`);
        setMatches(data.data);
      } else {
        console.warn('API response format unexpected:', data);
        setMatches([]);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      setError('Unable to load matches. Please try again later.');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  // Hàm đổi trạng thái cuộc hội thoại thành "deleted" (xóa match)
  const handleRemoveMatch = async (id) => {
    if (!id) {
      console.error('No match ID provided');
      return;
    }

    try {
      // Kiểm tra userId
      if (!userId) {
        const retrievedId = await getUserId();
        if (!retrievedId) {
          Alert.alert('Error', 'User not authenticated');
          return;
        }
      }

      Alert.alert(
        'Remove Match',
        'Are you sure you want to remove this match?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Remove',
            onPress: async () => {
              try {
                // Hiển thị loading state nếu cần
                setLoading(true);

                // Gọi API để đổi trạng thái
                const response = await fetch(`${appConfig.API_URL}/conversation/${id}`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({ status: 'deleted' })
                });

                if (response.ok) {
                  // Cập nhật UI bằng cách loại bỏ match đã xóa
                  setMatches(prevMatches => prevMatches.filter(match => (match._id || match.id) !== id));
                  console.log('Match removed successfully');
                } else {
                  const errorText = await response.text();
                  console.error('API error response:', errorText);
                  Alert.alert('Error', 'Unable to remove match');
                }
              } catch (error) {
                console.error('Error removing match:', error);
                Alert.alert('Error', 'Unable to remove match');
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error in handleRemoveMatch:', error);
      Alert.alert('Error', 'Unable to process your request');
    }
  };

  const addNtfToDB = async (match)=>{

    const ntfMatchForDB = {
      content: `${match.receiver.name} has accepted your request`,
      id_conversation: match._id, 
      id_user: match.sender._id,  
    };

    const response = await fetch(`${appConfig.API_URL}/notification/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(ntfMatchForDB)
    });

    console.log(response.data);
  }
  const sendAcceptedMatch = async (match) => {
    try {
      console.log("🔎CHECK SEND MATCHES :",match.sender._id, match.receiver._id)
      const acceptedMatchesSubcollectionRef = collection(
        db,
        `acceptedMatches/${match.sender._id}/acceptedMatches`,
      );

      const newAcceptedmatch = {
        content: `${match.receiver.name} has accepted your request`,
        id_conversation: match._id, 
        id_user: match.sender._id,
        createdAt: serverTimestamp(),
        sender: {
          _id: match.receiver._id,
          avatar: match.receiver.avatar,
        }
      };
      
      await addDoc(acceptedMatchesSubcollectionRef, newAcceptedmatch);
      await addNtfToDB(match);

      console.log("✅ Accepted match đã được gửi!");
    } catch (error) {
      console.error("❌ Gửi Accepted match thất bại:", error);
    }
  };
  // Hàm đổi trạng thái cuộc hội thoại thành "active" (like match)
  const handleLikeMatch = async (match) => {
    id = match._id || match.id
    if (!id) {
      console.error('No match ID provided');
      return;
    }

    try {
      // Kiểm tra userId
      if (!userId) {
        const retrievedId = await getUserId();
        if (!retrievedId) {
          Alert.alert('Error', 'User not authenticated');
          return;
        }
      }

      // Hiển thị loading state nếu cần
      setLoading(true);

      //FireBase
      sendAcceptedMatch(match);

      // Gọi API để đổi trạng thái
      const response = await fetch(`${appConfig.API_URL}/conversation/${match._id || match.id}/active`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'active' })
      });

      if (response.ok) {
        // Cập nhật UI bằng cách loại bỏ match đã like
        setMatches(prevMatches => prevMatches.filter(match => (match._id || match.id) !== id));
        console.log('Match liked successfully');
        Alert.alert('Success', 'Match liked successfully!');
      } else {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        Alert.alert('Error', 'Unable to like match');
      }
    } catch (error) {
      console.error('Error liking match:', error);
      Alert.alert('Error', 'Unable to like match');
    } finally {
      setLoading(false);
    }
  };

  // Reload matches
  const handleRefresh = () => {
    fetchMatches();
  };

  // Load dữ liệu khi component được mount
  useEffect(() => {
    fetchMatches();

    // Cleanup function
    return () => {
      // Cleanup nếu cần
    };
  }, []);

  // Hiển thị loading
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3366" />
          <Text style={styles.loadingText}>Loading matches...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matches</Text>
        <TouchableOpacity style={styles.filterButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color="#FF3366" />
        </TouchableOpacity>
      </View>

      <View style={styles.description}>
        <Text style={styles.descriptionText}>
          This is a list of people who have liked you and your matches.
        </Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchMatches}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.matchesList}
          contentContainerStyle={matches.length === 0 ? { flex: 1, justifyContent: 'center' } : {}}
        >
          {matches && matches.length > 0 ? (
            <View style={styles.matchesGrid}>
              {matches.map((match) => (
                <MatchCard
                  key={match._id || match.id || Math.random().toString()}
                  name={match.sender?.name || 'Unknown'}
                  age={match.sender?.age || '?'}
                  imageUrl={match.sender?.avatar || 'https://picsum.photos/200'}

                  onRemove={() => handleRemoveMatch(match._id || match.id)}
                  onLike={() => handleLikeMatch(match)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No matches available</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchMatches}>
                <Text style={styles.retryButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3366',
    marginBottom: 15,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FF3366',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
  },
  matchesList: {
    flex: 1,
    paddingTop: 15,
  },
  matchesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 7,
  },
  matchCard: {
    width: '50%',
    padding: 8,
  },
  matchImage: {
    width: '100%',
    aspectRatio: 0.8,
    borderRadius: 10,
  },
  matchInfo: {
    position: 'absolute',
    bottom: 50,
    left: 16,
    marginBottom: 10,
  },
  matchText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    backgroundColor: '#796c5a',
    borderRadius: 30,
    marginTop: -30,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButton: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    marginHorizontal: 20,
    fontWeight: 'bold',
  },
  buttonDivider: {
    width: 1,
    backgroundColor: '#eee',
  },
});

export default MatchesScreen;