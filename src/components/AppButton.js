import React, { useRef } from 'react';
import { TouchableWithoutFeedback, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const AppButton = ({ title, onPress, type = 'primary', icon, loading, style }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getBgColor = () => {
    if (type === 'primary') return Colors.primary;
    if (type === 'danger') return Colors.danger;
    if (type === 'accent') return Colors.accent;
    return Colors.card;
  };

  const getTextColor = () => {
    if (type === 'outline' || type === 'card') return Colors.textPrimary;
    return Colors.background;
  };

  return (
    <TouchableWithoutFeedback 
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={loading}
    >
      <Animated.View 
        style={[
          styles.button, 
          { backgroundColor: type === 'outline' ? 'transparent' : getBgColor() },
          type === 'outline' && { borderWidth: 1, borderColor: Colors.border },
          type === 'card' && { borderWidth: 1, borderColor: Colors.border },
          { transform: [{ scale: scaleAnim }] },
          style
        ]} 
      >
        {loading ? (
          <ActivityIndicator color={getTextColor()} />
        ) : (
          <>
            {icon && <MaterialCommunityIcons name={icon} size={20} color={getTextColor()} style={styles.icon} />}
            <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
          </>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  button: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default AppButton;
