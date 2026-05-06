import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { getFriends, getUserProfile, getStudySessions } from '../storage/storageService';
import { calculateLeaderboard } from '../utils/socialUtils';
import LeaderboardItem from '../components/LeaderboardItem';

const LeaderboardScreen = ({ navigation }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  const [leaderboard, setLeaderboard] = useState([]);

  const loadData = async () => {
    const [friends, profile, sessions] = await Promise.all([
      getFriends(), getUserProfile(), getStudySessions()
    ]);

    // Calculate user's weekly minutes
    const weekStart = new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 1));
    let weeklyMins = 0;
    sessions.forEach(s => {
      if (new Date(s.timestamp) >= weekStart) weeklyMins += s.durationMinutes;
    });

    const userProfile = { ...profile, weeklyMinutes: weeklyMins };
    const sorted = calculateLeaderboard(userProfile, friends);
    setLeaderboard(sorted);
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={32} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Haftalık Sıralama</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.heroCard}>
        <MaterialCommunityIcons name="trophy-outline" size={48} color="#FFD700" style={{ marginBottom: 8 }} />
        <Text style={styles.heroTitle}>Bu Hafta</Text>
        <Text style={styles.heroDesc}>Haftalık çalışma sürelerine göre sıralama. Her pazartesi sıfırlanır.</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.listContainer}>
          {leaderboard.map((item, index) => (
            <LeaderboardItem key={item.id} item={item} rank={index + 1} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 },
  backButton: { marginRight: 16 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary, textAlign: 'center' },
  heroCard: { alignItems: 'center', padding: 24, paddingBottom: 32 },
  heroTitle: { color: Colors.textPrimary, fontSize: 24, fontWeight: '900', marginBottom: 8 },
  heroDesc: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center' },
  container: { flex: 1 },
  contentContainer: { paddingBottom: 120 },
  listContainer: { borderTopWidth: 1, borderTopColor: Colors.border },
});

export default LeaderboardScreen;
