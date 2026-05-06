import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const AIInsightsCard = ({ insights, onStartChat }) => {
  const { colors: Colors } = useTheme();
  const styles = getStyles(Colors);

  // Fallback if no insights provided
  const data = insights || [
    { icon: 'star-four-points', color: Colors.primary, title: 'Bugün odaklan', desc: 'Matematik tekrarı için en verimli saatlerindesin. Hemen başla.' },
    { icon: 'alert-circle-outline', color: Colors.danger, title: 'Devamsızlık Uyarısı', desc: 'Fizik dersi devamsızlık sınırına yaklaştı. Dikkat etmelisin.' },
    { icon: 'check-all', color: Colors.success, title: 'Harika gidiyorsun', desc: 'Dün hedeflerinin %100\'ünü tamamladın. Böyle devam et.' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons name="robot-happy-outline" size={20} color={Colors.primary} />
          <Text style={styles.title}>AI Insights</Text>
        </View>
        <Text style={styles.subTitle}>Son haftalık analizine göre yapay zeka önerileri</Text>
      </View>

      <View style={styles.list}>
        {data.map((item, index) => (
          <View key={index} style={styles.listItem}>
            <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
              <MaterialCommunityIcons name={item.icon} size={16} color={item.color} />
            </View>
            <View style={styles.itemTextCol}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8} onPress={onStartChat}>
        <Text style={styles.actionBtnText}>Sohbete Başla</Text>
        <MaterialCommunityIcons name="arrow-right" size={16} color={Colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  container: {
    backgroundColor: Colors.cardElevated,
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subTitle: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  list: {
    gap: 16,
    marginBottom: 24,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  itemTextCol: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  itemDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary + '20',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
});

export default AIInsightsCard;
