import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const AIPlanCard = ({ plan, onGenerate, onViewPlan }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  if (!plan || !plan.items || plan.items.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="robot-outline" size={24} color={Colors.cyan} />
          <Text style={styles.title}>AI Günlük Çalışma Planı</Text>
        </View>
        <Text style={styles.desc}>Bugün için kişiselleştirilmiş, sınavlarına ve zayıf konularına odaklanan akıllı bir plan oluştur.</Text>
        <TouchableOpacity style={styles.btn} onPress={onGenerate}>
          <Text style={styles.btnText}>Bugün İçin Plan Oluştur</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const completedCount = plan.items.filter(i => i.completed).length;
  const totalCount = plan.items.length;
  const pct = Math.round((completedCount / totalCount) * 100) || 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="robot-outline" size={24} color={Colors.cyan} />
          <Text style={styles.title}>AI Günlük Planı</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>%{pct} Tamamlandı</Text>
        </View>
      </View>

      <View style={styles.itemsList}>
        {plan.items.slice(0, 2).map((item, index) => (
          <View key={item.id} style={styles.previewItem}>
            <MaterialCommunityIcons name={item.completed ? "check-circle" : "circle-outline"} size={20} color={item.completed ? Colors.success : Colors.textMuted} />
            <View style={styles.previewItemInfo}>
              <Text style={styles.previewTitle} numberOfLines={1}>{item.title} - {item.topic}</Text>
              <Text style={styles.previewTime}>{item.suggestedMinutes} dk {item.priority === 'Yüksek' ? '• Kritik' : ''}</Text>
            </View>
          </View>
        ))}
        {totalCount > 2 && (
          <Text style={styles.moreText}>+{totalCount - 2} görev daha...</Text>
        )}
      </View>

      <TouchableOpacity style={styles.viewBtn} onPress={onViewPlan}>
        <Text style={styles.viewBtnText}>Planı Gör ve Tamamla</Text>
        <MaterialCommunityIcons name="arrow-right" size={20} color={Colors.background} />
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  card: { backgroundColor: Colors.cyan + '10', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: Colors.cyan + '40', marginBottom: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { color: Colors.textPrimary, fontSize: 18, fontWeight: 'bold' },
  desc: { color: Colors.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: 16 },
  btn: { backgroundColor: Colors.cyan, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  btnText: { color: Colors.background, fontSize: 15, fontWeight: 'bold' },
  badge: { backgroundColor: Colors.cyan + '30', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: Colors.cyan, fontSize: 12, fontWeight: 'bold' },
  itemsList: { marginBottom: 16 },
  previewItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  previewItemInfo: { flex: 1 },
  previewTitle: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  previewTime: { color: Colors.textMuted, fontSize: 12 },
  moreText: { color: Colors.textMuted, fontSize: 12, fontStyle: 'italic', marginLeft: 32 },
  viewBtn: { backgroundColor: Colors.cyan, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: 12, gap: 8 },
  viewBtnText: { color: Colors.background, fontSize: 15, fontWeight: 'bold' },
});

export default AIPlanCard;
