import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { useTheme } from '../context/ThemeContext';
import { getCourses, getAttendanceRecords, getAttendanceSettings, saveAttendanceRecord, saveAttendanceSetting, deleteAttendanceRecord } from '../storage/storageService';
import { calculateAttendanceRisk, getAttendanceRiskColor, getRemainingAbsenceLimit } from '../utils/attendanceUtils';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import EmptyState from '../components/EmptyState';
import AttendanceRiskBadge from '../components/AttendanceRiskBadge';
import SectionHeader from '../components/SectionHeader';

const AttendanceScreen = ({ navigation }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  const [courses, setCourses] = useState([]);
  const [records, setRecords] = useState([]);
  const [settings, setSettings] = useState({});
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  // Modals
  const [isRecordModalVisible, setRecordModalVisible] = useState(false);
  const [recordAmount, setRecordAmount] = useState('1');
  const [recordNote, setRecordNote] = useState('');

  const [isLimitModalVisible, setLimitModalVisible] = useState(false);
  const [limitInput, setLimitInput] = useState('');

  const loadData = async () => {
    const c = await getCourses();
    const r = await getAttendanceRecords();
    const s = await getAttendanceSettings();
    setCourses(c);
    setRecords(r);
    setSettings(s);
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const handleSaveLimit = async () => {
    if (!selectedCourseId || !limitInput) return;
    await saveAttendanceSetting(selectedCourseId, { limit: parseInt(limitInput, 10) });
    setLimitModalVisible(false);
    Toast.show({ type: 'success', text1: 'Limit Güncellendi' });
    loadData();
  };

  const handleSaveRecord = async () => {
    if (!selectedCourseId || !recordAmount) return;
    const rec = {
      courseId: selectedCourseId,
      amount: parseInt(recordAmount, 10),
      note: recordNote || '',
      dateString: new Date().toDateString(),
      timestamp: Date.now()
    };
    await saveAttendanceRecord(rec);
    setRecordModalVisible(false);
    setRecordAmount('1');
    setRecordNote('');
    Toast.show({ type: 'success', text1: 'Devamsızlık Eklendi' });
    loadData();
  };

  const handleDelete = (id) => {
    Alert.alert("Sil", "Emin misiniz?", [
      { text: "İptal", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: async () => { await deleteAttendanceRecord(id); loadData(); } }
    ]);
  };

  // Group
  const activeCourseRecords = records.filter(r => r.courseId === selectedCourseId).sort((a,b) => b.timestamp - a.timestamp);
  const totalUsed = activeCourseRecords.reduce((sum, r) => sum + r.amount, 0);
  const currentLimit = settings[selectedCourseId]?.limit || 0;
  const remaining = getRemainingAbsenceLimit(totalUsed, currentLimit);
  const risk = calculateAttendanceRisk(totalUsed, currentLimit);
  const riskColor = getAttendanceRiskColor(risk);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={32} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Devamsızlık Takibi</Text>
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
            <View style={styles.statsCard}>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{totalUsed}</Text>
                  <Text style={styles.statLabel}>Kullanılan</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: Colors.cyan }]}>{remaining}</Text>
                  <Text style={styles.statLabel}>Kalan Hak</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{currentLimit}</Text>
                  <Text style={styles.statLabel}>Toplam Limit</Text>
                </View>
              </View>
              <View style={styles.riskRow}>
                <AttendanceRiskBadge riskLabel={risk} color={riskColor} />
                <TouchableOpacity onPress={() => { setLimitInput(currentLimit.toString()); setLimitModalVisible(true); }} style={styles.editBtn}>
                  <MaterialCommunityIcons name="pencil" size={16} color={Colors.textSecondary} />
                  <Text style={styles.editBtnText}>Limiti Düzenle</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.actionsRow}>
              <AppButton title="+ Yeni Kayıt Ekle" onPress={() => setRecordModalVisible(true)} style={{ flex: 1 }} />
            </View>

            <SectionHeader title="Geçmiş Kayıtlar" />
            {activeCourseRecords.length === 0 ? (
              <EmptyState icon="history" title="Kayıt Yok" message="Bu derse ait devamsızlık bulunmuyor." />
            ) : (
              activeCourseRecords.map(r => (
                <View key={r.id} style={styles.recordRow}>
                  <MaterialCommunityIcons name="calendar-remove-outline" size={24} color={Colors.accent} style={{ marginRight: 16 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recordDate}>{new Date(r.timestamp).toLocaleDateString('tr-TR')}</Text>
                    {r.note ? <Text style={styles.recordNote}>{r.note}</Text> : null}
                  </View>
                  <Text style={styles.recordAmount}>{r.amount} Saat</Text>
                  <TouchableOpacity onPress={() => handleDelete(r.id)} style={{ padding: 8, marginLeft: 8 }}>
                    <MaterialCommunityIcons name="trash-can-outline" size={20} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        ) : (
          <EmptyState icon="cursor-pointer" title="Ders Seçimi" message="Devamsızlık detaylarını görmek için yukarıdan bir ders seçin." />
        )}

      </ScrollView>

      {/* Limit Modal */}
      <Modal visible={isLimitModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Devamsızlık Limiti (Saat)</Text>
            <AppInput placeholder="Örn: 10" value={limitInput} onChangeText={setLimitInput} keyboardType="number-pad" />
            <AppButton title="Kaydet" onPress={handleSaveLimit} />
            <AppButton title="İptal" onPress={() => setLimitModalVisible(false)} type="outline" style={{ marginTop: 8 }} />
          </View>
        </View>
      </Modal>

      {/* Record Modal */}
      <Modal visible={isRecordModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Devamsızlık Kaydı Ekle</Text>
            <AppInput label="Miktar (Saat)" placeholder="1" value={recordAmount} onChangeText={setRecordAmount} keyboardType="number-pad" />
            <AppInput label="Not (Opsiyonel)" placeholder="Örn: Hastaydım" value={recordNote} onChangeText={setRecordNote} />
            <AppButton title="Ekle" onPress={handleSaveRecord} />
            <AppButton title="İptal" onPress={() => setRecordModalVisible(false)} type="outline" style={{ marginTop: 8 }} />
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
  courseChipActive: { backgroundColor: Colors.primary + '20', borderColor: Colors.primary },
  courseChipText: { color: Colors.textSecondary, fontWeight: '600' },
  courseChipTextActive: { color: Colors.primary },

  statsCard: { backgroundColor: Colors.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: Colors.border, marginBottom: 24 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: { alignItems: 'center', flex: 1 },
  divider: { width: 1, backgroundColor: Colors.border },
  statValue: { color: Colors.textPrimary, fontSize: 28, fontWeight: '800', marginBottom: 4 },
  statLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  
  riskRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.border },
  editBtn: { flexDirection: 'row', alignItems: 'center' },
  editBtnText: { color: Colors.textSecondary, fontSize: 12, marginLeft: 4, fontWeight: '600' },

  actionsRow: { flexDirection: 'row', marginBottom: 32 },
  
  recordRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 12 },
  recordDate: { color: Colors.textPrimary, fontSize: 16, fontWeight: 'bold' },
  recordNote: { color: Colors.textMuted, fontSize: 13, marginTop: 4 },
  recordAmount: { color: Colors.accent, fontSize: 16, fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: Colors.card, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: Colors.border },
  modalTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
});

export default AttendanceScreen;
