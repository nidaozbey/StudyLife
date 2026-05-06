import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { formatMinutesToHourText } from '../utils/dateUtils';

const CoachReportCard = ({ report }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  if (!report) return null;
  const { totalHours, bestSubject, riskiest, habitRate, attWarnings, suggestions } = report;

  return (
    <View style={styles.card}>
      <LinearGradient colors={[Colors.purple + '15', Colors.background]} style={styles.gradient}>
        <View style={styles.headerRow}>
          <MaterialCommunityIcons name="account-tie-outline" size={24} color={Colors.purple} />
          <Text style={styles.title}>Haftalık Koç Raporu</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: Colors.cyan }]}>{totalHours}s</Text>
            <Text style={styles.statLabel}>Toplam Çalışma</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: Colors.success }]}>{bestSubject || '—'}</Text>
            <Text style={styles.statLabel}>En Başarılı</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: Colors.primary }]}>{riskiest || '—'}</Text>
            <Text style={styles.statLabel}>En Riskli</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: habitRate >= 70 ? Colors.success : Colors.primary }]}>%{habitRate}</Text>
            <Text style={styles.statLabel}>Alışkanlık</Text>
          </View>
        </View>

        {attWarnings.length > 0 && (
          <View style={styles.attWarning}>
            <MaterialCommunityIcons name="alert-circle-outline" size={16} color={Colors.danger} />
            <Text style={styles.attText}>
              Devamsızlık riski: {attWarnings.join(', ')}
            </Text>
          </View>
        )}

        <View style={styles.suggestionsBox}>
          <Text style={styles.suggestTitle}>Bu Hafta İçin 3 Öneri</Text>
          {suggestions.map((s, i) => (
            <View key={i} style={styles.suggestRow}>
              <Text style={[styles.suggestNum, { color: Colors.purple }]}>{i + 1}.</Text>
              <Text style={styles.suggestText}>{s}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    </View>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  card: { borderRadius: 20, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: Colors.purple + '30' },
  gradient: { padding: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  title: { color: Colors.purple, fontSize: 16, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  statBox: { alignItems: 'center', flex: 1 },
  statVal: { fontWeight: '800', fontSize: 14, marginBottom: 4, textAlign: 'center' },
  statLabel: { color: Colors.textMuted, fontSize: 10, textAlign: 'center' },
  attWarning: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.danger + '10', borderRadius: 10, padding: 10, marginBottom: 14, borderWidth: 1, borderColor: Colors.danger + '25' },
  attText: { color: Colors.danger, fontSize: 12, flex: 1 },
  suggestionsBox: { backgroundColor: Colors.background, borderRadius: 14, padding: 14 },
  suggestTitle: { color: Colors.purple, fontWeight: 'bold', fontSize: 13, marginBottom: 10 },
  suggestRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  suggestNum: { fontWeight: 'bold', fontSize: 13 },
  suggestText: { flex: 1, color: Colors.textPrimary, fontSize: 13, lineHeight: 20 },
});

export default CoachReportCard;
