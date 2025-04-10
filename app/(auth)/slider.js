import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import SliderItem from "./slider-item";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window"); // Lấy kích thước màn hình

const Slider = () => {
  const router = useRouter();

  const handleCreateAccount = () => {
    router.push("/(auth)/register");
  };

  const handleSignIn = () => {
    router.push("/(auth)/login");
  };

  const carouselData = [
    {
      id: "1",
      title: "Algorithm",
      description:
        "Users going through a vetting process to ensure you never match with bots.",
      image: require("../../assets/images/girl1.png"),
    },
    {
      id: "2",
      title: "Matches",
      description:
        "We match you with people that have a large array of similar interests.",
      image: require("../../assets/images/girl2.png"),
    },
    {
      id: "3",
      title: "Premium",
      description:
        "Sign up today and enjoy the first month of premium benefits on us.",
      image: require("../../assets/images/girl3.png"),
    },
  ];

  // Custom render cho từng slide
  const renderCarouselItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.phoneContainer}>
          <View style={styles.contentContainer}>
            {/* Image */}
            <View style={styles.imageContainer}>
              <Image
                source={item.image}
                style={styles.image}
                resizeMode="cover"
              />
            </View>

            {/* Text phần title và description */}
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Slider hiển thị hình ảnh + title + mô tả */}
      <View style={styles.carouselContainer}>
        <SliderItem
          data={carouselData}
          loop={true}
          autoPlay={true}
          autoPlayInterval={4000}
          renderItem={renderCarouselItem}
          paginationActiveColor="#e94057"
          paginationInactiveColor="#e9e9e9"
        />
      </View>

      {/* Phần phía dưới cố định: nút, link sign in */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.button} onPress={handleCreateAccount}>
          <Text style={styles.buttonText}>Create an account</Text>
        </TouchableOpacity>

        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Already have an account? </Text>
          <TouchableOpacity onPress={handleSignIn}>
            <Text style={styles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  carouselContainer: {
    flex: 1,
    justifyContent: "center", // căn giữa nội dung
  },
  slide: {
    width,
    alignItems: "center",
    justifyContent: "center",
  },
  phoneContainer: {
    width: width * 0.9,
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    width: width * 0.85,
    aspectRatio: 0.9,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 30,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#e94057", // màu chủ đạo
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    lineHeight: 22,
  },
  bottomContainer: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  button: {
    width: "90%",
    height: 55,
    backgroundColor: "#e94057",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },
  signInContainer: {
    flexDirection: "row",
    marginBottom: 25,
  },
  signInText: {
    color: "#666",
    fontSize: 15,
  },
  signInLink: {
    color: "#e94057",
    fontWeight: "bold",
    fontSize: 15,
  },
});

export default Slider;
