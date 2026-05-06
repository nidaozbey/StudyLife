import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { useTheme } from '../context/ThemeContext';
import { getAppPreferences, saveAppPreferences } from '../storage/storageService';

const SettingsScreen = ({ navigation }) => {
  const { colors: Colors, isDark, themeMode, setTheme } = useTheme();
  const styles = getStyles(Colors);

  const [simpleMode, setSimpleMode] = useState(false);

  const loadPrefs = async () => {
    const prefs = await getAppPreferences();
    setSimpleMode(prefs.simpleMode || false);
  };

  useFocusEffect(useCallback(() => { loadPrefs(); }, []));

  const toggleSimpleMode = async (val) => {
    setSimpleMode(val);
    await saveAppPreferences({ simpleMode: val });
    Toast.show({ type: 'success', text1: val ? 'Sade Mod Açık' : 'Sade Mod Kapalı' });
  };

  const handleClearAll = () => {
    Alert.alert(
      'Tüm Verileri Sil',
      'Bu işlem geri alınamaz. Tüm ders, sınav, alışkanlık ve çalışma verileriniz silinecek. Devam etmek istiyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil', style: 'destructive', onPress: async () => {
            await AsyncStorage.clear();
            Toast.show({ type: 'success', text1: 'Veriler Silindi', text2: 'Tüm uygulama verileri temizlendi.' });
            setTimeout(() => navigation.navigate('MainTabs'), 1500);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={32} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayarlar</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>

        {/* Tema */}
        <Text style={styles.sectionTitle}>Tema</Text>
        <View style={styles.themeContainer}>
          {['light', 'dark', 'system'].map(t => {
            const isSelected = t === themeMode;
            const labels = { light: 'Gündüz', dark: 'Gece', system: 'Sistem' };
            const icons = { light: 'white-balance-sunny', dark: 'moon-waning-crescent', system: 'cog-outline' };
            
            return (
              <TouchableOpacity 
                key={t}
                style={[styles.themeBtn, isSelected && { borderColor: Colors.primary, backgroundColor: Colors.primary + '15' }]}
                onPress={() => setTheme(t)}
              >
                <MaterialCommunityIcons name={icons[t]} size={20} color={isSelected ? Colors.primary : Colors.textSecondary} />
                <Text style={[styles.themeText, isSelected && { color: Colors.primary, fontWeight: 'bold' }]}>{labels[t]}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Görünüm */}
        <Text style={styles.sectionTitle}>Görünüm</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <MaterialCommunityIcons name="view-compact-outline" size={22} color={Colors.primary} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.settingLabel}>Sade Mod</Text>
              <Text style={styles.settingDesc}>Ana ekranda yalnızca en kritik bilgileri göster.</Text>
            </View>
          </View>
          <Switch
            value={simpleMode}
            onValueChange={toggleSimpleMode}
            trackColor={{ false: Colors.border, true: Colors.primary + '60' }}
            thumbColor={simpleMode ? Colors.primary : Colors.textMuted}
          />
        </View>

        {/* Veri Gizliliği */}
        <Text style={styles.sectionTitle}>Veri Gizliliği</Text>
        <View style={styles.privacyCard}>
          <MaterialCommunityIcons name="shield-check-outline" size={24} color={Colors.success} style={{ marginBottom: 12 }} />
          <Text style={styles.privacyTitle}>Verileriniz Cihazınızda</Text>
          <Text style={styles.privacyText}>
            StudyLife herhangi bir sunucuya veya bulut hizmetine bağlanmaz. Tüm ders, sınav, çalışma ve alışkanlık verileriniz yalnızca bu cihazda saklanır. Gizliliğiniz her zaman korunur.
          </Text>
        </View>

        {/* Veri Sıfırlama */}
        <Text style={styles.sectionTitle}>Veri Yönetimi</Text>
        <TouchableOpacity style={styles.dangerBtn} onPress={handleClearAll}>
          <MaterialCommunityIcons name="trash-can-outline" size={22} color={Colors.danger} />
          <Text style={styles.dangerBtnText}>Tüm Verileri Temizle</Text>
        </TouchableOpacity>
        <Text style={styles.dangerWarning}>Bu işlem geri alınamaz. Tüm uygulama verileriniz kalıcı olarak silinir.</Text>

        {/* AI Info */}
        <Text style={styles.sectionTitle}>Sistem Bilgisi</Text>
        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="robot-outline" size={24} color={Colors.cyan} style={{ marginBottom: 8 }} />
          <Text style={styles.infoTitle}>AI Koç Hakkında</Text>
          <Text style={styles.infoText}>Bu sürümdeki Yapay Zeka (AI) Koç, cihaz içi verilerinizi analiz eden gelişmiş bir kural tabanlı karar motoru kullanır. Verileriniz hiçbir şekilde dış sunuculara gönderilmez.</Text>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { marginRight: 8 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary, textAlign: 'center' },
  contentContainer: { padding: 24, paddingBottom: 120 },
  sectionTitle: { color: Colors.textSecondary, fontSize: 13, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12, marginTop: 24 },
  
  themeContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  themeBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.cardElevated, gap: 4 },
  themeText: { color: Colors.textSecondary, fontSize: 12, marginTop: 4 },

  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 12 },
  settingInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  settingLabel: { color: Colors.textPrimary, fontWeight: '600', fontSize: 15, marginBottom: 2 },
  settingDesc: { color: Colors.textSecondary, fontSize: 12, lineHeight: 18 },
  privacyCard: { backgroundColor: Colors.success + '08', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: Colors.success + '25', marginBottom: 12 },
  privacyTitle: { color: Colors.textPrimary, fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  privacyText: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20 },
  dangerBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.danger + '10', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: Colors.danger + '30', marginBottom: 10 },
  dangerBtnText: { color: Colors.danger, fontWeight: 'bold', fontSize: 15 },
  dangerWarning: { color: Colors.textMuted, fontSize: 12, lineHeight: 18 },
  infoCard: { backgroundColor: Colors.cyan + '08', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: Colors.cyan + '25', marginBottom: 12 },
  infoTitle: { color: Colors.textPrimary, fontWeight: 'bold', fontSize: 15, marginBottom: 6 },
  infoText: { color: Colors.textSecondary, fontSize: 12, lineHeight: 18 },
});

export default SettingsScreen;
