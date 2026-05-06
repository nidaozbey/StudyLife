import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { useTheme } from '../context/ThemeContext';
import { getCourses, getQuizResults, saveQuizResult, deleteQuizResult } from '../storage/storageService';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import EmptyState from '../components/EmptyState';

const QuizAnalysisScreen = ({ navigation }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  const [courses, setCourses] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const [isModalVisible, setModalVisible] = useState(false);
  const [examName, setExamName] = useState('');
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState('100');
  const [weakTopics, setWeakTopics] = useState('');

  const loadData = async () => {
    const c = await getCourses();
    const r = await getQuizResults();
    setCourses(c);
    setResults(r);
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const handleSave = async () => {
    if (!selectedCourseId || !examName || !score || !maxScore) {
      Toast.show({ type: 'error', text1: 'Eksik Alanlar' });
      return;
    }
    const q = {
      courseId: selectedCourseId,
      examName,
      score: parseFloat(score),
      maxScore: parseFloat(maxScore),
      weakTopics,
      dateString: new Date().toDateString(),
      timestamp: Date.now()
    };
    await saveQuizResult(q);
    setModalVisible(false);
    setExamName(''); setScore(''); setWeakTopics('');
    Toast.show({ type: 'success', text1: 'Sonuç Eklendi' });
    loadData();
  };

  const handleDelete = (id) => {
    Alert.alert("Sil", "Emin misiniz?", [
      { text: "İptal", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: async () => { await deleteQuizResult(id); loadData(); } }
    ]);
  };

  const activeResults = results.filter(r => r.courseId === selectedCourseId).sort((a,b) => b.timestamp - a.timestamp);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={32} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deneme & Quiz Analizi</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.label}>Ders Seçin</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
          {courses.map(c => (
            <TouchableOpacity key={c.id} style={[styles.courseChip, selectedCourseId === c.id && styles.courseChipActive]} onPress={() => setSelectedCourseId(c.id)}>
              <Text style={[styles.courseChipText, selectedCourseId === c.id && styles.courseChipTextActive]}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {selectedCourseId ? (
          <>
            <AppButton title="+ Yeni Sonuç Ekle" onPress={() => setModalVisible(true)} style={{ marginBottom: 24 }} />

            {activeResults.length === 0 ? (
              <EmptyState icon="chart-bell-curve" title="Sonuç Yok" message="Bu derse ait deneme veya quiz sonucu eklenmemiş." />
            ) : (
              activeResults.map(r => {
                const p = Math.round((r.score / r.maxScore) * 100);
                let color = Colors.primary;
                if (p < 50) color = Colors.danger;
                else if (p < 75) color = Colors.accent;

                return (
                  <View key={r.id} style={styles.resultCard}>
                    <View style={styles.resultHeader}>
                      <Text style={styles.resultName}>{r.examName}</Text>
                      <View style={[styles.scoreBadge, { backgroundColor: color + '15' }]}>
                        <Text style={[styles.scoreText, { color }]}>{r.score} / {r.maxScore}</Text>
                      </View>
                    </View>
                    {r.weakTopics ? (
                      <View style={styles.weakBox}>
                        <Text style={styles.weakTitle}>Eksik Konular:</Text>
                        <Text style={styles.weakDesc}>{r.weakTopics}</Text>
                      </View>
                    ) : null}
                    <View style={styles.footerRow}>
                      <Text style={styles.date}>{new Date(r.timestamp).toLocaleDateString('tr-TR')}</Text>
                      <TouchableOpacity onPress={() => handleDelete(r.id)}>
                        <MaterialCommunityIcons name="trash-can-outline" size={20} color={Colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )
              })
            )}
          </>
        ) : (
          <EmptyState icon="cursor-pointer" title="Ders Seçimi" message="Sonuçları görmek için yukarıdan bir ders seçin." />
        )}

      </ScrollView>

      {/* Modal */}
      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yeni Deneme/Quiz Ekle</Text>
            <AppInput label="Sınav Adı" placeholder="Örn: 1. Vize Denemesi" value={examName} onChangeText={setExamName} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <AppInput label="Aldığım Puan" placeholder="75" value={score} onChangeText={setScore} keyboardType="numeric" style={{ flex: 0.45 }} />
              <AppInput label="Max Puan" placeholder="100" value={maxScore} onChangeText={setMaxScore} keyboardType="numeric" style={{ flex: 0.45 }} />
            </View>
            <AppInput label="Eksik Yapılan Konular" placeholder="Örn: Limit, Türev" value={weakTopics} onChangeText={setWeakTopics} />
            <AppButton title="Kaydet" onPress={handleSave} />
            <AppButton title="İptal" onPress={() => setModalVisible(false)} type="outline" style={{ marginTop: 8 }} />
          </View>
        </View>
      </Modal>

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

  label: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 12 },
  courseChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.card, marginRight: 10, borderWidth: 1, borderColor: Colors.border, height: 38 },
  courseChipActive: { backgroundColor: Colors.danger + '20', borderColor: Colors.danger },
  courseChipText: { color: Colors.textSecondary, fontWeight: '600' },
  courseChipTextActive: { color: Colors.danger },

  resultCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 16 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  resultName: { color: Colors.textPrimary, fontSize: 16, fontWeight: 'bold' },
  scoreBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  scoreText: { fontWeight: 'bold', fontSize: 14 },
  
  weakBox: { backgroundColor: Colors.background, padding: 12, borderRadius: 8, marginBottom: 12 },
  weakTitle: { color: Colors.accent, fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  weakDesc: { color: Colors.textPrimary, fontSize: 13 },

  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12 },
  date: { color: Colors.textMuted, fontSize: 12 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: Colors.card, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: Colors.border },
  modalTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
});

export default QuizAnalysisScreen;
