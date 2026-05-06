import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const ShareSummaryCard = ({ summary }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  return (
    <View style={styles.card}>
      <View style={styles.bgGlow} />
      
      <View style={styles.header}>
        <MaterialCommunityIcons name="school" size={28} color={Colors.primary} />
        <Text style={styles.brand}>StudyLife</Text>
      </View>

      <Text style={styles.title}>Haftalık Özetim</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{Math.round(summary.weeklyMinutes / 60)}<Text style={styles.statUnit}>s</Text></Text>
          <Text style={styles.statLabel}>Çalışma</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statVal}>{summary.streak}<Text style={styles.statUnit}>g</Text></Text>
          <Text style={styles.statLabel}>Seri</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statVal}>{summary.level}</Text>
          <Text style={styles.statLabel}>Seviye</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <MaterialCommunityIcons name="star-shooting-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.footerText}>En İyi: {summary.bestSubject}</Text>
        </View>
        <View style={styles.footerItem}>
          <MaterialCommunityIcons name="shield-star-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.footerText}>{summary.badgesEarned} Rozet</Text>
        </View>
      </View>
    </View>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  card: { backgroundColor: '#1C1C1E', borderRadius: 24, padding: 24, overflow: 'hidden', borderWidth: 1, borderColor: Colors.purple + '40', position: 'relative' },
  bgGlow: { position: 'absolute', top: -50, right: -50, width: 150, height: 150, borderRadius: 75, backgroundColor: Colors.purple, opacity: 0.15, transform: [{ scale: 1.5 }] },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
  brand: { color: Colors.textPrimary, fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  title: { color: Colors.textPrimary, fontSize: 28, fontWeight: '800', marginBottom: 32 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  statBox: { alignItems: 'center' },
  statVal: { color: Colors.textPrimary, fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  statUnit: { fontSize: 18, color: Colors.textSecondary },
  statLabel: { color: Colors.textSecondary, fontSize: 13, marginTop: 4, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 16 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { color: Colors.textSecondary, fontSize: 13 },
});

export default ShareSummaryCard;
