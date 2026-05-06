import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Modal, Alert, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';

import { getExams, saveExam, deleteExam, getStudySessions, getTopicProgress, getQuizResults, getStudyPlans } from '../storage/storageService';
import { formatDate, formatTime, getDaysUntil } from '../utils/dateUtils';
import { calculateExamPriority } from '../utils/priorityUtils';
import { calculateExamPreparation } from '../utils/preparationUtils';
import { useTheme } from '../context/ThemeContext';
import ExamCard from '../components/ExamCard';
import PreparationProgressCard from '../components/PreparationProgressCard';
import EmptyState from '../components/EmptyState';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';

const EXAM_TYPES = ["Vize", "Final", "Quiz", "Ödev", "Proje"];

const ExamsScreen = () => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  const [exams, setExams] = useState([]);
  const [studySessions, setStudySessions] = useState([]);
  const [topicProgressData, setTopicProgressData] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [studyPlans, setStudyPlans] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('Vize');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [examTopicsText, setExamTopicsText] = useState('');
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const loadData = async () => {
    const data = await getExams();
    const sorted = data.sort((a, b) => new Date(a.dateString) - new Date(b.dateString));
    setExams(sorted);
    const sessions = await getStudySessions();
    setStudySessions(sessions);
    const t = await getTopicProgress(); setTopicProgressData(t);
    const q = await getQuizResults(); setQuizResults(q);
    const p = await getStudyPlans(); setStudyPlans(p);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setType('Vize');
    setDate(new Date());
    setTime(new Date());
    setExamTopicsText('');
  };

  const openModal = (exam = null) => {
    if (exam) {
      setEditingId(exam.id);
      setName(exam.name);
      setType(exam.type || 'Vize');
      setDate(new Date(exam.dateString));
      
      const st = new Date();
      const [sh, sm] = exam.timeString.split(':');
      st.setHours(parseInt(sh, 10), parseInt(sm, 10), 0);
      setTime(st);
      
      setExamTopicsText(exam.topics);
    } else {
      resetForm();
    }
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Eksik Bilgi', text2: 'Lütfen sınav adını girin.' });
      return;
    }

    const examData = {
      id: editingId,
      name,
      type,
      dateString: date.toISOString(),
      timeString: formatTime(time),
      topics: examTopicsText,
    };

    await saveExam(examData);
    setIsModalVisible(false);
    resetForm();
    loadData();
    
    Toast.show({
      type: 'success',
      text1: editingId ? 'Güncellendi' : 'Eklendi',
      text2: 'Sınav başarıyla kaydedildi.',
    });
  };

  const handleDelete = (id) => {
    Alert.alert("Sınavı Sil", "Bu sınavı silmek istediğinize emin misiniz?", [
      { text: "İptal", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: async () => { await deleteExam(id); loadData(); } }
    ]);
  };

  const getWeekStudyMins = (examName) => {
    return studySessions.filter(s => {
      const d = new Date(s.timestamp);
      return (new Date() - d) / (1000 * 60 * 60 * 24) <= 7 && s.subject === examName;
    }).reduce((sum, s) => sum + s.durationMinutes, 0);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sınavlar</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <MaterialCommunityIcons name="plus" size={24} color={Colors.background} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {exams.length === 0 ? (
          <EmptyState 
            icon="file-document-outline"
            title="Henüz sınav eklenmedi"
            message="Yaklaşan vize ve finallerini ekleyerek öncelik sırasını takip edebilirsin."
          />
        ) : (
          exams.map((exam) => {
            const weekMins = getWeekStudyMins(exam.name);
            const priority = calculateExamPriority(exam, weekMins);
            const prepPercent = calculateExamPreparation(exam, topicProgressData, studySessions, quizResults, studyPlans);
            return (
              <View key={exam.id} style={styles.cardWrapper}>
                <ExamCard 
                  name={`${exam.name} (${exam.type})`}
                  date={formatDate(exam.dateString)}
                  time={exam.timeString}
                  daysLeft={getDaysUntil(exam.dateString)}
                  topics={exam.topics || 'Konu girilmemiş'}
                  priorityLabel={priority.label}
                  priorityColor={priority.color}
                />
                <View style={styles.prepContainer}>
                  <PreparationProgressCard exam={exam} percent={prepPercent} />
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity onPress={() => openModal(exam)} style={styles.iconButton}>
                    <MaterialCommunityIcons name="pencil-outline" size={20} color={Colors.accent} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(exam.id)} style={styles.iconButton}>
                    <MaterialCommunityIcons name="trash-can-outline" size={20} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={isModalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingId ? 'Sınavı Düzenle' : 'Yeni Sınav Ekle'}</Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <MaterialCommunityIcons name="close" size={28} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <AppInput label="Ders / Sınav Adı" placeholder="Örn: Matematik" value={name} onChangeText={setName} />

            <Text style={styles.label}>Tür</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScroll}>
              {EXAM_TYPES.map(t => (
                <TouchableOpacity key={t} style={[styles.dayChip, type === t && styles.dayChipActive]} onPress={() => setType(t)}>
                  <Text style={[styles.dayChipText, type === t && styles.dayChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.label}>Tarih</Text>
                <TouchableOpacity style={styles.timeInput} onPress={() => setShowDatePicker(true)}>
                  <MaterialCommunityIcons name="calendar" size={20} color={Colors.accent} />
                  <Text style={styles.timeInputText}>{formatDate(date)}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker value={date} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={(event, selectedDate) => { setShowDatePicker(Platform.OS === 'ios'); if (selectedDate) setDate(selectedDate); }} />
                )}
                {Platform.OS === 'ios' && showDatePicker && (
                  <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.doneBtn}>
                    <Text style={styles.doneBtnText}>Bitti</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.flexSpacer} />

              <View style={styles.flex1}>
                <Text style={styles.label}>Saat</Text>
                <TouchableOpacity style={styles.timeInput} onPress={() => setShowTimePicker(true)}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color={Colors.accent} />
                  <Text style={styles.timeInputText}>{formatTime(time)}</Text>
                </TouchableOpacity>
                {showTimePicker && (
                  <DateTimePicker value={time} mode="time" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={(event, selectedDate) => { setShowTimePicker(Platform.OS === 'ios'); if (selectedDate) setTime(selectedDate); }} />
                )}
                {Platform.OS === 'ios' && showTimePicker && (
                  <TouchableOpacity onPress={() => setShowTimePicker(false)} style={styles.doneBtn}>
                    <Text style={styles.doneBtnText}>Bitti</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <AppInput label="Konular" placeholder="Sınav konularını buraya yazabilirsiniz..." value={examTopicsText} onChangeText={setExamTopicsText} multiline style={{ marginTop: 20 }} />

            <AppButton title="Kaydet" onPress={handleSave} style={{ marginTop: 20, marginBottom: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  addButton: { backgroundColor: Colors.primary, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
  contentContainer: { padding: 24, paddingBottom: 120 },
  cardWrapper: { position: 'relative', marginBottom: 16 },
  prepContainer: { marginHorizontal: 4, marginTop: -8, backgroundColor: Colors.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.border, borderTopWidth: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 },
  actionButtons: { position: 'absolute', top: 20, right: 20, flexDirection: 'row', zIndex: 10 },
  iconButton: { padding: 6, marginLeft: 8, backgroundColor: Colors.card, borderRadius: 8, borderWidth: 1, borderColor: Colors.border },
  bottomSpacer: { height: 100 },
  
  modalSafeArea: { flex: 1, backgroundColor: Colors.card },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: 'bold' },
  modalBody: { padding: 24 },
  label: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  daysScroll: { flexDirection: 'row', marginBottom: 8 },
  dayChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: Colors.background, marginRight: 10, borderWidth: 1, borderColor: Colors.border },
  dayChipActive: { backgroundColor: Colors.accent + '20', borderColor: Colors.accent },
  dayChipText: { color: Colors.textSecondary, fontWeight: '600' },
  dayChipTextActive: { color: Colors.accent },
  row: { flexDirection: 'row' },
  flex1: { flex: 1 },
  flexSpacer: { width: 16 },
  timeInput: { flexDirection: 'row', backgroundColor: Colors.background, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  timeInputText: { color: Colors.textPrimary, fontSize: 16, marginLeft: 10 },
  doneBtn: { marginTop: 8, alignSelf: 'flex-end' },
  doneBtnText: { color: Colors.primary, fontWeight: 'bold' },
});

export default ExamsScreen;
