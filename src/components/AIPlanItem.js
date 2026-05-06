import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const AIPlanItem = ({ item, onToggle, onShowReason }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  const isHighPriority = item.priority === 'Yüksek';

  return (
    <View style={[styles.card, item.completed && styles.cardCompleted, isHighPriority && !item.completed && styles.cardHighPriority]}>
      <TouchableOpacity onPress={onToggle} style={styles.checkBtn}>
        <MaterialCommunityIcons 
          name={item.completed ? "check-circle" : "circle-outline"} 
          size={28} 
          color={item.completed ? Colors.success : Colors.textMuted} 
        />
      </TouchableOpacity>
      
      <View style={styles.info}>
        <Text style={[styles.title, item.completed && styles.textCompleted]}>{item.title}</Text>
        <Text style={[styles.topic, item.completed && styles.textCompleted]}>{item.topic}</Text>
        
        <View style={styles.metaRow}>
          <View style={styles.metaBadge}>
            <MaterialCommunityIcons name="clock-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{item.suggestedMinutes} dk</Text>
          </View>
          
          {isHighPriority && !item.completed && (
            <View style={[styles.metaBadge, { backgroundColor: Colors.primary + '20' }]}>
              <MaterialCommunityIcons name="alert-circle-outline" size={14} color={Colors.primary} />
              <Text style={[styles.metaText, { color: Colors.primary }]}>Öncelikli</Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.reasonBtn} onPress={onShowReason}>
        <MaterialCommunityIcons name="help-circle-outline" size={24} color={Colors.cyan} />
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: Colors.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  cardCompleted: { opacity: 0.7, borderColor: Colors.success + '40', backgroundColor: Colors.success + '10' },
  cardHighPriority: { borderColor: Colors.primary + '50' },
  checkBtn: { marginRight: 16 },
  info: { flex: 1 },
  title: { color: Colors.textPrimary, fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  topic: { color: Colors.textSecondary, fontSize: 14, marginBottom: 8 },
  textCompleted: { textDecorationLine: 'line-through', color: Colors.textMuted },
  metaRow: { flexDirection: 'row', gap: 8 },
  metaBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  metaText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '500' },
  reasonBtn: { padding: 8, backgroundColor: Colors.cyan + '15', borderRadius: 12, marginLeft: 8 },
});

export default AIPlanItem;
