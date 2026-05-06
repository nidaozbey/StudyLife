import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const InsightCard = ({ suggestion }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  const { type, text } = suggestion;
  
  const getColors = () => {
    switch(type) {
      case 'danger': return { bg: Colors.danger, icon: 'alert-circle-outline' };
      case 'warning': return { bg: Colors.accent, icon: 'lightbulb-on-outline' };
      case 'success': return { bg: Colors.primary, icon: 'check-decagram-outline' };
      case 'info':
      default: return { bg: Colors.cyan, icon: 'information-outline' };
    }
  };

  const c = getColors();

  return (
    <View style={[styles.card, { borderColor: c.bg + '40', backgroundColor: c.bg + '08' }]}>
      <View style={[styles.iconBox, { backgroundColor: c.bg + '15' }]}>
        <MaterialCommunityIcons name={c.icon} size={22} color={c.bg} />
      </View>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  text: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  }
});

export default InsightCard;
