import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { getStudySessions, getHabits, getAttendanceRecords, getGamification, getCourses, getExams, getAIStudyPlans, getChallenges } from '../storage/storageService';
import { formatMinutesToHourText } from '../utils/dateUtils';
import { calculateDigitalTwin } from '../utils/digitalTwinUtils';
import { calculatePlanCompletionRate } from '../utils/aiStudyPlanUtils';
import { calculateChallengeProgress, generateShareSummary } from '../utils/socialUtils';
import { getLevel, getProgressToNextLevel, getAllBadgesList } from '../utils/gamificationUtils';
import { calculateBalanceScore } from '../utils/balanceUtils';
import { analyzeProductivityTimes } from '../utils/productivityTimeUtils';

import SectionHeader from '../components/SectionHeader';
import BarChart from '../components/BarChart';
import EmptyState from '../components/EmptyState';
import BadgeCard from '../components/BadgeCard';
import BalanceScoreCard from '../components/BalanceScoreCard';
import ChallengeCard from '../components/ChallengeCard';
import ShareSummaryCard from '../components/ShareSummaryCard';

const DAYS = ["Pzr", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

const ReportsScreen = ({ navigation }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  const [stats, setStats] = useState({ todayStr: '0dk', weekStr: '0dk', bestSubject: '-', habitRate: 0 });
  const [chartData, setChartData] = useState([]);
  const [subjectData, setSubjectData] = useState([]);
  const [twinProfile, setTwinProfile] = useState({ type: '-', summary: '' });
  const [gamification, setGamification] = useState({ xp: 0, level: 1, progress: 0, badges: [] });
  const [balance, setBalance] = useState(null);
  const [productivity, setProductivity] = useState(null);
  const [aiCompletion, setAiCompletion] = useState(0);
  const [challenges, setChallenges] = useState([]);
  const [shareSummary, setShareSummary] = useState(null);

  const loadData = async () => {
    const sessions = await getStudySessions();
    const habits = await getHabits();
    const attendance = await getAttendanceRecords();
    const gamData = await getGamification();
    const courses = await getCourses();
    const exams = await getExams();
    const aiPlans = await getAIStudyPlans();
    const chs = await getChallenges();

    // 1. Weekly Chart Data
    const weekData = [];
    let weekTotal = 0;
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dString = d.toDateString();
      const dayName = DAYS[d.getDay()];
      
      const daySessions = sessions.filter(s => s.dateString === dString);
      const dayMins = daySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
      weekTotal += dayMins;
      
      weekData.push({
        label: dayName,
        value: Math.round((dayMins / 60) * 10) / 10
      });
    }
    setChartData(weekData);

    const todaySessions = sessions.filter(s => s.dateString === new Date().toDateString());
    const todayMins = todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0);

    const subjectMap = {};
    sessions.forEach(s => {
      const d = new Date(s.timestamp);
      if ((new Date() - d) / (1000*60*60*24) <= 7) {
        subjectMap[s.subject] = (subjectMap[s.subject] || 0) + s.durationMinutes;
      }
    });

    const subjectArray = Object.keys(subjectMap).map(k => ({ name: k, mins: subjectMap[k] })).sort((a,b) => b.mins - a.mins);
    setSubjectData(subjectArray.slice(0, 4));

    let hRate = 0;
    if (habits.length > 0) {
      const completed = habits.filter(h => h.completed).length;
      hRate = Math.round((completed / habits.length) * 100);
    }

    setStats({
      todayStr: formatMinutesToHourText(todayMins),
      weekStr: formatMinutesToHourText(weekTotal),
      bestSubject: subjectArray.length > 0 ? subjectArray[0].name : '-',
      habitRate: hRate
    });

    // 2. Digital Twin
    const dt = calculateDigitalTwin(sessions, habits, attendance);
    setTwinProfile({ type: dt.profile.type, summary: dt.summary });

    // 3. Gamification
    const level = getLevel(gamData.xp);
    const progressObj = getProgressToNextLevel(gamData.xp);
    const allBadges = getAllBadgesList();
    
    const processedBadges = allBadges.map(b => ({
      ...b,
      unlocked: gamData.unlockedBadges.some(ub => ub.id === b.id)
    }));

    setGamification({
      xp: gamData.xp,
      level,
      progressPercent: progressObj.percent,
      reqXP: progressObj.required,
      badges: processedBadges
    });

    // Balance & Productivity
    setBalance(calculateBalanceScore(sessions, courses, exams));
    setProductivity(analyzeProductivityTimes(sessions));

    // V4 Stats
    const todayPlan = aiPlans.find(p => p.date === new Date().toDateString());
    if (todayPlan) {
      setAiCompletion(calculatePlanCompletionRate(todayPlan));
    }

    setChallenges(chs.filter(c => c.status === 'active'));
    
    // Summary
    const summary = generateShareSummary(sessions, habits, gamData, courses);
    setShareSummary(summary);
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={32} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dijital İkiz ve Raporlar</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        {/* Digital Twin Summary */}
        <View style={styles.twinCard}>
          <View style={styles.twinHeaderRow}>
            <MaterialCommunityIcons name="account-search-outline" size={32} color={Colors.primary} />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.twinTitle}>Öğrenci Dijital İkizi</Text>
              <Text style={styles.twinType}>Profil: {twinProfile.type}</Text>
            </View>
          </View>
          <Text style={styles.twinSummary}>{twinProfile.summary}</Text>
        </View>

        {/* Gamification Level */}
        <View style={styles.levelCard}>
          <Text style={styles.levelTitle}>Seviye {gamification.level}</Text>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${gamification.progressPercent}%` }]} />
          </View>
          <Text style={styles.levelSubtext}>{gamification.xp} XP / Sonraki seviye için {gamification.reqXP} XP gerekli</Text>
        </View>

        {/* Main Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Bu Hafta</Text>
            <Text style={styles.statValue}>{stats.weekStr}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Bugün</Text>
            <Text style={styles.statValue}>{stats.todayStr}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>En İyi Ders</Text>
            <Text style={[styles.statValue, { fontSize: 18 }]} numberOfLines={1}>{stats.bestSubject}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Alışkanlık</Text>
            <Text style={styles.statValue}>%{stats.habitRate}</Text>
          </View>
        </View>

        {/* Chart */}
        <SectionHeader title="Çalışma Süreleri (Saat)" />
        {chartData.length > 0 ? (
          <BarChart data={chartData} color={Colors.primary} />
        ) : (
          <EmptyState icon="chart-bar" title="Veri Yok" message="Henüz grafik oluşturacak kadar çalışma verisi bulunmuyor." />
        )}

        <View style={{ height: 32 }} />

        {/* AI & Social Section */}
        <SectionHeader title="AI ve Sosyal" />
        
        <View style={styles.aiCompletionCard}>
          <View style={styles.aiCompLeft}>
            <MaterialCommunityIcons name="robot-outline" size={24} color={Colors.cyan} />
            <Text style={styles.aiCompTitle}>Bugünkü AI Planı</Text>
          </View>
          <Text style={styles.aiCompValue}>%{aiCompletion} Bitti</Text>
        </View>

        <TouchableOpacity style={styles.socialNavCard} onPress={() => navigation.navigate('Friends')}>
          <View style={styles.socialNavLeft}>
            <MaterialCommunityIcons name="account-group" size={24} color={Colors.purple} />
            <Text style={styles.socialNavTitle}>Arkadaşlar ve Yarışma</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>

        {challenges.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <Text style={styles.challengeTitle}>Aktif Yarışmaların</Text>
            {challenges.slice(0, 2).map(c => (
              <ChallengeCard key={c.id} challenge={c} progress={calculateChallengeProgress(c, [], [])} />
            ))}
          </View>
        )}

        <View style={{ height: 32 }} />

        {/* Balance Score */}
        <SectionHeader title="Haftalık Denge Analizi" />
        <BalanceScoreCard balance={balance} />

        {/* Productivity Peak Hours */}
        {productivity && productivity.peakHour !== null && (
          <>
            <SectionHeader title="Verimli Saatler" />
            <View style={styles.productivityCard}>
              <Text style={styles.productivityText}>{productivity.summary}</Text>
            </View>
          </>
        )}

        {/* Badges */}
        <SectionHeader title="Başarı Rozetleri" />
        {gamification.badges.map(b => (
          <BadgeCard key={b.id} badge={b} unlocked={b.unlocked} />
        ))}

        <View style={{ height: 32 }} />

        {/* Share Summary */}
        <SectionHeader title="Haftalık Özetin" />
        {shareSummary && <ShareSummaryCard summary={shareSummary} />}

        <View style={styles.bottomSpacer} />
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
  
  twinCard: { backgroundColor: Colors.primary + '10', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: Colors.primary + '40', marginBottom: 24 },
  twinHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  twinTitle: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  twinType: { color: Colors.primary, fontSize: 20, fontWeight: 'bold' },
  twinSummary: { color: Colors.textPrimary, fontSize: 14, lineHeight: 22 },

  levelCard: { backgroundColor: Colors.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: Colors.border, marginBottom: 32 },
  levelTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  progressBarTrack: { height: 8, backgroundColor: Colors.background, borderRadius: 4, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, marginBottom: 8 },
  progressBarFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 4 },
  levelSubtext: { color: Colors.textMuted, fontSize: 12 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 32 },
  statBox: { width: '48%', backgroundColor: Colors.card, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  statLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  productivityCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: Colors.cyan + '30' },
  productivityText: { color: Colors.textPrimary, fontSize: 14, lineHeight: 22 },
  statValue: { color: Colors.textPrimary, fontSize: 24, fontWeight: 'bold' },

  aiCompletionCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.cyan + '10', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.cyan + '30', marginBottom: 12 },
  aiCompLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  aiCompTitle: { color: Colors.cyan, fontSize: 16, fontWeight: 'bold' },
  aiCompValue: { color: Colors.textPrimary, fontSize: 16, fontWeight: '900' },

  socialNavCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.purple + '10', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.purple + '30', marginBottom: 16 },
  socialNavLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  socialNavTitle: { color: Colors.purple, fontSize: 16, fontWeight: 'bold' },
  
  challengeTitle: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 12 },

  bottomSpacer: { height: 100 },
});

export default ReportsScreen;
