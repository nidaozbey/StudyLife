import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const StudyBuddyCard = ({ miniAdvice, onStartChat }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  return (
    <View style={styles.cardContainer}>
      <LinearGradient 
        colors={['#FF7A00', '#FFB000']} 
        start={{ x: 0, y: 0 }} 
        end={{ x: 1, y: 1 }} 
        style={styles.card}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <MaterialCommunityIcons name="robot-happy-outline" size={24} color={Colors.background} />
            <Text style={styles.title}>AI Study Buddy</Text>
          </View>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Aktif</Text>
          </View>
        </View>

        <Text style={styles.greeting}>Bugün nasıl gidiyor? Beraber toparlayalım.</Text>
        
        <View style={styles.adviceBox}>
          <MaterialCommunityIcons name="lightning-bolt" size={16} color={Colors.success} style={{ marginRight: 6 }} />
          <Text style={styles.adviceText}>{miniAdvice}</Text>
        </View>

        <TouchableOpacity style={styles.actionBtn} onPress={onStartChat}>
          <Text style={styles.actionBtnText}>Sohbete Başla</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color={Colors.background} />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  cardContainer: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    marginBottom: 24,
    borderRadius: 24,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: Colors.background,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(57, 255, 20, 0.2)', // Soft green glow
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  statusText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  greeting: {
    color: Colors.background,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 20,
    opacity: 0.95,
  },
  adviceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  adviceText: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.textPrimary,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  actionBtnText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StudyBuddyCard;
