import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import data from '../data/data.json'; // Adjust path as needed

const SyllabusScreen = ({ route, navigation }) => {
  const { branch, semester, subject } = route.params;

  const branchData = data.branches.find(b => b.name === branch) || {};
  const semesterData = branchData.semesters?.find(s => s.name === semester) || {};
  const subjectData = semesterData.subjects?.find(sub => sub.name === subject) || {};
  const syllabus = subjectData.syllabus || {};

  const branchIcons = Object.fromEntries(data.branches.map(b => [b.name, b.icon]));
  const branchIcon = branchIcons[branch] || 'graduation-cap';

  const getBranchColor = () => branchData.gradientColors || ['#1976D2', '#42a5f5'];
  const branchColor = getBranchColor();

  const syllabusSections = [
    { title: 'Course Objectives', icon: 'bullseye', content: syllabus.courseObjectives || [] },
    { title: 'Learning Outcomes', icon: 'lightbulb', content: syllabus.learningOutcomes || [] },
    { title: 'Course Content', icon: 'book', content: syllabus.courseContent || [] },
    { title: 'Reference Books', icon: 'book-open', content: syllabus.referenceBooks || [] },
    { title: 'Assessment Methods', icon: 'clipboard-check', content: syllabus.assessmentMethods || [] },
  ];

  const headerAnimation = useRef(new Animated.Value(0)).current;
  const animatedValues = useRef(syllabusSections.map(() => new Animated.Value(0))).current;
  const [expandedSections, setExpandedSections] = useState(syllabusSections.map(() => true));

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

  const toggleSection = (index) => {
    setExpandedSections(prev => prev.map((expanded, i) => (i === index ? !expanded : expanded)));
  };

  const SyllabusSection = ({ section, index, animatedValue }) => {
    const contentHeight = useRef(new Animated.Value(0)).current;
    const isExpanded = expandedSections[index];

    useEffect(() => {
      Animated.timing(contentHeight, {
        toValue: isExpanded ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }, [isExpanded]);

    const height = contentHeight.interpolate({ inputRange: [0, 1], outputRange: [0, 'auto'] });

    return (
      <Animated.View
        style={{
          opacity: animatedValue,
          transform: [
            { translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) },
            { scale: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) },
          ],
        }}
      >
        <TouchableOpacity
          style={[styles.section, { borderLeftColor: branchColor[0] }]}
          onPress={() => toggleSection(index)}
          activeOpacity={0.8}
        >
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={[branchColor[0] + '20', branchColor[1] + '20']}
              style={styles.sectionIconCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <FontAwesome5 name={section.icon} size={20} color={branchColor[0]} />
            </LinearGradient>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <FontAwesome5
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={branchColor[0]}
              style={styles.toggleIcon}
            />
          </View>
          <Animated.View style={[styles.sectionContent, { height: isExpanded ? 'auto' : 0, opacity: contentHeight }]}>
            {section.content.map((item, idx) => (
              <Text key={idx} style={styles.contentItem}>• {item}</Text>
            ))}
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
            <Text style={styles.branchText}>{branch} - {semester}</Text>
            <View style={styles.headerTitleContainer}>
              <FontAwesome5 name={branchIcon} size={28} color="#FFFFFF" style={styles.headerIcon} />
              <Text style={styles.headerTitle}>{subject}</Text>
            </View>
            <Text style={styles.subtitle}>Syllabus Details</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionsContainer}>
          {syllabusSections.map((section, index) => (
            <SyllabusSection
              key={section.title}
              section={section}
              index={index}
              animatedValue={animatedValues[index]}
            />
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.floatingHelpButton} onPress={() => navigation.navigate('Help')}>
        <FontAwesome5 name="question-circle" size={24} color="#FFFFFF" />
      </TouchableOpacity>
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
  headerContent: {
    alignItems: 'flex-start', // Modified to align items to the start
    marginTop: 16,
  },
  branchText: {
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
    marginBottom: 8,
  },
  headerIcon: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'left', // Modified to align text to the left
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'left', // Modified to align text to the left
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  sectionsContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  toggleIcon: {
    marginLeft: 10,
  },
  sectionContent: {
    marginLeft: 48,
    overflow: 'hidden',
  },
  contentItem: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 6,
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

export default SyllabusScreen;