import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { useTheme } from '../context/ThemeContext';
import { getFriends, saveFriend, deleteFriend } from '../storage/storageService';
import FriendCard from '../components/FriendCard';
import EmptyState from '../components/EmptyState';

// Initial Mock Data
const MOCK_FRIENDS = [
  { id: 'f_1', name: 'Ayşe Y.', level: 4, weeklyMinutes: 850, streak: 5, badgesEarned: 12 },
  { id: 'f_2', name: 'Caner K.', level: 2, weeklyMinutes: 420, streak: 2, badgesEarned: 5 },
  { id: 'f_3', name: 'Elif S.', level: 6, weeklyMinutes: 1200, streak: 14, badgesEarned: 24 }
];

const FriendsScreen = ({ navigation }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  const [friends, setFriends] = useState([]);

  const loadData = async () => {
    const data = await getFriends();
    setFriends(data);
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const addMockFriends = async () => {
    for (const f of MOCK_FRIENDS) {
      await saveFriend(f);
    }
    Toast.show({ type: 'success', text1: 'Örnek Arkadaşlar Eklendi' });
    loadData();
  };

  const handleFriendClick = (friend) => {
    Alert.alert(
      friend.name,
      `Seviye: ${friend.level}\nÇalışma: ${Math.round(friend.weeklyMinutes/60)} saat\nSeri: ${friend.streak} gün`,
      [
        { text: "Karşılaştır", onPress: () => navigation.navigate('Leaderboard') },
        { text: "Kapat", style: "cancel" },
        { text: "Sil", style: "destructive", onPress: async () => { await deleteFriend(friend.id); loadData(); } }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={32} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Arkadaşlar</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabActive}>
          <Text style={styles.tabTextActive}>Arkadaşlar ({friends.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Leaderboard')}>
          <Text style={styles.tabText}>Sıralama</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Challenges')}>
          <Text style={styles.tabText}>Yarışmalar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {friends.length === 0 ? (
          <EmptyState 
            icon="account-group-outline" 
            title="Arkadaşın Yok" 
            message="Çalışma istatistiklerini karşılaştırmak için arkadaşlarını ekle." 
          />
        ) : (
          friends.map(f => (
            <FriendCard key={f.id} friend={f} onPress={() => handleFriendClick(f)} />
          ))
        )}

        {friends.length === 0 && (
          <TouchableOpacity style={styles.mockBtn} onPress={addMockFriends}>
            <MaterialCommunityIcons name="plus-circle-outline" size={20} color={Colors.purple} />
            <Text style={styles.mockBtnText}>Örnek Arkadaşlar Ekle</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backButton: { marginRight: 16 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary, textAlign: 'center' },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  tabActive: { flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: Colors.purple },
  tabText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: Colors.purple, fontSize: 14, fontWeight: 'bold' },
  container: { flex: 1 },
  contentContainer: { padding: 24, paddingBottom: 120 },
  mockBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16, gap: 8, marginTop: 20, backgroundColor: Colors.purple + '15', borderRadius: 12, borderWidth: 1, borderColor: Colors.purple + '30' },
  mockBtnText: { color: Colors.purple, fontSize: 15, fontWeight: 'bold' },
});

export default FriendsScreen;
