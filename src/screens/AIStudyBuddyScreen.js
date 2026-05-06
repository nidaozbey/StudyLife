import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Animated, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../context/ThemeContext';
import { 
  getStudyBuddyMessages, saveStudyBuddyMessage, clearStudyBuddyMessages, getStudyBuddyPreferences,
  getUserProfile, getStudySessions, getExams, getHabits, getDailyGoal, getTopicProgress, getCourses, getAttendanceRecords, getAttendanceSettings
} from '../storage/storageService';
import { generateStudyBuddyReply } from '../utils/studyBuddyUtils';
import { groupAttendanceByCourse } from '../utils/attendanceUtils';

const QUICK_ACTIONS = [
  "Matematik için tavsiye ver 📐",
  "Bana bir şaka yap 😄",
  "Pomodoro tekniği nedir? ⏳",
  "Bugün ne yapmalıyım? ✨",
  "Haftalık özetimi çıkar 📊"
];

const AIStudyBuddyScreen = ({ navigation }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [appData, setAppData] = useState({});
  const [preferences, setPreferences] = useState({});
  
  const scrollViewRef = useRef();

  const loadData = async () => {
    const [
      savedMsgs, prefs, profile, sessions, exams, habits, goalObj, topics, courses, attRecs, attSet
    ] = await Promise.all([
      getStudyBuddyMessages(), getStudyBuddyPreferences(),
      getUserProfile(), getStudySessions(), getExams(), getHabits(), getDailyGoal(), getTopicProgress(), getCourses(), getAttendanceRecords(), getAttendanceSettings()
    ]);
    
    const attMap = groupAttendanceByCourse(attRecs);
    
    setAppData({
      userName: profile?.name || 'Öğrenci',
      sessions, exams, habits, dailyGoalMins: goalObj.targetMinutes || 120, topics, courses, attMap, attSettings: attSet
    });
    setPreferences(prefs);

    if (savedMsgs.length === 0) {
      // First time greeting
      const welcomeMsg = {
        id: Date.now().toString(),
        text: `Selam ${profile?.name || ''}! 👋 Ben senin çalışma arkadaşınım. Bugün sana nasıl yardımcı olabilirim?`,
        sender: 'buddy',
        createdAt: new Date().toISOString()
      };
      await saveStudyBuddyMessage(welcomeMsg);
      setMessages([welcomeMsg]);
    } else {
      setMessages(savedMsgs);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const handleSend = async (textOverride) => {
    const textToSend = textOverride || inputText.trim();
    if (!textToSend) return;

    setInputText('');
    
    const userMsg = {
      id: Date.now().toString() + '_u',
      text: textToSend,
      sender: 'user',
      createdAt: new Date().toISOString()
    };
    
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    await saveStudyBuddyMessage(userMsg);
    
    setIsTyping(true);

    // Simulate network/thinking delay
    setTimeout(async () => {
      const replyText = generateStudyBuddyReply(textToSend, appData, preferences.personality);
      const buddyMsg = {
        id: Date.now().toString() + '_b',
        text: replyText,
        sender: 'buddy',
        createdAt: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, buddyMsg]);
      await saveStudyBuddyMessage(buddyMsg);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleClearChat = () => {
    Alert.alert(
      "Sohbeti Temizle",
      "Tüm sohbet geçmişini silmek istediğine emin misin?",
      [
        { text: "İptal", style: "cancel" },
        { 
          text: "Sil", 
          style: "destructive", 
          onPress: async () => {
            await clearStudyBuddyMessages();
            setMessages([]);
            loadData();
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={32} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>AI Study Buddy</Text>
          <Text style={styles.headerSubtitle}>Sana her zaman destek olmaya hazır</Text>
        </View>
        <TouchableOpacity style={styles.clearBtn} onPress={handleClearChat}>
          <MaterialCommunityIcons name="trash-can-outline" size={24} color={Colors.danger} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView 
          style={styles.chatArea} 
          contentContainerStyle={styles.chatContent}
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <View key={msg.id} style={[styles.messageRow, isUser ? styles.userRow : styles.buddyRow]}>
                {!isUser && (
                  <View style={styles.buddyAvatar}>
                    <MaterialCommunityIcons name="robot-happy-outline" size={18} color={Colors.background} />
                  </View>
                )}
                
                <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.buddyBubble]}>
                  <Text style={[styles.messageText, isUser && styles.userMessageText]}>{msg.text}</Text>
                </View>
              </View>
            );
          })}
          
          {isTyping && (
            <View style={[styles.messageRow, styles.buddyRow]}>
              <View style={styles.buddyAvatar}>
                <MaterialCommunityIcons name="robot-happy-outline" size={18} color={Colors.background} />
              </View>
              <View style={[styles.messageBubble, styles.buddyBubble, { paddingHorizontal: 16 }]}>
                <MaterialCommunityIcons name="dots-horizontal" size={24} color={Colors.primary} style={{ opacity: 0.7 }} />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.bottomArea}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsScroll}>
            {QUICK_ACTIONS.map((action, i) => (
              <TouchableOpacity key={i} style={styles.quickActionBtn} onPress={() => handleSend(action)}>
                <Text style={styles.quickActionText}>{action}</Text>
              </TouchableOpacity>
            ))}
            <View style={{ width: 16 }} />
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Bir şeyler yaz..."
              placeholderTextColor={Colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]} 
              onPress={() => handleSend()}
              disabled={!inputText.trim()}
            >
              <MaterialCommunityIcons name="send" size={20} color={Colors.background} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.cardElevated },
  backButton: { marginRight: 12 },
  headerTitleBox: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
  headerSubtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  clearBtn: { padding: 8 },
  
  chatArea: { flex: 1 },
  chatContent: { padding: 16, paddingBottom: 24, gap: 16 },
  
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', maxWidth: '85%' },
  userRow: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  buddyRow: { alignSelf: 'flex-start' },
  
  buddyAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 8, marginBottom: 4 },
  
  messageBubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  userBubble: { backgroundColor: Colors.cardElevated, borderBottomRightRadius: 4, borderWidth: 1, borderColor: Colors.border },
  buddyBubble: { backgroundColor: Colors.card, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.primary + '40', shadowColor: Colors.primary, shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 8 },
  
  messageText: { color: Colors.textPrimary, fontSize: 15, lineHeight: 22 },
  userMessageText: { color: Colors.accent },

  bottomArea: { 
    backgroundColor: Colors.card, 
    borderTopWidth: 1, 
    borderTopColor: Colors.border, 
    paddingBottom: Platform.OS === 'ios' ? 40 : 35, // Extra padding for safe area and keyboard
    paddingTop: 12,
  },
  
  quickActionsScroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  quickActionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.primary + '15', borderWidth: 1, borderColor: Colors.primary + '40', marginRight: 8 },
  quickActionText: { color: Colors.primary, fontSize: 13, fontWeight: '600' },
  
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 8 },
  input: { flex: 1, backgroundColor: Colors.secondaryBackground, borderRadius: 24, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 14, minHeight: 48, maxHeight: 120, color: Colors.textPrimary, fontSize: 15, borderWidth: 1, borderColor: Colors.border },
  sendBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  sendBtnDisabled: { backgroundColor: Colors.border, opacity: 0.5 },
});

export default AIStudyBuddyScreen;
