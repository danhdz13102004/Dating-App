import React from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
const MatchCard = ({ name, age, imageUrl, onRemove, onLike }) => {
  return (
    <View style={styles.matchCard}>
      <Image source={{ uri: imageUrl }} style={styles.matchImage} />
      <View style={styles.matchInfo}>
        <Text style={styles.matchText}>{name}, {age}</Text>
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
  // Combined all matches into a single array
  const matches = [
    { id: 1, name: 'Leilani', age: 19, image: 'https://picsum.photos/200' },
    { id: 2, name: 'Annabelle', age: 20, image: 'https://picsum.photos/200' },
    { id: 3, name: 'Reagan', age: 24, image: 'https://picsum.photos/200' },
    { id: 4, name: 'Hadley', age: 25, image: 'https://picsum.photos/200' },
    { id: 5, name: 'Emma', age: 22, image: 'https://picsum.photos/200' },
    { id: 6, name: 'Michael', age: 27, image: 'https://picsum.photos/200' },
  ];

  const handleRemoveMatch = (id) => {
    console.log('Remove match with id:', id);
  };

  const handleLikeMatch = (id) => {
    console.log('Like match with id:', id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matches</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={24} color="#FF3366" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.description}>
        <Text style={styles.descriptionText}>
          This is a list of people who have liked you and your matches.
        </Text>
      </View>
      
      <ScrollView style={styles.matchesList}>
        <View style={styles.matchesGrid}>
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              name={match.name}
              age={match.age}
              imageUrl={match.image}
              onRemove={() => handleRemoveMatch(match.id)}
              onLike={() => handleLikeMatch(match.id)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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