import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const StudyPlanCard = ({ item, onToggle }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (item.completed) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 150, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true })
      ]).start();
    }
  }, [item.completed]);

  return (
    <TouchableWithoutFeedback onPress={onToggle}>
      <View style={[styles.card, item.completed && styles.cardCompleted]}>
        <View style={styles.left}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <MaterialCommunityIcons 
              name={item.completed ? "check-circle" : "circle-outline"} 
              size={26} 
              color={item.completed ? Colors.primary : Colors.textMuted} 
              style={{ marginRight: 12 }}
            />
          </Animated.View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.date, item.completed && styles.textCompleted]}>{item.displayDate}</Text>
            <Text style={[styles.topic, item.completed && styles.textCompleted]}>{item.topic}</Text>
          </View>
        </View>
        <View style={styles.right}>
          <Text style={[styles.duration, item.completed && styles.textCompleted]}>{item.suggestedMinutes} dk</Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: Colors.card, padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  cardCompleted: { opacity: 0.6, borderColor: Colors.primary + '50' },
  left: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  date: { color: Colors.textMuted, fontSize: 12, marginBottom: 4 },
  topic: { color: Colors.textPrimary, fontSize: 15, fontWeight: 'bold' },
  right: { backgroundColor: Colors.background, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  duration: { color: Colors.cyan, fontWeight: 'bold' },
  textCompleted: { textDecorationLine: 'line-through', color: Colors.textMuted }
});

export default StudyPlanCard;
