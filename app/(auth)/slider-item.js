import React, { useRef, useState, useEffect } from "react";
import {
  View,
  FlatList,
  Image,
  Dimensions,
  StyleSheet,
  Animated,
} from "react-native";

const { width } = Dimensions.get("window");

const SliderItem = ({
  data,
  autoPlayInterval = 3000,
  loop = true,
  autoPlay = true,
  renderItem,
  paginationEnabled = true,
  paginationActiveColor = "#e94057",
  paginationInactiveColor = "#e9e9e9",
}) => {
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // Create a modified data array with one extra item at the end (duplicate of the first)
  const extendedData = [...data];
  if (loop && data.length > 1) {
    // Add the first item at the end to create a seamless transition
    extendedData.push({ ...data[0], id: `${data[0].id}-duplicate` });
  }

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      if (index < data.length) {
        // Only update if within the original data range
        setCurrentIndex(index);
      }
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  // Auto-play functionality
  useEffect(() => {
    let interval;

    if (autoPlay && data.length > 1 && !isUserScrolling) {
      interval = setInterval(() => {
        const nextIndex = (currentIndex + 1) % data.length;

        if (nextIndex === 0 && currentIndex === data.length - 1) {
          // We're at the end and need to go to the beginning
          // First, go to the duplicate slide
          flatListRef.current?.scrollToOffset({
            offset: data.length * width,
            animated: true,
          });

          // Then after animation completes, instantly jump back to the real first slide
          setTimeout(() => {
            flatListRef.current?.scrollToOffset({
              offset: 0,
              animated: false,
            });
          }, 400); // Adjust this timeout to match your animation duration
        } else {
          flatListRef.current?.scrollToOffset({
            offset: nextIndex * width,
            animated: true,
          });
        }
      }, autoPlayInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentIndex, autoPlay, autoPlayInterval, data.length, isUserScrolling]);

  // Handle scrolling
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleScrollBegin = () => {
    setIsUserScrolling(true);
  };

  // Handle when scrolling ends
  const handleMomentumScrollEnd = (event) => {
    setIsUserScrolling(false);

    if (loop && data.length > 1) {
      const position = event.nativeEvent.contentOffset.x;
      const index = Math.round(position / width);

      // Check if we're at the duplicate slide (last slide in extended data)
      if (index >= data.length) {
        // We're at the duplicate, jump back to the real first slide without animation
        flatListRef.current?.scrollToOffset({
          offset: 0,
          animated: false,
        });
        setCurrentIndex(0);
      }
    }
  };

  // Pagination component
  const Pagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {data.map((_, i) => (
          <View
            key={i}
            style={[
              styles.paginationDot,
              {
                backgroundColor:
                  i === currentIndex
                    ? paginationActiveColor
                    : paginationInactiveColor,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  // Default render item if none provided
  const defaultRenderItem = ({ item, index }) => {
    // Don't render the duplicate item differently
    return (
      <View style={styles.slide}>
        <Image source={item.image} style={styles.image} resizeMode="cover" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={extendedData}
        renderItem={renderItem || defaultRenderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBegin}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={styles.flatListContent}
      />
      {paginationEnabled && <Pagination />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatListContent: {
    alignItems: "center",
  },
  slide: {
    width,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: width * 0.85,
    height: width * 0.85 * 1.1, // Aspect ratio similar to your design
    borderRadius: 20,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});

export default SliderItem;
