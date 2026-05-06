import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const DimensionBar = ({ dim }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: dim.score, duration: 700, delay: 200, useNativeDriver: false }).start();
  }, [dim.score]);

  const barColor = dim.score < 40 ? Colors.danger : dim.score < 65 ? Colors.primary : Colors.success;

  return (
    <View style={styles.dimRow}>
      <MaterialCommunityIcons name={dim.icon} size={16} color={barColor} style={styles.dimIcon} />
      <Text style={styles.dimLabel} numberOfLines={1}>{dim.label}</Text>
      <View style={styles.dimTrack}>
        <Animated.View
          style={[
            styles.dimFill,
            {
              width: anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
      <Text style={[styles.dimScore, { color: barColor }]}>{dim.score}</Text>
    </View>
  );
};

const PreparationRadarCard = ({ radarData, examName }) => {
  if (!radarData) return null;
  const { dimensions, overall, weakDimensions, daysLeft } = radarData;
  const overallColor = overall >= 70 ? Colors.success : overall >= 40 ? Colors.primary : Colors.danger;

  return (
    <View style={[styles.card, { borderColor: overallColor + '30' }]}>
      <View style={styles.headerRow}>
        <MaterialCommunityIcons name="target" size={20} color={overallColor} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.title}>Hazırlık Analizi</Text>
          {examName ? <Text style={styles.subtitle}>{examName}</Text> : null}
        </View>
        <View style={[styles.overallCircle, { borderColor: overallColor }]}>
          <Text style={[styles.overallScore, { color: overallColor }]}>{overall}</Text>
          <Text style={styles.overallLabel}>%</Text>
        </View>
      </View>

      {dimensions.map(dim => <DimensionBar key={dim.key} dim={dim} />)}

      {weakDimensions.length > 0 && (
        <View style={styles.weakBox}>
          <MaterialCommunityIcons name="alert-circle-outline" size={14} color={Colors.primary} />
          <Text style={styles.weakText}>
            {weakDimensions.map(d => d.label).join(', ')} boyutlarında geliştirme gerekiyor.
          </Text>
        </View>
      )}
    </View>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  card: { backgroundColor: Colors.card, borderRadius: 20, padding: 18, marginBottom: 20, borderWidth: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  title: { color: Colors.textPrimary, fontWeight: 'bold', fontSize: 15 },
  subtitle: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  overallCircle: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  overallScore: { fontSize: 18, fontWeight: '800', lineHeight: 22 },
  overallLabel: { fontSize: 10, color: Colors.textMuted, marginTop: -4 },
  dimRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  dimIcon: { width: 18 },
  dimLabel: { width: 100, color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  dimTrack: { flex: 1, height: 8, backgroundColor: Colors.background, borderRadius: 4, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  dimFill: { height: '100%', borderRadius: 4 },
  dimScore: { width: 28, textAlign: 'right', fontWeight: 'bold', fontSize: 12 },
  weakBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: Colors.primary + '10', borderRadius: 10, padding: 10, marginTop: 8, borderWidth: 1, borderColor: Colors.primary + '25' },
  weakText: { flex: 1, color: Colors.textSecondary, fontSize: 12, lineHeight: 18 },
});

export default PreparationRadarCard;
