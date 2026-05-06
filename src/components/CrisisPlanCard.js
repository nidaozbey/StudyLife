import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const CrisisPlanCard = ({ crisisPlan, onDismiss }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  if (!crisisPlan) return null;
  const { exam, daysLeft, steps, totalMinutes, message } = crisisPlan;
  const borderColor = daysLeft <= 1 ? Colors.danger : Colors.primary;

  return (
    <View style={[styles.card, { borderColor: borderColor + '60' }]}>
      <LinearGradient colors={[borderColor + '20', Colors.card]} style={styles.gradient}>
        <View style={styles.headerRow}>
          <MaterialCommunityIcons name="alert-octagon" size={24} color={borderColor} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.cardTitle, { color: borderColor }]}>
              {daysLeft <= 1 ? '🚨 Kriz Modu' : '⚠️ Son Dakika Planı'}
            </Text>
            <Text style={styles.examName}>{exam?.name}</Text>
          </View>
          {onDismiss && (
            <TouchableOpacity onPress={onDismiss}>
              <MaterialCommunityIcons name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.stepsContainer}>
          {steps.map((step) => (
            <View key={step.order} style={[styles.stepRow, step.type === 'warning' && { opacity: 0.8 }]}>
              <View style={[styles.stepIcon, { backgroundColor: borderColor + '20' }]}>
                <MaterialCommunityIcons name={step.icon} size={18} color={borderColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{step.order}. {step.title}</Text>
                <Text style={styles.stepDetail}>{step.detail}</Text>
              </View>
              {step.duration > 0 && (
                <View style={styles.durationBadge}>
                  <Text style={[styles.durationText, { color: borderColor }]}>{step.duration} dk</Text>
                </View>
              )}
            </View>
          ))}
        </View>
        {totalMinutes > 0 && (
          <Text style={styles.totalText}>Toplam süre: {totalMinutes} dakika</Text>
        )}
      </LinearGradient>
    </View>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1, overflow: 'hidden', marginBottom: 24 },
  gradient: { padding: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '900' },
  examName: { color: Colors.textSecondary, fontSize: 13 },
  message: { color: Colors.textPrimary, fontSize: 14, lineHeight: 20, marginBottom: 16 },
  stepsContainer: { gap: 12 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  stepTitle: { color: Colors.textPrimary, fontWeight: '700', fontSize: 14, marginBottom: 2 },
  stepDetail: { color: Colors.textSecondary, fontSize: 12, lineHeight: 18 },
  durationBadge: { backgroundColor: Colors.background, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start', marginTop: 4 },
  durationText: { fontWeight: 'bold', fontSize: 12 },
  totalText: { color: Colors.textMuted, fontSize: 12, marginTop: 16, textAlign: 'right' },
});

export default CrisisPlanCard;
