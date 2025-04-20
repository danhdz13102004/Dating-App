import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Colors } from "../../../constants/Colors";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
const MatchScreen = () => {
  const router = useRouter();
  const handleButtonSayHello = () => {
    console.log("Say hello button pressed");
    router.push("/(tabs)/chat/detail-chat");
  };
  const handleButtonKeepSwiping = () => {
    console.log("Keep swiping button pressed");
    router.push("/(tabs)/discover");
  };

  return (
    <View style={styles.container}>
      {/* Card images with hearts */}
      <View style={styles.cardsContainer}>
        {/* Man card - positioned in back */}
        <View style={[styles.cardWrapper, styles.manCardPosition]}>
          <Image
            source={require("../../../assets/images/man.png")}
            style={styles.cardImage}
          />
          <View style={styles.heartIcon}>
            <MaterialIcons name="favorite" size={24} color="#FF4B6A" />
          </View>
        </View>

        {/* Woman card - positioned in front */}
        <View style={[styles.cardWrapper, styles.womanCardPosition]}>
          <Image
            source={require("../../../assets/images/woman.png")}
            style={styles.cardImage}
          />
          <View style={[styles.heartIcon, styles.womanHeartPosition]}>
            <MaterialIcons name="favorite" size={24} color="#FF4B6A" />
          </View>
        </View>
      </View>

      {/* Match message */}
      <View style={styles.matchTextContainer}>
        <Text style={styles.matchTitle}>It's a match, Jake!</Text>
        <Text style={styles.matchSubtitle}>
          Start a conversation now with each other
        </Text>
      </View>

      {/* Buttons */}
      <TouchableOpacity style={styles.primaryButton}>
        <Text style={styles.primaryButtonText} onPress={handleButtonSayHello}>
          Say hello
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton}>
        <Text
          style={styles.secondaryButtonText}
          onPress={handleButtonKeepSwiping}
        >
          Keep swiping
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  cardsContainer: {
    height: 450,
    width: "100%",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  cardWrapper: {
    position: "absolute",
    borderRadius: 20,
    overflow: "hidden",
    width: 160,
    height: 160 * 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  manCardPosition: {
    right: 30,
    top: 40,
    transform: [{ rotate: "6deg" }],
    zIndex: 1,
  },
  womanCardPosition: {
    left: 50,
    bottom: 40,
    transform: [{ rotate: "-6deg" }],
    zIndex: 2, // This ensures the woman's card is on top
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  heartIcon: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 50,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  womanHeartPosition: {
    bottom: 15,
    left: 15,
    top: undefined,
    right: undefined,
  },
  matchTextContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  matchTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.primaryColor,
    marginBottom: 10,
  },
  matchSubtitle: {
    fontSize: 16,
    color: "#000000",
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: Colors.primaryColor,
    width: "100%",
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "#FFF0F2",
    width: "100%",
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: Colors.primaryColor,
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default MatchScreen;
