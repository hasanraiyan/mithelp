import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated,
  ActivityIndicator,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DATA_URL = 'https://raw.githubusercontent.com/hasanraiyan/beu-data/refs/heads/main/data.json';
const STORAGE_KEY = 'app_data_cache';

const HomeScreen = ({ navigation }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animatedValues, setAnimatedValues] = useState([]);
  const [animationsReady, setAnimationsReady] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (data && data.branches) {
      // Initialize animated values when data is available
      const newAnimatedValues = data.branches.map(() => new Animated.Value(0));
      setAnimatedValues(newAnimatedValues);
      setAnimationsReady(true);
    }
  }, [data]);

  useEffect(() => {
    if (animationsReady && animatedValues.length > 0) {
      // Start animations only after animated values are properly initialized
      Animated.stagger(
        100,
        animatedValues.map(anim =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          })
        )
      ).start();
    }
  }, [animationsReady, animatedValues]);

  const fetchData = async () => {
    setError(null); // Clear any previous errors
    try {
      setLoading(true);

      // Try to get data from cache first
      const cachedData = await AsyncStorage.getItem(STORAGE_KEY);

      if (cachedData) {
        const parsedCacheData = JSON.parse(cachedData);
        setData(parsedCacheData);
        console.log('Data loaded from cache.');
        setLoading(false);
      } else {
        // If no cached data, fetch from remote
        await fetchFromRemote();
      }
    } catch (cacheError) {
      console.error("Error accessing cache:", cacheError);
      // If cache fails, attempt to fetch from remote as fallback
      setError("Error accessing local cache. Trying to fetch data from server...");
      await fetchFromRemote(); // Attempt to fetch from remote as fallback
    }
  };

  const fetchFromRemote = async () => {
    try {
      const response = await fetch(DATA_URL);
      if (!response.ok) {
        throw new Error(`Network response was not ok, status code: ${response.status}`);
      }

      const fetchedData = await response.json();

      // Save to cache
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fetchedData));
      setData(fetchedData);
      console.log('Data fetched from remote and cached.');
      setLoading(false);
    } catch (remoteError) {
      console.error("Error fetching remote data:", remoteError);
      setError("Failed to load data from server. Please check your connection or try again later.");
      setLoading(false);
    }
  };

  const updateData = async () => {
    Alert.alert(
      "Update Data",
      "Do you want to update the data from the server?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Update",
          onPress: async () => {
            setLoading(true);
            setError(null); // Clear error before update attempt
            try {
              await fetchFromRemote();
              Alert.alert("Success", "Data has been updated successfully!");
            } catch (updateError) {
              console.error("Error during data update:", updateError);
              setError("Failed to update data. Please try again.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const BranchCard = ({ branch, index, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // Make sure we have valid animated values before using them
    const animValue = animatedValues[index] || new Animated.Value(0);

    const handlePressIn = () => {
      Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    };

    return (
      <Animated.View
        style={[
          styles.animatedContainer,
          {
            opacity: animValue,
            transform: [
              { translateY: animValue.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) },
              { scale: animValue.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        <TouchableOpacity
          style={[styles.branchCard, { borderLeftColor: branch.color }]}
          activeOpacity={0.8}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => {
            if (data) {
              navigation.navigate('Semester', { branch: branch.name, data: data });
            } else {
              console.warn('Data is not yet loaded, navigation prevented.');
              // Optionally, you could show a message to the user.
            }
          }}
          accessibilityLabel={`Navigate to ${branch.name} branch`}
        >
          <LinearGradient
            colors={[branch.color, lightenColor(branch.color, 30)]}
            style={styles.iconContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <FontAwesome5 name={branch.icon} size={26} color="#FFFFFF" />
          </LinearGradient>
          <View style={styles.branchInfo}>
            <Text style={styles.branchName}>{branch.name}</Text>
            <Text style={styles.branchDescription}>{branch.description}</Text>
          </View>
          <FontAwesome5 name="chevron-right" size={16} color={branch.color} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2962FF" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <FontAwesome5 name="exclamation-circle" size={50} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#2962FF', '#00B0FF']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTitleContainer}>
            <FontAwesome5 name="graduation-cap" size={32} color="#FFFFFF" style={styles.headerIcon} />
            <Text style={styles.headerTitle}>{data.metadata.appName}</Text>
          </View>
          <Text style={styles.subtitle}>Select Your Branch</Text>
          <Text style={styles.welcomeText}>
            Welcome to your academic resource center. Access course materials, assignments, and more.
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {data && data.branches && data.branches.map((branch, index) => ( // Safe access data.branches
          <BranchCard
            key={index}
            branch={branch}
            index={index}
            onPress={() => {
              if (data) {
                navigation.navigate('Semester', { branch: branch.name, data: data });
              } else {
                console.warn('Data is not yet loaded, navigation prevented.');
              }
            }}
          />
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.floatingUpdateButton} onPress={updateData}>
        <FontAwesome5 name="sync-alt" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

function lightenColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f9fc',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f9fc',
    padding: 20,
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2962FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  headerContent: {
    alignItems: 'start',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'start',
    marginBottom: 8,
  },
  headerIcon: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'start',
  },
  welcomeText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 10,
    lineHeight: 22,
    textAlign: 'start',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  animatedContainer: {
    marginBottom: 16,
  },
  branchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  branchInfo: {
    flex: 1,
  },
  branchName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  branchDescription: {
    fontSize: 14,
    color: '#777',
    lineHeight: 20,
  },
  floatingUpdateButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2962FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
});

export default HomeScreen;