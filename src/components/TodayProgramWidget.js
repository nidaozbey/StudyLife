import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const getTypeColor = (type) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  switch (type) {
    case 'ai_plan': return Colors.cyan;
    case 'exam_warning': return Colors.danger;
    case 'attendance_warning': return Colors.primary;
    case 'habit': return Colors.purple;
    default: return Colors.accent;
  }
};

const getTypeIcon = (type) => {
  switch (type) {
    case 'ai_plan': return 'robot-outline';
    case 'exam_warning': return 'alert-decagram-outline';
    case 'attendance_warning': return 'account-cancel-outline';
    case 'habit': return 'check-circle-outline';
    default: return 'book-open-variant';
  }
};

const TodayProgramWidget = ({ items, onViewAll }) => {
  if (!items || items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Bugünün Programı</Text>
        </View>
        <Text style={styles.emptyText}>Bugün için planlanmış bir etkinlik yok.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bugünün Programı</Text>
        <TouchableOpacity onPress={onViewAll} style={styles.aiCoachBtnWrap}>
          <LinearGradient colors={[Colors.cyan, Colors.purple]} style={styles.aiCoachBtn} start={{x:0,y:0}} end={{x:1,y:1}}>
            <MaterialCommunityIcons name="robot-outline" size={16} color={Colors.textPrimary} />
            <Text style={styles.aiCoachText}>AI Koç ile Konuş</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {items.slice(0, 5).map((item, index) => {
          const color = getTypeColor(item.type);
          const icon = getTypeIcon(item.type);

          return (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.timeText}>{item.time}</Text>
              
              <View style={styles.timelineCol}>
                <View style={[styles.timelineDot, { borderColor: color, backgroundColor: item.isCompleted ? color : Colors.card }]} />
                {index < items.slice(0, 5).length - 1 && <View style={styles.timelineLine} />}
              </View>

              <View style={[styles.contentBox, item.isPriority && styles.priorityBox]}>
                <View style={styles.contentHeader}>
                  <MaterialCommunityIcons name={icon} size={16} color={color} style={{ marginRight: 6 }} />
                  <Text style={[styles.itemTitle, item.isCompleted && styles.textCompleted]} numberOfLines={1}>{item.title}</Text>
                </View>
                {item.subtitle && (
                  <Text style={[styles.itemSub, item.isCompleted && styles.textCompleted]} numberOfLines={1}>{item.subtitle}</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  container: { backgroundColor: Colors.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: Colors.border, marginBottom: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { color: Colors.textPrimary, fontSize: 18, fontWeight: 'bold' },
  aiCoachBtnWrap: { shadowColor: Colors.cyan, shadowOpacity: 0.5, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  aiCoachBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  aiCoachText: { color: Colors.textPrimary, fontSize: 12, fontWeight: 'bold' },
  emptyText: { color: Colors.textMuted, fontSize: 14, fontStyle: 'italic' },
  
  list: { paddingLeft: 4 },
  itemRow: { flexDirection: 'row', minHeight: 60 },
  timeText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', width: 45, paddingTop: 4 },
  
  timelineCol: { width: 24, alignItems: 'center', marginRight: 12 },
  timelineDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, marginTop: 4, zIndex: 2 },
  timelineLine: { width: 2, flex: 1, backgroundColor: Colors.border, marginTop: -4, marginBottom: -8, zIndex: 1 },
  
  contentBox: { flex: 1, backgroundColor: Colors.background, padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  priorityBox: { borderColor: Colors.primary + '60', backgroundColor: Colors.primary + '08' },
  contentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  itemTitle: { color: Colors.textPrimary, fontSize: 14, fontWeight: 'bold', flex: 1 },
  itemSub: { color: Colors.textSecondary, fontSize: 12 },
  textCompleted: { textDecorationLine: 'line-through', color: Colors.textMuted },
});

export default TodayProgramWidget;
