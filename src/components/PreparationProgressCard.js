import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getPreparationColor, getPreparationLabel } from '../utils/preparationUtils';
import { useTheme } from '../context/ThemeContext';

const PreparationProgressCard = ({ exam, percent }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  if (!exam) return null;
  const color = getPreparationColor(percent);
  const label = getPreparationLabel(percent);
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.examName} numberOfLines={1}>{exam.name}</Text>
        <Text style={[styles.percent, { color }]}>%{percent}</Text>
        <View style={[styles.labelBadge, { backgroundColor: color + '15', borderColor: color + '50' }]}>
          <Text style={[styles.labelText, { color }]}>{label}</Text>
        </View>
      </View>
      <View style={styles.track}>
        <LinearGradient
          colors={percent < 41 ? [Colors.danger, Colors.primary] : percent < 71 ? [Colors.primary, '#FFB000'] : [Colors.primary, Colors.success]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${percent}%` }]}
        />
      </View>
    </View>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  container: { marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
  examName: { flex: 1, color: Colors.textPrimary, fontWeight: '600', fontSize: 14 },
  percent: { fontWeight: '800', fontSize: 16 },
  labelBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1 },
  labelText: { fontSize: 11, fontWeight: 'bold' },
  track: { height: 8, backgroundColor: Colors.background, borderRadius: 4, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  fill: { height: '100%', borderRadius: 4 },
});

export default PreparationProgressCard;
