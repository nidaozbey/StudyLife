import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

const ProgressBar = ({ data }) => {
  const maxHours = Math.max(...data.map(d => d.hours));

  return (
    <View style={styles.container}>
      {data.map((item, index) => {
        const heightPercent = maxHours > 0 ? (item.hours / maxHours) * 100 : 0;
        const isToday = new Date().getDay() === (index + 1) % 7;
        
        return (
          <View key={index} style={styles.barContainer}>
            <Text style={styles.valueText}>{item.hours}</Text>
            <View style={styles.barTrack}>
              <View 
                style={[
                  styles.barFill, 
                  { height: `${Math.max(heightPercent, 5)}%` },
                  isToday && { backgroundColor: '#39FF14' }
                ]} 
              />
            </View>
            <Text style={[styles.dayText, isToday && styles.todayText]}>{item.day}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#161618',
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 220,
    borderWidth: 1,
    borderColor: '#2A2A2E',
  },
  barContainer: {
    alignItems: 'center',
    width: 30,
  },
  valueText: {
    color: '#A1A1AA',
    fontSize: 11,
    marginBottom: 8,
    fontWeight: '500',
  },
  barTrack: {
    width: 14,
    height: 120,
    backgroundColor: '#2A2A2E',
    borderRadius: 7,
    justifyContent: 'flex-end',
    marginBottom: 12,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#FFB703',
    borderRadius: 7,
  },
  dayText: {
    color: '#71717A',
    fontSize: 13,
    fontWeight: '500',
  },
  todayText: {
    color: '#FAFAFA',
    fontWeight: 'bold',
  },
});

export default ProgressBar;
