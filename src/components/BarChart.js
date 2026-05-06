import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const BarChart = ({ data, color = Colors.primary }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  // data = [{ label: 'Pzt', value: 2.5 }, { label: 'Sal', value: 1.0 }...]
  const max = Math.max(...data.map(d => d.value), 1); // Avoid div by 0

  return (
    <View style={styles.container}>
      {data.map((item, index) => {
        const heightPercent = (item.value / max) * 100;
        return (
          <View key={index} style={styles.barWrapper}>
            <Text style={styles.valueText}>{item.value > 0 ? item.value : ''}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { height: `${heightPercent}%`, backgroundColor: color }]} />
            </View>
            <Text style={styles.label}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 220,
    paddingTop: 20,
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  valueText: {
    color: Colors.textMuted,
    fontSize: 10,
    marginBottom: 6,
    height: 14,
  },
  barTrack: {
    width: 12,
    height: 120,
    backgroundColor: Colors.background,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 10,
    fontWeight: '600',
  }
});

export default BarChart;
