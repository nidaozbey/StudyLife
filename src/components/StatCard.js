import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const StatCard = ({ icon, title, value, subtext, color = '#39FF14' }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
          <MaterialCommunityIcons name={icon} size={22} color={color} />
        </View>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.subtext} numberOfLines={1}>{subtext}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#161618',
    borderRadius: 20,
    padding: 16,
    width: '47%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A2E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  content: {
    marginTop: 4,
  },
  value: {
    color: '#FAFAFA',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subtext: {
    color: '#71717A',
    fontSize: 12,
  },
});

export default StatCard;
