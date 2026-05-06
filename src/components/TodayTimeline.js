import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const TodayTimeline = ({ events }) => {
  const { colors: Colors } = useTheme();
  const styles = getStyles(Colors);

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Bugünün Zaman Çizelgesi</Text>
      
      <View style={styles.timelineWrapper}>
        {events.map((item, index) => {
          const isLast = index === events.length - 1;
          const isPast = item.status === 'past';
          const isCurrent = item.status === 'current';
          
          let dotColor = Colors.textMuted;
          if (isCurrent) dotColor = Colors.primary; // Orange for active
          if (isPast) dotColor = Colors.success; // Lime for completed

          return (
            <View key={index} style={styles.eventRow}>
              {/* Left Column: Time */}
              <View style={styles.timeCol}>
                <Text style={[styles.timeText, (isCurrent || isPast) && styles.timeTextActive]}>
                  {item.time}
                </Text>
              </View>

              {/* Middle Column: Line & Dot */}
              <View style={styles.lineCol}>
                <View style={[styles.dot, { borderColor: dotColor, backgroundColor: isPast ? Colors.success : 'transparent' }]}>
                  {isPast && <MaterialCommunityIcons name="check" size={8} color={Colors.background} />}
                </View>
                {!isLast && (
                  <View style={[styles.line, { backgroundColor: isPast ? Colors.success + '50' : Colors.border }]} />
                )}
              </View>

              {/* Right Column: Card */}
              <View style={styles.cardCol}>
                <View style={[
                  styles.eventCard, 
                  isCurrent && { borderColor: Colors.primary + '50', backgroundColor: Colors.cardElevated },
                  isPast && { opacity: 0.7 }
                ]}>
                  <Text style={[styles.eventTitle, isPast && { textDecorationLine: 'line-through', color: Colors.textMuted }]}>
                    {item.title}
                  </Text>
                  <Text style={styles.eventDesc}>{item.description}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  timelineWrapper: {
    paddingLeft: 4,
  },
  eventRow: {
    flexDirection: 'row',
  },
  timeCol: {
    width: 50,
    paddingTop: 12,
  },
  timeText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  timeTextActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  lineCol: {
    width: 24,
    alignItems: 'center',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    marginTop: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    backgroundColor: Colors.background,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: -4,
    marginBottom: -14,
    zIndex: 1,
  },
  cardCol: {
    flex: 1,
    paddingBottom: 24,
  },
  eventCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eventTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  eventDesc: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
});

export default TodayTimeline;
