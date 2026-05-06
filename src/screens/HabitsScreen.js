import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { useTheme } from '../context/ThemeContext';
import { getHabits, saveHabit, deleteHabit, toggleHabit, updateItem, KEYS } from '../storage/storageService';
import EmptyState from '../components/EmptyState';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';

const HabitItemEditable = ({ habit, onToggle, onProgress, onEdit, onDelete }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  return (
    <View style={styles.habitWrapper}>
      <TouchableOpacity 
        style={[styles.itemContainer, habit.completed && styles.itemContainerCompleted]} 
        activeOpacity={0.8} 
        onPress={() => {
          if (habit.targetAmount > 1) {
            onProgress(habit.id, habit.currentProgress, habit.targetAmount);
          } else {
            onToggle(habit.id, !habit.completed);
          }
        }}
      >
        <View style={styles.leftContent}>
          <View style={[styles.checkbox, habit.completed && styles.checkboxCompleted]}>
            {habit.completed && <MaterialCommunityIcons name="check" size={16} color={Colors.background} />}
          </View>
          <View style={styles.titleWrapper}>
            <Text style={[styles.title, habit.completed && styles.titleCompleted]}>{habit.title}</Text>
            {habit.targetAmount > 1 && (
              <Text style={styles.targetText}>{habit.currentProgress} / {habit.targetAmount} {habit.unit}</Text>
            )}
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={() => onEdit(habit)} style={styles.iconBtn}>
            <MaterialCommunityIcons name="pencil-outline" size={18} color={Colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(habit.id)} style={styles.iconBtn}>
            <MaterialCommunityIcons name="trash-can-outline" size={18} color={Colors.danger} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const HabitsScreen = () => {
  const { colors: Colors } = useTheme();
  const styles = getStyles(Colors);
  const [habits, setHabits] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('1');
  const [unit, setUnit] = useState('Kez');

  const loadHabits = async () => {
    const data = await getHabits();
    setHabits(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadHabits();
    }, [])
  );

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setAmount('1');
    setUnit('Kez');
  };

  const openModal = (habit = null) => {
    if (habit) {
      setEditingId(habit.id);
      setTitle(habit.title);
      setAmount(habit.targetAmount ? habit.targetAmount.toString() : '1');
      setUnit(habit.unit || 'Kez');
    } else {
      resetForm();
    }
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Toast.show({ type: 'error', text1: 'Hata', text2: 'Alışkanlık adı boş olamaz.' });
      return;
    }

    const parsedAmount = parseInt(amount, 10) || 1;

    const habitData = {
      id: editingId,
      title,
      targetAmount: parsedAmount,
      unit,
    };

    await saveHabit(habitData);
    setIsModalVisible(false);
    resetForm();
    loadHabits();
    
    Toast.show({ type: 'success', text1: 'Başarılı', text2: 'Alışkanlık kaydedildi.' });
  };

  const handleDelete = (id) => {
    Alert.alert("Sil", "Silmek istediğinize emin misiniz?", [
      { text: "İptal", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: async () => { await deleteHabit(id); loadHabits(); } }
    ]);
  };

  const handleToggle = async (id, isCompleted) => {
    await toggleHabit(id, isCompleted);
    loadHabits();
  };

  const handleProgress = async (id, currentProgress, targetAmount) => {
    const newProgress = currentProgress + 1;
    const isCompleted = newProgress >= targetAmount;
    
    if (newProgress <= targetAmount) {
      await updateItem(KEYS.HABITS, id, { currentProgress: newProgress });
      if (isCompleted) {
        await toggleHabit(id, true);
      }
      loadHabits();
    }
  };

  const completedCount = habits.filter(h => h.completed).length;
  const totalCount = habits.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alışkanlıklar</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <MaterialCommunityIcons name="plus" size={24} color={Colors.background} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        {/* Progress Card */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Bugünün İlerlemesi</Text>
          <View style={styles.progressHeaderRow}>
            <Text style={styles.progressPercent}>{progressPercent}%</Text>
            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>{completedCount} / {totalCount}</Text>
            </View>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Günlük Liste</Text>
        
        {habits.length === 0 ? (
          <EmptyState 
            icon="check-circle-outline"
            title="Listeniz boş"
            message="Sağ üstteki butondan su içmek, kitap okumak gibi günlük alışkanlıklar ekleyin."
          />
        ) : (
          <View style={styles.listContainer}>
            {habits.map(habit => (
              <HabitItemEditable 
                key={habit.id}
                habit={habit}
                onToggle={handleToggle}
                onProgress={handleProgress}
                onEdit={openModal}
                onDelete={handleDelete}
              />
            ))}
          </View>
        )}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Modal */}
      <Modal visible={isModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? 'Alışkanlık Düzenle' : 'Yeni Alışkanlık'}</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <AppInput label="Alışkanlık Adı" placeholder="Örn: Su İç" value={title} onChangeText={setTitle} autoFocus />
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <AppInput label="Miktar" placeholder="1" value={amount} onChangeText={setAmount} keyboardType="number-pad" style={{ flex: 0.4 }} />
              <AppInput label="Birim" placeholder="Bardak" value={unit} onChangeText={setUnit} style={{ flex: 0.55 }} />
            </View>

            <AppButton title="Kaydet" onPress={handleSave} />
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
  addButton: { backgroundColor: Colors.primary, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
  contentContainer: { padding: 24, paddingBottom: 120 },
  progressCard: { backgroundColor: Colors.card, borderRadius: 24, padding: 24, marginBottom: 36, borderWidth: 1, borderColor: Colors.border },
  progressTitle: { color: Colors.textSecondary, fontSize: 15, fontWeight: '600', marginBottom: 16 },
  progressHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  progressPercent: { color: Colors.cyan, fontSize: 42, fontWeight: '800', letterSpacing: -1 },
  progressBadge: { backgroundColor: Colors.cyan + '15', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  progressBadgeText: { color: Colors.cyan, fontWeight: 'bold', fontSize: 15 },
  progressBarTrack: { height: 14, backgroundColor: Colors.background, borderRadius: 7, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  progressBarFill: { height: '100%', backgroundColor: Colors.cyan, borderRadius: 7 },
  sectionTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: '700', marginBottom: 20, letterSpacing: 0.5 },
  listContainer: { marginBottom: 20 },
  bottomSpacer: { height: 100 },

  habitWrapper: { marginBottom: 12 },
  itemContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.card, padding: 18, borderRadius: 16, borderWidth: 1, borderColor: Colors.border },
  itemContainerCompleted: { borderColor: Colors.primary + '30' },
  leftContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  checkbox: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: Colors.textMuted, marginRight: 16, justifyContent: 'center', alignItems: 'center' },
  checkboxCompleted: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  titleWrapper: { flex: 1 },
  title: { color: Colors.textPrimary, fontSize: 16, fontWeight: '500' },
  titleCompleted: { color: Colors.textMuted, textDecorationLine: 'line-through' },
  targetText: { color: Colors.textMuted, fontSize: 12, marginTop: 4 },
  actionButtons: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { padding: 6, marginLeft: 4 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: Colors.card, width: '100%', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: Colors.border },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: 'bold' },
});

export default HabitsScreen;
