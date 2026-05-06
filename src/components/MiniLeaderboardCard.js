import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const MiniLeaderboardCard = ({ leaderboard, onViewAll }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  if (!leaderboard || leaderboard.length === 0) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Haftalık Sıralama</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.link}>Tümünü Gör</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {leaderboard.slice(0, 3).map((item, index) => {
          const isUser = item.isCurrentUser;
          const isFirst = index === 0;
          
          return (
            <View key={item.id} style={[styles.row, isUser && styles.userRow]}>
              <Text style={[styles.rank, isFirst && styles.rankFirst]}>#{index + 1}</Text>
              <Text style={[styles.name, isUser && styles.userName]} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.score}>{Math.round(item.weeklyMinutes / 60)}s</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  card: { backgroundColor: Colors.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: Colors.purple + '30', marginBottom: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { color: Colors.textPrimary, fontSize: 16, fontWeight: 'bold' },
  link: { color: Colors.purple, fontSize: 13, fontWeight: '600' },
  list: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: Colors.background },
  userRow: { backgroundColor: Colors.purple + '15', borderWidth: 1, borderColor: Colors.purple + '40' },
  rank: { width: 30, color: Colors.textSecondary, fontSize: 14, fontWeight: 'bold' },
  rankFirst: { color: '#FFD700' },
  name: { flex: 1, color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  userName: { color: Colors.purple },
  score: { color: Colors.textPrimary, fontSize: 14, fontWeight: 'bold' },
});

export default MiniLeaderboardCard;
