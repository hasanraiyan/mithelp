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

const { width } = Dimensions.get('window');

const CommonLayout = ({
  title,
  subtitle,
  icon,
  gradientColors,
  navigation,
  headerAnimation,
  children,
  showBackButton = true,
  additionalHeaderContent = null,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnimation,
            transform: [
              {
                translateY: headerAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={gradientColors || ['#1976D2', '#42a5f5']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            {showBackButton && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <FontAwesome5 name="arrow-left" size={20} color="#fff" />
              </TouchableOpacity>
            )}
            <View style={styles.titleContainer}>
              <View style={styles.iconContainer}>
                <FontAwesome5 name={icon || 'graduation-cap'} size={24} color="#fff" />
              </View>
              <View>
                <Text style={styles.headerTitle}>{title}</Text>
                {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
              </View>
            </View>
            {additionalHeaderContent}
          </View>
        </LinearGradient>
      </Animated.View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {children}
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
    width: '100%',
    overflow: 'hidden',
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
});

export default CommonLayout; 