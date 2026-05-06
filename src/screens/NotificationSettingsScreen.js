import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { useTheme } from '../context/ThemeContext';
import { getNotificationSettings, saveNotificationSettings } from '../storage/storageService';
import AppButton from '../components/AppButton';

const NotificationSettingsScreen = ({ navigation }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  const [settings, setSettings] = useState({
    enabled: true,
    courseReminderMinutes: 15,
    examReminderDays: 1,
    habitReminderTime: '20:00'
  });

  useEffect(() => {
    const loadSettings = async () => {
      const data = await getNotificationSettings();
      setSettings(data);
    };
    loadSettings();
  }, []);

  const toggleSwitch = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    await saveNotificationSettings(settings);
    Toast.show({ type: 'success', text1: 'Kaydedildi', text2: 'Bildirim ayarlarınız başarıyla güncellendi.' });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={32} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bildirim Ayarları</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        <View style={styles.settingGroup}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextContent}>
              <Text style={styles.settingTitle}>Tüm Bildirimler</Text>
              <Text style={styles.settingDesc}>Uygulamaya ait tüm bildirimleri açıp kapatabilirsiniz.</Text>
            </View>
            <Switch
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.textPrimary}
              value={settings.enabled}
              onValueChange={() => toggleSwitch('enabled')}
            />
          </View>
        </View>

        {settings.enabled && (
          <View style={styles.settingGroup}>
            <View style={styles.settingRow}>
              <View style={styles.settingTextContent}>
                <Text style={styles.settingTitle}>Ders Hatırlatıcısı</Text>
                <Text style={styles.settingDesc}>Dersler başlamadan 15 dakika önce haber ver.</Text>
              </View>
              <MaterialCommunityIcons name="bell-ring-outline" size={24} color={Colors.accent} />
            </View>
            
            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingTextContent}>
                <Text style={styles.settingTitle}>Sınav Hatırlatıcısı</Text>
                <Text style={styles.settingDesc}>Yaklaşan sınavlar için 1 gün önceden uyar.</Text>
              </View>
              <MaterialCommunityIcons name="calendar-alert" size={24} color={Colors.danger} />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingTextContent}>
                <Text style={styles.settingTitle}>Alışkanlık Hatırlatıcısı</Text>
                <Text style={styles.settingDesc}>Eksik alışkanlıklar için akşam (20:00) uyarısı.</Text>
              </View>
              <MaterialCommunityIcons name="check-circle-outline" size={24} color={Colors.cyan} />
            </View>
          </View>
        )}

        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="information-outline" size={20} color={Colors.textSecondary} style={{ marginRight: 10 }} />
          <Text style={styles.infoText}>Bu sürümde bildirim ayarları cihazınıza lokal olarak kaydedilmektedir.</Text>
        </View>

        <AppButton title="Ayarları Kaydet" onPress={handleSave} style={{ marginTop: 24 }} />

      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backButton: { marginRight: 16 },
  headerTitle: { flex: 1, fontSize: 22, fontWeight: 'bold', color: Colors.textPrimary, textAlign: 'center' },
  container: { flex: 1 },
  contentContainer: { padding: 24, paddingBottom: 120 },
  
  settingGroup: { backgroundColor: Colors.card, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, marginBottom: 24, paddingHorizontal: 20 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20 },
  settingTextContent: { flex: 1, paddingRight: 16 },
  settingTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  settingDesc: { color: Colors.textSecondary, fontSize: 13, lineHeight: 18 },
  divider: { height: 1, backgroundColor: Colors.border },

  infoBox: { flexDirection: 'row', backgroundColor: Colors.background, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  infoText: { flex: 1, color: Colors.textSecondary, fontSize: 12, lineHeight: 18 },
});

export default NotificationSettingsScreen;
