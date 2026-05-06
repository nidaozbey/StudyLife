import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import WhyModal from './WhyModal';

const DailyPriorityCard = ({ tasks }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  const [whyVisible, setWhyVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  if (!tasks || tasks.length === 0) return null;

  const handleWhy = (task) => {
    setSelectedTask(task);
    setWhyVisible(true);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <MaterialCommunityIcons name="lightning-bolt" size={22} color={Colors.primary} />
        <Text style={styles.cardTitle}>Bugünün En Önemli 3 Görevi</Text>
      </View>
      {tasks.map((task, i) => (
        <View key={task.id} style={[styles.taskRow, { borderLeftColor: task.priority?.color || Colors.border }]}>
          <View style={styles.taskLeft}>
            <View style={[styles.numberBadge, { backgroundColor: (task.priority?.color || Colors.border) + '20', borderColor: task.priority?.color || Colors.border }]}>
              <Text style={[styles.numberText, { color: task.priority?.color || Colors.textMuted }]}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskDesc} numberOfLines={2}>{task.description}</Text>
              <View style={[styles.levelBadge, { backgroundColor: (task.priority?.color || Colors.border) + '15' }]}>
                <Text style={[styles.levelText, { color: task.priority?.color || Colors.textMuted }]}>{task.priority?.level || ''} Öncelik</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.whyBtn} onPress={() => handleWhy(task)}>
            <MaterialCommunityIcons name="help-circle-outline" size={20} color={Colors.primary} />
            <Text style={styles.whyText}>Neden?</Text>
          </TouchableOpacity>
        </View>
      ))}
      <WhyModal
        visible={whyVisible}
        onClose={() => setWhyVisible(false)}
        title={selectedTask?.title}
        reasons={selectedTask?.reasons}
      />
    </View>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  card: { backgroundColor: Colors.card, borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: Colors.border },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  cardTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: 'bold' },
  taskRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', borderLeftWidth: 3, paddingLeft: 12, marginBottom: 16 },
  taskLeft: { flexDirection: 'row', flex: 1, gap: 12, alignItems: 'flex-start' },
  numberBadge: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  numberText: { fontWeight: 'bold', fontSize: 14 },
  taskTitle: { color: Colors.textPrimary, fontWeight: '700', fontSize: 14, marginBottom: 4 },
  taskDesc: { color: Colors.textSecondary, fontSize: 12, lineHeight: 18, marginBottom: 6 },
  levelBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  levelText: { fontSize: 11, fontWeight: 'bold' },
  whyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingLeft: 8, paddingTop: 4 },
  whyText: { color: Colors.primary, fontSize: 12, fontWeight: 'bold' },
});

export default DailyPriorityCard;
