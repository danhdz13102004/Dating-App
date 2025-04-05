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
  Dimensions,
} from "react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { Colors } from "../../../constants/Colors";

const DetailChat = () => {
  const scrollViewRef = useRef(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Set up keyboard listeners to track keyboard height and visibility
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

    // Clean up listeners on component unmount
    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // Function to dismiss keyboard when tapping outside the input
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton}>
            <MaterialIcons
              style={{ marginLeft: 5 }}
              name="arrow-back-ios"
              size={20}
              color={Colors.primaryColor}
            />
          </TouchableOpacity>

          <View style={styles.profileContainer}>
            <Image
              source={require("../../../assets/images/avatar-test.jpg")}
              style={styles.avatar}
            />
            <View style={styles.userInfo}>
              <Text style={styles.username}>Grace</Text>
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

      {/* Main content area with KeyboardAvoidingView */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Touchable area to dismiss keyboard */}
        <TouchableOpacity
          activeOpacity={1}
          style={{ flex: 1 }}
          onPress={dismissKeyboard}
        >
          {/* Chat content */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messageScroll}
            contentContainerStyle={styles.messageContentContainer}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
          >
            {/* Date label */}
            <View style={styles.dateContainer}>
              <View style={styles.dateLine} />
              <Text style={styles.dateText}>Today</Text>
              <View style={styles.dateLine} />
            </View>

            {/* Message 1 - received */}
            <View>
              <View style={styles.receivedMessageContainer}>
                <Text style={styles.messageText}>
                  Hi Jake, how are you? I saw on the app that we've crossed
                  paths several times this week 😄
                </Text>
              </View>
              <Text style={styles.timeTextLeft}>2:55 PM</Text>
            </View>

            {/* Message 2 - sent */}
            <View>
              <View style={styles.sentMessageContainer}>
                <Text style={styles.messageText}>
                  Haha truly! Nice to meet you Grace! What about a cup of coffee
                  today evening? ☕
                </Text>
              </View>
              <View style={styles.timeContainerRight}>
                <Text style={styles.timeTextRight}>3:02 PM</Text>
                <MaterialIcons
                  name="done-all"
                  size={16}
                  color={Colors.primaryColor}
                />
              </View>
            </View>

            {/* Message 3 - received */}
            <View>
              <View style={styles.receivedMessageContainer}>
                <Text style={styles.messageText}>Sure, let's do it!</Text>
              </View>
              <Text style={styles.timeTextLeft}>2:55 PM</Text>
            </View>

            {/* Message 4 - sent */}
            <View>
              <View style={styles.sentMessageContainer}>
                <Text style={styles.messageText}>
                  Great I will write later the exact time and place. See you
                  soon!
                </Text>
              </View>
              <View style={styles.timeContainerRight}>
                <Text style={styles.timeTextRight}>3:15 PM</Text>
                <MaterialIcons
                  name="done-all"
                  size={16}
                  color={Colors.primaryColor}
                />
              </View>
            </View>
          </ScrollView>
        </TouchableOpacity>

        {/* Footer input */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Your message"
                placeholderTextColor="#999"
              />
            </View>
            <TouchableOpacity style={styles.buttonSend}>
              <Feather name="send" size={24} color={Colors.primaryColor} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    marginTop: 15,
    marginBottom: 15,
    padding: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    justifyContent: "space-between",
  },
  backButton: {
    padding: 5,
  },
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
  userInfo: {
    marginLeft: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
  },
  onlineStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryColor,
    marginRight: 5,
  },
  statusText: {
    fontSize: 12,
    color: "#000000",
    fontWeight: "400",
  },
  moreButton: {
    padding: 5,
  },
  messageScroll: {
    flex: 1,
  },
  messageContentContainer: {
    padding: 20,
    paddingBottom: 70,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dateText: {
    marginHorizontal: 10,
    fontSize: 12,
    color: "#666",
  },
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
  messageText: {
    fontSize: 16,
    color: "#000",
  },
  timeTextLeft: {
    fontSize: 12,
    color: "#000000",
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
  timeTextRight: {
    fontSize: 12,
    color: "#000000",
    marginRight: 5,
  },
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
  input: {
    flex: 1,
    fontSize: 16,
    height: 48,
  },
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
