import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getDaysUntil } from '../utils/dateUtils';

const StatCardGrid = ({ stats, nearestExam, onNavigate }) => {
  const { colors: Colors } = useTheme();
  const styles = getStyles(Colors);

  const examDays = nearestExam ? getDaysUntil(nearestExam.dateString) : null;

  return (
    <View style={styles.gridContainer}>
      <View style={styles.row}>
        {/* Study Time Card */}
        <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => onNavigate('Çalış')}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: Colors.success + '20' }]}>
              <MaterialCommunityIcons name="timer-outline" size={20} color={Colors.success} />
            </View>
            <Text style={styles.cardTitle}>Çalışma</Text>
          </View>
          <Text style={styles.cardValue}>{stats.studyTime || '0dk'}</Text>
          <Text style={styles.cardSub}>Bugün</Text>
        </TouchableOpacity>

        {/* Next Exam Card */}
        <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => onNavigate('Sınavlar')}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: Colors.primary + '20' }]}>
              <MaterialCommunityIcons name="calendar-alert" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.cardTitle}>Sınav</Text>
          </View>
          {nearestExam ? (
            <>
              <Text style={styles.cardValue}>{examDays === 0 ? 'Bugün' : examDays === 1 ? 'Yarın' : `${examDays} gün`}</Text>
              <Text style={styles.cardSub} numberOfLines={1}>{nearestExam.name}</Text>
            </>
          ) : (
            <>
              <Text style={styles.cardValue}>Yok</Text>
              <Text style={styles.cardSub}>Sınav planlanmadı</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        {/* Habits Card */}
        <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => onNavigate('Alışkanlıklar')}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: Colors.success + '20' }]}>
              <MaterialCommunityIcons name="check-circle-outline" size={20} color={Colors.success} />
            </View>
            <Text style={styles.cardTitle}>Alışkanlıklar</Text>
          </View>
          <Text style={styles.cardValue}>%{stats.progressPercent || 0}</Text>
          <Text style={styles.cardSub}>Günlük Hedef</Text>
        </TouchableOpacity>

        {/* Risk/Consistency Card */}
        <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => onNavigate('Reports')}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: (stats.consistency < 50 ? Colors.danger : Colors.primary) + '20' }]}>
              <MaterialCommunityIcons name="chart-bell-curve" size={20} color={stats.consistency < 50 ? Colors.danger : Colors.primary} />
            </View>
            <Text style={styles.cardTitle}>Tutarlılık</Text>
          </View>
          <Text style={[styles.cardValue, { color: stats.consistency < 50 ? Colors.danger : Colors.textPrimary }]}>%{stats.consistency || 0}</Text>
          <Text style={styles.cardSub}>Haftalık Skor</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  gridContainer: {
    gap: 12,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  cardValue: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  cardSub: {
    color: Colors.textMuted,
    fontSize: 11,
  },
});

export default StatCardGrid;
