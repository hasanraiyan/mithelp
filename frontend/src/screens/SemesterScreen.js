import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import data from '../data/data.json';
const { width } = Dimensions.get('window');

const SemesterScreen = ({ route, navigation }) => {
  const { branch } = route.params || {};
  const branchData = data.branches.find(b => b.name === branch) || {};
  const semesters = branchData.semesters || [];

  const headerAnimation = useRef(new Animated.Value(0)).current;
  const animatedValues = useRef(semesters.map(() => new Animated.Value(0))).current;

  const branchIcons = Object.fromEntries(
    data.branches.map(b => [b.name, b.icon])
  );
  const branchIcon = branchIcons[branch] || 'graduation-cap';

  const getBranchColor = () => branchData.gradientColors || ['#1976D2', '#42a5f5'];
  const branchColor = getBranchColor();

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerAnimation, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.stagger(
        75,
        animatedValues.map(anim =>
          Animated.spring(anim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true })
        )
      ),
    ]).start();
  }, [headerAnimation, animatedValues]);

  const SemesterCard = ({ semester, animatedValue, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
    const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

    return (
      <Animated.View
        style={{
          opacity: animatedValue,
          transform: [
            { translateX: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [width / 2, 0] }) },
            { scale: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) },
            { scale: scaleAnim },
          ],
        }}
      >
        <TouchableOpacity
          style={[styles.semesterButton, { borderLeftColor: branchColor[0] }]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          activeOpacity={0.8}
          accessibilityLabel={`Navigate to ${semester.name}`}
          accessibilityRole="button"
        >
          <View style={styles.semesterInfo}>
            <Text style={styles.semesterText}>{semester.name}</Text>
            <Text style={styles.semesterDetails}>
              {semester.subjectsCount} Subjects
              {semester.credits && semester.credits !== 0 ? ` • ${semester.credits} Credits` : null}
            </Text>
          </View>
          <LinearGradient
            colors={[branchColor[0] + '20', branchColor[1] + '20']}
            style={styles.semesterNumberCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[styles.semesterNumber, { color: branchColor[0] }]}>
              {semester.id}
            </Text>
          </LinearGradient>
          <FontAwesome5 name="chevron-right" size={14} color={branchColor[0]} style={styles.chevron} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <Animated.View
        style={{
          opacity: headerAnimation,
          transform: [{ translateY: headerAnimation.interpolate({ inputRange: [0, 1], outputRange: [-50, 0] }) }],
        }}
      >
        <LinearGradient
          colors={branchColor}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <View style={styles.backButtonCircle}>
              <FontAwesome5 name="chevron-left" size={18} color={branchColor[0]} />
            </View>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.branchType}>{branch}</Text>
            <View style={styles.headerTitleContainer}>
              <FontAwesome5 name={branchIcon} size={28} color="#FFFFFF" style={styles.headerIcon} />
              <Text style={styles.headerTitle}>Select Semester</Text>
            </View>
            <Text style={styles.subtitle}>Choose a semester to view subjects and resources</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.semestersContainer}>
          {semesters.map((sem, index) => (
            <SemesterCard
              key={sem.id}
              semester={sem}
              animatedValue={animatedValues[index]}
              onPress={() =>
                navigation.navigate('Subject', { branch, semester: sem.name, semesterId: sem.id })
              }
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    overflow: 'hidden',
  },
  headerContent: {
    alignItems: 'flex-start',
    marginTop: 16,
  },
  branchType: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
    textAlign: 'left', // Modified to align text to the left
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Keep align items center for vertical alignment with icon
    justifyContent: 'flex-start', // Modified to align content to the start
    marginBottom: 10,
  },
  headerIcon: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'left', // Modified to align text to the left
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 22,
    textAlign: 'left', // Modified to align text to the left
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 2,
  },
  backButtonCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  semestersContainer: {
    padding: 20,
  },
  semesterButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 4,
  },
  semesterInfo: {
    flex: 1,
  },
  semesterText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  semesterDetails: {
    fontSize: 14,
    color: '#777',
  },
  semesterNumberCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  semesterNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chevron: {
    marginLeft: 5,
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

export default SemesterScreen;