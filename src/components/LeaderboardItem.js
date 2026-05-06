import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const LeaderboardItem = ({ item, rank }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  const isFirst = rank === 1;
  const isSecond = rank === 2;
  const isThird = rank === 3;
  const isUser = item.isCurrentUser;

  let rankColor = Colors.textMuted;
  if (isFirst) rankColor = '#FFD700'; // Gold
  else if (isSecond) rankColor = '#C0C0C0'; // Silver
  else if (isThird) rankColor = '#CD7F32'; // Bronze

  return (
    <View style={[styles.container, isUser && styles.userContainer]}>
      <View style={styles.rankCol}>
        <Text style={[styles.rankText, { color: rankColor, fontSize: isFirst ? 20 : 16 }]}>#{rank}</Text>
      </View>
      
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name ? item.name.substring(0, 1).toUpperCase() : '?'}</Text>
      </View>
      
      <View style={styles.info}>
        <Text style={[styles.name, isUser && styles.userName]}>{item.name} {isUser && '(Sen)'}</Text>
        <Text style={styles.level}>Lvl {item.level} {item.streak > 0 && `• ${item.streak}🔥`}</Text>
      </View>

      <View style={styles.scoreCol}>
        <Text style={[styles.score, isFirst && styles.scoreFirst]}>{Math.round(item.weeklyMinutes / 60)}</Text>
        <Text style={styles.scoreUnit}>saat</Text>
      </View>
    </View>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, backgroundColor: Colors.background, borderBottomWidth: 1, borderBottomColor: Colors.border },
  userContainer: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.purple + '40', borderRadius: 12, borderBottomWidth: 1 },
  rankCol: { width: 40, alignItems: 'center' },
  rankText: { fontWeight: 'bold' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.card, justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: Colors.border },
  avatarText: { color: Colors.textSecondary, fontSize: 14, fontWeight: 'bold' },
  info: { flex: 1 },
  name: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600', marginBottom: 2 },
  userName: { color: Colors.purple },
  level: { color: Colors.textSecondary, fontSize: 12 },
  scoreCol: { alignItems: 'flex-end' },
  score: { color: Colors.textPrimary, fontSize: 18, fontWeight: '900' },
  scoreFirst: { color: '#FFD700' },
  scoreUnit: { color: Colors.textSecondary, fontSize: 11 },
});

export default LeaderboardItem;
