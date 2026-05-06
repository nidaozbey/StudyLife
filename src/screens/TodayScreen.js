import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
  getCourses, getExams, getHabits, getStudySessions, getDailyGoal,
  getAttendanceRecords, getAttendanceSettings, getAppUsageLogs,
  getTopicProgress, getQuizResults, getStudyPlans, getAppPreferences,
  getFriends, getUserProfile
} from '../storage/storageService';
import { getWeekday, formatMinutesToHourText, getDaysUntil } from '../utils/dateUtils';
import { getAppUsageConsistency } from '../utils/digitalTwinUtils';
import { groupAttendanceByCourse } from '../utils/attendanceUtils';

import { useTheme } from '../context/ThemeContext';
import StatCardGrid from '../components/StatCardGrid';
import TodayTimeline from '../components/TodayTimeline';
import WeeklyActivityChart from '../components/WeeklyActivityChart';
import AIInsightsCard from '../components/AIInsightsCard';

const TodayScreen = ({ navigation }) => {
  const { colors: Colors } = useTheme();
  const styles = getStyles(Colors);

  const [stats, setStats] = useState({ studyTime: '0dk', progressPercent: 0, consistency: 0 });
  const [nearestExam, setNearestExam] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [totalWeeklyHours, setTotalWeeklyHours] = useState('0');
  const [insights, setInsights] = useState([]);

  const loadData = async () => {
    const [courses, exams, habits, allSessions, dailyGoalObj, logs, prefs, userProfile] = await Promise.all([
      getCourses(), getExams(), getHabits(), getStudySessions(), getDailyGoal(),
      getAppUsageLogs(), getAppPreferences(), getUserProfile()
    ]);

    const dailyGoal = dailyGoalObj.targetMinutes || 120;
    const todayStr = new Date().toDateString();
    const todaySessions = allSessions.filter(s => s.dateString === todayStr);
    const todayMinutes = todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    const progressPercent = Math.min(100, Math.round((todayMinutes / dailyGoal) * 100));
    const consistency = getAppUsageConsistency(logs);

    // Nearest exam
    const futureExams = exams.filter(e => getDaysUntil(e.dateString) >= 0)
      .sort((a, b) => getDaysUntil(a.dateString) - getDaysUntil(b.dateString));
    const ne = futureExams[0] || null;
    setNearestExam(ne);

    setStats({ 
      studyTime: formatMinutesToHourText(todayMinutes), 
      progressPercent, 
      consistency 
    });

    // Generate Timeline Events
    const events = [];
    if (ne && getDaysUntil(ne.dateString) <= 3) {
      events.push({ time: '09:00', title: `${ne.name} Yaklaşıyor`, description: 'Kritik uyarı', status: 'current' });
    } else {
      events.push({ time: '09:00', title: 'Güne Başlangıç', description: 'Hedeflerini kontrol et', status: 'past' });
    }
    
    if (todaySessions.length > 0) {
      events.push({ time: '11:30', title: 'Odaklanma', description: `${todaySessions[0].subject || 'Ders'} çalışıldı`, status: 'past' });
    } else {
      events.push({ time: '14:00', title: 'Çalışma Vakti', description: 'Henüz çalışmadın', status: 'current' });
    }
    events.push({ time: '19:00', title: 'AI Study Buddy', description: 'Günün özetini al', status: 'future' });
    setTimelineEvents(events);

    // Generate Real Weekly Data
    const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    const now = new Date();
    const currentDay = now.getDay() || 7; // Sunday is 7
    const mondayDate = new Date(now);
    mondayDate.setDate(now.getDate() - currentDay + 1);
    mondayDate.setHours(0, 0, 0, 0);

    let weeklyTotalMins = 0;
    const dailyMinsArray = Array(7).fill(0);

    allSessions.forEach(s => {
      const sDate = new Date(s.timestamp);
      if (sDate >= mondayDate) {
        // Calculate difference in days safely
        const sTime = sDate.getTime();
        const mTime = mondayDate.getTime();
        const diffDays = Math.floor((sTime - mTime) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 7) {
          dailyMinsArray[diffDays] += s.durationMinutes;
          weeklyTotalMins += s.durationMinutes;
        }
      }
    });

    const maxDailyMins = Math.max(...dailyMinsArray, dailyGoal, 1);

    const wData = weekDays.map((d, i) => {
      const mins = dailyMinsArray[i];
      const percent = Math.min(100, Math.round((mins / maxDailyMins) * 100));
      return {
        day: d,
        value: percent,
        color: percent >= 80 ? Colors.success : Colors.primary
      };
    });

    setWeeklyData(wData);
    setTotalWeeklyHours((weeklyTotalMins / 60).toFixed(1));

    // Generate Insights
    const genInsights = [];
    if (consistency > 70) {
      genInsights.push({ icon: 'check-all', color: Colors.success, title: 'Harika gidiyorsun', desc: 'Son günlerde çok tutarlısın. Böyle devam et!' });
    }
    if (ne && getDaysUntil(ne.dateString) <= 5) {
      genInsights.push({ icon: 'alert-circle-outline', color: Colors.primary, title: 'Sınav Alarmı', desc: `${ne.name} için hazırlıkları hızlandırmalısın.` });
    }
    if (progressPercent < 50) {
      genInsights.push({ icon: 'robot-happy-outline', color: Colors.primary, title: 'Odaklanma vakti', desc: 'Bugün günlük hedefine hala uzaksın. Hadi biraz çalışalım.' });
    }
    if (genInsights.length === 0) {
      genInsights.push({ icon: 'star-four-points', color: Colors.success, title: 'Her şey yolunda', desc: 'Günlük rutinini koruyorsun.' });
    }
    setInsights(genInsights);
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Merhaba Nida 👋</Text>
            <Text style={styles.subGreeting}>Bugünün ders, sınav ve düzen özeti</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Settings')}>
            <MaterialCommunityIcons name="cog-outline" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Search / Quick Action Bar */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchInputBox}>
            <MaterialCommunityIcons name="magnify" size={20} color={Colors.textMuted} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Ders, sınav, not ara..."
              placeholderTextColor={Colors.textMuted}
              editable={false} // Simple mockup
            />
          </View>
          <TouchableOpacity style={styles.aiBtn} onPress={() => navigation.navigate('AIStudyBuddy')}>
            <MaterialCommunityIcons name="robot-happy" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* 2x2 Grid */}
        <StatCardGrid stats={stats} nearestExam={nearestExam} onNavigate={(screen) => navigation.navigate(screen)} />

        {/* Timeline */}
        <TodayTimeline events={timelineEvents} />

        {/* Weekly Chart */}
        <WeeklyActivityChart weeklyData={weeklyData} totalHours={totalWeeklyHours} />

        {/* AI Insights */}
        <AIInsightsCard insights={insights} onStartChat={() => navigation.navigate('AIStudyBuddy')} />

      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  contentContainer: { padding: 24, paddingBottom: 160 },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },

  searchBarContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  searchInputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  aiBtn: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary + '50',
  },
});

export default TodayScreen;
