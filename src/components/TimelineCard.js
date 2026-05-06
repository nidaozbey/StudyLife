import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const TimelineCard = ({ time, title, type }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, useNativeDriver: true })
    ]).start();
  }, []);

  let dotColor = Colors.success;
  let typeLabel = 'Ders';
  
  if (type === 'study') {
    dotColor = Colors.cyan;
    typeLabel = 'Çalışma';
  } else if (type === 'exam' || type === 'warning') {
    dotColor = Colors.primary;
    typeLabel = 'Sınav/Uyarı';
  } else if (type === 'habit' || type === 'routine') {
    dotColor = Colors.purple;
    typeLabel = 'Rutin';
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY }] }]}>
      <View style={styles.timeContainer}>
        <Text style={styles.time}>{time}</Text>
      </View>
      
      <View style={styles.lineIndicator}>
        <View style={[styles.dot, { backgroundColor: dotColor, shadowColor: dotColor }]} />
        <View style={styles.line} />
      </View>
      
      <View style={styles.contentContainer}>
        <View style={[styles.card, { borderLeftColor: dotColor }]}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.typeText}>{typeLabel}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  timeContainer: {
    width: 55,
    alignItems: 'flex-end',
    paddingRight: 14,
    paddingTop: 18,
  },
  time: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  lineIndicator: {
    alignItems: 'center',
    width: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 20,
    zIndex: 2,
    borderWidth: 2,
    borderColor: Colors.background,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    position: 'absolute',
    top: 26,
    bottom: -14,
    zIndex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingLeft: 14,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  typeText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default TimelineCard;
