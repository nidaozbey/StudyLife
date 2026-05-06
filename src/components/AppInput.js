import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const AppInput = ({ label, icon, style, ...props }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, props.multiline && styles.multilineContainer]}>
        {icon && <MaterialCommunityIcons name={icon} size={20} color={Colors.textMuted} style={styles.icon} />}
        <TextInput 
          style={[styles.input, props.multiline && styles.multilineInput]}
          placeholderTextColor={Colors.textMuted}
          {...props}
        />
      </View>
    </View>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  container: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  multilineContainer: {
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 54,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  }
});

export default AppInput;
