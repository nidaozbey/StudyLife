import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const ChallengeCard = ({ challenge, progress }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  const isCompleted = challenge.status === 'completed';
  const isFailed = challenge.status === 'failed';
  
  let borderColor = Colors.primary + '50';
  let bgColor = Colors.primary + '10';
  let iconColor = Colors.primary;
  
  if (isCompleted) {
    borderColor = Colors.success + '50';
    bgColor = Colors.success + '10';
    iconColor = Colors.success;
  } else if (isFailed) {
    borderColor = Colors.danger + '50';
    bgColor = Colors.danger + '10';
    iconColor = Colors.danger;
  }

  return (
    <View style={[styles.card, { borderColor, backgroundColor: bgColor }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons name="flag-checkered" size={20} color={iconColor} />
          <Text style={styles.title}>{challenge.title}</Text>
        </View>
        <Text style={styles.daysLeft}>{challenge.daysLeft} gün kaldı</Text>
      </View>

      <Text style={styles.target}>{challenge.targetAmount} {challenge.targetUnit} hedefleniyor.</Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: iconColor }]} />
        </View>
        <Text style={[styles.progressText, { color: iconColor }]}>%{progress}</Text>
      </View>
    </View>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  card: { borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  title: { color: Colors.textPrimary, fontSize: 16, fontWeight: 'bold', flex: 1 },
  daysLeft: { color: Colors.textMuted, fontSize: 12 },
  target: { color: Colors.textSecondary, fontSize: 13, marginBottom: 16 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  progressTrack: { flex: 1, height: 8, backgroundColor: Colors.background, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 13, fontWeight: 'bold' },
});

export default ChallengeCard;
