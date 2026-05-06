import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const HabitItem = ({ title, completed, onPress }) => {
  return (
    <TouchableOpacity style={[styles.container, completed && styles.containerCompleted]} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.leftContent}>
        <View style={[styles.checkbox, completed && styles.checkboxCompleted]}>
          {completed && <MaterialCommunityIcons name="check" size={16} color="#09090B" />}
        </View>
        <Text style={[styles.title, completed && styles.titleCompleted]}>{title}</Text>
      </View>
      <MaterialCommunityIcons 
        name={completed ? "fire" : "circle-outline"} 
        size={20} 
        color={completed ? "#FFB703" : "#3F3F46"} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#161618',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A2E',
  },
  containerCompleted: {
    backgroundColor: '#161618',
    borderColor: '#39FF1430',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#52525B',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#39FF14',
    borderColor: '#39FF14',
  },
  title: {
    color: '#FAFAFA',
    fontSize: 16,
    fontWeight: '500',
  },
  titleCompleted: {
    color: '#71717A',
    textDecorationLine: 'line-through',
  },
});

export default HabitItem;
