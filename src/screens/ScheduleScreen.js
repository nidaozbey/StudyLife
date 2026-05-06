import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Modal, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';

import { getCourses, saveCourse, deleteCourse } from '../storage/storageService';
import { formatTime } from '../utils/dateUtils';
import { useTheme } from '../context/ThemeContext';
import EmptyState from '../components/EmptyState';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

const ScheduleScreen = ({ navigation }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  const [courses, setCourses] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [day, setDay] = useState('Pazartesi');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [location, setLocation] = useState('');
  const [teacher, setTeacher] = useState('');
  
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const loadCourses = async () => {
    const data = await getCourses();
    setCourses(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadCourses();
    }, [])
  );

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDay('Pazartesi');
    setStartTime(new Date());
    setEndTime(new Date());
    setLocation('');
    setTeacher('');
  };

  const openModal = (course = null) => {
    if (course) {
      setEditingId(course.id);
      setName(course.name);
      setDay(course.day);
      
      const st = new Date();
      const [sh, sm] = course.startTime.split(':');
      st.setHours(parseInt(sh, 10), parseInt(sm, 10), 0);
      setStartTime(st);

      const et = new Date();
      if(course.endTime) {
        const [eh, em] = course.endTime.split(':');
        et.setHours(parseInt(eh, 10), parseInt(em, 10), 0);
      }
      setEndTime(et);

      setLocation(course.location || '');
      setTeacher(course.teacher || '');
    } else {
      resetForm();
    }
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !location.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Eksik Bilgi',
        text2: 'Lütfen ders adı ve yer bilgisini doldurun.',
      });
      return;
    }

    const courseData = {
      id: editingId,
      name,
      day,
      startTime: formatTime(startTime),
      endTime: formatTime(endTime),
      location,
      teacher,
    };

    await saveCourse(courseData);
    setIsModalVisible(false);
    resetForm();
    loadCourses();
    
    Toast.show({
      type: 'success',
      text1: editingId ? 'Güncellendi' : 'Eklendi',
      text2: 'Ders başarıyla kaydedildi.',
    });
  };

  const groupedCourses = DAYS.map(d => ({
    day: d,
    classes: courses.filter(c => c.day === d).sort((a, b) => a.startTime.localeCompare(b.startTime))
  })).filter(g => g.classes.length > 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Haftalık Program</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <MaterialCommunityIcons name="plus" size={24} color={Colors.background} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {groupedCourses.length === 0 ? (
          <EmptyState 
            icon="calendar-blank-outline"
            title="Henüz ders eklenmedi"
            message="İlk dersini ekleyerek haftanı planlamaya başla. Sağ üstteki + butonunu kullanabilirsin."
          />
        ) : (
          groupedCourses.map((dayData, index) => (
            <View key={index} style={styles.dayContainer}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayTitle}>{dayData.day}</Text>
                <View style={styles.dayDivider} />
              </View>
              
              {dayData.classes.map(cls => (
                <TouchableOpacity 
                  key={cls.id} 
                  style={styles.classCard}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('CourseDetail', { course: cls })}
                >
                  <View style={styles.timeIndicator}>
                    <Text style={styles.timeText}>{cls.startTime}</Text>
                  </View>
                  <View style={styles.classInfo}>
                    <Text style={styles.className}>{cls.name}</Text>
                    <View style={styles.locationRow}>
                      <MaterialCommunityIcons name="map-marker-radius-outline" size={14} color={Colors.textSecondary} />
                      <Text style={styles.locationText}>{cls.location}</Text>
                      {cls.endTime && <Text style={styles.durationText}> • Bitiş: {cls.endTime}</Text>}
                    </View>
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity onPress={() => openModal(cls)} style={styles.iconButton}>
                      <MaterialCommunityIcons name="pencil-outline" size={20} color={Colors.accent} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={isModalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingId ? 'Dersi Düzenle' : 'Yeni Ders Ekle'}</Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <MaterialCommunityIcons name="close" size={28} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <AppInput 
              label="Ders Adı"
              placeholder="Örn: Matematik"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Gün</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScroll}>
              {DAYS.map(d => (
                <TouchableOpacity 
                  key={d} 
                  style={[styles.dayChip, day === d && styles.dayChipActive]}
                  onPress={() => setDay(d)}
                >
                  <Text style={[styles.dayChipText, day === d && styles.dayChipTextActive]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.label}>Başlangıç</Text>
                <TouchableOpacity style={styles.timeInput} onPress={() => setShowStartPicker(true)}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color={Colors.accent} />
                  <Text style={styles.timeInputText}>{formatTime(startTime)}</Text>
                </TouchableOpacity>
                {showStartPicker && (
                  <DateTimePicker
                    value={startTime}
                    mode="time"
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, date) => {
                      setShowStartPicker(Platform.OS === 'ios');
                      if (date) setStartTime(date);
                    }}
                  />
                )}
                {Platform.OS === 'ios' && showStartPicker && (
                  <TouchableOpacity onPress={() => setShowStartPicker(false)} style={styles.doneBtn}>
                    <Text style={styles.doneBtnText}>Bitti</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.flexSpacer} />

              <View style={styles.flex1}>
                <Text style={styles.label}>Bitiş</Text>
                <TouchableOpacity style={styles.timeInput} onPress={() => setShowEndPicker(true)}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color={Colors.accent} />
                  <Text style={styles.timeInputText}>{formatTime(endTime)}</Text>
                </TouchableOpacity>
                {showEndPicker && (
                  <DateTimePicker
                    value={endTime}
                    mode="time"
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, date) => {
                      setShowEndPicker(Platform.OS === 'ios');
                      if (date) setEndTime(date);
                    }}
                  />
                )}
                {Platform.OS === 'ios' && showEndPicker && (
                  <TouchableOpacity onPress={() => setShowEndPicker(false)} style={styles.doneBtn}>
                    <Text style={styles.doneBtnText}>Bitti</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <AppInput 
              label="Yer / Sınıf"
              placeholder="Örn: D204"
              value={location}
              onChangeText={setLocation}
              style={{ marginTop: 20 }}
            />

            <AppInput 
              label="Hoca Adı (Opsiyonel)"
              placeholder="Örn: Dr. Ahmet Yılmaz"
              value={teacher}
              onChangeText={setTeacher}
            />

            <AppButton title="Kaydet" onPress={handleSave} style={{ marginTop: 20, marginBottom: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 32, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  addButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: { flex: 1 },
  contentContainer: { padding: 24, paddingBottom: 120 },
  dayContainer: { marginBottom: 32 },
  dayHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dayTitle: { fontSize: 18, fontWeight: '700', color: Colors.accent, marginRight: 12 },
  dayDivider: { flex: 1, height: 1, backgroundColor: Colors.border },
  classCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    backgroundColor: Colors.background,
    borderRadius: 14,
    marginRight: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeText: { color: Colors.textPrimary, fontSize: 16, fontWeight: 'bold' },
  classInfo: { flex: 1, justifyContent: 'center' },
  className: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { color: Colors.textSecondary, fontSize: 14, marginLeft: 6, fontWeight: '500' },
  durationText: { color: Colors.textMuted, fontSize: 12 },
  actionButtons: { flexDirection: 'row' },
  iconButton: { padding: 8, marginLeft: 4 },
  bottomSpacer: { height: 100 },
  
  // Modal Styles
  modalSafeArea: { flex: 1, backgroundColor: Colors.card },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: 'bold' },
  modalBody: { padding: 24 },
  label: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  daysScroll: { flexDirection: 'row', marginBottom: 8 },
  dayChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.background,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayChipActive: { backgroundColor: Colors.accent + '20', borderColor: Colors.accent },
  dayChipText: { color: Colors.textSecondary, fontWeight: '600' },
  dayChipTextActive: { color: Colors.accent },
  row: { flexDirection: 'row' },
  flex1: { flex: 1 },
  flexSpacer: { width: 16 },
  timeInput: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeInputText: { color: Colors.textPrimary, fontSize: 16, marginLeft: 10 },
  doneBtn: { marginTop: 8, alignSelf: 'flex-end' },
  doneBtnText: { color: Colors.primary, fontWeight: 'bold' },
});

export default ScheduleScreen;
