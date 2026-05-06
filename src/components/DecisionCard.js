import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import WhyModal from './WhyModal';

const DecisionCard = ({ decisions }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  const [whyVisible, setWhyVisible] = useState(false);
  const [selected, setSelected] = useState(null);

  if (!decisions || decisions.length === 0) return null;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <MaterialCommunityIcons name="chess-knight" size={22} color={Colors.primary} />
        <Text style={styles.cardTitle}>Bugünün Kritik 3 Hamlesi</Text>
      </View>

      {decisions.map((d, i) => (
        <View key={d.id} style={[styles.row, { borderLeftColor: d.badgeColor }]}>
          <View style={[styles.numBox, { backgroundColor: d.badgeColor + '20', borderColor: d.badgeColor + '50' }]}>
            <Text style={[styles.numText, { color: d.badgeColor }]}>{i + 1}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <Text style={styles.title} numberOfLines={1}>{d.title}</Text>
              <View style={[styles.badge, { backgroundColor: d.badgeColor + '15', borderColor: d.badgeColor + '40' }]}>
                <Text style={[styles.badgeText, { color: d.badgeColor }]}>{d.badgeLabel}</Text>
              </View>
            </View>
            <Text style={styles.detail} numberOfLines={1}>{d.detail}</Text>
          </View>
          <TouchableOpacity style={styles.whyBtn} onPress={() => { setSelected(d); setWhyVisible(true); }}>
            <MaterialCommunityIcons name="help-circle-outline" size={19} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      ))}

      <WhyModal visible={whyVisible} onClose={() => setWhyVisible(false)} title={selected?.title} reasons={selected?.reasons} />
    </View>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  card: { backgroundColor: Colors.card, borderRadius: 20, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: Colors.border },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  cardTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: 'bold' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderLeftWidth: 3, paddingLeft: 12, marginBottom: 14 },
  numBox: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  numText: { fontWeight: 'bold', fontSize: 13 },
  title: { color: Colors.textPrimary, fontWeight: '700', fontSize: 13, flex: 1 },
  detail: { color: Colors.textSecondary, fontSize: 12 },
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  whyBtn: { padding: 4 },
});

export default DecisionCard;
