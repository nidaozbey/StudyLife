import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Modal, Alert, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../context/ThemeContext';
import { getCourses, getTodayStudySessions, saveStudySession, deleteStudySession, getDailyGoal, setDailyGoal, logAppUsage, getGamification, saveGamification } from '../storage/storageService';
import { formatDuration, formatMinutesToHourText } from '../utils/dateUtils';
import { calculateXPForAction } from '../utils/gamificationUtils';
import EmptyState from '../components/EmptyState';
import SectionHeader from '../components/SectionHeader';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';

const POMODORO_SECONDS = 25 * 60;

const StudyScreen = () => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [dailyGoal, setDailyGoalState] = useState(120);
  
  // Timer State
  const [isStudying, setIsStudying] = useState(false);
  const [mode, setMode] = useState('normal');
  const [seconds, setSeconds] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [topic, setTopic] = useState('');
  
  const timerRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Modals
  const [isManualModalVisible, setIsManualModalVisible] = useState(false);
  const [manualDuration, setManualDuration] = useState('');
  const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
  const [goalInput, setGoalInput] = useState('');

  const loadData = async () => {
    const fetchedCourses = await getCourses();
    const uniqueNames = [...new Set(fetchedCourses.map(c => c.name))];
    setCourses(uniqueNames);
    
    const fetchedSessions = await getTodayStudySessions();
    setSessions(fetchedSessions);

    const goalObj = await getDailyGoal();
    setDailyGoalState(goalObj.targetMinutes || 120);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [])
  );

  useEffect(() => {
    if (mode === 'pomodoro' && !isStudying && seconds === 0) {
      setSeconds(POMODORO_SECONDS);
    } else if (mode === 'normal' && !isStudying) {
      setSeconds(0);
    }
  }, [mode]);

  useEffect(() => {
    if (isStudying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
        ])
      ).start();

      timerRef.current = setInterval(() => {
        setSeconds(s => {
          if (mode === 'pomodoro') {
            if (s <= 1) {
              finishPomodoro();
              return 0;
            }
            return s - 1;
          } else {
            return s + 1;
          }
        });
      }, 1000);
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      if (seconds !== 0 && mode === 'normal') clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isStudying, mode]);

  const awardXP = async (xp, msg) => {
    const gamData = await getGamification();
    gamData.xp += xp;
    await saveGamification(gamData);
    Toast.show({ type: 'success', text1: msg, text2: `+${xp} XP kazandınız!` });
  };

  const finishPomodoro = async () => {
    clearInterval(timerRef.current);
    setIsStudying(false);
    
    const session = {
      subject: selectedCourse || 'Pomodoro',
      topic: topic || 'Odak Modu',
      durationMinutes: 25,
      type: 'pomodoro'
    };
    await saveStudySession(session);
    await logAppUsage();
    await awardXP(calculateXPForAction('POMODORO_DONE'), 'Odak Ulaşıldı!');
    
    setSeconds(POMODORO_SECONDS);
    setTopic('');
    loadData();
  };

  const toggleTimer = async () => {
    if (!selectedCourse) {
      Toast.show({ type: 'error', text1: 'Hata', text2: 'Lütfen çalışacağınız dersi seçin.' });
      return;
    }

    if (isStudying) {
      setIsStudying(false);
      
      if (mode === 'pomodoro') {
        Alert.alert("Erken Bitirdiniz", "Pomodoro oturumunu erken bitirdiğiniz için süre kaydedilmedi.");
        setSeconds(POMODORO_SECONDS);
        return;
      }

      if (seconds > 60) {
        const mins = Math.floor(seconds / 60);
        const session = {
          subject: selectedCourse,
          topic: topic || 'Genel Çalışma',
          durationMinutes: mins,
          type: 'normal'
        };
        await saveStudySession(session);
        await logAppUsage();
        await awardXP(mins * calculateXPForAction('STUDY_SESSION_MIN'), 'Çalışma Bitti');
        
        setSeconds(0);
        setTopic('');
        loadData();
      } else {
        Alert.alert("İptal Edildi", "1 dakikadan az çalıştığınız için kaydedilmedi.");
        setSeconds(0);
      }
    } else {
      setIsStudying(true);
    }
  };

  const handleManualSave = async () => {
    const mins = parseInt(manualDuration, 10);
    if (!selectedCourse || isNaN(mins) || mins <= 0) return;
    const session = { subject: selectedCourse, topic: topic || 'Manuel Kayıt', durationMinutes: mins, type: 'manual' };
    await saveStudySession(session);
    await logAppUsage();
    await awardXP(mins * calculateXPForAction('STUDY_SESSION_MIN'), 'Manuel Kayıt Başarılı');
    
    setIsManualModalVisible(false);
    setManualDuration(''); setTopic(''); loadData();
  };

  const handleGoalSave = async () => {
    const mins = parseInt(goalInput, 10);
    if (isNaN(mins) || mins <= 0) return;
    await setDailyGoal(mins);
    setDailyGoalState(mins);
    setIsGoalModalVisible(false);
    Toast.show({ type: 'success', text1: 'Güncellendi' });
  };

  const handleDelete = (id) => {
    Alert.alert("Sil", "Emin misiniz?", [
      { text: "İptal", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: async () => { await deleteStudySession(id); loadData(); } }
    ]);
  };

  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const progressPercent = Math.min(100, Math.round((totalMinutes / dailyGoal) * 100));

  const isPomodoro = mode === 'pomodoro';
  // If progress is low, show orange, else show green in the gradient
  const pStartColor = progressPercent < 40 ? Colors.danger : Colors.primary;
  const pEndColor = progressPercent < 80 ? Colors.accent : Colors.success;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ders Çalış</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => { setGoalInput(dailyGoal.toString()); setIsGoalModalVisible(true); }}>
            <MaterialCommunityIcons name="target" size={24} color={Colors.background} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { marginLeft: 10, backgroundColor: Colors.purple }]} onPress={() => setIsManualModalVisible(true)}>
            <MaterialCommunityIcons name="clock-plus-outline" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        {/* Goal Card with Dynamic LinearGradient Progress */}
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle}>Günlük Hedef: {formatMinutesToHourText(dailyGoal)}</Text>
            <Text style={[styles.goalPercent, { color: pEndColor }]}>{progressPercent}%</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <LinearGradient 
              colors={[pStartColor, pEndColor]} 
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} 
              style={[styles.progressBarFill, { width: `${progressPercent}%` }]} 
            />
          </View>
          <Text style={styles.goalSubtext}>Tamamlanan: {formatMinutesToHourText(totalMinutes)}</Text>
        </View>

        {/* Timer Card */}
        <Animated.View style={[styles.timerCard, isStudying && { transform: [{ scale: pulseAnim }], borderColor: Colors.primary, shadowColor: Colors.deepOrange, shadowOpacity: 0.4, shadowRadius: 20 }]}>
          <View style={styles.modeTabs}>
            <TouchableOpacity style={[styles.modeTab, !isPomodoro && styles.modeTabActive]} onPress={() => !isStudying && setMode('normal')}>
              <Text style={[styles.modeTabText, !isPomodoro && styles.modeTabTextActive]}>Kronometre</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modeTab, isPomodoro && styles.modeTabActive]} onPress={() => !isStudying && setMode('pomodoro')}>
              <Text style={[styles.modeTabText, isPomodoro && styles.modeTabTextActive]}>Pomodoro</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Ders Seçimi</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.coursesScroll}>
            {courses.map(c => (
              <TouchableOpacity key={c} style={[styles.courseChip, selectedCourse === c && { borderColor: Colors.primary, backgroundColor: Colors.primary + '20' }]} onPress={() => setSelectedCourse(c)}>
                <Text style={[styles.courseChipText, selectedCourse === c && { color: Colors.primary }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <AppInput placeholder="Veya ders adını kendin yaz..." value={selectedCourse} onChangeText={setSelectedCourse} editable={!isStudying} style={{ marginBottom: 12, marginTop: 10 }} />
          <AppInput icon="text-subject" placeholder="Hangi konuya çalışacaksın?" value={topic} onChangeText={setTopic} editable={!isStudying} style={{ marginBottom: 0 }} />
          
          <View style={styles.timerDisplay}>
            <Text style={[styles.timerText, { color: Colors.primary }]}>{formatDuration(seconds)}</Text>
            <Text style={styles.timerSubtext}>{isPomodoro ? 'Odak Modu (25dk)' : 'dk : sn'}</Text>
          </View>
          
          <AppButton 
            title={isStudying ? (isPomodoro ? 'Oturumu Böl' : 'Durdur ve Kaydet') : 'Başlat'} 
            type={isStudying ? 'danger' : 'primary'}
            icon={isStudying ? 'stop' : 'play'}
            onPress={toggleTimer} 
            style={{ width: '100%', backgroundColor: isStudying ? Colors.danger : Colors.primary }}
          />
        </Animated.View>

        <SectionHeader title="Bugünkü Kayıtlar" />
        
        {sessions.length === 0 ? (
          <EmptyState icon="history" title="Kayıt Yok" message="Çalışma sürenizi kronometreyle veya manuel olarak ekleyebilirsiniz." />
        ) : (
          sessions.map(record => (
            <View key={record.id} style={styles.recordCard}>
              <View style={styles.recordIcon}>
                <MaterialCommunityIcons name={record.type === 'pomodoro' ? "brain" : "check-decagram"} size={26} color={record.type === 'pomodoro' ? Colors.deepOrange : Colors.cyan} />
              </View>
              <View style={styles.recordInfo}>
                <Text style={styles.recordSubject}>{record.subject}</Text>
                <Text style={styles.recordTopic}>{record.topic}</Text>
              </View>
              <View style={styles.recordRight}>
                <View style={[styles.recordDuration, { backgroundColor: (record.type === 'pomodoro' ? Colors.deepOrange : Colors.cyan) + '15' }]}>
                  <Text style={[styles.durationText, { color: record.type === 'pomodoro' ? Colors.deepOrange : Colors.cyan }]}>{record.durationMinutes} dk</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(record.id)} style={styles.iconBtn}>
                  <MaterialCommunityIcons name="trash-can-outline" size={18} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Manual Add Modal */}
      <Modal visible={isManualModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manuel Süre Ekle</Text>
              <TouchableOpacity onPress={() => setIsManualModalVisible(false)}><MaterialCommunityIcons name="close" size={24} color={Colors.textPrimary} /></TouchableOpacity>
            </View>
            <AppInput label="Ders" placeholder="Örn: Fizik" value={selectedCourse} onChangeText={setSelectedCourse} />
            <AppInput label="Süre (Dakika)" placeholder="Örn: 45" value={manualDuration} onChangeText={setManualDuration} keyboardType="number-pad" />
            <AppInput label="Konu (Opsiyonel)" placeholder="Örn: Kuvvet" value={topic} onChangeText={setTopic} />
            <AppButton title="Kaydet" onPress={handleManualSave} style={{ backgroundColor: Colors.purple }} />
          </View>
        </View>
      </Modal>

      {/* Goal Modal */}
      <Modal visible={isGoalModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Günlük Hedef Belirle</Text>
              <TouchableOpacity onPress={() => setIsGoalModalVisible(false)}><MaterialCommunityIcons name="close" size={24} color={Colors.textPrimary} /></TouchableOpacity>
            </View>
            <AppInput label="Hedef Süre (Dakika)" placeholder="120" value={goalInput} onChangeText={setGoalInput} keyboardType="number-pad" />
            <AppButton title="Kaydet" onPress={handleGoalSave} />
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  actionBtn: { backgroundColor: Colors.cyan, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
  contentContainer: { padding: 24, paddingBottom: 160 },
  
  goalCard: { backgroundColor: Colors.card, borderRadius: 20, padding: 20, marginBottom: 32, borderWidth: 1, borderColor: Colors.border },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  goalTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '600' },
  goalPercent: { color: Colors.cyan, fontSize: 18, fontWeight: '800' },
  progressBarTrack: { height: 10, backgroundColor: Colors.background, borderRadius: 5, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, marginBottom: 8 },
  progressBarFill: { height: '100%', borderRadius: 5 },
  goalSubtext: { color: Colors.textSecondary, fontSize: 13 },

  timerCard: { backgroundColor: Colors.card, borderRadius: 24, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, marginBottom: 40 },
  modeTabs: { flexDirection: 'row', backgroundColor: Colors.background, borderRadius: 12, padding: 4, marginBottom: 24, width: '100%', borderWidth: 1, borderColor: Colors.border },
  modeTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  modeTabActive: { backgroundColor: Colors.card, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  modeTabText: { color: Colors.textSecondary, fontWeight: '600' },
  modeTabTextActive: { color: Colors.textPrimary },

  cardTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 16, alignSelf: 'flex-start' },
  label: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', alignSelf: 'flex-start', marginBottom: 8 },
  coursesScroll: { flexDirection: 'row', width: '100%' },
  courseChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.background, marginRight: 10, borderWidth: 1, borderColor: Colors.border },
  courseChipText: { color: Colors.textSecondary, fontWeight: '600' },
  timerDisplay: { alignItems: 'center', marginBottom: 24, marginTop: 16 },
  timerText: { fontSize: 72, fontWeight: '800', fontVariant: ['tabular-nums'], letterSpacing: -2 },
  timerSubtext: { color: Colors.textMuted, fontSize: 16, marginTop: -8, fontWeight: '500' },
  
  recordCard: { flexDirection: 'row', backgroundColor: Colors.card, borderRadius: 20, padding: 16, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  recordIcon: { marginRight: 16 },
  recordInfo: { flex: 1 },
  recordSubject: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  recordTopic: { color: Colors.textSecondary, fontSize: 13, fontWeight: '500' },
  recordRight: { flexDirection: 'row', alignItems: 'center' },
  recordDuration: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginRight: 12 },
  durationText: { fontWeight: 'bold', fontSize: 13 },
  iconBtn: { padding: 6 },
  bottomSpacer: { height: 100 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: Colors.card, width: '100%', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: Colors.border },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: 'bold' },
});

export default StudyScreen;
