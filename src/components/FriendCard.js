import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const FriendCard = ({ friend, onPress }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{friend.name ? friend.name.substring(0, 2).toUpperCase() : '?'}</Text>
      </View>
      
      <View style={styles.info}>
        <Text style={styles.name}>{friend.name}</Text>
        <Text style={styles.level}>Seviye {friend.level}</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="clock-outline" size={14} color={Colors.cyan} />
          <Text style={styles.statText}>{Math.round(friend.weeklyMinutes / 60)}s</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="fire" size={14} color={Colors.primary} />
          <Text style={styles.statText}>{friend.streak || 0}</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="shield-star-outline" size={14} color={Colors.purple} />
          <Text style={styles.statText}>{friend.badgesEarned || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: Colors.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.purple + '20', justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 1, borderColor: Colors.purple },
  avatarText: { color: Colors.purple, fontSize: 16, fontWeight: 'bold' },
  info: { flex: 1 },
  name: { color: Colors.textPrimary, fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  level: { color: Colors.textSecondary, fontSize: 13 },
  stats: { flexDirection: 'row', gap: 12 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
});

export default FriendCard;
