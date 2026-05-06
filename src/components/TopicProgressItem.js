import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const getStatusColor = (status) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  switch (status) {
    case 'Bilmiyorum': return Colors.danger;
    case 'Az biliyorum': return Colors.accent;
    case 'Orta': return '#FFD166';
    case 'İyi biliyorum': return Colors.primary;
    default: return Colors.textMuted;
  }
};

const TopicProgressItem = ({ topic, onChangeStatus, onDelete }) => {
  const color = getStatusColor(topic.status);
  
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.name}>{topic.name}</Text>
        <TouchableOpacity onPress={onChangeStatus} style={[styles.statusBadge, { borderColor: color }]}>
          <Text style={[styles.statusText, { color }]}>{topic.status}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={onDelete} style={styles.delBtn}>
        <MaterialCommunityIcons name="trash-can-outline" size={20} color={Colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  info: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { color: Colors.textPrimary, fontSize: 15, fontWeight: '500', flex: 1 },
  statusBadge: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginHorizontal: 8 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  delBtn: { padding: 4 }
});

export default TopicProgressItem;
