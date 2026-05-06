import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { useTheme } from '../context/ThemeContext';
import { getExams, getTopicProgress, getStudyPlans, saveStudyPlan, deleteStudyPlan } from '../storage/storageService';
import { generateStudyPlan } from '../utils/planUtils';
import AppButton from '../components/AppButton';
import EmptyState from '../components/EmptyState';
import StudyPlanCard from '../components/StudyPlanCard';

const StudyPlanScreen = ({ navigation }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  const [exams, setExams] = useState([]);
  const [topics, setTopics] = useState([]);
  const [plans, setPlans] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);

  const loadData = async () => {
    const e = await getExams();
    const t = await getTopicProgress();
    const p = await getStudyPlans();
    
    // Sadece gelecekteki sınavlar
    const futureExams = e.filter(exam => new Date(exam.dateString).getTime() >= new Date().getTime() - 86400000);
    setExams(futureExams);
    setTopics(t);
    setPlans(p);
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const handleGeneratePlan = async () => {
    if (!selectedExam) {
      Toast.show({ type: 'error', text1: 'Sınav Seçin' });
      return;
    }
    const newPlanItems = generateStudyPlan(selectedExam, topics, 120);
    if (newPlanItems.length === 0) {
      Toast.show({ type: 'error', text1: 'Plan Oluşturulamadı', text2: 'Sınava çok az kalmış olabilir.' });
      return;
    }

    const planObj = {
      id: `plan_${Date.now()}`,
      examId: selectedExam.id,
      courseName: selectedExam.name,
      items: newPlanItems,
      createdAt: Date.now()
    };

    await saveStudyPlan(planObj);
    Toast.show({ type: 'success', text1: 'Yapay Zeka Planı Hazır!' });
    loadData();
    setSelectedExam(null);
  };

  const handleDeletePlan = (id) => {
    Alert.alert("Sil", "Planı silmek istediğinize emin misiniz?", [
      { text: "İptal", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: async () => { await deleteStudyPlan(id); loadData(); } }
    ]);
  };

  const handleTogglePlanItem = async (plan, itemIndex) => {
    const newPlan = { ...plan };
    newPlan.items[itemIndex].completed = !newPlan.items[itemIndex].completed;
    await saveStudyPlan(newPlan);
    loadData();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={32} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Çalışma Planı</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        
        <View style={styles.aiCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <MaterialCommunityIcons name="robot-outline" size={28} color={Colors.cyan} style={{ marginRight: 12 }} />
            <Text style={styles.aiTitle}>Otomatik Plan Üretici</Text>
          </View>
          <Text style={styles.aiDesc}>Yaklaşan sınavını seç. Senin zayıf konularına odaklanan, sınava kadar güne bölünmüş bir plan hazırlayalım.</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 16 }}>
            {exams.length === 0 ? (
              <Text style={{ color: Colors.textMuted }}>Yaklaşan sınav bulunmuyor.</Text>
            ) : (
              exams.map(e => (
                <TouchableOpacity key={e.id} style={[styles.examChip, selectedExam?.id === e.id && styles.examChipActive]} onPress={() => setSelectedExam(e)}>
                  <Text style={[styles.examChipText, selectedExam?.id === e.id && styles.examChipTextActive]}>{e.name} ({e.type})</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          <AppButton title="Plan Oluştur" onPress={handleGeneratePlan} disabled={!selectedExam} />
        </View>

        {plans.length === 0 ? (
          <EmptyState icon="calendar-check-outline" title="Plan Yok" message="Henüz otomatik bir çalışma planı oluşturmadınız." />
        ) : (
          plans.map(plan => (
            <View key={plan.id} style={styles.planSection}>
              <View style={styles.planHeader}>
                <View>
                  <Text style={styles.planCourse}>{plan.courseName}</Text>
                  <Text style={styles.planSub}>Sınav Planı</Text>
                </View>
                <TouchableOpacity onPress={() => handleDeletePlan(plan.id)}>
                  <MaterialCommunityIcons name="trash-can-outline" size={24} color={Colors.danger} />
                </TouchableOpacity>
              </View>

              {plan.items.map((item, index) => (
                <StudyPlanCard 
                  key={item.id} 
                  item={item} 
                  onToggle={() => handleTogglePlanItem(plan, index)} 
                />
              ))}
            </View>
          ))
        )}

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

  aiCard: { backgroundColor: Colors.cyan + '10', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: Colors.cyan + '40', marginBottom: 32 },
  aiTitle: { color: Colors.cyan, fontSize: 18, fontWeight: 'bold' },
  aiDesc: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20 },

  examChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: Colors.card, marginRight: 10, borderWidth: 1, borderColor: Colors.border },
  examChipActive: { backgroundColor: Colors.cyan + '20', borderColor: Colors.cyan },
  examChipText: { color: Colors.textSecondary, fontWeight: '600' },
  examChipTextActive: { color: Colors.cyan },

  planSection: { marginBottom: 32 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  planCourse: { color: Colors.textPrimary, fontSize: 20, fontWeight: 'bold' },
  planSub: { color: Colors.textMuted, fontSize: 13 },
});

export default StudyPlanScreen;
