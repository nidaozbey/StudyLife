import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Modal, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTheme } from '../context/ThemeContext';
import { getWeeklyPlans, saveWeeklyPlan, deleteWeeklyPlan, getCourses, getExams, getStudySessions, getHabits } from '../storage/storageService';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import EmptyState from '../components/EmptyState';
import SectionHeader from '../components/SectionHeader';
import { getDaysUntil } from '../utils/dateUtils';

const WeeklyPlanningScreen = ({ navigation }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  const [plans, setPlans] = useState([]);
  const [courses, setCourses] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [targetHours, setTargetHours] = useState('');
  const [note, setNote] = useState('');

  const loadData = async () => {
    const [p, c, exams, sessions, habits] = await Promise.all([
      getWeeklyPlans(), getCourses(), getExams(), getStudySessions(), getHabits()
    ]);
    setPlans(p);
    const names = [...new Set(c.map(x => x.name))];
    setCourses(names);

    // Auto-generate suggestions
    const upcomingExams = exams.filter(e => getDaysUntil(e.dateString) >= 0 && getDaysUntil(e.dateString) <= 14)
      .sort((a, b) => getDaysUntil(a.dateString) - getDaysUntil(b.dateString));
    const s = upcomingExams.slice(0, 4).map(e => ({
      course: e.courseName,
      targetHours: getDaysUntil(e.dateString) <= 3 ? 4 : 3,
      reason: `Sınav ${getDaysUntil(e.dateString)} gün sonra.`
    }));
    setSuggestions(s);
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const handleSave = async () => {
    if (!selectedCourse || !targetHours) return;
    await saveWeeklyPlan({ course: selectedCourse, targetHours: parseFloat(targetHours), note, weekOf: new Date().toDateString() });
    setIsModalVisible(false);
    setSelectedCourse(''); setTargetHours(''); setNote('');
    loadData();
    Toast.show({ type: 'success', text1: 'Plan eklendi' });
  };

  const handleDelete = (id) => {
    Alert.alert('Sil', 'Bu planı silmek istiyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => { await deleteWeeklyPlan(id); loadData(); } }
    ]);
  };

  const addSuggestion = async (s) => {
    await saveWeeklyPlan({ course: s.course, targetHours: s.targetHours, note: s.reason, weekOf: new Date().toDateString() });
    loadData();
    Toast.show({ type: 'success', text1: `${s.course} için plan eklendi` });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={32} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Haftalık Planlama</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setIsModalVisible(true)}>
          <MaterialCommunityIcons name="plus" size={24} color={Colors.background} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {suggestions.length > 0 && (
          <>
            <SectionHeader title="Önerilen Hedefler" />
            {suggestions.map((s, i) => (
              <View key={i} style={styles.suggestionRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.suggestionCourse}>{s.course}</Text>
                  <Text style={styles.suggestionReason}>{s.reason}</Text>
                </View>
                <Text style={styles.suggestionHours}>{s.targetHours} saat</Text>
                <TouchableOpacity style={styles.addSuggBtn} onPress={() => addSuggestion(s)}>
                  <MaterialCommunityIcons name="plus-circle" size={24} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        <SectionHeader title="Bu Haftanın Planları" />
        {plans.length === 0
          ? <EmptyState icon="calendar-week" title="Plan Yok" message="Bu hafta için hedef eklemek için + butonuna tıkla." />
          : plans.map(p => (
            <View key={p.id} style={styles.planRow}>
              <View style={styles.planIconBox}>
                <MaterialCommunityIcons name="book-open-outline" size={22} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.planCourse}>{p.course}</Text>
                {p.note ? <Text style={styles.planNote}>{p.note}</Text> : null}
              </View>
              <View style={styles.planHourBadge}>
                <Text style={styles.planHour}>{p.targetHours}h</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(p.id)} style={{ padding: 6 }}>
                <MaterialCommunityIcons name="trash-can-outline" size={18} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          ))
        }
        <View style={{ height: 80 }} />
      </ScrollView>

      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Haftalık Hedef Ekle</Text>
            <Text style={styles.label}>Ders</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {courses.map(c => (
                <TouchableOpacity key={c} style={[styles.chip, selectedCourse === c && styles.chipActive]} onPress={() => setSelectedCourse(c)}>
                  <Text style={[styles.chipText, selectedCourse === c && { color: Colors.primary }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <AppInput label="Hedef Saat" placeholder="Örn: 3" value={targetHours} onChangeText={setTargetHours} keyboardType="decimal-pad" />
            <AppInput label="Not (opsiyonel)" placeholder="Açıklama..." value={note} onChangeText={setNote} />
            <AppButton title="Kaydet" onPress={handleSave} style={{ marginTop: 8 }} />
            <AppButton title="İptal" type="outline" onPress={() => setIsModalVisible(false)} style={{ marginTop: 8 }} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary, textAlign: 'center' },
  addBtn: { backgroundColor: Colors.primary, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 24, paddingBottom: 120 },
  suggestionRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.primary + '30', gap: 8 },
  suggestionCourse: { color: Colors.textPrimary, fontWeight: '700', fontSize: 14 },
  suggestionReason: { color: Colors.textSecondary, fontSize: 12 },
  suggestionHours: { color: Colors.primary, fontWeight: 'bold', fontSize: 16, marginRight: 4 },
  addSuggBtn: { padding: 4 },
  planRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.border, gap: 12 },
  planIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
  planCourse: { color: Colors.textPrimary, fontWeight: '700', fontSize: 14 },
  planNote: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  planHourBadge: { backgroundColor: Colors.primary + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  planHour: { color: Colors.primary, fontWeight: 'bold' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1, borderColor: Colors.border },
  modalTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  label: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.background, marginRight: 8, borderWidth: 1, borderColor: Colors.border },
  chipActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '15' },
  chipText: { color: Colors.textSecondary, fontWeight: '600' },
});

export default WeeklyPlanningScreen;
