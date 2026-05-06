import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const BalanceScoreCard = ({ balance }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  if (!balance) return null;
  const { score, ignored, overloaded, suggestion, suggestions } = balance;
  const color = score >= 70 ? Colors.success : score >= 40 ? Colors.primary : Colors.danger;

  return (
    <View style={[styles.card, { borderColor: color + '30' }]}>
      <View style={styles.headerRow}>
        <MaterialCommunityIcons name="scale-balance" size={22} color={color} />
        <Text style={styles.cardTitle}>Haftalık Denge Skoru</Text>
        <Text style={[styles.score, { color }]}>{score}/100</Text>
      </View>
      <Text style={styles.suggestion}>{suggestion}</Text>
      {overloaded.length > 0 && (
        <View style={styles.tagRow}>
          <Text style={styles.tagLabel}>Çok Çalışılan:</Text>
          {overloaded.map(n => (
            <View key={n} style={[styles.tag, { backgroundColor: Colors.danger + '15', borderColor: Colors.danger + '40' }]}>
              <Text style={[styles.tagText, { color: Colors.danger }]}>{n}</Text>
            </View>
          ))}
        </View>
      )}
      {ignored.length > 0 && (
        <View style={styles.tagRow}>
          <Text style={styles.tagLabel}>İhmal Edilen:</Text>
          {ignored.map(n => (
            <View key={n} style={[styles.tag, { backgroundColor: Colors.primary + '15', borderColor: Colors.primary + '40' }]}>
              <Text style={[styles.tagText, { color: Colors.primary }]}>{n}</Text>
            </View>
          ))}
        </View>
      )}
      {suggestions && Object.keys(suggestions).length > 0 && (
        <View style={styles.suggestBox}>
          <Text style={styles.suggestTitle}>Bu Hafta Önerilen Dağılım:</Text>
          {Object.entries(suggestions).map(([name, mins]) => (
            <Text key={name} style={styles.suggestItem}>• {name}: {Math.round(mins / 60 * 10) / 10} saat</Text>
          ))}
        </View>
      )}
    </View>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  card: { backgroundColor: Colors.card, borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitle: { flex: 1, color: Colors.textPrimary, fontSize: 16, fontWeight: 'bold' },
  score: { fontSize: 20, fontWeight: '800' },
  suggestion: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 12 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 8 },
  tagLabel: { color: Colors.textMuted, fontSize: 12 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  tagText: { fontSize: 12, fontWeight: 'bold' },
  suggestBox: { marginTop: 8, backgroundColor: Colors.background, borderRadius: 12, padding: 12 },
  suggestTitle: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 },
  suggestItem: { color: Colors.textPrimary, fontSize: 13, lineHeight: 22 },
});

export default BalanceScoreCard;
