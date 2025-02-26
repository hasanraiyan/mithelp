import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import data from '../data/data.json'; 

const HomeScreen = ({ navigation }) => {
  const branches = data.branches;

  const animatedValues = useRef(branches.map(() => new Animated.Value(0))).current;

  useEffect(() => {
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
  }, []);

  const BranchCard = ({ branch, animatedValue, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

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
            opacity: animatedValue,
            transform: [
              { translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) },
              { scale: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
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
          onPress={onPress}
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
        {branches.map((branch, index) => (
          <BranchCard
            key={index}
            branch={branch}
            animatedValue={animatedValues[index]}
            onPress={() => navigation.navigate('Semester', { branch: branch.name })}
          />
        ))}
      </ScrollView>

      {/* <View style={styles.footer}>
        <Text style={styles.footerText}>{data.metadata.academicYear}</Text>
      </View> */}
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
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  headerPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.15,
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
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  floatingHelpButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007BFF',
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