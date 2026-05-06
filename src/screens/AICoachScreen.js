import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../context/ThemeContext';
import { getUserProfile, getStudySessions, getExams, getHabits, getDailyGoal, getTopicProgress } from '../storage/storageService';
import { generateCoachGreeting, generateCoachResponse } from '../utils/aiCoachUtils';

const AICoachScreen = ({ navigation }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  const [messages, setMessages] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef();

  const loadData = async () => {
    const [profile, sessions, exams, habits, goalObj, topics] = await Promise.all([
      getUserProfile(), getStudySessions(), getExams(), getHabits(), getDailyGoal(), getTopicProgress()
    ]);
    
    const data = {
      userName: profile?.name || 'Öğrenci',
      sessions, exams, habits, dailyGoalMins: goalObj.targetMinutes || 120, topics
    };
    setUserData(data);

    // Initial Greeting
    const greeting = generateCoachGreeting(data.userName, sessions, exams, habits, data.dailyGoalMins);
    setMessages([{ id: Date.now().toString(), text: greeting, sender: 'ai' }]);
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const handleAction = (actionType, label) => {
    // Add user message
    const userMsg = { id: Date.now().toString() + 'u', text: label, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const response = generateCoachResponse(actionType, userData);
      const aiMsg = { id: Date.now().toString() + 'a', text: response, sender: 'ai' };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={32} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Koç</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView 
        style={styles.chatArea} 
        contentContainerStyle={styles.chatContent}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <View key={msg.id} style={[styles.messageBubble, msg.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
            {msg.sender === 'ai' && (
              <LinearGradient colors={[Colors.cyan, Colors.purple]} style={styles.aiAvatar}>
                <MaterialCommunityIcons name="robot-outline" size={16} color={Colors.textPrimary} />
              </LinearGradient>
            )}
            <View style={[styles.messageBox, msg.sender === 'user' ? styles.userBox : styles.aiBox]}>
              <Text style={[styles.messageText, msg.sender === 'user' && { color: Colors.background }]}>{msg.text}</Text>
            </View>
          </View>
        ))}
        {isTyping && (
          <View style={[styles.messageBubble, styles.aiBubble]}>
             <LinearGradient colors={[Colors.cyan, Colors.purple]} style={styles.aiAvatar}>
                <MaterialCommunityIcons name="robot-outline" size={16} color={Colors.textPrimary} />
              </LinearGradient>
              <View style={[styles.messageBox, styles.aiBox]}>
                <MaterialCommunityIcons name="dots-horizontal" size={24} color={Colors.cyan} style={{ opacity: 0.7 }} />
              </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.actionsContainer}>
        <Text style={styles.actionsTitle}>Ne istersin?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsScroll}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction('motivation', 'Bana motivasyon ver 🚀')}>
            <LinearGradient colors={[Colors.primary + '30', Colors.deepOrange + '30']} style={styles.actionGradient}>
              <MaterialCommunityIcons name="fire" size={20} color={Colors.primary} />
              <Text style={[styles.actionBtnText, { color: Colors.primary }]}>Motivasyon Ver</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction('next_task', 'Sırada ne çalışmalıyım? 🎯')}>
            <LinearGradient colors={[Colors.cyan + '30', Colors.purple + '30']} style={styles.actionGradient}>
              <MaterialCommunityIcons name="target" size={20} color={Colors.cyan} />
              <Text style={[styles.actionBtnText, { color: Colors.cyan }]}>Sırada Ne Var?</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction('summary', 'Durumumu özetle 📊')}>
            <LinearGradient colors={[Colors.success + '30', '#00FF8730']} style={styles.actionGradient}>
              <MaterialCommunityIcons name="chart-bar" size={20} color={Colors.success} />
              <Text style={[styles.actionBtnText, { color: Colors.success }]}>Durumu Özetle</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.card },
  backButton: { marginRight: 16 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary, textAlign: 'center' },
  
  chatArea: { flex: 1 },
  chatContent: { padding: 20, paddingBottom: 40 },
  
  messageBubble: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16 },
  userBubble: { justifyContent: 'flex-end' },
  aiBubble: { justifyContent: 'flex-start' },
  
  aiAvatar: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 8, marginBottom: 4 },
  
  messageBox: { maxWidth: '80%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  userBox: { backgroundColor: Colors.cyan, borderBottomRightRadius: 4 },
  aiBox: { backgroundColor: Colors.card, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.purple + '40' },
  
  messageText: { color: Colors.textPrimary, fontSize: 15, lineHeight: 22 },

  actionsContainer: { backgroundColor: Colors.card, paddingVertical: 16, borderTopWidth: 1, borderTopColor: Colors.border },
  actionsTitle: { color: Colors.textSecondary, fontSize: 13, fontWeight: 'bold', marginLeft: 20, marginBottom: 12, textTransform: 'uppercase' },
  actionsScroll: { paddingHorizontal: 20, gap: 12 },
  actionBtn: { borderRadius: 16, overflow: 'hidden' },
  actionGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16 },
  actionBtnText: { fontWeight: 'bold', fontSize: 14 },
});

export default AICoachScreen;
