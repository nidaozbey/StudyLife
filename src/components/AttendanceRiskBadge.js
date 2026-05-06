import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AttendanceRiskBadge = ({ riskLabel, color }) => (
  <View style={[styles.badge, { backgroundColor: color + '15', borderColor: color }]}>
    <Text style={[styles.text, { color }]}>Risk: {riskLabel}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  text: { fontSize: 11, fontWeight: 'bold' }
});

export default AttendanceRiskBadge;
