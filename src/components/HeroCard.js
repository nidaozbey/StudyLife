import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getDaysUntil, formatMinutesToHourText } from '../utils/dateUtils';

const StatusBadge = ({ label, color, styles }) => (
  <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color + '60' }]}>
    <View style={[styles.badgeDot, { backgroundColor: color }]} />
    <Text style={[styles.badgeText, { color }]}>{label}</Text>
  </View>
);

const HeroCard = ({ greeting, stats, nearestExam, crisisMode }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  const animWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: stats?.progressPercent || 0,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [stats?.progressPercent]);

  const examDays = nearestExam ? getDaysUntil(nearestExam.dateString) : null;
  const examColor = examDays !== null && examDays <= 3 ? Colors.danger : Colors.primary;

  return (
    <LinearGradient
      colors={crisisMode
        ? [Colors.background, Colors.danger + '18', Colors.deepOrange + '12', Colors.background]
        : [Colors.background, Colors.deepOrange + '15', Colors.background]}
      style={styles.heroCard}
    >
      <View style={styles.heroTop}>
        <View>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.subtitle}>Akademik özetin hazır 📊</Text>
        </View>
        {crisisMode && (
          <View style={[styles.crisisBadge]}>
            <MaterialCommunityIcons name="alert-octagon" size={16} color={Colors.danger} />
            <Text style={styles.crisisBadgeText}>Kriz Modu</Text>
          </View>
        )}
      </View>

      {/* Günlük Hedef Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Günlük Hedef</Text>
          <Text style={[styles.progressPercent, { color: stats?.progressPercent >= 80 ? Colors.success : Colors.primary }]}>
            {stats?.progressPercent || 0}%
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: animWidth.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
                backgroundColor: (stats?.progressPercent || 0) >= 80 ? Colors.success : Colors.primary,
              },
            ]}
          />
        </View>
        <Text style={styles.progressSub}>{stats?.studyTime || '0dk'} çalışıldı</Text>
      </View>

      {/* Sınav Bilgisi */}
      {nearestExam && (
        <View style={[styles.examRow, { borderColor: examColor + '40', backgroundColor: examColor + '10' }]}>
          <MaterialCommunityIcons name="calendar-alert" size={18} color={examColor} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.examName, { color: examColor }]}>{nearestExam.name}</Text>
            <Text style={styles.examSub}>
              {examDays === 0 ? 'Bugün!' : examDays === 1 ? 'Yarın!' : `${examDays} gün kaldı`}
            </Text>
          </View>
          {stats?.examPrep !== undefined && (
            <View style={styles.prepBadge}>
              <Text style={[styles.prepText, { color: examColor }]}>%{stats.examPrep}</Text>
              <Text style={styles.prepLabel}>Hazırlık</Text>
            </View>
          )}
        </View>
      )}

      {/* Focus Subject & Stat Badges */}
      <View style={styles.badgeRow}>
        {stats?.focusSubject && (
          <StatusBadge label={`Odak: ${stats.focusSubject}`} color={Colors.primary} styles={styles} />
        )}
        {stats?.consistency >= 70 && (
          <StatusBadge label="Yüksek Tutarlılık" color={Colors.success} styles={styles} />
        )}
        {crisisMode && (
          <StatusBadge label="Acil Plan Gerekli" color={Colors.danger} styles={styles} />
        )}
      </View>
    </LinearGradient>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  heroCard: { borderRadius: 24, padding: 20, marginBottom: 20 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  crisisBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.danger + '20', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: Colors.danger + '40' },
  crisisBadgeText: { color: Colors.danger, fontWeight: 'bold', fontSize: 12 },
  progressSection: { marginBottom: 16 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  progressPercent: { fontSize: 20, fontWeight: '800' },
  progressTrack: { height: 10, backgroundColor: Colors.background, borderRadius: 5, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  progressFill: { height: '100%', borderRadius: 5 },
  progressSub: { color: Colors.textMuted, fontSize: 12, marginTop: 6 },
  examRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 12, borderWidth: 1, marginBottom: 14 },
  examName: { fontWeight: '700', fontSize: 14 },
  examSub: { color: Colors.textSecondary, fontSize: 12 },
  prepBadge: { alignItems: 'center', marginLeft: 8 },
  prepText: { fontWeight: '800', fontSize: 18, lineHeight: 22 },
  prepLabel: { color: Colors.textMuted, fontSize: 10 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1 },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 12, fontWeight: '600' },
});

export default HeroCard;
