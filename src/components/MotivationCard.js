import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const MotivationCard = ({ motivation }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  if (!motivation) return null;
  const { message, icon, color } = motivation;
  return (
    <View style={[styles.card, { borderColor: color + '30' }]}>
      <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
        <MaterialCommunityIcons name={icon || 'lightning-bolt'} size={24} color={color} />
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 20, padding: 18, marginBottom: 24, borderWidth: 1, gap: 14 },
  iconBox: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  message: { flex: 1, color: Colors.textPrimary, fontSize: 14, lineHeight: 22 },
});

export default MotivationCard;
