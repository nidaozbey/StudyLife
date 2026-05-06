import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import WhyModal from './WhyModal';

const EarlyWarningCard = ({ warnings }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  const [whyVisible, setWhyVisible] = useState(false);
  const [selectedWarning, setSelectedWarning] = useState(null);

  if (!warnings || warnings.length === 0) return null;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <MaterialCommunityIcons name="radar" size={22} color={Colors.primary} />
        <Text style={styles.cardTitle}>Akademik Erken Uyarılar</Text>
      </View>

      {warnings.map((w, i) => (
        <View
          key={w.id}
          style={[styles.warningRow, { borderLeftColor: w.riskLevel.color }]}
        >
          <View style={styles.warningLeft}>
            <View style={[styles.riskBadge, { backgroundColor: w.riskLevel.color + '15', borderColor: w.riskLevel.color + '50' }]}>
              <Text style={[styles.riskText, { color: w.riskLevel.color }]}>{w.riskLevel.label}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.courseName}>{w.courseName}</Text>
              <Text style={styles.topReason} numberOfLines={1}>{w.reasons[0]}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.whyBtn}
            onPress={() => { setSelectedWarning(w); setWhyVisible(true); }}
          >
            <MaterialCommunityIcons name="help-circle-outline" size={18} color={Colors.primary} />
            <Text style={styles.whyText}>Neden?</Text>
          </TouchableOpacity>
        </View>
      ))}

      <WhyModal
        visible={whyVisible}
        onClose={() => setWhyVisible(false)}
        title={selectedWarning?.courseName}
        reasons={selectedWarning?.reasons}
      />
    </View>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  card: { backgroundColor: Colors.card, borderRadius: 20, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: Colors.primary + '30' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  cardTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: 'bold' },
  warningRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderLeftWidth: 3, paddingLeft: 12, marginBottom: 12 },
  warningLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  riskBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1 },
  riskText: { fontSize: 11, fontWeight: 'bold' },
  courseName: { color: Colors.textPrimary, fontWeight: '700', fontSize: 14, marginBottom: 2 },
  topReason: { color: Colors.textSecondary, fontSize: 12 },
  whyBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingLeft: 8 },
  whyText: { color: Colors.primary, fontSize: 12, fontWeight: 'bold' },
});

export default EarlyWarningCard;
