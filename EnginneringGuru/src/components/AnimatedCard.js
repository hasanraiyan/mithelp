import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const AnimatedCard = ({
  title,
  subtitle,
  icon,
  animatedValue,
  onPress,
  gradientColors,
  rightContent = null,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { 
      toValue: 0.98, 
      useNativeDriver: true 
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { 
      toValue: 1, 
      friction: 5, 
      tension: 40, 
      useNativeDriver: true 
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.cardContent}>
          <View style={[styles.iconContainer, { backgroundColor: gradientColors[0] }]}>
            <FontAwesome5 name={icon || 'book'} size={18} color="#fff" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          {rightContent || (
            <View style={styles.arrowContainer}>
              <FontAwesome5 name="chevron-right" size={16} color="#999" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: width - 40,
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  arrowContainer: {
    width: 30,
    alignItems: 'flex-end',
  },
});

export default AnimatedCard; 