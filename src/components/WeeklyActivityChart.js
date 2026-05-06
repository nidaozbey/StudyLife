import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const WeeklyActivityChart = ({ weeklyData, totalHours }) => {
  const { colors: Colors } = useTheme();
  const styles = getStyles(Colors);

  // Fallback data if not provided
  const data = weeklyData || [
    { day: 'Pzt', value: 30, color: Colors.success },
    { day: 'Sal', value: 80, color: Colors.success },
    { day: 'Çar', value: 45, color: Colors.primary },
    { day: 'Per', value: 100, color: Colors.success },
    { day: 'Cum', value: 20, color: Colors.primary },
    { day: 'Cmt', value: 60, color: Colors.success },
    { day: 'Paz', value: 50, color: Colors.success },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Haftalık Çalışma Özeti</Text>
        <Text style={styles.totalHours}>{totalHours || '0'}s <Text style={styles.totalHoursSub}>bu hafta</Text></Text>
      </View>

      <View style={styles.chartContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.barCol}>
            <View style={styles.barTrack}>
              <View 
                style={[
                  styles.barFill, 
                  { height: `${item.value}%`, backgroundColor: item.color }
                ]} 
              />
            </View>
            <Text style={styles.dayLabel}>{item.day}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  totalHours: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  totalHoursSub: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  barCol: {
    alignItems: 'center',
    width: 30,
  },
  barTrack: {
    width: 24,
    height: 100,
    backgroundColor: Colors.background,
    borderRadius: 6,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  dayLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
});

export default WeeklyActivityChart;
