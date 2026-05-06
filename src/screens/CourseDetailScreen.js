import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { useTheme } from '../context/ThemeContext';
import { getStudySessions, getExams, getCourseNotes, saveCourseNote, deleteCourseNote, getAttendanceRecords, getAttendanceSettings, getTopicProgress, saveTopicProgress, deleteTopicProgress, getQuizResults, getStudyPlans } from '../storage/storageService';
import { formatMinutesToHourText, getDaysUntil } from '../utils/dateUtils';
import { calculateAcademicRiskScore, getRiskLevel } from '../utils/riskUtils';
import { calculateAttendanceRisk, getAttendancePercentage, groupAttendanceByCourse } from '../utils/attendanceUtils';
import { buildCourseTwin } from '../utils/courseTwinUtils';
import { calculatePreparationRadar } from '../utils/preparationRadarUtils';

import EmptyState from '../components/EmptyState';
import SectionHeader from '../components/SectionHeader';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import RiskBadge from '../components/RiskBadge';
import TopicProgressItem from '../components/TopicProgressItem';
import PreparationRadarCard from '../components/PreparationRadarCard';

const TABS = ['Genel', 'Konular', 'Notlar'];

const CourseDetailScreen = ({ route, navigation }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  const { course } = route.params;
  const [activeTab, setActiveTab] = useState('Genel');
  
  const [stats, setStats] = useState({ totalTime: 0, weekTime: 0, upcomingExams: [], riskScore: 0, riskLevel: null, attPercent: 0 });
  const [notes, setNotes] = useState([]);
  const [topics, setTopics] = useState([]);
  const [radarData, setRadarData] = useState(null);
  const [twinProfile, setTwinProfile] = useState(null);

  // Modals
  const [isNoteModalVisible, setNoteModalVisible] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const [isTopicModalVisible, setTopicModalVisible] = useState(false);
  const [topicName, setTopicName] = useState('');
  const [topicStatus, setTopicStatus] = useState('Bilmiyorum');

  const loadData = async () => {
    const allSessions = await getStudySessions();
    const allExams = await getExams();
    const allNotes = await getCourseNotes(course.id);
    const allTopics = await getTopicProgress();
    const allAtt = await getAttendanceRecords();
    const allAttSet = await getAttendanceSettings();
    const quizResults = await getQuizResults();
    const studyPlans = await getStudyPlans();
    const attMap = groupAttendanceByCourse(allAtt);

    const courseSessions = allSessions.filter(s => s.subject === course.name);
    const totalTime = courseSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    const weekTime = courseSessions.filter(s => ((new Date() - new Date(s.timestamp)) / (1000 * 60 * 60 * 24)) <= 7).reduce((sum, s) => sum + s.durationMinutes, 0);
    
    const upcomingExams = allExams.filter(e => e.courseName === course.name && getDaysUntil(e.dateString) >= 0).sort((a,b) => new Date(a.dateString) - new Date(b.dateString));

    const courseTopics = allTopics.filter(t => t.courseName === course.name);
    
    const courseAtt = allAtt.filter(a => a.courseId === course.id);
    const usedAtt = courseAtt.reduce((sum, a) => sum + a.amount, 0);
    const limit = allAttSet[course.id]?.limit || 1;
    const attPercent = getAttendancePercentage(usedAtt, limit);

    const rScore = calculateAcademicRiskScore(course.name, allExams, allSessions, allTopics, attPercent, true);
    const rLevel = getRiskLevel(rScore);

    setStats({ totalTime, weekTime, upcomingExams, riskScore: rScore, riskLevel: rLevel, attPercent });
    setNotes(allNotes);
    setTopics(courseTopics);

    // Radar + Twin
    if (upcomingExams[0]) {
      const rd = calculatePreparationRadar(upcomingExams[0], allTopics, allSessions, quizResults, studyPlans, attMap, allAttSet, course);
      setRadarData(rd);
    } else { setRadarData(null); }

    const twin = buildCourseTwin(course, allExams, allSessions, allTopics, quizResults, studyPlans, attMap, allAttSet);
    setTwinProfile(twin);
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const handleSaveNote = async () => {
    if (!noteTitle) return;
    await saveCourseNote({ courseId: course.id, title: noteTitle, content: noteContent, dateString: new Date().toDateString(), timestamp: Date.now() });
    setNoteModalVisible(false);
    setNoteTitle(''); setNoteContent('');
    loadData();
  };

  const handleSaveTopic = async () => {
    if (!topicName) return;
    await saveTopicProgress({ courseName: course.name, name: topicName, status: topicStatus });
    setTopicModalVisible(false);
    setTopicName(''); setTopicStatus('Bilmiyorum');
    loadData();
  };

  const cycleTopicStatus = async (topic) => {
    const statuses = ['Bilmiyorum', 'Az biliyorum', 'Orta', 'İyi biliyorum'];
    const idx = statuses.indexOf(topic.status);
    const nextStatus = statuses[(idx + 1) % statuses.length];
    await saveTopicProgress({ ...topic, status: nextStatus });
    loadData();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={32} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{course.name}</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.tabContainer}>
        {TABS.map(tab => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.activeTab]} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        {activeTab === 'Genel' && (
          <>
            <View style={styles.riskCard}>
              <Text style={styles.riskTitle}>Akademik Risk Skoru</Text>
              {stats.riskLevel && (
                <RiskBadge riskLabel={stats.riskLevel.label} color={stats.riskLevel.color} score={stats.riskScore} />
              )}
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{formatMinutesToHourText(stats.totalTime)}</Text>
                <Text style={styles.statLabel}>Toplam Çalışma</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: Colors.cyan }]}>{formatMinutesToHourText(stats.weekTime)}</Text>
                <Text style={styles.statLabel}>Bu Hafta</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.attCard} onPress={() => navigation.navigate('Attendance')}>
              <MaterialCommunityIcons name="account-cancel-outline" size={24} color={Colors.accent} />
              <Text style={styles.attCardText}>Devamsızlık Durumu: %{stats.attPercent}</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.textMuted} />
            </TouchableOpacity>

            <SectionHeader title="Yaklaşan Sınavlar" />
            {stats.upcomingExams.length === 0 ? (
              <Text style={{ color: Colors.textMuted }}>Yaklaşan sınav yok.</Text>
            ) : (
              stats.upcomingExams.map(e => (
                <View key={e.id} style={styles.examCard}>
                  <Text style={styles.examName}>{e.type}</Text>
                  <Text style={styles.examDate}>{getDaysUntil(e.dateString)} gün kaldı</Text>
                </View>
              ))
            )}
            {/* Preparation Radar */}
            {radarData && (
              <PreparationRadarCard radarData={radarData} examName={stats.upcomingExams[0]?.name} />
            )}

            {/* Digital Twin Summary */}
            {twinProfile && (
              <View style={styles.twinCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={styles.twinTitle}>Ders Dijital İkizi</Text>
                  <View style={[styles.riskPill, { backgroundColor: twinProfile.riskColor + '20', borderColor: twinProfile.riskColor + '50' }]}>
                    <Text style={[styles.riskPillText, { color: twinProfile.riskColor }]}>{twinProfile.riskLevel} Risk</Text>
                  </View>
                </View>
                <View style={styles.twinRow}>
                  <View style={styles.twinStat}>
                    <Text style={[styles.twinVal, { color: Colors.cyan }]}>{formatMinutesToHourText(twinProfile.weekMins)}</Text>
                    <Text style={styles.twinLabel}>Bu Hafta</Text>
                  </View>
                  <View style={styles.twinStat}>
                    <Text style={[styles.twinVal, { color: Colors.primary }]}>{twinProfile.weakTopics.length}</Text>
                    <Text style={styles.twinLabel}>Zayıf Konu</Text>
                  </View>
                  <View style={styles.twinStat}>
                    <Text style={[styles.twinVal, { color: Colors.danger }]}>%{twinProfile.attPercent}</Text>
                    <Text style={styles.twinLabel}>Devamsızlık</Text>
                  </View>
                  <View style={styles.twinStat}>
                    <Text style={[styles.twinVal, { color: Colors.success }]}>{twinProfile.suggestedWeeklyHours}s</Text>
                    <Text style={styles.twinLabel}>Hedef/Hafta</Text>
                  </View>
                </View>
              </View>
            )}
          </>
        )}

        {activeTab === 'Konular' && (
          <>
            <AppButton title="+ Yeni Konu Ekle" onPress={() => setTopicModalVisible(true)} style={{ marginBottom: 16 }} />
            {topics.length === 0 ? (
              <EmptyState icon="book-open-variant" title="Konu Yok" message="Bu ders için henüz konu girmediniz." />
            ) : (
              topics.map(t => (
                <TopicProgressItem key={t.id} topic={t} onChangeStatus={() => cycleTopicStatus(t)} onDelete={async () => { await deleteTopicProgress(t.id); loadData(); }} />
              ))
            )}
          </>
        )}

        {activeTab === 'Notlar' && (
          <>
            <AppButton title="+ Yeni Not Ekle" onPress={() => setNoteModalVisible(true)} style={{ marginBottom: 16 }} />
            {notes.length === 0 ? (
              <EmptyState icon="notebook-outline" title="Not Yok" message="Bu ders için henüz not eklemediniz." />
            ) : (
              notes.map(n => (
                <View key={n.id} style={styles.noteCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.noteTitle}>{n.title}</Text>
                    <TouchableOpacity onPress={async () => { await deleteCourseNote(n.id); loadData(); }}>
                      <MaterialCommunityIcons name="trash-can-outline" size={20} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.noteContent}>{n.content}</Text>
                  <Text style={styles.noteDate}>{new Date(n.timestamp).toLocaleDateString()}</Text>
                </View>
              ))
            )}
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Note Modal */}
      <Modal visible={isNoteModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yeni Not</Text>
            <AppInput label="Başlık" value={noteTitle} onChangeText={setNoteTitle} />
            <AppInput label="İçerik" value={noteContent} onChangeText={setNoteContent} multiline style={{ height: 100 }} />
            <AppButton title="Kaydet" onPress={handleSaveNote} />
            <AppButton title="İptal" onPress={() => setNoteModalVisible(false)} type="outline" style={{ marginTop: 8 }} />
          </View>
        </View>
      </Modal>

      {/* Topic Modal */}
      <Modal visible={isTopicModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yeni Konu</Text>
            <AppInput label="Konu Adı" value={topicName} onChangeText={setTopicName} />
            <Text style={{ color: Colors.textSecondary, marginBottom: 8, fontSize: 13, fontWeight: '600' }}>Başlangıç Durumu: Bilmiyorum</Text>
            <AppButton title="Kaydet" onPress={handleSaveTopic} />
            <AppButton title="İptal" onPress={() => setTopicModalVisible(false)} type="outline" style={{ marginTop: 8 }} />
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

  tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText: { color: Colors.textSecondary, fontWeight: '600' },
  activeTabText: { color: Colors.primary },

  riskCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.card, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 16 },
  riskTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: 'bold' },

  statsRow: { flexDirection: 'row', backgroundColor: Colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 16 },
  statBox: { flex: 1, alignItems: 'center' },
  divider: { width: 1, backgroundColor: Colors.border },
  statValue: { color: Colors.textPrimary, fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { color: Colors.textSecondary, fontSize: 12 },

  attCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 24 },
  attCardText: { flex: 1, color: Colors.textPrimary, fontSize: 15, fontWeight: '600', marginLeft: 12 },

  examCard: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: Colors.card, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 8 },
  examName: { color: Colors.textPrimary, fontWeight: 'bold' },
  examDate: { color: Colors.accent },

  noteCard: { backgroundColor: Colors.card, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 12 },
  noteTitle: { color: Colors.primary, fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  noteContent: { color: Colors.textPrimary, fontSize: 14, lineHeight: 20, marginBottom: 12 },
  noteDate: { color: Colors.textMuted, fontSize: 12, textAlign: 'right' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: Colors.card, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: Colors.border },
  modalTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 20 },

  twinCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.primary + '30', marginBottom: 20 },
  twinTitle: { color: Colors.textPrimary, fontWeight: 'bold', fontSize: 15 },
  riskPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  riskPillText: { fontSize: 12, fontWeight: 'bold' },
  twinRow: { flexDirection: 'row', justifyContent: 'space-between' },
  twinStat: { alignItems: 'center', flex: 1 },
  twinVal: { fontWeight: '800', fontSize: 18, marginBottom: 4 },
  twinLabel: { color: Colors.textMuted, fontSize: 11 },

  bottomSpacer: { height: 100 },
});

export default CourseDetailScreen;
