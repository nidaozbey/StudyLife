import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const ExamCard = ({ name, date, time, daysLeft, topics, priorityLabel, priorityColor }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.name}>{name}</Text>
          {priorityLabel && (
            <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '15', borderColor: priorityColor }]}>
              <Text style={[styles.priorityText, { color: priorityColor }]}>Öncelik: {priorityLabel}</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="calendar" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{date}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="clock-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{time}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="timer-sand" size={16} color={Colors.accent} />
          <Text style={[styles.detailText, { color: Colors.accent, fontWeight: 'bold' }]}>
            {daysLeft < 0 ? 'Geçti' : `${daysLeft} gün kaldı`}
          </Text>
        </View>
      </View>
      
      <View style={styles.topicsContainer}>
        <MaterialCommunityIcons name="book-open-variant" size={16} color={Colors.textMuted} />
        <Text style={styles.topicsText} numberOfLines={2}>{topics}</Text>
      </View>
    </View>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  priorityBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  detailText: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginLeft: 6,
  },
  topicsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  topicsText: {
    color: Colors.textMuted,
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  }
});

export default ExamCard;
