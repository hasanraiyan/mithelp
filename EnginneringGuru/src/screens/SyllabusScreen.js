import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator // Import ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
// Remove this line: import data from '../data/data.json';

const SyllabusScreen = ({ route, navigation }) => {
  console.log('route.params in SyllabusScreen:', route.params);
  const { branch, semester, subject, data } = route.params;
  const [syllabusSectionsData, setSyllabusSectionsData] = useState([]); // State for syllabus sections data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [animatedValues, setAnimatedValues] = useState([]); // State for animated values
  const [subjectData, setSubjectData] = useState(null); // State to hold subjectData

  const headerAnimation = useRef(new Animated.Value(0)).current;

  const branchIcons = Object.fromEntries(
    data?.branches?.map(b => [b.name, b.icon]) || []
  );
  const branchIcon = branchIcons[branch] || 'graduation-cap';
  const getBranchColor = () => data?.branches?.find(b => b.name === branch)?.gradientColors || ['#1976D2', '#42a5f5'];
  const branchColor = getBranchColor();


  const processSyllabusData = useCallback(() => { // Use useCallback for memoization
    setLoading(true); // Start loading
    setError(null); // Clear any previous errors
    try {
      const branchData = data?.branches?.find(b => b.name === branch) || {};
      const semesterData = branchData?.semesters?.find(s => s.name === semester) || {};
      const currentSubjectData = semesterData?.subjects?.find(sub => sub.name === subject) || null; // Find and set subjectData
      setSubjectData(currentSubjectData); // Set subjectData state
      const syllabus = currentSubjectData?.syllabus || {}; // Use subjectData from state

      const allSyllabusSectionsConfig = [
        { title: 'Course Objectives', icon: 'bullseye', contentKey: 'courseObjectives' },
        {
          title: 'Course Content',
          icon: 'book',
          contentKey: 'courseContent'
        },
        { title: 'Learning Outcomes', icon: 'lightbulb', contentKey: 'learningOutcomes' },
        { title: 'Reference Books', icon: 'book-open', contentKey: 'referenceBooks' },
        { title: 'Assessment Methods', icon: 'clipboard-check', contentKey: 'assessmentMethods' },
      ];

      const sections = allSyllabusSectionsConfig.filter(sectionConfig => {
        const content = syllabus?.[sectionConfig.contentKey];
        if (sectionConfig.contentKey === 'courseContent') {
          return typeof content === 'string' && content.trim() !== '';
        } else {
          return Array.isArray(content) && content.length > 0;
        }
      }).map(sectionConfig => ({
        title: sectionConfig.title,
        icon: sectionConfig.icon,
        content: syllabus?.[sectionConfig.contentKey] || (sectionConfig.contentKey === 'courseContent' ? '' : [])
      }));

      setSyllabusSectionsData(sections);
      setAnimatedValues(sections.map(() => new Animated.Value(0))); // Initialize animatedValues based on sections
      setLoading(false); // Loading finished successfully

    } catch (processError) {
      console.error("Error processing syllabus data:", processError);
      setError("Failed to load syllabus content.");
      setLoading(false); // Loading finished with error
      setSyllabusSectionsData([]); // Ensure syllabusSectionsData is empty on error
      setAnimatedValues([]); // Ensure animatedValues is empty on error
      setSubjectData(null); // Ensure subjectData is null on error
    }
  }, [branch, semester, subject, data]);

  useEffect(() => {
    processSyllabusData();
  }, [processSyllabusData]); // Use useCallback memoized function


  useEffect(() => {
    if (!loading && syllabusSectionsData.length > 0 && animatedValues.length > 0) { // Check animatedValues.length
      Animated.sequence([
        Animated.timing(headerAnimation, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.stagger(
          75,
          animatedValues.map(anim =>
            Animated.spring(anim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true })
          )
        ),
      ]).start();
    }
  }, [headerAnimation, loading, syllabusSectionsData, animatedValues]); // Added animatedValues to dependency array


  const SyllabusSection = React.memo(({ section, branchColor, animatedValue }) => {
    const contentHeight = useRef(new Animated.Value(0)).current;
    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
      Animated.timing(contentHeight, {
        toValue: isExpanded ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }, [isExpanded]);

    const toggleSection = () => {
      setIsExpanded(!isExpanded);
    };

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
          onPress={toggleSection}
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
          <Animated.View
            style={[
              styles.sectionContent,
              {
                height: isExpanded ? 'auto' : 0,
                opacity: contentHeight
              }
            ]}
          >
            {section.title === 'Course Content' ? (
              <Markdown style={styles.markdownStyles}>
                {typeof section.content === 'string'
                  ? section.content
                  : section.content.join('\n')}
              </Markdown>
            ) : (
              Array.isArray(section.content) && section.content.map((item, idx) => (
                <Text
                  key={idx}
                  style={[
                    styles.contentItem,
                    item.startsWith('#') && styles.heading,
                    item.startsWith('##') && styles.subheading
                  ]}
                >
                  {item.startsWith('#') ? item.replace(/^#+/, '') : `• ${item}`}
                </Text>
              ))
            )}
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    );
  }, (prevProps, nextProps) => {
    return prevProps.section === nextProps.section;
  });


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2962FF" />
        <Text style={styles.loadingText}>Loading syllabus...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <FontAwesome5 name="exclamation-circle" size={50} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }


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
              <View>
                <Text style={styles.headerTitle}>{subject}</Text>
                {subjectData?.course_code !== null && subjectData?.course_code !== undefined && ( // Safe check for subjectData and course_code
                  <Text style={styles.courseCode}>Course Code: {subjectData.course_code}</Text>
                )}
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionsContainer}>
          {syllabusSectionsData.map((section, index) => (
            <SyllabusSection
              key={section.title}
              section={section}
              branchColor={branchColor}
              animatedValue={animatedValues[index]}
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
    alignItems: 'flex-start',
    marginTop: 16,
  },
  branchText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
    textAlign: 'left',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  headerIcon: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'left',
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
    marginLeft: 20,
    overflow: 'hidden',
  },
  contentItem: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 6,
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
    marginTop: 8,
    marginBottom: 6,
  },
  // Custom markdown styles
  markdownStyles: {
    body: { fontSize: 14, color: '#555', lineHeight: 22 },
    heading1: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8, marginTop: 10 },
    heading2: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 6, marginTop: 8 },
  },
  courseCode: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  loadingContainer: { // Added loading container style
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f9fc',
  },
  loadingText: { // Added loading text style
    marginTop: 15,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: { // Added error container style
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f9fc',
    padding: 20,
  },
  errorText: { // Added error text style
    marginTop: 15,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});

export default SyllabusScreen;