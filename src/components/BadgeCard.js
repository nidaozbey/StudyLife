import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const BadgeCard = ({ badge, unlocked }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  return (
    <View style={[styles.card, !unlocked && styles.lockedCard]}>
      <View style={[styles.iconBox, !unlocked && styles.lockedIconBox]}>
        <MaterialCommunityIcons 
          name={unlocked ? badge.icon : 'lock'} 
          size={28} 
          color={unlocked ? Colors.primary : Colors.textMuted} 
        />
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, !unlocked && styles.lockedText]}>{badge.name}</Text>
        <Text style={styles.desc}>{badge.desc}</Text>
      </View>
    </View>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  lockedCard: {
    opacity: 0.6,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  lockedIconBox: {
    backgroundColor: Colors.background,
    borderColor: Colors.border,
  },
  info: { flex: 1 },
  name: { color: Colors.textPrimary, fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  lockedText: { color: Colors.textSecondary },
  desc: { color: Colors.textMuted, fontSize: 13, lineHeight: 18 }
});

export default BadgeCard;
