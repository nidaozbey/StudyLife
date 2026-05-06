import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { useTheme } from '../context/ThemeContext';
import { getChallenges, saveChallenge, getStudySessions, getHabits } from '../storage/storageService';
import { calculateChallengeProgress } from '../utils/socialUtils';
import ChallengeCard from '../components/ChallengeCard';
import EmptyState from '../components/EmptyState';

// Dummy static challenges for user to pick
const PRESET_CHALLENGES = [
  { id: 'pre_1', title: 'Haftalık 5 Saat', targetAmount: 5, targetUnit: 'Saat', type: 'study_time', days: 7 },
  { id: 'pre_2', title: '3 Günlük Seri', targetAmount: 3, targetUnit: 'Gün', type: 'streak', days: 3 },
  { id: 'pre_3', title: '10 Pomodoro', targetAmount: 10, targetUnit: 'Oturum', type: 'pomodoro', days: 7 }
];

const ChallengesScreen = ({ navigation }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  const [challenges, setChallenges] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [habits, setHabits] = useState([]);

  const loadData = async () => {
    const [c, s, h] = await Promise.all([ getChallenges(), getStudySessions(), getHabits() ]);
    setChallenges(c);
    setSessions(s);
    setHabits(h);
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const startChallenge = async (preset) => {
    const newChallenge = {
      id: `ch_${Date.now()}`,
      title: preset.title,
      targetAmount: preset.targetAmount,
      targetUnit: preset.targetUnit,
      type: preset.type,
      status: 'active',
      startDate: new Date().toISOString(),
      daysLeft: preset.days,
      currentAmount: 0 // dummy starting value
    };
    await saveChallenge(newChallenge);
    Toast.show({ type: 'success', text1: 'Yarışma Başladı!' });
    loadData();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={32} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yarışmalar</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        
        <Text style={styles.sectionTitle}>Aktif Yarışmalar</Text>
        {challenges.length === 0 ? (
          <EmptyState icon="flag-checkered" title="Aktif Yarışma Yok" message="Arkadaşlarınla veya kendi hedeflerinle yarışmak için bir meydan okuma başlat." />
        ) : (
          challenges.map(c => (
            <ChallengeCard key={c.id} challenge={c} progress={calculateChallengeProgress(c, sessions, habits)} />
          ))
        )}

        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Yeni Yarışma Başlat</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
          {PRESET_CHALLENGES.map(p => (
            <TouchableOpacity key={p.id} style={styles.presetCard} onPress={() => startChallenge(p)}>
              <MaterialCommunityIcons name="lightning-bolt" size={24} color={Colors.accent} style={{ marginBottom: 8 }} />
              <Text style={styles.presetTitle}>{p.title}</Text>
              <Text style={styles.presetSub}>{p.days} Günlük Hedef</Text>
              <View style={styles.presetBtn}>
                <Text style={styles.presetBtnText}>Başlat</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backButton: { marginRight: 16 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary, textAlign: 'center' },
  container: { flex: 1 },
  contentContainer: { padding: 24, paddingBottom: 120 },
  sectionTitle: { color: Colors.textSecondary, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  
  presetScroll: { overflow: 'visible' },
  presetCard: { width: 160, backgroundColor: Colors.card, borderRadius: 16, padding: 16, marginRight: 16, borderWidth: 1, borderColor: Colors.border },
  presetTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  presetSub: { color: Colors.textSecondary, fontSize: 12, marginBottom: 16 },
  presetBtn: { backgroundColor: Colors.accent + '20', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  presetBtnText: { color: Colors.accent, fontSize: 13, fontWeight: 'bold' }
});

export default ChallengesScreen;
