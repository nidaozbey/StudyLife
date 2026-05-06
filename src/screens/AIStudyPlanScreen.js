import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { useTheme } from '../context/ThemeContext';
import { getAIStudyPlans, saveAIStudyPlan, getExams, getTopicProgress, getStudySessions, getQuizResults, getStudyPlans, getHabits, getCourses, getAttendanceRecords, getAttendanceSettings, getTimeBlocks, getDailyGoal } from '../storage/storageService';
import { generateAIStudyPlan, calculatePlanCompletionRate } from '../utils/aiStudyPlanUtils';
import { groupAttendanceByCourse } from '../utils/attendanceUtils';

import AIPlanItem from '../components/AIPlanItem';
import WhyModal from '../components/WhyModal';
import EmptyState from '../components/EmptyState';
import ProgressBar from '../components/ProgressBar';

const AIStudyPlanScreen = ({ navigation }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  const [currentPlan, setCurrentPlan] = useState(null);
  const [whyModalVisible, setWhyModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState([]);

  const loadData = async () => {
    const plans = await getAIStudyPlans();
    const todayStr = new Date().toDateString();
    const todayPlan = plans.find(p => p.date === todayStr);
    setCurrentPlan(todayPlan || null);
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const handleGeneratePlan = async () => {
    const [exams, topics, sessions, quizResults, stdPlans, habits, courses, attRecs, attSettings, timeBlocks, dailyGoalObj] = await Promise.all([
      getExams(), getTopicProgress(), getStudySessions(), getQuizResults(), getStudyPlans(), getHabits(), getCourses(), getAttendanceRecords(), getAttendanceSettings(), getTimeBlocks(), getDailyGoal()
    ]);
    const attMap = groupAttendanceByCourse(attRecs);
    const dailyGoalMins = dailyGoalObj.targetMinutes || 90;

    const newPlan = generateAIStudyPlan(exams, topics, sessions, quizResults, stdPlans, habits, courses, attMap, attSettings, timeBlocks, dailyGoalMins);
    
    if (newPlan.items.length === 0) {
      Toast.show({ type: 'info', text1: 'Plan Gerekli Değil', text2: 'Bugün için özel bir çalışma planı önerisi bulunamadı.' });
      return;
    }

    await saveAIStudyPlan(newPlan);
    setCurrentPlan(newPlan);
    Toast.show({ type: 'success', text1: 'Yapay Zeka Planı Hazır!' });
  };

  const handleToggleItem = async (index) => {
    if (!currentPlan) return;
    const updatedPlan = { ...currentPlan };
    updatedPlan.items[index].completed = !updatedPlan.items[index].completed;
    await saveAIStudyPlan(updatedPlan);
    setCurrentPlan(updatedPlan);
  };

  const showWhy = (reasons) => {
    setSelectedReason(reasons);
    setWhyModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={32} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Günlük Plan</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        
        {!currentPlan ? (
          <View style={styles.emptyContainer}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="robot-outline" size={64} color={Colors.cyan} />
            </View>
            <Text style={styles.emptyTitle}>Bugünün Planı Yok</Text>
            <Text style={styles.emptyDesc}>AI asistanın, yaklaşan sınavlarına, zayıf konularına ve hedeflerine göre senin için en uygun çalışma planını oluştursun.</Text>
            
            <TouchableOpacity style={styles.generateBtn} onPress={handleGeneratePlan}>
              <MaterialCommunityIcons name="magic-staff" size={20} color={Colors.background} />
              <Text style={styles.generateBtnText}>Akıllı Plan Oluştur</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.planContainer}>
            <View style={styles.planHeaderCard}>
              <Text style={styles.planDate}>Bugün • {currentPlan.date}</Text>
              <Text style={styles.planTitle}>Kişiselleştirilmiş Çalışma Planı</Text>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>Tamamlanma Oranı</Text>
                  <Text style={styles.progressValue}>%{calculatePlanCompletionRate(currentPlan)}</Text>
                </View>
                <ProgressBar progress={calculatePlanCompletionRate(currentPlan) / 100} color={Colors.cyan} />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Görevler</Text>
            
            {currentPlan.items.map((item, index) => (
              <AIPlanItem 
                key={item.id} 
                item={item} 
                onToggle={() => handleToggleItem(index)}
                onShowReason={() => showWhy(item.reasons)}
              />
            ))}

            <TouchableOpacity style={styles.regenerateBtn} onPress={handleGeneratePlan}>
              <MaterialCommunityIcons name="refresh" size={20} color={Colors.textSecondary} />
              <Text style={styles.regenerateText}>Planı Yeniden Oluştur</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      <WhyModal 
        visible={whyModalVisible} 
        onClose={() => setWhyModalVisible(false)} 
        reasons={selectedReason} 
      />
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
  
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  iconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.cyan + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  emptyTitle: { color: Colors.textPrimary, fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  emptyDesc: { color: Colors.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32, paddingHorizontal: 20 },
  generateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cyan, paddingVertical: 16, paddingHorizontal: 24, borderRadius: 16, gap: 8 },
  generateBtnText: { color: Colors.background, fontSize: 16, fontWeight: 'bold' },

  planContainer: { flex: 1 },
  planHeaderCard: { backgroundColor: Colors.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: Colors.cyan + '40', marginBottom: 24 },
  planDate: { color: Colors.cyan, fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  planTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: 'bold', marginBottom: 24 },
  progressContainer: { marginBottom: 8 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { color: Colors.textSecondary, fontSize: 13 },
  progressValue: { color: Colors.cyan, fontSize: 14, fontWeight: 'bold' },

  sectionTitle: { color: Colors.textSecondary, fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  
  regenerateBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16, marginTop: 16, gap: 8 },
  regenerateText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },
});

export default AIStudyPlanScreen;
